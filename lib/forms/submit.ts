"use server";

import { INTENTS, contactSubmissionSchema, isContactIntent } from "./contact";

/**
 * Contact submission — server action.
 *
 * The client confirmed every enquiry goes back into Zoho Creator, so this
 * POSTs to a Creator endpoint. Two things are configured, never hardcoded:
 *
 *   CREATOR_CONTACT_ENDPOINT   the Creator form/API URL
 *   CREATOR_CONTACT_TOKEN      optional auth header value
 *
 * ## The rule this file follows: never pretend an enquiry was received.
 *
 * If the endpoint is unconfigured, unreachable, or rejects the payload, the
 * visitor is told plainly and given the email address. A contact form that
 * shows a green tick and drops the message is worse than no form: the sender
 * believes they have been heard, and nobody ever finds out. On a site where
 * one of the intents is adverse-event adjacent, that matters more than usual.
 *
 * FIELD NAMES: the payload below uses our names. Creator's Openings-style
 * forms use their own (`Name`, `Work_Email`, …). Map them here once the target
 * form is known — one object, one place.
 */

export interface ContactState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
  /**
   * What the visitor typed, echoed back so the form can be re-rendered with
   * it. React 19 resets an uncontrolled form once its action completes, so
   * without this a failed submission silently wipes everything — including a
   * long message somebody spent five minutes writing. Never returned on
   * success, where the form is replaced by the confirmation.
   */
  values?: Record<string, string>;
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const raw = Object.fromEntries(formData) as Record<string, string>;

  // Everything the visitor typed, minus the honeypot, ready to echo back.
  const { website: _honeypot, ...typed } = raw;

  const intent = raw.intent ?? "";
  if (!isContactIntent(intent)) {
    return { status: "error", message: "Unknown enquiry type.", values: typed };
  }

  const config = INTENTS[intent];
  if (!config.enabled) {
    // Defence in depth: the UI does not render a submittable form for a
    // disabled intent, but a POST must not slip through either.
    return {
      status: "error",
      message: config.blockedReason ?? "This channel is not currently accepting submissions.",
      values: typed,
    };
  }

  const parsed = contactSubmissionSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    // The honeypot failing is a bot. Give it the same answer as a human
    // typo rather than telling it which check it tripped.
    return {
      status: "error",
      message: "Please check the highlighted fields.",
      fieldErrors,
      values: typed,
    };
  }

  const endpoint = process.env.CREATOR_CONTACT_ENDPOINT;
  if (!endpoint) {
    console.error("[contact] CREATOR_CONTACT_ENDPOINT is not configured; enquiry not delivered.");
    return {
      status: "error",
      message:
        "We could not submit your enquiry just now. Please email cs@genedrift.com and we will pick it up.",
      values: typed,
    };
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(process.env.CREATOR_CONTACT_TOKEN
          ? { Authorization: process.env.CREATOR_CONTACT_TOKEN }
          : {}),
      },
      body: JSON.stringify({
        intent: parsed.data.intent,
        name: parsed.data.name,
        email: parsed.data.email,
        company: parsed.data.company,
        country: parsed.data.country || null,
        phone: parsed.data.phone || null,
        message: parsed.data.message,
        submittedAt: new Date().toISOString(),
        source: "genedrift.com",
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[contact] Creator rejected submission: ${response.status}`);
      return {
        status: "error",
        message:
          "We could not submit your enquiry just now. Please email cs@genedrift.com and we will pick it up.",
        values: typed,
      };
    }
  } catch (error) {
    console.error("[contact] submission failed", error);
    return {
      status: "error",
      message:
        "We could not submit your enquiry just now. Please email cs@genedrift.com and we will pick it up.",
      values: typed,
    };
  }

  return {
    status: "success",
    message: "Thank you — your enquiry has reached the team. We respond within one working day.",
  };
}

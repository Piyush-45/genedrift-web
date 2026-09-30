"use server";

import { INTENTS, contactSubmissionSchema, isContactIntent, type ContactSubmission } from "./contact";

/**
 * Contact submission — server action.
 *
 * The client confirmed every enquiry goes back into Zoho Creator, so this
 * POSTs to a Creator endpoint. Two things are configured, never hardcoded:
 *
 *   CREATOR_CONTACT_ENDPOINT   the Publish API form URL, including
 *                              ?privatelink=<key from their form permalink>
 *
 * ## The rule this file follows: never pretend an enquiry was received.
 *
 * If the endpoint is unconfigured, unreachable, or rejects the payload, the
 * visitor is told plainly and given the email address. A contact form that
 * shows a green tick and drops the message is worse than no form: the sender
 * believes they have been heard, and nobody ever finds out. On a site where
 * one of the intents is adverse-event adjacent, that matters more than usual.
 *
 * FIELD NAMES: mapped once, in toCreatorRecord below.
 */

/**
 * Our fields → the client's Website_Contact form (Creator, app `proton`).
 * Field link names read from the published form on 30 Sept.
 *
 * - Name is one box on our form and first/last on theirs. The last word is
 *   the last name; a single word goes to first name.
 * - Country: theirs is a lookup (`CountryLookUp`) that stores a record ID per
 *   country, and we do not hold that list. Until we do, the country travels
 *   as the first line of the message so their team still sees it.
 * - Source marks where the enquiry came from; it is a radio on their form.
 */
function toCreatorRecord(data: ContactSubmission): Record<string, unknown> {
  const words = data.name.split(/\s+/).filter(Boolean);
  const last = words.length > 1 ? words[words.length - 1] : "";
  const first = words.length > 1 ? words.slice(0, -1).join(" ") : data.name;
  const message = data.country ? `Country: ${data.country}\n\n${data.message}` : data.message;

  return {
    Name: { first_name: first, last_name: last },
    Email: data.email,
    Company: data.company,
    ...(data.phone ? { Phone_Number: data.phone } : {}),
    Inquiry_Type: data.inquiryType,
    Message: message,
    Source: "Website - Contact Us",
  };
}

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
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ data: toCreatorRecord(parsed.data) }),
      cache: "no-store",
    });

    // Zoho answers 200 with its own code in the body; 3000 is success.
    // Anything else (a missing mandatory field, an unknown option) is a
    // refusal, and its message is logged so the cause is visible in Vercel.
    const result = (await response.json().catch(() => null)) as
      | { code?: number; message?: unknown; error?: unknown }
      | null;
    if (!response.ok || result?.code !== 3000) {
      console.error(
        `[contact] Creator refused the enquiry: HTTP ${response.status}`,
        JSON.stringify(result),
      );
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
    // No response-time promise: the client has not given one.
    message: "Thank you. Your enquiry has reached the team.",
  };
}

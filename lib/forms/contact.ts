import { z } from "zod";

/**
 * Contact intents and validation — template H.
 *
 * ## Why Zod appears here
 *
 * The project rule is that Zod runs at BUILD time only (see
 * context/decisions.md), because re-validating already-published Catalyst
 * content on every request spends time discovering a problem too late to fix.
 *
 * Form input is the opposite case: it is untrusted, it arrives at runtime, and
 * it must be validated at the moment it arrives. Hand-rolling that is strictly
 * worse. So `lib/forms/` is an explicit, narrow exception to the rule — and the
 * only one. It does not reopen the door for section rendering.
 */

export const CONTACT_INTENTS = ["enquiry", "proposal", "partnership", "safety"] as const;
export type ContactIntent = (typeof CONTACT_INTENTS)[number];

export interface IntentConfig {
  slug: ContactIntent;
  label: string;
  eyebrow: string;
  heading: string;
  standfirst: string;
  submitLabel: string;
  /**
   * When false the form renders read-only with `blockedReason` shown.
   * Used for the PV/safety route until the client names an accountable owner.
   */
  enabled: boolean;
  blockedReason?: string;
  fallbackEmail?: string;
}

export const INTENTS: Record<ContactIntent, IntentConfig> = {
  enquiry: {
    slug: "enquiry",
    label: "Speak to an expert",
    eyebrow: "Speak to an expert",
    heading: "Tell us the product and the market. We'll map the pathway.",
    standfirst:
      "A regulatory lead reads every enquiry. Tell us what you are trying to register and where.",
    submitLabel: "Submit enquiry",
    enabled: true,
  },
  proposal: {
    slug: "proposal",
    label: "Request a proposal",
    eyebrow: "Request a proposal",
    heading: "Defined scope, timeline and commercial terms.",
    standfirst:
      "Give us the portfolio and the target markets and we will come back with a scoped proposal.",
    submitLabel: "Request proposal",
    enabled: true,
  },
  partnership: {
    slug: "partnership",
    label: "Partnership enquiry",
    eyebrow: "Partnership enquiry",
    heading: "For CROs, consultancies and local agents.",
    standfirst:
      "We work with partners in markets where a local presence adds something we do not already have.",
    submitLabel: "Send enquiry",
    enabled: true,
  },
  safety: {
    slug: "safety",
    label: "Pharmacovigilance & safety",
    eyebrow: "Pharmacovigilance & safety",
    heading: "Report an adverse event or product safety concern.",
    standfirst:
      "Safety reports are handled separately from commercial enquiries and are never routed through the sales queue.",
    submitLabel: "Submit safety report",
    /**
     * ⚠️ DELIBERATELY DISABLED. An adverse-event channel is a regulatory
     * obligation with a named accountable owner, mandatory fields and a
     * defined routing destination. None of those have been supplied — see
     * context/blocked-on-client.md, item 4.
     *
     * A form that accepts a safety report and drops it is worse than no form
     * at all: the reporter believes they have discharged their duty. Until the
     * client names the owner, this route shows the escalation path instead.
     *
     * Do not set this to true to "make the page look finished".
     */
    enabled: false,
    blockedReason:
      "This reporting channel is not yet live. Please report adverse events or product safety concerns by email so they reach the safety team directly.",
    fallbackEmail: "cs@genedrift.com",
  },
};

export function isContactIntent(value: string): value is ContactIntent {
  return (CONTACT_INTENTS as readonly string[]).includes(value);
}

/** Untrusted input. Validated at runtime, on the server, every time. */
export const contactSubmissionSchema = z.object({
  intent: z.enum(CONTACT_INTENTS),
  name: z.string().trim().min(2, "Please enter your name.").max(150),
  email: z.string().trim().email("Please enter a valid work email address.").max(150),
  company: z.string().trim().min(1, "Please enter your company.").max(200),
  country: z.string().trim().max(120).optional().or(z.literal("")),
  phone: z.string().trim().max(60).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Please tell us a little more.").max(4000),
  /** Honeypot. Bots fill it; humans never see it. Must arrive empty. */
  website: z.string().max(0).optional().or(z.literal("")),
});

export type ContactSubmission = z.infer<typeof contactSubmissionSchema>;

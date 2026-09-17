import { z } from "zod";

/**
 * The closing contact block: an enquiry panel on the accent ground, with
 * routing cards beside it.
 *
 * ⚠️ The enquiry panel is presentational only for now. The fields render so
 * the section reads as designed, but nothing is submitted — the CTA links
 * through to /contact. Real capture lands with template H (contact/[intent]),
 * which owns the Zod schema, react-hook-form wiring and the server action.
 * Both will then share one schema. Do not ship this section live before that.
 *
 * The PV / safety route is deliberately a separate card with its own copy:
 * adverse-event reporting is a regulatory obligation and must not be funnelled
 * into the commercial enquiry queue. See context/blocked-on-client.md — the
 * routing and the accountable owner are still unanswered.
 */
export const contactSplitSchema = z.object({
  type: z.literal("contact-split"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  fields: z.array(z.object({ label: z.string().min(1), wide: z.boolean().default(false) })).default([]),
  submitLabel: z.string().min(1),
  submitHref: z.string().min(1),
  routes: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        href: z.string().optional(),
        linkLabel: z.string().optional(),
        emphasis: z.enum(["neutral", "safety"]).default("neutral"),
      }),
    )
    .default([]),
  generalLabel: z.string().optional(),
  generalEmail: z.string().optional(),
});

export type ContactSplitProps = z.infer<typeof contactSplitSchema>;

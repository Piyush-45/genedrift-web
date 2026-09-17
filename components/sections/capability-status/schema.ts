import { z } from "zod";

/**
 * Per-market capability status — the table a buyer actually came for.
 *
 * The statuses are NOT stored here. They come from the referenced market in
 * the Markets collection, which is what makes "capabilities is an array"
 * matter: three renders as three, five renders as five, and the client's
 * unanswered question about whether it is always three (blocker 1) never
 * reaches the frontend.
 *
 * `notes` is the page's own editorial copy, keyed by capability name, for
 * the cases where a status needs a sentence of explanation. Optional, and a
 * missing note is normal, not an error.
 */
export const capabilityStatusSchema = z.object({
  type: z.literal("capability-status"),
  eyebrow: z.string().default("Capability coverage"),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  regionSlug: z.string().min(1),
  marketSlug: z.string().min(1),
  notes: z.record(z.string(), z.string()).default({}),
  footnote: z.string().optional(),
});

export type CapabilityStatusProps = z.infer<typeof capabilityStatusSchema>;

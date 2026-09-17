import { z } from "zod";

/**
 * Engagement models — a wrapped row of pills. Items may optionally link; the
 * homepage version does not, the expertise hub version will.
 */
export const pillRowSchema = z.object({
  type: z.literal("pill-row"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  items: z
    .array(z.object({ label: z.string().min(1), href: z.string().optional() }))
    .default([]),
});

export type PillRowProps = z.infer<typeof pillRowSchema>;

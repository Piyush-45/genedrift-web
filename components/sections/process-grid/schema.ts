import { z } from "zod";

/**
 * Operating model — the twelve lifecycle stages, on the warm band.
 *
 * The stage number is derived from position, not stored: renumbering a
 * twelve-row list by hand in a CMS is how 07 ends up appearing twice.
 */
export const processGridSchema = z.object({
  type: z.literal("process-grid"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  stages: z
    .array(z.object({ title: z.string().min(1), body: z.string().min(1) }))
    .default([]),
});

export type ProcessGridProps = z.infer<typeof processGridSchema>;

import { z } from "zod";

/**
 * Why Genedrift — four differentiators on the deep band. Top-rule cards, no
 * icons: the client's review banned icons in this section by name.
 */
export const valueGridSchema = z.object({
  type: z.literal("value-grid"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  items: z
    .array(z.object({ title: z.string().min(1), body: z.string().min(1) }))
    .default([]),
});

export type ValueGridProps = z.infer<typeof valueGridSchema>;

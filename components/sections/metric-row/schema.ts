import { z } from "zod";

/**
 * Proof numbers. Deliberately a plain list of {value, label, note} strings
 * rather than typed numerics — "46", "170+", "50+" and "10+" are all things
 * the client writes, and forcing them through a number field would lose the
 * "+" and invite an editor to guess a precise figure they do not have.
 *
 * ⚠️ Every figure here is a public claim about the business. The client's own
 * material already contradicts itself (the hero says forty-six markets, their
 * metrics row says thirty-plus). Do not invent numbers for this section.
 */
export const metricRowSchema = z.object({
  type: z.literal("metric-row"),
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  items: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
        note: z.string().optional(),
      }),
    )
    .default([]),
});

export type MetricRowProps = z.infer<typeof metricRowSchema>;

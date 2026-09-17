import { z } from "zod";

/**
 * Global presence. One card per region: name, a count numeral, and the market
 * names as links to their country pages. The client's review asked that every
 * market name be clickable and that the "no boundaries drawn" note stay
 * visible, so both the footnotes are content, not decoration.
 *
 * `count` is stored as a string because the design shows it zero-padded ("06").
 */
export const regionCardsSchema = z.object({
  type: z.literal("region-cards"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  headingTail: z.string().optional(),
  regions: z
    .array(
      z.object({
        name: z.string().min(1),
        count: z.string().min(1),
        href: z.string().optional(),
        markets: z
          .array(z.object({ name: z.string().min(1), href: z.string().min(1) }))
          .default([]),
      }),
    )
    .default([]),
  footnoteLeft: z.string().optional(),
  footnoteRight: z.string().optional(),
});

export type RegionCardsProps = z.infer<typeof regionCardsSchema>;

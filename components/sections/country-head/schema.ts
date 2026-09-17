import { z } from "zod";

/**
 * Template D head — one market. Name, region, local time and a locator map.
 *
 * The market itself is a REFERENCE (`marketSlug` + `regionSlug`), resolved by
 * lib/content/resolve.ts. The country's name, region and capabilities are NOT
 * stored here: they live once in the Markets collection, so correcting a
 * market's status updates the map, the region cards and this page together.
 *
 * What IS stored here is the page's own editorial copy — the standfirst and
 * the actions. That is the payload/relationship split from
 * context/cms-architecture.md applied to a single section.
 */
export const countryHeadSchema = z.object({
  type: z.literal("country-head"),
  eyebrow: z.string().default("Market"),
  regionSlug: z.string().min(1),
  marketSlug: z.string().min(1),
  standfirst: z.string().optional(),
  localTimeLabel: z.string().default("Local time"),
  showLocator: z.boolean().default(true),
  actions: z
    .array(z.object({ label: z.string().min(1), href: z.string().min(1), variant: z.enum(["solid", "quiet"]) }))
    .max(2)
    .default([]),
});

export type CountryHeadProps = z.infer<typeof countryHeadSchema>;

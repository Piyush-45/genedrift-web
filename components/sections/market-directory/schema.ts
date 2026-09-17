import { z } from "zod";

/**
 * Global presence — a searchable directory of every market and the services
 * offered there. Added on client request, 2026-09-15.
 *
 * The client asked for "a country search bar and a table of countries with the
 * services offered", explicitly WITHOUT a compare-markets feature. So this is a
 * filter over one list, never a side-by-side.
 *
 * `marketSource` is a REFERENCE, not a list of markets — the same contract
 * hero-map uses. Records arrive resolved as props (see lib/content/resolve.ts);
 * the component never imports the Markets collection.
 *
 * The capability columns are DERIVED from the markets themselves, not stored
 * here. The client confirmed (2026-09-16) that a market's capability list is
 * the same data the country pages already use — this view just personalises
 * which row you land on.
 */
export const marketDirectorySchema = z.object({
  type: z.literal("market-directory"),
  /* Optional: on /global-presence the page head already carries the h1, so
     repeating an eyebrow and heading here reads as a stutter. */
  eyebrow: z.string().optional(),
  heading: z.string().optional(),
  standfirst: z.string().optional(),
  searchLabel: z.string().default("Search for a country"),
  searchPlaceholder: z.string().default("Start typing a country or region…"),
  countryColumnLabel: z.string().default("Market"),
  regionColumnLabel: z.string().default("Region"),
  emptyLabel: z.string().default("No market matches that search."),
  /** "all", or a region slug. */
  marketSource: z.string().default("all"),
});

export type MarketDirectoryProps = z.infer<typeof marketDirectorySchema>;

import { z } from "zod";

/**
 * The hero: headline, the world map, a market status card, the health
 * authority bulletin, and the updates ticker along the bottom.
 *
 * The 46 markets are NOT in this schema — `marketSource` references them. A
 * market is edited once in the Markets collection and appears on the map, on
 * its country page and in the region cards. Putting the records in the
 * section payload would mean maintaining the same 46 twice.
 * See lib/content/resolve.ts.
 *
 * The client banned a hero in the brand colour. Do not reintroduce one.
 */
export const heroMapSchema = z.object({
  type: z.literal("hero-map"),
  /** "Get it approved" — the market name is appended live from the map. */
  headingLead: z.string().min(1),
  /** The small word before the market name. "in". */
  headingJoin: z.string().min(1),
  standfirst: z.string().min(1),
  actions: z
    .array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
        variant: z.enum(["solid", "quiet"]),
      }),
    )
    .max(2)
    .default([]),
  /** Slug of the market shown before the visitor touches anything. */
  defaultMarket: z.string().min(1),
  /**
   * Which markets to plot — a REFERENCE to the Markets collection, not the
   * records themselves. "all", or a region slug. The editor picks from a
   * dropdown; Catalyst resolves it to published market records at publish
   * time and the component receives them as props.
   */
  marketSource: z.string().default("all"),
  cardLabel: z.string().min(1),

  /**
   * "Find your market" — the phone-only search under the standfirst.
   *
   * Editable because the wording is the whole of it: a field labelled
   * "Search" asks the reader to guess what is searchable, and on a
   * regulatory site the answer ("the 46 markets we can file in") is the
   * selling point. Not rendered above lg, where the map is the control.
   */
  searchLabel: z.string().default("Find your market"),
  searchPlaceholder: z.string().default("Search 46 markets"),
  searchEmptyLabel: z.string().default("No market by that name. Try a region — Africa, Asia Pacific."),

  /**
   * Rolling health authority bulletin — client request, 15 September:
   * "New strip between the Market Status card and the Latest Updates ticker,
   * rotating authority names, starting with FDA."
   *
   * WHY `authority` AND AN OPTIONAL `note`. The client had not decided whether
   * this shows authority names alone or real headlines, and that question was
   * blocking the build. Carrying both makes it a content decision rather than
   * a rebuild: leave every note empty and it rotates bare authority names;
   * fill them in and it reads as a headline feed. Nothing changes here either
   * way.
   *
   * An EMPTY list hides the strip entirely, so an editor can switch it off
   * without anyone touching code.
   *
   * This is website content edited on the home page, with no relationship to
   * the editorial platform — confirmed 16 September. Who keeps it current is
   * the client's problem; our job was to give them the field.
   */
  bulletinLabel: z.string().default("Health authority bulletin"),
  bulletin: z
    .array(
      z.object({
        /** "FDA", "EMA", "CDSCO". */
        authority: z.string().min(1),
        /** Optional. Empty means the strip shows the authority name alone. */
        note: z.string().default(""),
        href: z.string().default(""),
      }),
    )
    .max(20)
    .default([]),

  /**
   * Label on the second strip — the one that rotates each market's health
   * authority. Its ENTRIES are not here: they come from the Markets
   * collection, so an authority is edited once on its own market and appears
   * here and on that market's country page.
   */
  authorityLabel: z.string().default("Regulatory authorities"),

  tickerLabel: z.string().min(1),
  ticker: z
    .array(z.object({ source: z.string().min(1), text: z.string().min(1), href: z.string().optional() }))
    .default([]),
});

export type HeroMapProps = z.infer<typeof heroMapSchema>;

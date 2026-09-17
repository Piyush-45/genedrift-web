import { z } from "zod";

/**
 * The Markets collection.
 *
 * Markets are NOT pages. A market is a record that many pages reference: the
 * homepage map, the Global Presence table, six region pages and 46 country
 * pages all read the same 46 rows. So it is published as ONE collection, in
 * one call, rather than 46 page publishes — and the website reads it from one
 * endpoint.
 *
 * This is the client's own request from 15 September: "Global presence must be
 * freely editable; the CMS must support adding, removing and reorganising
 * capabilities per market." Capabilities are therefore a LIST on each market,
 * never three named fields — a fourth capability is a new row in Creator, not
 * a schema change here or a column added in React.
 */

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lower-case words joined by single hyphens",
  });

/**
 * Creator sends whatever the dropdown says. The website understands exactly
 * three states, so the mapping lives here — one place — instead of being a
 * rule editors have to remember.
 *
 * An unrecognised value is REFUSED rather than silently treated as "none":
 * quietly downgrading a market to "no services here" is a commercial claim
 * nobody authorised.
 */
const STATUS_WORDS: Record<string, "available" | "upcoming" | "none"> = {
  available: "available",
  yes: "available",
  live: "available",
  active: "available",
  upcoming: "upcoming",
  "coming soon": "upcoming",
  soon: "upcoming",
  planned: "upcoming",
  none: "none",
  no: "none",
  "not available": "none",
  "not offered": "none",
  "—": "none",
  "-": "none",
};

export const capabilityStatusSchema = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, ctx) => {
    const key = String(value ?? "").trim().toLowerCase();
    if (key === "") return "none" as const;
    const mapped = STATUS_WORDS[key];
    if (!mapped) {
      ctx.addIssue({
        code: "custom",
        message: `Unknown capability status "${String(value)}". Use Available, Upcoming or Not available.`,
      });
      return z.NEVER;
    }
    return mapped;
  });

export const marketCapabilitySchema = z.object({
  name: z.string().trim().min(1).max(120),
  status: capabilityStatusSchema,
  displayOrder: z.coerce.number().int().default(0),
});

export const marketSchema = z.object({
  slug,
  name: z.string().trim().min(1).max(120),
  region: z.string().trim().min(1).max(120),
  regionSlug: slug,
  /** Hours from UTC. Half-hour and 45-minute offsets are real (IST, NPT). */
  utcOffset: z.coerce.number().min(-12).max(14),
  /** Position on the 1000x500 map viewBox. */
  x: z.coerce.number().min(0).max(1000),
  y: z.coerce.number().min(0).max(500),
  capabilities: z.array(marketCapabilitySchema).max(24).default([]),
});

export const regionSchema = z.object({
  slug,
  name: z.string().trim().min(1).max(120),
  displayOrder: z.coerce.number().int().default(0),
});

export const marketsPublishRequestSchema = z.object({
  markets: z.array(marketSchema).min(1).max(500),
  /**
   * Optional. When Creator does not send regions, they are derived from the
   * markets themselves, so the collection is never blocked on a second form
   * being filled in.
   */
  regions: z.array(regionSchema).max(50).optional(),
  publishNote: z.string().trim().max(2000).optional().nullable(),
});

export type MarketsPublishRequest = z.infer<typeof marketsPublishRequestSchema>;
export type PublishedMarket = z.infer<typeof marketSchema>;
export type PublishedRegion = z.infer<typeof regionSchema>;

export interface PublishedMarkets {
  schemaVersion: 1;
  publicationId: string;
  contentHash: string;
  publishedAt: string;
  markets: Array<Omit<PublishedMarket, "capabilities"> & {
    href: string;
    capabilities: Array<{ name: string; status: "available" | "upcoming" | "none" }>;
  }>;
  regions: PublishedRegion[];
}

/**
 * Duplicate slugs are the one error that cannot be allowed through: two rows
 * claiming `/markets/africa/kenya` means one country page silently wins and
 * the other disappears, with no error anywhere.
 */
export function findDuplicateSlug(markets: PublishedMarket[]): string | null {
  const seen = new Set<string>();
  for (const m of markets) {
    const key = `${m.regionSlug}/${m.slug}`;
    if (seen.has(key)) return key;
    seen.add(key);
  }
  return null;
}

/** Regions derived from the markets, in first-seen order. */
export function regionsFromMarkets(markets: PublishedMarket[]): PublishedRegion[] {
  const out: PublishedRegion[] = [];
  const seen = new Set<string>();
  for (const m of markets) {
    if (seen.has(m.regionSlug)) continue;
    seen.add(m.regionSlug);
    out.push({ slug: m.regionSlug, name: m.region, displayOrder: out.length });
  }
  return out;
}

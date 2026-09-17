import { MARKETS, REGIONS, type CapabilityStatus, type Market } from "@/lib/map/markets";
import { websiteCatalystBaseUrl } from "./website-pages";

/**
 * The Markets collection, from the CMS when it has one, from the built-in
 * copy when it does not.
 *
 * WHY MARKETS ARE NOT PAGES. 46 country pages, six region pages, the homepage
 * map and the Global Presence table all render the same 46 records. If a market
 * were edited page by page, "Kenya now offers Pharmacovigilance" would be four
 * edits in four places, three of which someone would forget. It is one record,
 * read by everything.
 *
 * This is the client's request of 15 September: "Global presence must be freely
 * editable; the CMS must support adding, removing and reorganising capabilities
 * per market."
 *
 * FALLING BACK IS DELIBERATE AND IS NOT A LAST RESORT. If Catalyst is
 * unreachable, or the collection has never been published, the site renders the
 * built-in 46 markets. A map with no countries on it is a far worse failure
 * than a map showing last week's truth.
 */

export interface Region {
  slug: string;
  name: string;
}

export interface MarketCollection {
  markets: Market[];
  regions: Region[];
  /** Where these came from. Used by the dev page and worth logging. */
  source: "cms" | "built-in";
}

const BUILT_IN: MarketCollection = {
  markets: [...MARKETS],
  regions: REGIONS.map((r) => ({ slug: r.slug, name: r.name })),
  source: "built-in",
};

const STATUSES: ReadonlySet<string> = new Set<CapabilityStatus>(["available", "upcoming", "none"]);

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * A hand-written guard, for the same reason `lib/content/guard.ts` is one:
 * Zod is a BUILD-TIME dependency here and never runs in the request path.
 *
 * One bad row is dropped; it does not take the collection down. A market with
 * no usable slug has no page to link to, so there is nothing to render anyway.
 */
function toMarket(value: unknown): Market | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  const slug = str(row.slug);
  const regionSlug = str(row.regionSlug);
  const name = str(row.name);
  if (!slug || !regionSlug || !name) return null;

  const x = Number(row.x);
  const y = Number(row.y);
  // A market with no position cannot be drawn on the map. Rendering it at
  // (0,0) would put it in the Atlantic, which looks like a bug in the map
  // rather than a gap in the data.
  if (!Number.isFinite(x) || !Number.isFinite(y)) return null;

  const capabilities = Array.isArray(row.capabilities)
    ? row.capabilities
        .map((c) => {
          if (!c || typeof c !== "object") return null;
          const cap = c as Record<string, unknown>;
          const capName = str(cap.name);
          const status = str(cap.status);
          if (!capName || !STATUSES.has(status)) return null;
          return { name: capName, status: status as CapabilityStatus };
        })
        .filter((c): c is { name: string; status: CapabilityStatus } => c !== null)
    : [];

  return {
    slug,
    name,
    region: str(row.region) || regionSlug,
    regionSlug,
    // Derived on the service, but never trusted blindly: a stored href that
    // disagrees with the slug is a 404 with no error message.
    href: `/markets/${regionSlug}/${slug}`,
    utcOffset: Number.isFinite(Number(row.utcOffset)) ? Number(row.utcOffset) : 0,
    x,
    y,
    capabilities,
  };
}

export async function fetchMarkets(): Promise<MarketCollection> {
  const baseUrl = websiteCatalystBaseUrl();
  if (!baseUrl) return BUILT_IN;

  try {
    const res = await fetch(`${baseUrl}/v1/public/markets`, {
      // One tag for the whole collection: publishing markets invalidates every
      // page that renders one, which is most of the site.
      next: { tags: ["website-markets"], revalidate: 60 },
    });
    if (!res.ok) return BUILT_IN;

    const body = (await res.json()) as {
      ok?: boolean;
      markets?: { markets?: unknown; regions?: unknown };
    };
    if (!body?.ok) return BUILT_IN;

    const rows = Array.isArray(body.markets?.markets) ? body.markets.markets : [];
    const markets = rows.map(toMarket).filter((m): m is Market => m !== null);

    // An EMPTY collection is treated as no collection. Publishing zero markets
    // is far more likely to be an accident than an instruction to empty the
    // map, and the built-in copy is a better answer than a blank world.
    if (markets.length === 0) return BUILT_IN;

    const published = Array.isArray(body.markets?.regions) ? body.markets.regions : [];
    const regions = published
      .map((r) => {
        const row = (r ?? {}) as Record<string, unknown>;
        const slug = str(row.slug);
        return slug ? { slug, name: str(row.name) || slug } : null;
      })
      .filter((r): r is Region => r !== null)
      // A region with no markets left in it would render as an empty page.
      .filter((r) => markets.some((m) => m.regionSlug === r.slug));

    return {
      markets,
      regions: regions.length > 0 ? regions : regionsFrom(markets),
      source: "cms",
    };
  } catch {
    return BUILT_IN;
  }
}

function regionsFrom(markets: Market[]): Region[] {
  const seen = new Map<string, string>();
  for (const m of markets) if (!seen.has(m.regionSlug)) seen.set(m.regionSlug, m.region);
  return [...seen].map(([slug, name]) => ({ slug, name }));
}

/* ------------------------------------------------- the lookups, async --- */

export async function getMarkets(): Promise<Market[]> {
  return (await fetchMarkets()).markets;
}

export async function getRegions(): Promise<Region[]> {
  return (await fetchMarkets()).regions;
}

export async function getMarketsInRegion(regionSlug: string): Promise<Market[]> {
  return (await getMarkets()).filter((m) => m.regionSlug === regionSlug);
}

export async function getMarket(regionSlug: string, slug: string): Promise<Market | undefined> {
  return (await getMarkets()).find((m) => m.regionSlug === regionSlug && m.slug === slug);
}

export async function getRegion(slug: string): Promise<Region | undefined> {
  return (await getRegions()).find((r) => r.slug === slug);
}

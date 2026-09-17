import type { Page, Section } from "@/lib/schema/section";
import { guardPage } from "./guard";
import { NAV } from "@/lib/nav";
import { JOBS, findJob } from "@/lib/jobs";
import { getMarket, getMarkets, getMarketsInRegion, getRegion, getRegions } from "./markets-source";
import { fetchWebsitePage } from "./website-pages";

import { heroMapFixture } from "@/components/sections/hero-map/fixture";
import { exploreJourneysFixture } from "@/components/sections/explore-journeys/fixture";
import { insightFeedFixture } from "@/components/sections/insight-feed/fixture";
import { statementFixture } from "@/components/sections/statement/fixture";
import { capabilityPanelsFixture } from "@/components/sections/capability-panels/fixture";
import { industryIndexFixture } from "@/components/sections/industry-index/fixture";
import { marketDirectoryFixture } from "@/components/sections/market-directory/fixture";
import { regionCardsFixture } from "@/components/sections/region-cards/fixture";
import { processGridFixture } from "@/components/sections/process-grid/fixture";
import { pillRowFixture } from "@/components/sections/pill-row/fixture";
import { valueGridFixture } from "@/components/sections/value-grid/fixture";
import { proofBillboardFixture } from "@/components/sections/proof-billboard/fixture";
import { contactSplitFixture } from "@/components/sections/contact-split/fixture";
import { countryHeadFixture } from "@/components/sections/country-head/fixture";
import { capabilityStatusFixture } from "@/components/sections/capability-status/fixture";
import { pageHeadFixture } from "@/components/sections/page-head/fixture";
import { subCapabilityGridFixture } from "@/components/sections/sub-capability-grid/fixture";
import { metricRowFixture } from "@/components/sections/metric-row/fixture";
import { faqAccordionFixture } from "@/components/sections/faq-accordion/fixture";
import { jobListFixture } from "@/components/sections/job-list/fixture";
import { jobDetailFixture } from "@/components/sections/job-detail/fixture";

/**
 * Stand-in for Catalyst while the CMS is being built. Same shape, same
 * validation path — swapping the source later touches `getPage` only.
 *
 * Pages are keyed by their path. Every page is an ordered list of sections
 * drawn from the ten built types: that is the section contract doing its job.
 * A hub page is not a new template in the "new React file" sense — it is a
 * different ordering of the same components.
 *
 * ⚠️ All body copy below the homepage is PLACEHOLDER. It is structurally
 * correct and factually unverified. None of it may go live without the
 * client's own words. See context/blocked-on-client.md.
 */

/**
 * The pillars routed by templates B and C. Closed list — routing refuses
 * anything else.
 *
 * `markets`, `careers` and `insights` are deliberately NOT here. Both have leaf pages
 * driven by real records rather than by nav children, which `[pillar]/[slug]`
 * cannot express, so each gets its own tree: app/markets/ (template D) and
 * app/careers/ (template G).
 */
export const PILLARS = [
  "explore",
  "expertise",
  "client-success",
  "company",
] as const;

export type Pillar = (typeof PILLARS)[number];

const NAV_BY_HREF = new Map(NAV.map((i) => [i.href, i]));

/** Children of a pillar, from the nav — so routes and menus cannot disagree. */
export function pillarChildren(pillar: Pillar) {
  return NAV_BY_HREF.get(`/${pillar}`)?.children ?? [];
}

const HUB_COPY: Record<Pillar, { eyebrow: string; lead: string; tail: string }> = {
  explore: {
    eyebrow: "Explore",
    lead: "Start with the problem, not our service names.",
    tail: "Most people arrive knowing the outcome they need, not what the industry calls it.",
  },
  expertise: {
    eyebrow: "Expertise",
    lead: "Regulatory Affairs, Pharmacovigilance and local representation,",
    tail: "delivered in-house by the people who stay accountable after approval.",
  },
  "client-success": {
    eyebrow: "Client impact",
    lead: "Work our clients let us talk about.",
    tail: "Each engagement tagged to a capability and a market.",
  },
  company: {
    eyebrow: "Company",
    lead: "A long-term regulatory partner,",
    tail: "not a service provider you re-brief every quarter.",
  },
};

function hubPage(pillar: Pillar): Omit<Page, "sections"> & { sections: Section[] } {
  const copy = HUB_COPY[pillar];

  // A hub is: one h1, the children of this pillar, then the sections that
  // genuinely belong to it. Borrowing the homepage's sections wholesale is
  // what made these pages read as stubs.
  const sections: Section[] = [
    {
      ...pageHeadFixture,
      eyebrow: copy.eyebrow,
      heading: copy.lead,
      headingTail: copy.tail,
      standfirst: undefined,
    },
    {
      ...subCapabilityGridFixture,
      eyebrow: "In this section",
      heading: `Everything under ${copy.eyebrow}.`,
      navSource: pillar,
      items: [],
    },
  ];

  if (pillar === "expertise") sections.push(capabilityPanelsFixture, processGridFixture, pillRowFixture);
  if (pillar === "client-success") sections.push(metricRowFixture, proofBillboardFixture);
  if (pillar === "company") sections.push(valueGridFixture, processGridFixture, metricRowFixture);
  if (pillar === "explore") sections.push(exploreJourneysFixture, industryIndexFixture);

  sections.push(faqAccordionFixture, contactSplitFixture);

  return {
    slug: pillar,
    title: `${copy.eyebrow} — Genedrift`,
    seo: { title: `${copy.eyebrow} — Genedrift`, description: copy.lead },
    sections,
  };
}

function detailPage(pillar: Pillar, slug: string, label: string) {
  const sections: Section[] = [
    {
      ...pageHeadFixture,
      eyebrow: HUB_COPY[pillar].eyebrow,
      heading: `${label}.`,
      headingTail: undefined,
      standfirst:
        "Placeholder standfirst — the client's own description of this service replaces it through the CMS. Nothing on this page has been verified.",
    },
    processGridFixture,
    faqAccordionFixture,
    contactSplitFixture,
  ];
  return {
    slug: `${pillar}/${slug}`,
    title: `${label} — Genedrift`,
    seo: { title: `${label} — Genedrift`, description: label },
    sections,
  };
}

const HOME = {
  slug: "home",
  title: "Genedrift — Global Regulatory Affairs & Pharmacovigilance",
  sections: [
    heroMapFixture,
    exploreJourneysFixture,
    statementFixture,
    capabilityPanelsFixture,
    industryIndexFixture,
    regionCardsFixture,
    processGridFixture,
    pillRowFixture,
    valueGridFixture,
    proofBillboardFixture,
    insightFeedFixture,
    contactSplitFixture,
  ],
};

/** Every detail route that exists, derived from the nav. */
export function detailRoutes(): { pillar: Pillar; slug: string; label: string }[] {
  const out: { pillar: Pillar; slug: string; label: string }[] = [];
  for (const pillar of PILLARS) {
    for (const child of pillarChildren(pillar)) {
      const slug = child.href.split("/").filter(Boolean).slice(1).join("/");
      if (slug && !slug.includes("/")) out.push({ pillar, slug, label: child.label });
    }
  }
  return out;
}

/**
 * The built-in content for a path, ignoring the CMS.
 *
 * Exported so `scripts/export-creator-seed.ts` can read every page's current
 * content and turn it into Creator records. Nothing in the request path should
 * use this — use `getPage`, which asks the CMS first.
 */
export function builtInPage(path: string): unknown {
  return raw(path);
}

function raw(path: string): unknown {
  if (path === "home") return HOME;

  const [pillar, slug] = path.split("/") as [Pillar, string | undefined];
  if (!PILLARS.includes(pillar)) return null;
  if (!slug) return hubPage(pillar);

  const match = detailRoutes().find((r) => r.pillar === pillar && r.slug === slug);
  return match ? detailPage(pillar, slug, match.label) : null;
}

/**
 * Resolve a page: the CMS first, the built-in content as the fallback.
 *
 * Pages migrate into Creator ONE AT A TIME. Until a path has been published
 * there, `fetchWebsitePage` returns `missing` and the built-in copy renders
 * exactly as before. So the site never has a broken window during the
 * migration, and no big-bang cutover is needed.
 *
 * A Catalyst outage also lands here as `missing`, which means the site
 * degrades to the last-known-good built-in copy rather than going down. That
 * is the right failure for a marketing site — and the opposite of the rule for
 * ARTICLES, where a failed fetch must NOT fall back, because serving invented
 * regulatory notices as real ones is far worse than serving nothing.
 */
export async function getPage(path: string): Promise<Page | null> {
  const sitePath = path === "home" ? "/" : `/${path}`;
  const fromCms = await fetchWebsitePage(sitePath);

  const record = fromCms.state === "ok" ? fromCms.record : raw(path);
  if (!record) return null;

  // Shallow boundary check only — deep validation happens in Catalyst at
  // publish time. See lib/content/guard.ts for why.
  const result = guardPage(record);
  if (!result.ok) throw new Error(`Invalid page "${path}": ${result.reason}`);
  if (result.dropped.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn(`[content] "${path}" dropped unknown sections:`, result.dropped);
  }
  return result.page;
}

/** Every section, once, for the /dev/sections gallery. */
export const ALL_FIXTURES = [
  heroMapFixture,
  jobListFixture,
  jobDetailFixture,
  pageHeadFixture,
  subCapabilityGridFixture,
  metricRowFixture,
  faqAccordionFixture,
  countryHeadFixture,
  capabilityStatusFixture,
  exploreJourneysFixture,
  statementFixture,
  capabilityPanelsFixture,
  industryIndexFixture,
  regionCardsFixture,
  processGridFixture,
  pillRowFixture,
  valueGridFixture,
  proofBillboardFixture,
  insightFeedFixture,
  contactSplitFixture,
];

/* ---------------------------------------------------------------------------
   Markets — template D. Three levels, driven entirely by the Markets
   collection (lib/content/markets-source.ts), which reads from the CMS and
   falls back to the built-in 46. That is why these are async: adding a market
   in Creator adds a page, and removing one removes it, with no deploy.
--------------------------------------------------------------------------- */

export async function marketsHubPage() {
  return {
    slug: "markets",
    title: "Markets — Genedrift",
    seo: {
      title: "Markets — Genedrift",
      description: "Forty-six markets across six regions.",
    },
    sections: [
      {
        ...pageHeadFixture,
        eyebrow: "Markets",
        heading: "Forty-six markets across six regions,",
        headingTail: "each with its own filing route and lifecycle obligations.",
        standfirst: undefined,
      },
      regionCardsFixture,
      contactSplitFixture,
    ] as Section[],
  };
}

/**
 * Global presence — added on client request, 2026-09-15. A search over every
 * market and the services offered in it. Deliberately NOT a compare view; the
 * client ruled that out.
 *
 * ⚠️ OPEN: whether this replaces /markets or sits beside it is not settled.
 * It is a separate route for now so nothing existing had to be torn out.
 */
export function globalPresencePage() {
  return {
    slug: "global-presence",
    title: "Global presence — Genedrift",
    seo: {
      title: "Global presence — Genedrift",
      description: "Search 46 markets and see which services are available in each.",
    },
    sections: [
      {
        ...pageHeadFixture,
        eyebrow: "Global presence",
        heading: "Forty-six markets,",
        headingTail: "one search away.",
        standfirst:
          "Search for a market to see which services are live there, which are coming, and where to go next.",
        actions: [],
      },
      marketDirectoryFixture,
      contactSplitFixture,
    ] as Section[],
  };
}

export async function regionPage(regionSlug: string) {
  const region = await getRegion(regionSlug);
  if (!region) return null;

  const markets = await getMarketsInRegion(regionSlug);
  if (markets.length === 0) return null;

  return {
    slug: `markets/${regionSlug}`,
    title: `${region.name} — Genedrift`,
    seo: {
      title: `${region.name} markets — Genedrift`,
      description: `${markets.length} markets across ${region.name}.`,
    },
    sections: [
      {
        ...pageHeadFixture,
        eyebrow: region.name,
        heading: `${markets.length} markets in ${region.name},`,
        headingTail: "one regional team across all of them.",
        standfirst: undefined,
        actions: [],
      },
      {
        ...regionCardsFixture,
        heading: `${region.name} —`,
        headingTail: `${markets.length} markets`,
        regions: [
          {
            name: region.name,
            count: String(markets.length).padStart(2, "0"),
            href: `/markets/${regionSlug}`,
            markets: markets.map((m) => ({ name: m.name, href: m.href })),
          },
        ],
      },
      contactSplitFixture,
    ] as Section[],
  };
}

export async function countryPage(regionSlug: string, countrySlug: string) {
  const market = await getMarket(regionSlug, countrySlug);
  if (!market) return null;

  return {
    slug: `markets/${regionSlug}/${countrySlug}`,
    title: `${market.name} — Genedrift`,
    seo: {
      title: `Regulatory Affairs & Pharmacovigilance in ${market.name} — Genedrift`,
      description: `Capability coverage, filing route and local representation in ${market.name}.`,
    },
    sections: [
      { ...countryHeadFixture, regionSlug, marketSlug: countrySlug },
      {
        ...capabilityStatusFixture,
        regionSlug,
        marketSlug: countrySlug,
        heading: `What we can carry in ${market.name}.`,
      },
      processGridFixture,
      contactSplitFixture,
    ] as Section[],
  };
}

/**
 * Every market route, for generateStaticParams.
 *
 * These are the routes prerendered AT BUILD TIME. A market added in Creator
 * after the build is NOT in this list — which is exactly why both market
 * routes set `dynamicParams = true`. Prerendering is an optimisation here,
 * not the definition of which pages exist.
 */
export async function marketRoutes() {
  return (await getMarkets()).map((m) => ({ region: m.regionSlug, country: m.slug }));
}

export async function regionRoutes() {
  return (await getRegions()).map((r) => ({ region: r.slug }));
}

/* ---------------------------------------------------------------------------
   Careers — template G. The openings list replaces the embedded Creator
   report iframe on genedrift.com/openings; job pages are generated from the
   same records. See lib/jobs.ts.
--------------------------------------------------------------------------- */

export function careersPage() {
  return {
    slug: "careers",
    title: "Careers — Genedrift",
    seo: {
      title: "Careers — Genedrift",
      description: "Regulatory and pharmacovigilance roles, in-house.",
    },
    sections: [
      {
        ...pageHeadFixture,
        eyebrow: "Careers",
        heading: "Regulatory careers with real ownership.",
        headingTail: "In-country specialists, not a remote processing desk.",
        standfirst: undefined,
      },
      valueGridFixture,
      jobListFixture,
      faqAccordionFixture,
      contactSplitFixture,
    ] as Section[],
  };
}

export function jobPage(slug: string) {
  const job = findJob(slug);
  if (!job) return null;

  return {
    slug: `careers/${slug}`,
    title: `${job.title} — Genedrift`,
    seo: {
      title: `${job.title} — Careers — Genedrift`,
      description: job.summary,
    },
    sections: [
      { ...jobDetailFixture, jobSlug: slug },
      contactSplitFixture,
    ] as Section[],
  };
}

export function jobRoutes() {
  return JOBS.map((j) => ({ job: j.slug }));
}

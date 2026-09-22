import { websiteCatalystBaseUrl } from "./website-pages";
import type { CaseStudy, CaseStudyMetric } from "./case-study";

/**
 * The Case Studies collection, from the CMS when it has one, from the
 * built-in copy when it does not. Same contract as `markets-source.ts`, for
 * the same reason: a case study is a RECORD, not a page. The listing, the
 * detail page and the homepage Client Impact billboard all read the same
 * eight rows, so it is edited once.
 *
 * ── WHERE THIS CONTENT CAME FROM ─────────────────────────────────────────
 *
 * Every record below is the client's OWN case study, transcribed from the
 * live pages on genedrift.com — their titles, their two families, their
 * Scenario / Solution / Result narratives. Nothing here was written for them
 * and nothing was embellished.
 *
 * That matters twice over. It means the page family can ship with real
 * content rather than placeholders, which is why it was blocked for three
 * weeks. And it means the content still needs THEIR sign-off before launch —
 * transcribed is not the same as approved, some of it reads as though it was
 * written some years ago, and two records (API Vendor Review, Biosimilars)
 * have no narrative on their current site either. Those two carry a summary
 * and no detail page. We did not write the missing halves.
 *
 * Figures in `metrics` are theirs, lifted from the sentence they appear in.
 * Do not add a figure that is not in the narrative it sits beside.
 */

const DELIVERING = { family: "Delivering Excellence", familySlug: "delivering-excellence" };
const STRATEGIC = { family: "Strategic Filing", familySlug: "strategic-filing" };

/** Exported so `scripts/export-case-studies-seed.ts` can turn these into
 * Creator import files. Nothing in the request path should use it directly —
 * use `getCaseStudies()`, which asks the CMS first. */
export const BUILT_IN_CASE_STUDIES: CaseStudy[] = [
  {
    ...DELIVERING,
    order: 1,
    slug: "capa-system-redesigned",
    title: "CAPA System — Redesigned",
    teaser:
      "A global manufacturer of solid orals wanted their complete Change Control and CAPA system redesigned to meet growing regulatory demands.",
    scenario:
      "A global manufacturer of solid orals was facing numerous problems relating to ineffective CAPA and Change Control procedures, which were leading to failed processes and delayed batch releases.",
    solution:
      "We examined the complete process, reviewing multiple SOPs and documents — including market complaints, audit observations and the software solution in use.",
    result:
      "Following a document review across every functional team, a process and method was designed that ensured each activity performed was effective, and market complaints reduced.",
    metrics: [],
    tags: ["Quality & compliance", "CAPA", "Change control"],
  },
  {
    ...DELIVERING,
    order: 2,
    slug: "label-artwork-management",
    title: "Label / Artwork Management",
    teaser:
      "An Indian company operating in 27 countries was finding it difficult to manage artwork for over 5,000 SKUs internally and ensure accuracy.",
    scenario:
      "A company was struggling to cope with multiple regulatory guidelines and could not ensure that its labels complied with the regulations covering over 5,000 SKUs across 27 countries.",
    solution:
      "We reviewed all the regulatory guidelines of the markets the client worked in. Each regulation was redrafted so that it was specific to the client's current and proposed product basket.",
    result:
      "The guidelines ensured labels were properly managed across all functional teams, inventory reduced, reviews were completed in time and non-compliances were minimised.",
    metrics: [
      { value: "5,000+", label: "SKUs covered" },
      { value: "27", label: "Countries" },
    ],
    tags: ["Labelling & artwork", "Regulatory affairs", "Multi-market"],
  },
  {
    ...DELIVERING,
    order: 3,
    slug: "api-vendor-review",
    title: "API Vendor Review",
    teaser:
      "A global manufacturer was facing issues with their API manufacturer. Reviewing the entry of a new API manufacturer while ensuring variation filings were made was a difficult area to manage.",
    scenario: "",
    solution: "",
    result: "",
    metrics: [],
    tags: ["Regulatory affairs", "Variations", "Supply chain"],
  },
  {
    ...DELIVERING,
    order: 4,
    slug: "life-cycle-management",
    title: "Life-Cycle Management",
    teaser:
      "The client was stuck with frequent changes, inadequate data management, broken processes and a lack of expertise, leading to six-figure revenue loss.",
    scenario:
      "Filings were spread across different facilities and teams — seven manufacturing sites, and more than twenty supply markets.",
    solution:
      "A dedicated team was assigned. Internal procedures were updated and all marketing authorisations were brought to active and updated status.",
    result:
      "While the client focused on revenue, we dealt with the regulatory challenges.",
    metrics: [
      { value: "7", label: "Manufacturing sites" },
      { value: "20+", label: "Supply markets" },
    ],
    tags: ["Lifecycle management", "Dedicated team", "Marketing authorisations"],
  },
  {
    ...STRATEGIC,
    order: 1,
    slug: "new-chemical-entity-asean",
    title: "New Chemical Entity — ASEAN",
    teaser:
      "The client was unable to make a regulatory filing for an EU-origin drug, for lack of understanding, knowledge and procedure in ASEAN.",
    scenario:
      "The client was struggling to make an NCE submission across ASEAN. Local regulations, translations, filing procedures, MA holding and data security were all a challenge.",
    solution:
      "We acted as a one-point contact for the target markets, preparing all regulatory packages and translations and making the filings. Providing data security and MA holding helped achieve the objectives.",
    result:
      "Time saving and data security helped the client save years on their plans and increase revenues. Maintaining a competitive edge was possible with the correct regulatory pathway.",
    metrics: [],
    tags: ["ASEAN", "New chemical entity", "MA holding"],
  },
  {
    ...STRATEGIC,
    order: 2,
    slug: "biosimilars",
    title: "Biosimilars",
    teaser:
      "One of the world's top 15 manufacturers wanted to enter an ASEAN market. They wanted an experienced regulatory partner to file and to provide MA holding and pharmacovigilance services.",
    scenario: "",
    solution: "",
    result: "",
    metrics: [],
    tags: ["Biosimilars", "ASEAN", "Pharmacovigilance"],
  },
  {
    ...STRATEGIC,
    order: 3,
    slug: "sla-based-closure",
    title: "SLA Based Closure",
    teaser:
      "Handling filings for a large Indian conglomerate that, despite its own local office and team, outsourced and received time-bound regulatory approvals in Uzbekistan.",
    scenario:
      "A large Indian conglomerate wanted to enter Uzbekistan in record time. Having developed some market-specific products, they wanted to be first to file.",
    solution:
      "A time-bound plan was required. Our team delivered the marketing authorisations to the client within record time, with the target of over-achieving on our own timelines.",
    result:
      "Having entered the market with their niche range, the client was able to lead with a majority share, while also receiving the marketing authorisations in their own name.",
    metrics: [],
    tags: ["Uzbekistan", "First to file", "Marketing authorisations"],
  },
  {
    ...STRATEGIC,
    order: 4,
    slug: "regulatory-filing-strategy",
    title: "Regulatory Filing Strategy",
    teaser:
      "A company with limited presence outside the EU wanted to build a substantial presence across Asia. Time was of the essence.",
    scenario:
      "An EU company with large drug manufacturing capabilities wanted to make a major presence felt across Asia Pacific. Finding the right partner was a challenge.",
    solution:
      "Each product was studied against six regulatory frameworks to identify the correct pathway and timelines. Filings were planned so that the marketing authorisations would be received within a pre-defined period.",
    result:
      "The company saved over two years and brought products to market faster, keeping competition at bay while holding leverage on the regulatory pathway and early MA receipt.",
    metrics: [
      { value: "6", label: "Regulatory frameworks" },
      { value: "2 yrs", label: "Time saved" },
    ],
    tags: ["Asia Pacific", "Filing strategy", "Market entry"],
  },
];

export interface CaseStudyCollection {
  studies: CaseStudy[];
  source: "cms" | "built-in";
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * A hand-written guard, for the same reason `markets-source.ts` has one: Zod
 * is a build-time dependency here and never runs in the request path.
 *
 * One bad row is dropped rather than taking the collection down. A record
 * with no slug or no title has nothing to render and nowhere to link.
 */
function toCaseStudy(value: unknown, index: number): CaseStudy | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  const title = str(row.title);
  const slug = str(row.slug) || slugify(title);
  if (!slug || !title) return null;

  const family = str(row.family) || "Case studies";

  const metrics = Array.isArray(row.metrics)
    ? row.metrics
        .map((m) => {
          if (!m || typeof m !== "object") return null;
          const metric = m as Record<string, unknown>;
          const value_ = str(metric.value);
          const label = str(metric.label);
          return value_ && label ? { value: value_, label } : null;
        })
        .filter((m): m is CaseStudyMetric => m !== null)
    : [];

  const tags = Array.isArray(row.tags)
    ? row.tags.map((t) => str(t)).filter((t) => t !== "")
    : [];

  const order = Number(row.order);

  return {
    slug,
    title,
    family,
    familySlug: str(row.familySlug) || slugify(family),
    teaser: str(row.teaser),
    scenario: str(row.scenario),
    solution: str(row.solution),
    result: str(row.result),
    metrics,
    tags,
    order: Number.isFinite(order) ? order : index + 1,
  };
}

export async function fetchCaseStudies(): Promise<CaseStudyCollection> {
  const baseUrl = websiteCatalystBaseUrl();
  if (!baseUrl) return { studies: [...BUILT_IN_CASE_STUDIES], source: "built-in" };

  try {
    const res = await fetch(`${baseUrl}/v1/public/case-studies`, {
      // One tag for the whole collection — publishing invalidates the listing
      // and every detail page at once.
      next: { tags: ["website-case-studies"], revalidate: 60 },
    });
    if (!res.ok) return { studies: [...BUILT_IN_CASE_STUDIES], source: "built-in" };

    const body = (await res.json()) as {
      ok?: boolean;
      caseStudies?: { caseStudies?: unknown };
    };
    if (!body?.ok) return { studies: [...BUILT_IN_CASE_STUDIES], source: "built-in" };

    const rows = Array.isArray(body.caseStudies?.caseStudies) ? body.caseStudies.caseStudies : [];
    const studies = rows
      .map(toCaseStudy)
      .filter((s): s is CaseStudy => s !== null);

    // An EMPTY collection is treated as no collection, exactly as with
    // markets: publishing zero case studies is far more likely to be an
    // accident than an instruction to empty the section.
    if (studies.length === 0) return { studies: [...BUILT_IN_CASE_STUDIES], source: "built-in" };

    return { studies, source: "cms" };
  } catch {
    return { studies: [...BUILT_IN_CASE_STUDIES], source: "built-in" };
  }
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return (await fetchCaseStudies()).studies;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return (await getCaseStudies()).find((s) => s.slug === slug);
}

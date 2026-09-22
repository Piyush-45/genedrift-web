import type { Section } from "@/lib/schema/section";
import type { Market } from "@/lib/map/markets";
import { getMarket, getMarkets, getMarketsInRegion } from "./markets-source";
import { NAV } from "@/lib/nav";
import { JOBS, findJob, type Job } from "@/lib/jobs";
import { getArticle, fetchArticles } from "./articles-source";
import { articleHref, articleKind } from "./article";
import type { Article } from "./article";
import { getCaseStudies } from "./case-studies-source";
import { hasDetail, type CaseStudy } from "./case-study";

/**
 * Relationship resolution — the seam between "what an editor stores" and
 * "what a component renders".
 *
 * The blueprint is explicit that a published page snapshot resolves its
 * relationships to explicit published versions before it is served. So there
 * are two shapes for any section that references a collection:
 *
 *   EDIT TIME   the editor stores a REFERENCE — "all markets", "markets in
 *               this region". That is what the Zod schema describes and what
 *               the CMS form shows. A market is edited once, in the Markets
 *               collection, and every page referencing it updates.
 *
 *   RENDER TIME the component receives RESOLVED RECORDS as props. It never
 *               imports a collection and never knows where the data came
 *               from.
 *
 * Markets now resolve from the CMS collection (`markets-source.ts`), which is
 * why this function is ASYNC. Everything else still resolves from `lib/`.
 * The components did not change when markets moved — which is the entire
 * point of having this seam at all.
 *
 * The rule this enforces: **a section component must never import a
 * collection.** If it needs records, they arrive as props.
 */

export interface ResolvedExtras {
  markets?: Market[];
  market?: Market;
  resolvedItems?: { title: string; href: string; body?: string }[];
  jobs?: Job[];
  job?: Job;
  article?: Article;
  studies?: CaseStudy[];
  caseStudy?: CaseStudy;
  /** The next openable case study, for the detail-page pager. */
  nextStudy?: CaseStudy;
}

export async function resolveSection(section: Section): Promise<Section & ResolvedExtras> {
  switch (section.type) {
    case "market-directory":
    case "hero-map":
      return {
        ...section,
        markets:
          section.marketSource === "all"
            ? await getMarkets()
            : await getMarketsInRegion(section.marketSource),
      };
    case "sub-capability-grid": {
      if (!section.navSource) return section;
      const parent = NAV.find((i) => i.href === `/${section.navSource}`);
      return {
        ...section,
        resolvedItems: (parent?.children ?? []).map((c) => ({ title: c.label, href: c.href })),
      };
    }

    /**
     * The homepage Knowledge Hub, filled from the editorial platform.
     *
     * The editor keeps the heading, the labels and — optionally — which
     * article is featured. The LIST is always the newest published articles,
     * because a homepage block captioned "Latest updates" is exactly the thing
     * nobody remembers to update by hand.
     *
     * If the feed is empty or unreachable the section is returned UNTOUCHED,
     * so it renders whatever an editor last stored rather than an empty box.
     * That stored content is bracketed placeholder copy from the design, which
     * reads as a placeholder — the one thing that must never appear here is an
     * invented regulatory notice that reads as real.
     */
    case "insight-feed": {
      // One more than the list needs, so pulling the featured article out of
      // the list still leaves a full list.
      const { articles } = await fetchArticles({ limit: section.limit + 1 });
      if (articles.length === 0) return section;

      const chosen = section.featuredSlug
        ? articles.find((a) => a.slug === section.featuredSlug)
        : undefined;
      // A featured slug that no longer resolves — retracted, renamed — falls
      // back to the newest article rather than leaving a hole on the homepage.
      const featuredArticle = chosen ?? articles[0];

      const rest = articles
        .filter((a) => a.slug !== featuredArticle?.slug)
        .slice(0, section.limit);

      return {
        ...section,
        featured: featuredArticle ? toFeatured(featuredArticle) : section.featured,
        items: rest.map(toListItem),
      };
    }

    case "article-head":
    case "article-body":
      return { ...section, article: getArticle(section.articleSlug) };

    /**
     * Case studies resolve from the collection, never from the page — the
     * same reason markets do. A record edited once in Creator updates the
     * listing, both detail pages that reference it and anything that surfaces
     * it later, without an editor touching three pages.
     */
    case "case-study-index": {
      const studies = await getCaseStudies();
      return {
        ...section,
        studies:
          section.source === "all"
            ? studies
            : studies.filter((s) => s.familySlug === section.source),
      };
    }

    case "case-study-head":
      return { ...section, caseStudy: await findCaseStudy(section.caseSlug) };

    case "case-study-body": {
      const studies = await getCaseStudies();
      const caseStudy = studies.find((s) => s.slug === section.caseSlug);
      return { ...section, caseStudy, nextStudy: caseStudy ? nextAfter(studies, caseStudy) : undefined };
    }

    case "job-list":
      return { ...section, jobs: [...JOBS] };

    case "job-detail":
      return { ...section, job: findJob(section.jobSlug) };

    case "country-head":
    case "capability-status":
      return { ...section, market: await getMarket(section.regionSlug, section.marketSlug) };

    default:
      return section;
  }
}

export async function resolveSections(
  sections: Section[],
): Promise<(Section & ResolvedExtras)[]> {
  // Parallel, not sequential. Every market lookup hits the same memoised
  // fetch, so this is one network call regardless of how many sections on the
  // page ask for markets.
  return Promise.all(sections.map(resolveSection));
}

/* ------------------------------------------------- article formatting --- */

/**
 * Same format as the article grid and the article head. Fixed to UTC on
 * purpose: a date rendered from the server's local zone can disagree with the
 * same date rendered elsewhere, which shows up as a hydration mismatch and as
 * an article apparently published a day early.
 */
function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** "12 Sep 2026 · 4 min read", dropping whichever half is missing. */
function featuredMeta(article: Article): string | undefined {
  const parts = [formatDate(article.publishedAt)];
  if (article.readingTimeMinutes) parts.push(`${article.readingTimeMinutes} min read`);
  const meta = parts.filter(Boolean).join(" · ");
  return meta || undefined;
}

/** "India · 12 Sep 2026" — the first tag reads as the market it concerns. */
function listMeta(article: Article): string | undefined {
  const parts = [article.tags?.[0]?.name, formatDate(article.publishedAt)];
  const meta = parts.filter(Boolean).join(" · ");
  return meta || undefined;
}

function toFeatured(article: Article) {
  return {
    // `articleKind` returns the taxon; "Insight" is the fallback when the
    // publish payload carries neither a content type nor a category — both
    // are optional in the contract on purpose.
    kind: articleKind(article)?.name ?? "Insight",
    meta: featuredMeta(article),
    title: article.title,
    // The design's featured card shows a flat tint where an image would go, so
    // a missing image is a supported state rather than a broken one.
    standfirst: article.excerpt,
    href: articleHref(article),
    image: article.featuredMedia?.url || undefined,
  };
}

function toListItem(article: Article) {
  return {
    // `articleKind` returns the taxon; "Insight" is the fallback when the
    // publish payload carries neither a content type nor a category — both
    // are optional in the contract on purpose.
    kind: articleKind(article)?.name ?? "Insight",
    meta: listMeta(article),
    title: article.title,
    href: articleHref(article),
  };
}

/* ------------------------------------------------------- case studies --- */

async function findCaseStudy(slug: string): Promise<CaseStudy | undefined> {
  return (await getCaseStudies()).find((s) => s.slug === slug);
}

/**
 * The next case study a reader can actually open — records with only a
 * summary are skipped, because sending someone to a page that does not exist
 * is worse than not offering a next step at all. Wraps around, so the last
 * record points back at the first.
 */
function nextAfter(studies: CaseStudy[], current: CaseStudy): CaseStudy | undefined {
  const openable = studies.filter(hasDetail);
  if (openable.length < 2) return undefined;
  const i = openable.findIndex((s) => s.slug === current.slug);
  if (i === -1) return openable[0];
  return openable[(i + 1) % openable.length];
}

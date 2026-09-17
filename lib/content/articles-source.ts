import type { Article } from "./article";
import { catalystGet, isCatalystConfigured } from "./catalyst";
import {
  fromDetail,
  fromFacets,
  fromSummary,
  type ApiDetailResponse,
  type ApiListResponse,
} from "./map-article";

/**
 * The Catalyst public-API client — fixtures for now.
 *
 * Source selection is by configuration, never by code change:
 *   CATALYST_API_BASE_URL set  → fetch the public API
 *   unset, development         → fixtures below, with a warning
 *   unset, production          → the build fails (see lib/content/catalyst.ts)
 *
 * This is the ONLY place that knows where articles come from; every component
 * takes resolved records as props, per lib/content/resolve.ts.
 *
 * The endpoint paths below are a best guess and must be confirmed against the
 * real API. Because they live here, confirming them is a one-file change.
 *
 * ⚠️ Fixture articles are invented and written to look like real regulatory
 * notices. They must not reach a client screenshot unlabelled.
 */

const img = (alt: string): Article["featuredMedia"] => ({
  url: "",
  alt,
  width: 1200,
  height: 675,
});

const ARTICLES: Article[] = [
  {
    uuid: "ART-0001",
    slug: "cdsco-import-licence-timeline-revised",
    title: "[SAMPLE] CDSCO revises import licence timelines for Form 10 applications",
    excerpt:
      "[SAMPLE] The authority has published revised processing timelines. What it means for products already in the queue, and for filings planned this quarter.",
    contentType: { name: "Regulatory Update", slug: "regulatory-updates" },
    category: { name: "Regulatory Affairs", slug: "regulatory-affairs" },
    tags: [
      { name: "India", slug: "india" },
      { name: "CDSCO", slug: "cdsco" },
      { name: "Import licence", slug: "import-licence" },
    ],
    featuredMedia: img("Placeholder"),
    publishedAt: "2026-09-08",
    readingTimeMinutes: 4,
    wordCount: 820,
    authors: [
      { name: "[SAMPLE] Author name", jobTitle: "Regulatory Affairs Lead", contribution: "Primary" },
    ],
    body: {
      format: "blocks",
      blocks: [
        { kind: "paragraph", text: "[SAMPLE] Opening paragraph summarising what changed and when it takes effect." },
        { kind: "heading", level: 2, text: "[SAMPLE] What changed" },
        { kind: "paragraph", text: "[SAMPLE] Detail of the revision, with the relevant clause reference." },
        { kind: "list", items: ["[SAMPLE] First implication", "[SAMPLE] Second implication", "[SAMPLE] Third implication"] },
        { kind: "callout", title: "What to do now", text: "[SAMPLE] Practical guidance for holders with filings in progress." },
        { kind: "heading", level: 2, text: "[SAMPLE] How we read it" },
        { kind: "quote", text: "[SAMPLE] A short pull quote from the analysis.", attribution: "[SAMPLE] Author name" },
        { kind: "paragraph", text: "[SAMPLE] Closing paragraph." },
      ],
    },
  },
  {
    uuid: "ART-0002",
    slug: "saudi-arabia-variation-guidance-updated",
    title: "[SAMPLE] SFDA updates variation guidance for registered products",
    excerpt: "[SAMPLE] Revised classification of minor and major variations, and the documents now expected with each.",
    contentType: { name: "Regulatory Update", slug: "regulatory-updates" },
    category: { name: "Regulatory Affairs", slug: "regulatory-affairs" },
    tags: [{ name: "Saudi Arabia", slug: "saudi-arabia" }, { name: "SFDA", slug: "sfda" }],
    publishedAt: "2026-09-02",
    readingTimeMinutes: 6,
  },
  {
    uuid: "ART-0003",
    slug: "nigeria-market-entry-guide",
    title: "[SAMPLE] Registering a medicinal product in Nigeria: the NAFDAC pathway",
    excerpt: "[SAMPLE] Dossier format, local representation requirements and realistic timelines for first registration.",
    contentType: { name: "Market Entry Guide", slug: "market-entry-guides" },
    category: { name: "Market Access", slug: "market-access" },
    tags: [{ name: "Nigeria", slug: "nigeria" }, { name: "NAFDAC", slug: "nafdac" }],
    publishedAt: "2026-08-26",
    readingTimeMinutes: 11,
  },
  {
    uuid: "ART-0004",
    slug: "qppv-obligations-emerging-markets",
    title: "[SAMPLE] QPPV obligations in emerging markets: what differs from the EU",
    excerpt: "[SAMPLE] Local qualified person requirements, case reporting windows and inspection expectations.",
    contentType: { name: "Expert Opinion", slug: "expert-opinions" },
    category: { name: "Pharmacovigilance", slug: "pharmacovigilance" },
    tags: [{ name: "QPPV", slug: "qppv" }, { name: "Pharmacovigilance", slug: "pharmacovigilance" }],
    publishedAt: "2026-08-19",
    readingTimeMinutes: 8,
  },
  {
    uuid: "ART-0005",
    slug: "uzbekistan-pharmacovigilance-inspection-notice",
    title: "[SAMPLE] Uzbekistan announces pharmacovigilance inspection programme",
    excerpt: "[SAMPLE] Scope, notice periods and the documentation inspectors have asked for elsewhere in the region.",
    contentType: { name: "Authority News", slug: "authority-news" },
    category: { name: "Pharmacovigilance", slug: "pharmacovigilance" },
    tags: [{ name: "Uzbekistan", slug: "uzbekistan" }, { name: "Inspections", slug: "inspections" }],
    publishedAt: "2026-08-11",
    readingTimeMinutes: 5,
  },
  {
    uuid: "ART-0006",
    slug: "gulf-regulatory-roadmap-2026",
    title: "[SAMPLE] Gulf regulatory roadmap: what changes across the GCC this year",
    excerpt: "[SAMPLE] Harmonisation progress, national divergences and the filings worth sequencing now.",
    contentType: { name: "Whitepaper", slug: "whitepapers" },
    category: { name: "Regulatory Intelligence", slug: "regulatory-intelligence" },
    tags: [{ name: "Gulf", slug: "gulf" }, { name: "Roadmap", slug: "roadmap" }],
    publishedAt: "2026-07-30",
    readingTimeMinutes: 14,
  },
];

export const ARTICLES_PER_PAGE = 9;

export function listArticles(opts: { kind?: string; tag?: string; page?: number } = {}) {
  let rows = [...ARTICLES];

  if (opts.kind) {
    rows = rows.filter(
      (a) => (a.contentType?.slug ?? a.category?.slug) === opts.kind,
    );
  }
  if (opts.tag) rows = rows.filter((a) => a.tags.some((t) => t.slug === opts.tag));

  rows.sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  const page = Math.max(1, opts.page ?? 1);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / ARTICLES_PER_PAGE));
  const start = (page - 1) * ARTICLES_PER_PAGE;

  return { articles: rows.slice(start, start + ARTICLES_PER_PAGE), total, page, pages };
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function allArticles(): Article[] {
  return [...ARTICLES];
}

/** Distinct kinds, for the filter bar. Derived, never stored. */
export function articleKinds() {
  const seen = new Map<string, { name: string; slug: string; count: number }>();
  for (const a of ARTICLES) {
    const k = a.contentType ?? a.category;
    if (!k) continue;
    const existing = seen.get(k.slug);
    if (existing) existing.count += 1;
    else seen.set(k.slug, { ...k, count: 1 });
  }
  return [...seen.values()].sort((a, b) => b.count - a.count);
}

/**
 * Site search over published articles.
 *
 * Deliberately simple: substring match across title, excerpt, kind and tags.
 * The Knowledge Hub is the only searchable content today. When Catalyst
 * exposes a search endpoint (`Site_Settings.Search_Enabled` implies one is
 * intended) this becomes a call to it, and nothing else changes.
 */
export function searchArticles(query: string) {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];

  return ARTICLES.filter((a) => {
    const haystack = [
      a.title,
      a.excerpt ?? "",
      a.contentType?.name ?? "",
      a.category?.name ?? "",
      ...a.tags.map((t) => t.name),
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  }).sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
}


/* ------------------------------------------------------------------------ *
 * Catalyst-backed reads — against the REAL public contract.
 *
 *   GET /v1/public/articles?page=&limit=&q=&category=&tag=
 *   GET /v1/public/articles/:slug
 *
 * Confirmed 2026-09-13 with the platform developer:
 *  - pagination is page-based, parameter is `limit` (default 20, max 50)
 *  - `category` and `tag` match DISPLAYED NAMES, not slugs, and are
 *    normalised for comparison
 *  - there is no `kind`/content-type filter yet
 *  - the listing returns `facets` — so the filter bar uses the API's own
 *    taxonomy rather than deriving one from the current page of results,
 *    which would have shown only the categories visible on page 1
 *  - an unknown slug is 404; a RETRACTED article is 410
 * ------------------------------------------------------------------------ */

/** Max the API accepts. Asking for more is rejected, not truncated. */
export const API_MAX_LIMIT = 50;

export interface ArticleFacets {
  categories?: { name: string; count?: number }[];
  tags?: { name: string; count?: number }[];
}

export interface ArticleListResult {
  articles: Article[];
  page: number;
  pages: number;
  total: number;
  facets?: ArticleFacets;
}

export async function fetchArticles(
  opts: { category?: string; tag?: string; q?: string; page?: number; limit?: number } = {},
): Promise<ArticleListResult> {
  if (!isCatalystConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[articles] CATALYST_API_BASE_URL unset — serving fixtures.");
    }
    const local = listArticles({ kind: opts.category, tag: opts.tag, page: opts.page });
    return { ...local, facets: undefined };
  }

  const params = new URLSearchParams();
  params.set("page", String(Math.max(1, opts.page ?? 1)));
  params.set("limit", String(Math.min(opts.limit ?? ARTICLES_PER_PAGE, API_MAX_LIMIT)));
  // Category and tag are matched by NAME — Catalyst lower-cases and trims both
  // sides before comparing, so the display name is the right thing to send.
  if (opts.category) params.set("category", opts.category);
  if (opts.tag) params.set("tag", opts.tag);
  if (opts.q) params.set("q", opts.q);

  const result = await catalystGet<ApiListResponse>(`/articles?${params}`, { tags: ["articles"] });

  // A failed fetch must NOT fall back to fixtures in production — that would
  // put invented regulatory notices on a live pharmaceutical site.
  if (result.state !== "ok") {
    return { articles: [], page: opts.page ?? 1, pages: 1, total: 0 };
  }

  const { articles, pagination, facets } = result.data;
  return {
    articles: articles.map(fromSummary),
    page: pagination.page,
    pages: pagination.totalPages,
    total: pagination.total,
    facets: fromFacets(facets),
  };
}

/**
 * `gone` means retracted (410). Catalyst returns the retraction REASON and a
 * `replacementPath` with it, so the page can say what happened and point at
 * whatever superseded it — far better than a generic not-found.
 */
export type ArticleFetch =
  | { state: "ok"; article: Article }
  | { state: "missing" }
  | { state: "gone"; reason?: string | null; replacementPath?: string | null };

export async function fetchArticle(slug: string): Promise<ArticleFetch> {
  if (!isCatalystConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[articles] CATALYST_API_BASE_URL unset — serving fixtures.");
    }
    const local = getArticle(slug);
    return local ? { state: "ok", article: local } : { state: "missing" };
  }

  const result = await catalystGet<ApiDetailResponse>(
    `/articles/${encodeURIComponent(slug)}`,
    { tags: ["articles", `article:${slug}`] },
  );

  if (result.state === "gone") {
    return { state: "gone", reason: result.reason, replacementPath: result.replacementPath };
  }
  if (result.state !== "ok" || !result.data.article) return { state: "missing" };
  return { state: "ok", article: fromDetail(result.data.article) };
}

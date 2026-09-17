import type { Article, ArticleMedia, ArticleTaxon } from "./article";

/**
 * Boundary mapper: Catalyst's public API shape → our `Article` contract.
 *
 * Written after reading the actual Catalyst source (`src/publicContent.ts`),
 * not from the summary. The two shapes differ in ways that typecheck fine and
 * fail at runtime, which is exactly why this file exists:
 *
 *  - `primaryCategory` is a plain STRING, not `{ name, slug }`
 *  - `tags` are plain STRINGS, not objects
 *  - the DETAIL response is nested under `article` / `revision`; the LIST
 *    response is flat — the same article has two shapes
 *  - the body is top-level `html`, and detail gives `featuredMediaId` plus a
 *    `media[]` array to resolve it from, while the list gives `featuredMedia`
 *    already resolved
 *  - `facets` are `string[]`, with no counts
 *
 * Keeping the mapping here means the components never learn any of that. If
 * Catalyst adds `authors` or `contentType`, this is the only file that changes.
 */

/* ---- what Catalyst actually returns ------------------------------------ */

export interface ApiMedia {
  mediaId: string;
  originalFilename: string;
  mimeType: string;
  fileSizeBytes: number;
  widthPixels: number;
  heightPixels: number;
  checksum: string;
  altText: string;
  caption?: string;
  credit?: string;
  publishedUrl?: string;
  url?: string;
}

export interface ApiArticleSummary {
  articleUuid: string;
  publicationId: string;
  revisionUuid: string;
  revisionNumber: number;
  title: string;
  slug: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  primaryCategory: string;
  tags: string[];
  publishedAt: string;
  readingTimeMinutes: number;
  featuredMedia: ApiMedia | null;
  /** Not present today. Declared so it maps through the moment it appears. */
  authors?: { name: string; jobTitle?: string; avatarUrl?: string; contribution?: string }[];
  contentType?: string;
}

export interface ApiArticleDetail {
  schemaVersion: number;
  publicationId: string;
  contentHash: string;
  publishedAt: string;
  article: { uuid: string; primaryCategory: string; tags: string[]; contentType?: string };
  revision: {
    uuid: string;
    number: number;
    title: string;
    slug: string;
    excerpt: string;
    seoTitle: string;
    seoDescription: string;
    canonicalUrlOverride: string;
    robotsDirective: string;
    wordCount: number;
    readingTimeMinutes: number;
    featuredMediaId?: string | null;
    socialMediaId?: string | null;
    approvedAt: string;
  };
  media: ApiMedia[];
  html: string;
  authors?: { name: string; jobTitle?: string; avatarUrl?: string; contribution?: string }[];
}

export interface ApiListResponse {
  ok: boolean;
  articles: ApiArticleSummary[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  facets?: { categories?: string[]; tags?: string[] };
}

export interface ApiDetailResponse {
  ok: boolean;
  article: ApiArticleDetail;
  pointer?: { publishedAt?: string; revisionNumber?: number };
}

export interface ApiRetraction {
  ok: false;
  code: string;
  message: string;
  articleUuid?: string;
  retractedAt?: string | null;
  reason?: string | null;
  replacementPath?: string | null;
}

/* ---- mapping ------------------------------------------------------------ */

/**
 * Taxonomy slugs are DERIVED, and used only for React keys and hrefs.
 * Filtering sends the NAME, because that is what the API matches on — it
 * lower-cases and trims both sides before comparing.
 */
function taxon(name: string): ArticleTaxon {
  return {
    name,
    slug: name
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  };
}

function media(asset: ApiMedia | null | undefined): ArticleMedia | undefined {
  if (!asset) return undefined;
  const url = asset.publishedUrl ?? asset.url;
  if (!url) return undefined;
  return {
    url,
    alt: asset.altText,
    caption: asset.caption || undefined,
    credit: asset.credit || undefined,
    width: asset.widthPixels,
    height: asset.heightPixels,
  };
}

export function fromSummary(row: ApiArticleSummary): Article {
  return {
    uuid: row.articleUuid,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || undefined,
    category: row.primaryCategory ? taxon(row.primaryCategory) : undefined,
    contentType: row.contentType ? taxon(row.contentType) : undefined,
    tags: (row.tags ?? []).map(taxon),
    featuredMedia: media(row.featuredMedia),
    seoTitle: row.seoTitle || undefined,
    seoDescription: row.seoDescription || undefined,
    publishedAt: row.publishedAt,
    readingTimeMinutes: row.readingTimeMinutes || undefined,
    authors: row.authors,
  };
}

export function fromDetail(detail: ApiArticleDetail): Article {
  const { article, revision } = detail;
  const featured = revision.featuredMediaId
    ? detail.media.find((m) => m.mediaId === revision.featuredMediaId)
    : undefined;

  return {
    uuid: article.uuid,
    slug: revision.slug,
    title: revision.title,
    excerpt: revision.excerpt || undefined,
    body: { format: "html", html: detail.html },
    category: article.primaryCategory ? taxon(article.primaryCategory) : undefined,
    contentType: article.contentType ? taxon(article.contentType) : undefined,
    tags: (article.tags ?? []).map(taxon),
    featuredMedia: media(featured),
    seoTitle: revision.seoTitle || undefined,
    seoDescription: revision.seoDescription || undefined,
    publishedAt: detail.publishedAt,
    readingTimeMinutes: revision.readingTimeMinutes || undefined,
    wordCount: revision.wordCount || undefined,
    authors: detail.authors,
  };
}

/** Facets arrive as plain string arrays — no counts. */
export function fromFacets(facets?: { categories?: string[]; tags?: string[] }) {
  return {
    categories: (facets?.categories ?? []).map((name) => ({ name })),
    tags: (facets?.tags ?? []).map((name) => ({ name })),
  };
}

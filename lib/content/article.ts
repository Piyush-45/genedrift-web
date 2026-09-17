/**
 * The PUBLIC article contract.
 *
 * Creator stays private (drafting and review). Catalyst publishes an immutable
 * public version. This app reads only the Catalyst public API — it never
 * touches a Creator form. See context/article-contract.md.
 *
 * Three things are deliberately LOOSE because the backend contract is not
 * final. Each one is loose in a way that costs nothing if it firms up:
 *
 *  1. URL SHAPE — `/insights/{slug}` vs `/insights/{contentType}/{slug}` is
 *     undecided. `articleHref()` is the single place that decides, and the
 *     route is a catch-all that accepts both. Flipping it is one function.
 *
 *  2. AUTHORS — not currently in the publish payload at all. `authors` is
 *     optional and the byline simply does not render when it is absent, so
 *     the page is correct either way.
 *
 *  3. CONTENT TYPE — may turn out to be the category. `contentType` is
 *     optional; listing and filtering fall back to `category` when it is
 *     missing, so nothing breaks whichever way it lands.
 */

export interface ArticleAuthor {
  name: string;
  jobTitle?: string;
  avatarUrl?: string;
  /** "Primary", "Co-author", "Contributor", "Subject Expert" */
  contribution?: string;
}

export interface ArticleMedia {
  url: string;
  alt: string;
  caption?: string;
  credit?: string;
  width?: number;
  height?: number;
}

export interface ArticleTaxon {
  name: string;
  slug: string;
}

/**
 * The body.
 *
 * `Editor_Document` is structured JSON (the publish code greps it for
 * `"mediaId":"`), not HTML and not a .docx. Until we know whether Catalyst
 * converts it, the renderer supports BLOCKS only — a closed set of node types
 * rendered as real React elements.
 *
 * The `html` variant is declared so the contract can express it, but it is NOT
 * rendered yet, on purpose: injecting unsanitised HTML into a pharmaceutical
 * client's site to save an afternoon is not a trade worth making. When we know
 * what Catalyst emits we add a sanitiser and turn it on.
 */
export type ArticleBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; level: 2 | 3; text: string }
  | { kind: "list"; ordered?: boolean; items: string[] }
  | { kind: "quote"; text: string; attribution?: string }
  | { kind: "image"; media: ArticleMedia }
  | { kind: "callout"; title?: string; text: string };

export type ArticleBody =
  | { format: "blocks"; blocks: ArticleBlock[] }
  | { format: "html"; html: string };

export interface Article {
  uuid: string;
  slug: string;
  title: string;
  excerpt?: string;
  body?: ArticleBody;
  /** Undecided whether this or `category` drives the URL. Optional on purpose. */
  contentType?: ArticleTaxon;
  category?: ArticleTaxon;
  tags: ArticleTaxon[];
  featuredMedia?: ArticleMedia;
  seoTitle?: string;
  seoDescription?: string;
  publishedAt?: string;
  readingTimeMinutes?: number;
  wordCount?: number;
  /** Absent today — the publish payload carries no author. Renders when present. */
  authors?: ArticleAuthor[];
}

/* ------------------------------------------------------------------------ *
 * URL shape — the single place that decides. Flip ONE constant to change
 * every link, route and sitemap entry on the site.
 * ------------------------------------------------------------------------ */

/** Set true once the client confirms `/insights/{content-type}/{slug}`. */
export const URL_INCLUDES_CONTENT_TYPE = false;

export const INSIGHTS_BASE = "/insights";

export function articleHref(article: Article): string {
  const segment = article.contentType?.slug ?? article.category?.slug;
  return URL_INCLUDES_CONTENT_TYPE && segment
    ? `${INSIGHTS_BASE}/${segment}/${article.slug}`
    : `${INSIGHTS_BASE}/${article.slug}`;
}

/**
 * Route params for an article.
 *
 * Today the route is a single segment (`/insights/[slug]`). If
 * URL_INCLUDES_CONTENT_TYPE is turned on, add `[type]/[slug]/page.tsx` and use
 * `articleTypeParams` there — this helper keeps serving the flat route.
 */
export function articleParams(article: Article): { slug: string } {
  return { slug: article.slug };
}

/** Params for the nested content-type route, if that shape is adopted. */
export function articleTypeParams(article: Article): { type: string; slug: string } | null {
  const segment = article.contentType?.slug ?? article.category?.slug;
  return segment ? { type: segment, slug: article.slug } : null;
}

/** What a taxonomy filter should group by, whichever way the backend lands. */
export function articleKind(article: Article): ArticleTaxon | undefined {
  return article.contentType ?? article.category;
}

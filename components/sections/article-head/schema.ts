import { z } from "zod";

/**
 * Template F head — title, byline, kind, date, reading time.
 *
 * The byline renders only when the article carries authors. Today the publish
 * payload has none, so it degrades to no byline rather than to an empty row.
 * When Catalyst starts sending `authors` it appears with no frontend change.
 */
export const articleHeadSchema = z.object({
  type: z.literal("article-head"),
  articleSlug: z.string().min(1),
  backLabel: z.string().default("← All insights"),
  backHref: z.string().default("/insights"),
});

export type ArticleHeadProps = z.infer<typeof articleHeadSchema>;

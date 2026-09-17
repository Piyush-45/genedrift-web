import { z } from "zod";

/**
 * Template E — the Insights listing: a filter bar, a grid of articles and
 * pagination.
 *
 * Articles are a REFERENCE, resolved from the Catalyst public API. The section
 * stores only its own copy and its filter/empty behaviour.
 *
 * `kind` is deliberately vague about content-type-vs-category: it filters on
 * whichever the article carries. See lib/content/article.ts.
 */
export const articleGridSchema = z.object({
  type: z.literal("article-grid"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  showFilters: z.boolean().default(true),
  allLabel: z.string().default("All"),
  emptyMessage: z.string().default("Nothing published here yet."),
});

export type ArticleGridProps = z.infer<typeof articleGridSchema>;

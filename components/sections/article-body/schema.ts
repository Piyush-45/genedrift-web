import { z } from "zod";

/**
 * Template F body.
 *
 * Creator stores the document as TipTap JSON, but the public API does not
 * expose that — Catalyst converts it to sanitised HTML at publish time and
 * serves `article.html`. So HTML is the live path.
 *
 * It is sanitised AGAIN on our side before rendering (lib/content/sanitize.ts),
 * agreed with the platform developer as defence in depth: on a pharmaceutical
 * site, one sanitiser between an editor's document and a public page is a
 * single point of failure.
 *
 * The `blocks` variant is kept because it is the better shape and the raw
 * TipTap JSON may be exposed later; nothing is lost by supporting both.
 */
export const articleBodySchema = z.object({
  type: z.literal("article-body"),
  articleSlug: z.string().min(1),
});

export type ArticleBodyProps = z.infer<typeof articleBodySchema>;

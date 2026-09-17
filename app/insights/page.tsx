import type { Metadata } from "next";
import { ArticleGrid } from "@/components/sections/article-grid";
import { articleGridFixture } from "@/components/sections/article-grid/fixture";
import { ContactSplit } from "@/components/sections/contact-split";
import { contactSplitFixture } from "@/components/sections/contact-split/fixture";
import { fetchArticles } from "@/lib/content/articles-source";

/**
 * Template E — the Insights listing.
 *
 * Filtering and paging live in the query string, not the path: `?category=`,
 * `?tag=`, `?q=` and `?page=` — the parameters the public API actually takes.
 * That avoids minting path-based taxonomy URLs we might have to redirect away
 * from once the content-type question is settled.
 *
 * NOTE: the API matches category and tag by DISPLAYED NAME, not slug. So the
 * values in these links are names, and the filter chips come from the API's
 * own `facets` rather than from the current page of results — deriving them
 * locally would only ever show the categories that happened to appear on
 * page 1.
 */
export const metadata: Metadata = {
  title: "Knowledge Hub — Genedrift",
  description: "Regulatory intelligence, authority updates and country analysis.",
};

export default async function InsightsIndex({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; tag?: string; q?: string; page?: string }>;
}) {
  const { category, tag, q, page } = await searchParams;
  const parsed = Number.parseInt(page ?? "1", 10);
  const result = await fetchArticles({
    category,
    tag,
    q,
    page: Number.isFinite(parsed) ? parsed : 1,
  });

  return (
    <main className="pb-section">
      <ArticleGrid
        {...articleGridFixture}
        articles={result.articles}
        categories={result.facets?.categories ?? []}
        activeCategory={category}
        page={result.page}
        pages={result.pages}
      />
      <ContactSplit {...contactSplitFixture} />
    </main>
  );
}

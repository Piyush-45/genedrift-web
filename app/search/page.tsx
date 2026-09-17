import type { Metadata } from "next";
import Link from "next/link";
import { PageHead } from "@/components/sections/page-head";
import { fetchArticles } from "@/lib/content/articles-source";
import { articleHref, articleKind } from "@/lib/content/article";

/**
 * Site search.
 *
 * The header has always linked here; the route did not exist, so every visit
 * was a 404. Searching the Knowledge Hub is what the icon is for, so that is
 * what it does — no placeholder page, no dead link.
 */
export const metadata: Metadata = {
  title: "Search — Genedrift",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const searched = q.trim().length >= 2;
  // The public API takes `q` directly, so search is the same endpoint as the
  // listing rather than a second implementation.
  const results = searched ? (await fetchArticles({ q, limit: 20 })).articles : [];

  return (
    <main className="pb-section">
      <PageHead
        type="page-head"
        eyebrow="Search"
        heading="Search the Knowledge Hub."
        standfirst="Regulatory updates, country intelligence and analysis."
        actions={[]}
      />

      <section className="px-gutter pt-10">
        <div className="mx-auto max-w-body">
          <form role="search" className="flex max-w-[34rem] gap-3">
            <label htmlFor="q" className="sr-only">
              Search
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Try a market, an authority, or a topic"
              className="grow rounded-control border border-line bg-canvas px-4 py-3.5 text-md outline-none focus-visible:border-accent"
            />
            <button
              type="submit"
              className="rounded-control bg-accent px-6 py-3.5 text-md font-semibold text-on-accent transition-colors hover:bg-deep"
            >
              Search
            </button>
          </form>

          {searched && (
            <p className="label mt-8 text-faint">
              {results.length} result{results.length === 1 ? "" : "s"} for “{q.trim()}”
            </p>
          )}

          {searched && results.length > 0 && (
            <ul className="mt-6 border-t border-line">
              {results.map((article) => {
                const kind = articleKind(article);
                return (
                  <li key={article.uuid} className="border-b border-line">
                    <Link href={articleHref(article)} className="group block py-6">
                      <span className="label text-accent">{kind?.name}</span>
                      <span className="mt-2.5 block text-h4 font-bold group-hover:text-accent">
                        {article.title}
                      </span>
                      {article.excerpt && (
                        <span className="mt-2 block max-w-[70ch] text-sm text-muted">
                          {article.excerpt}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {searched && results.length === 0 && (
            <p className="mt-6 rounded-panel border border-line bg-surface px-8 py-10 text-lead text-muted">
              Nothing matched that. Try a market name, an authority, or browse the{" "}
              <Link href="/insights" className="font-semibold text-accent">
                Knowledge Hub
              </Link>
              .
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

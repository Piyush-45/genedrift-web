import Link from "next/link";
import { cn } from "@/lib/cn";
import { articleHref, articleKind, type Article } from "@/lib/content/article";
import type { ArticleGridProps } from "./schema";

function formatDate(iso?: string) {
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

export function ArticleGrid({
  eyebrow,
  heading,
  standfirst,
  showFilters,
  allLabel,
  emptyMessage,
  articles = [],
  categories = [],
  activeCategory,
  page = 1,
  pages = 1,
  basePath = "/insights",
}: ArticleGridProps & {
  articles?: Article[];
  /** From the API's `facets.categories` — matched by NAME, not slug. */
  categories?: { name: string; count?: number }[];
  activeCategory?: string;
  page?: number;
  pages?: number;
  basePath?: string;
}) {
  const filterHref = (name?: string) =>
    name ? `${basePath}?category=${encodeURIComponent(name)}` : basePath;

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        {/* This section IS the page head on template E, so it owns the <h1>.
            SectionHead renders an <h2>, which left the listing page with no
            <h1> at all — correct-looking, and wrong for search and screen
            readers. */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
          <div>
            <p className="label text-accent">{eyebrow}</p>
            <h1 className="mt-4 max-w-[24ch] text-display font-bold">{heading}</h1>
          </div>
          {standfirst && <p className="max-w-[24rem] text-lead text-muted">{standfirst}</p>}
        </div>

        {showFilters && categories.length > 0 && (
          <nav aria-label="Filter by type" className="mt-10 flex flex-wrap gap-2.5">
            <Link
              href={filterHref()}
              aria-current={!activeCategory ? "true" : undefined}
              className={cn(
                "rounded-pill border px-5 py-2.5 text-sm transition-colors",
                !activeCategory
                  ? "border-accent bg-accent text-on-accent"
                  : "border-line text-mid hover:border-line-tint hover:text-accent",
              )}
            >
              {allLabel}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.name}
                href={filterHref(c.name)}
                aria-current={activeCategory === c.name ? "true" : undefined}
                className={cn(
                  "rounded-pill border px-5 py-2.5 text-sm transition-colors",
                  activeCategory === c.name
                    ? "border-accent bg-accent text-on-accent"
                    : "border-line text-mid hover:border-line-tint hover:text-accent",
                )}
              >
                {c.name}
                {typeof c.count === "number" && (
                  <span className="ml-2 tabular-nums opacity-60">{c.count}</span>
                )}
              </Link>
            ))}
          </nav>
        )}

        {articles.length === 0 ? (
          <p className="mt-11 rounded-panel border border-line bg-surface px-8 py-10 text-lead text-muted">
            {emptyMessage}
          </p>
        ) : (
          <ul className="mt-11 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => {
              const kind = articleKind(article);
              const date = formatDate(article.publishedAt);
              return (
                <li key={article.uuid} className="bg-canvas">
                  <Link href={articleHref(article)} className="group flex h-full flex-col p-7.5">
                    <span className="label text-accent">
                      {kind?.name}
                      {date ? ` · ${date}` : ""}
                    </span>

                    <span className="mt-4 block text-h4 leading-snug font-bold group-hover:text-accent">
                      {article.title}
                    </span>

                    {article.excerpt && (
                      <span className="mt-3 block text-sm text-muted">{article.excerpt}</span>
                    )}

                    {article.readingTimeMinutes ? (
                      <span className="label mt-auto pt-6 text-faint">
                        {article.readingTimeMinutes} min read
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-4">
            {page > 1 ? (
              <Link
                href={`${basePath}?page=${page - 1}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`}
                className="text-sm font-semibold text-accent"
              >
                ← Newer
              </Link>
            ) : (
              <span />
            )}
            <span className="label text-faint">
              Page {page} of {pages}
            </span>
            {page < pages ? (
              <Link
                href={`${basePath}?page=${page + 1}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`}
                className="text-sm font-semibold text-accent"
              >
                Older →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </section>
  );
}

import Link from "next/link";
import { articleKind, type Article } from "@/lib/content/article";
import type { ArticleHeadProps } from "./schema";

function formatDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  });
}

export function ArticleHead({
  backLabel,
  backHref,
  article,
}: ArticleHeadProps & { article?: Article }) {
  if (!article) return null;

  const kind = articleKind(article);
  const date = formatDate(article.publishedAt);

  return (
    <header className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-[52rem]">
        <Link href={backHref} className="label text-accent hover:text-deep">
          {backLabel}
        </Link>

        <p className="label mt-8 text-faint">
          {[kind?.name, date, article.readingTimeMinutes ? `${article.readingTimeMinutes} min read` : null]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <h1 className="mt-5 text-h1 leading-[1.14] font-bold">{article.title}</h1>

        {article.excerpt && <p className="mt-6 text-lead text-muted">{article.excerpt}</p>}

        {/* Renders only when authors are present — see schema.ts. */}
        {article.authors && article.authors.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6">
            {article.authors.map((a) => (
              <li key={a.name}>
                <p className="text-md font-semibold">{a.name}</p>
                {a.jobTitle && <p className="text-sm text-muted">{a.jobTitle}</p>}
              </li>
            ))}
          </ul>
        )}

        {article.tags.length > 0 && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <li key={t.slug} className="rounded-pill bg-surface px-3.5 py-1.5 text-xs text-slate">
                {t.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}

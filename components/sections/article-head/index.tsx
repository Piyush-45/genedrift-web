import Link from "next/link";
import { articleKind, type Article } from "@/lib/content/article";
import { formatArticleDate } from "@/lib/content/format-date";
import { ArticleCover } from "@/components/insights/article-cover";
import type { ArticleHeadProps } from "./schema";

/**
 * Template F head: the reading page's hero.
 *
 * With a cover: the image runs the full content width, and the headline sits
 * on a white panel that overlaps its lower edge. The image gets the weight of
 * a magazine opener while the title stays on a plain ground, so it is always
 * readable whatever the photo is.
 *
 * Without a cover: the same panel layout on the brand's deep purple with the
 * dot grid, so an image-less article still opens like a publication rather
 * than a document.
 */
function HeadText({ article, onDark }: { article: Article; onDark?: boolean }) {
  const kind = articleKind(article);
  const date = formatArticleDate(article.publishedAt, "long");
  const meta = [date, article.readingTimeMinutes ? `${article.readingTimeMinutes} min read` : null].filter(Boolean);

  const pill = onDark
    ? "bg-on-deep-accent/15 text-on-deep-accent hover:bg-on-deep-accent hover:text-deep"
    : "bg-lavender text-accent hover:bg-accent hover:text-on-accent";

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {kind &&
          (article.category && kind === article.category ? (
            <Link
              href={`/insights?category=${encodeURIComponent(article.category.name)}`}
              className={`rounded-pill px-3.5 py-1.5 text-xs font-semibold transition-colors ${pill}`}
            >
              {kind.name}
            </Link>
          ) : (
            <span className={`rounded-pill px-3.5 py-1.5 text-xs font-semibold ${pill}`}>{kind.name}</span>
          ))}
        {meta.length > 0 && (
          <span className={`label ${onDark ? "text-on-deep-faint" : "text-faint"}`}>{meta.join(" · ")}</span>
        )}
      </div>

      {/* Colour and size as plain strings, not cn(): tailwind-merge reads the
          custom "text-on-deep" colour and "text-display" size as the same
          utility and drops one of them. */}
      <h1 className={`mt-6 text-display font-bold text-balance ${onDark ? "text-on-deep" : ""}`}>{article.title}</h1>

      {article.excerpt && (
        <p className={`mt-5 max-w-[44rem] text-[1.1875rem] leading-[1.6] ${onDark ? "text-on-deep-muted" : "text-muted"}`}>
          {article.excerpt}
        </p>
      )}

      {/* Renders only when authors are present — see schema.ts. */}
      {article.authors && article.authors.length > 0 && (
        <ul
          className={`mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t pt-6 ${onDark ? "border-on-deep-faint/30" : "border-line"}`}
        >
          {article.authors.map((a) => (
            <li key={a.name} className="flex items-center gap-3">
              <span
                aria-hidden
                className={`grid size-9 place-items-center rounded-full text-xs font-bold ${onDark ? "bg-on-deep-accent/20 text-on-deep" : "bg-lavender text-accent"}`}
              >
                {a.name.replace(/\[.*?\]\s*/g, "").trim().charAt(0) || "G"}
              </span>
              <span>
                <span className={`block text-md font-semibold ${onDark ? "text-on-deep" : ""}`}>{a.name}</span>
                {a.jobTitle && (
                  <span className={`block text-sm ${onDark ? "text-on-deep-muted" : "text-muted"}`}>{a.jobTitle}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export function ArticleHead({
  backLabel,
  backHref,
  article,
}: ArticleHeadProps & { article?: Article }) {
  if (!article) return null;
  const media = article.featuredMedia;

  return (
    <header className="px-gutter pt-8 lg:pt-12">
      <div className="mx-auto max-w-body">
        <Link href={backHref} className="label text-accent hover:text-deep">
          {backLabel}
        </Link>

        {media?.url ? (
          <div className="mt-6">
            <ArticleCover
              article={article}
              eager
              className="aspect-[4/3] rounded-hero sm:aspect-[2/1] lg:aspect-[21/9]"
            />
            <div className="relative mx-auto -mt-12 w-[calc(100%-1.5rem)] max-w-[60rem] rounded-hero border border-line bg-canvas px-6 py-8 shadow-[0_32px_64px_-44px_rgba(36,22,83,0.55)] sm:-mt-24 sm:px-10 sm:py-10 lg:-mt-36 lg:px-14 lg:py-12">
              <HeadText article={article} />
            </div>
            {(media.caption || media.credit) && (
              <p className="mx-auto mt-4 max-w-[60rem] px-3 text-sm text-muted">
                {media.caption}
                {media.caption && media.credit ? " · " : ""}
                {media.credit}
              </p>
            )}
          </div>
        ) : (
          <div className="relative mt-6 overflow-hidden rounded-hero bg-deep px-6 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <div
              aria-hidden
              className="absolute inset-0 opacity-40"
              style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-on-deep-faint) 1px, transparent 0)",
                backgroundSize: "22px 22px",
              }}
            />
            <div
              aria-hidden
              className="absolute -right-1/4 -bottom-1/2 aspect-square w-2/3 rounded-full opacity-60 blur-3xl"
              style={{ background: "var(--color-accent)" }}
            />
            <div className="relative max-w-[56rem]">
              <HeadText article={article} onDark />
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

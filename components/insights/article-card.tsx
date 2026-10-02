import Link from "next/link";
import { cn } from "@/lib/cn";
import { articleHref, articleKind, type Article } from "@/lib/content/article";
import { formatArticleDate } from "@/lib/content/format-date";
import { ArticleCover } from "./article-cover";

const HOVER =
  "transition-[border-color,box-shadow,transform] duration-300 hover:border-line-soft hover:shadow-[0_22px_48px_-28px_rgba(36,22,83,0.45)] motion-safe:hover:-translate-y-0.5";

const ZOOM = "transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.04]";

function Meta({ article }: { article: Article }) {
  const kind = articleKind(article);
  const date = formatArticleDate(article.publishedAt);
  return (
    <p className="label text-accent">
      {kind?.name}
      {kind && date ? <span className="text-faint"> · {date}</span> : date}
    </p>
  );
}

/** Standard card: cover on top, then meta, title, excerpt, reading time. */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <Link
      href={articleHref(article)}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas",
        HOVER,
        className,
      )}
    >
      <ArticleCover article={article} className="aspect-[16/10]" imgClassName={ZOOM} />
      <div className="flex grow flex-col px-6.5 pt-6 pb-6.5">
        <Meta article={article} />
        <h3 className="mt-3.5 line-clamp-3 text-h4 leading-snug font-bold text-balance group-hover:text-accent">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="mt-3 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
        )}
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <span className="label text-faint">
            {article.readingTimeMinutes ? `${article.readingTimeMinutes} min read` : ""}
          </span>
          <span aria-hidden className="text-sm font-semibold text-accent transition-transform motion-safe:group-hover:translate-x-1">
            Read →
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Lead story: cover beside the text on desktop, stacked on mobile. */
export function FeaturedArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={articleHref(article)}
      className={cn(
        "group grid overflow-hidden rounded-hero border border-line bg-canvas lg:grid-cols-[1.4fr_1fr]",
        HOVER,
      )}
    >
      <ArticleCover
        article={article}
        eager
        className="aspect-[16/10] lg:aspect-auto lg:min-h-[25rem]"
        imgClassName={ZOOM}
      />
      <div className="flex flex-col justify-center px-7 py-8 lg:px-12 lg:py-12">
        <p className="label text-faint">Latest</p>
        <div className="mt-4">
          <Meta article={article} />
        </div>
        <h2 className="mt-4 text-h2 font-bold text-balance group-hover:text-accent">{article.title}</h2>
        {article.excerpt && <p className="mt-5 line-clamp-4 text-lead text-muted">{article.excerpt}</p>}
        <div className="mt-8 flex items-center gap-6">
          <span className="text-md font-semibold text-accent transition-transform motion-safe:group-hover:translate-x-1">
            Read the article →
          </span>
          {article.readingTimeMinutes ? (
            <span className="label text-faint">{article.readingTimeMinutes} min read</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

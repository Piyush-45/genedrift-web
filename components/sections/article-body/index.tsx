import Link from "next/link";
import type { ReactNode } from "react";
import { sanitizeArticleHtml } from "@/lib/content/sanitize";
import { slugifyHeading, withHeadingIds, type TocEntry } from "@/lib/content/toc";
import { ShareLinks } from "@/components/insights/share-links";
import { TocNav } from "@/components/insights/toc-nav";
import type { Article, ArticleBlock } from "@/lib/content/article";
import type { ArticleBodyProps } from "./schema";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="mt-6 text-lead leading-[1.75] text-mid">{block.text}</p>;

    case "heading":
      return block.level === 2 ? (
        <h2 id={slugifyHeading(block.text)} className="mt-12 scroll-mt-24 text-h3">{block.text}</h2>
      ) : (
        <h3 className="mt-9 text-h4">{block.text}</h3>
      );

    case "list": {
      const items = block.items.map((item) => (
        <li key={item} className="flex gap-3.5 text-lead text-mid">
          <span aria-hidden className="mt-3 block size-1.5 shrink-0 bg-accent" />
          <span>{item}</span>
        </li>
      ));
      return block.ordered ? (
        <ol className="mt-6 space-y-3">{items}</ol>
      ) : (
        <ul className="mt-6 space-y-3">{items}</ul>
      );
    }

    case "quote":
      return (
        <figure className="mt-10 border-l-2 border-accent pl-7">
          <blockquote className="text-h4 leading-snug font-medium">{block.text}</blockquote>
          {block.attribution && (
            <figcaption className="label mt-4 text-faint">{block.attribution}</figcaption>
          )}
        </figure>
      );

    case "callout":
      return (
        <aside className="mt-10 rounded-panel bg-lavender px-7 py-6">
          {block.title && <p className="label text-accent">{block.title}</p>}
          <p className="mt-3 text-body text-deep">{block.text}</p>
        </aside>
      );

    case "image":
      return (
        <figure className="mt-10">
          <div
            aria-hidden
            className="w-full rounded-panel bg-lavender"
            style={{ aspectRatio: `${block.media.width ?? 16} / ${block.media.height ?? 9}` }}
          />
          {(block.media.caption || block.media.credit) && (
            <figcaption className="mt-3 text-sm text-muted">
              {block.media.caption}
              {block.media.credit ? ` · ${block.media.credit}` : ""}
            </figcaption>
          )}
        </figure>
      );

    default:
      return null;
  }
}

/**
 * Template F body: the reading layout.
 *
 * Three columns on wide screens: a sticky share rail on the left, the text in
 * a ~70-character column, and a sticky "On this page" list on the right that
 * highlights the section being read. On small screens the rails fold away:
 * contents become a collapsible list above the text, sharing moves below it.
 *
 * The contents list appears only when the article has at least two <h2>
 * sections; a list of one is noise.
 *
 * The article ends with its topics, sharing, and a short "speak to an
 * expert" prompt tied to the subject, since a reader who finished a
 * regulatory piece is the most likely person to have a question about it.
 */
export function ArticleBody({
  article,
  shareUrl,
}: ArticleBodyProps & { article?: Article; shareUrl?: string }) {
  const body = article?.body;
  if (!article || !body) return null;

  let toc: TocEntry[] = [];
  let content: ReactNode;

  if (body.format === "html") {
    /* Catalyst converts the TipTap document to sanitised HTML at publish time
       and serves it as `article.html`, so this is the live path.
       `dangerouslySetInnerHTML` is used ONLY on output that has passed through
       sanitizeArticleHtml() — never on raw API content. Two independent
       sanitisers, ours owned by the team that renders the page. Heading ids
       are added after sanitising, from the heading's own text. */
    const prepared = withHeadingIds(sanitizeArticleHtml(body.html));
    toc = prepared.toc;
    content = <div className="article-prose" dangerouslySetInnerHTML={{ __html: prepared.html }} />;
  } else {
    toc = body.blocks
      .filter((b): b is Extract<ArticleBlock, { kind: "heading" }> => b.kind === "heading" && b.level === 2)
      .map((b) => ({ id: slugifyHeading(b.text), text: b.text }));
    content = (
      <div>
        {body.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    );
  }

  const showToc = toc.length >= 2;
  const url = shareUrl ?? "";

  return (
    <div className="px-gutter pt-14 lg:pt-20">
      <div className="mx-auto max-w-body lg:grid lg:grid-cols-[1fr_minmax(0,44rem)_1fr] lg:gap-12">
        <aside className="hidden lg:block">
          {url && (
            <div className="sticky top-24 flex justify-end pr-4">
              <ShareLinks url={url} title={article.title} variant="rail" />
            </div>
          )}
        </aside>

        <div className="mx-auto w-full max-w-[44rem] lg:max-w-none">
          {showToc && (
            <details className="group mb-10 rounded-panel border border-line bg-surface px-5 py-4 lg:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between text-md font-semibold [&::-webkit-details-marker]:hidden">
                On this page
                <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
              </summary>
              <ol className="mt-3 space-y-2">
                {toc.map((e) => (
                  <li key={e.id}>
                    <a href={`#${e.id}`} className="text-sm text-muted hover:text-accent">
                      {e.text}
                    </a>
                  </li>
                ))}
              </ol>
            </details>
          )}

          {content}

          <footer className="mt-16 space-y-8 border-t border-line pt-8">
            {article.tags.length > 0 && (
              <div>
                <p className="label text-faint">Topics</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {article.tags.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={`/insights?tag=${encodeURIComponent(t.name)}`}
                        className="block rounded-pill bg-surface px-3.5 py-1.5 text-xs text-slate transition-colors hover:bg-lavender hover:text-accent"
                      >
                        {t.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {url && <ShareLinks url={url} title={article.title} />}

            <div className="flex flex-col items-start justify-between gap-5 rounded-hero bg-lavender px-7 py-7 sm:flex-row sm:items-center sm:px-9">
              <div>
                <p className="text-h4 font-bold">Questions about this in your market?</p>
                <p className="mt-1.5 text-sm text-muted">Our regulatory team works on these filings every day.</p>
              </div>
              <Link
                href="/contact/enquiry"
                className="shrink-0 rounded-control bg-accent px-6 py-3 text-md font-semibold text-on-accent transition-colors hover:bg-deep"
              >
                Speak to an Expert
              </Link>
            </div>
          </footer>
        </div>

        <aside className="hidden lg:block">
          {showToc && <TocNav entries={toc} className="sticky top-24" />}
        </aside>
      </div>
    </div>
  );
}

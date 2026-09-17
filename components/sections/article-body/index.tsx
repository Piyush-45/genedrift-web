import { sanitizeArticleHtml } from "@/lib/content/sanitize";
import type { Article, ArticleBlock } from "@/lib/content/article";
import type { ArticleBodyProps } from "./schema";

function Block({ block }: { block: ArticleBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p className="mt-6 text-lead leading-[1.75] text-mid">{block.text}</p>;

    case "heading":
      return block.level === 2 ? (
        <h2 className="mt-12 text-h3">{block.text}</h2>
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

export function ArticleBody({ article }: ArticleBodyProps & { article?: Article }) {
  const body = article?.body;
  if (!body) return null;

  if (body.format === "html") {
    /* Catalyst converts the TipTap document to sanitised HTML at publish time
       and serves it as `article.html`, so this is the live path.
       `dangerouslySetInnerHTML` is used ONLY on output that has passed through
       sanitizeArticleHtml() — never on raw API content. Two independent
       sanitisers, ours owned by the team that renders the page. */
    return (
      <div className="px-gutter pt-10">
        <div
          className="article-prose mx-auto max-w-[52rem]"
          dangerouslySetInnerHTML={{ __html: sanitizeArticleHtml(body.html) }}
        />
      </div>
    );
  }

  return (
    <div className="px-gutter pt-10">
      <div className="mx-auto max-w-[52rem]">
        {body.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </div>
  );
}

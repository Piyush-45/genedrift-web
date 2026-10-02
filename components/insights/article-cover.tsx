import { cn } from "@/lib/cn";
import type { Article } from "@/lib/content/article";

/**
 * The picture slot used by every article card and the reading page.
 *
 * With a cover: the editor's image, cropped to the frame (object-cover), so an
 * odd upload (a tall screenshot, a square logo) never breaks the layout.
 *
 * Without one: a branded tile, not an empty grey box. Deep purple, a fine dot
 * grid and a soft accent glow, with the genedrift
 * wordmark. Regulatory updates often have no image; this keeps a grid of
 * mixed articles looking deliberate rather than half-finished.
 */
export function ArticleCover({
  article,
  className,
  imgClassName,
  eager = false,
}: {
  article: Article;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const media = article.featuredMedia;

  if (media?.url) {
    return (
      <div className={cn("relative overflow-hidden bg-surface", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={media.url}
          alt={media.alt || ""}
          width={media.width}
          height={media.height}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={cn("absolute inset-0 size-full object-cover", imgClassName)}
        />
      </div>
    );
  }

  // Same article, same tile: the glow's position and colour come from the
  // article id, so a grid of image-less cards varies instead of repeating
  // one tile, and a card never changes between visits.
  const seed = [...article.uuid].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  const spots = ["-right-1/4 -bottom-1/2", "-left-1/4 -bottom-1/2", "-right-1/4 -top-1/2", "left-1/4 -bottom-2/3"];
  const glow = seed % 2 === 0 ? "var(--color-accent)" : "var(--color-accent-soft)";

  return (
    <div aria-hidden className={cn("relative overflow-hidden bg-deep", className)}>
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-on-deep-faint) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      <div
        className={cn("absolute aspect-square w-3/4 rounded-full opacity-70 blur-3xl", spots[seed % spots.length])}
        style={{ background: glow }}
      />
      <span className="absolute bottom-4.5 left-6 text-md font-bold tracking-tight text-on-deep-muted">
        genedrift
      </span>
    </div>
  );
}

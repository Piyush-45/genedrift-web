import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import type { InsightFeedProps } from "./schema";

export function InsightFeed({
  eyebrow,
  heading,
  standfirst,
  featured,
  listLabel,
  listLinkLabel,
  listLinkHref,
  items,
}: InsightFeedProps) {
  // Empty state: no featured article and no list means nothing to show.
  if (!featured && items.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <div className="mt-11 flex flex-col items-stretch gap-5.5 lg:flex-row">
          {featured && (
            <Link
              href={featured.href}
              className="group overflow-hidden rounded-card bg-surface transition-colors hover:bg-lavender lg:w-160 lg:shrink-0"
            >
              {featured.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={featured.image} alt="" className="h-62.5 w-full object-cover" />
              ) : (
                <div aria-hidden className="h-62.5 w-full bg-lavender" />
              )}

              <div className="px-8 pt-7 pb-8">
                <p className="label text-accent">
                  {featured.kind}
                  {featured.meta ? ` · ${featured.meta}` : ""}
                </p>
                <h3 className="mt-4 text-h3 leading-[1.26] group-hover:text-accent">
                  {featured.title}
                </h3>
                {featured.standfirst && (
                  <p className="mt-3 text-body text-muted">{featured.standfirst}</p>
                )}
              </div>
            </Link>
          )}

          {items.length > 0 && (
            <div className="grow rounded-card bg-surface px-8 py-7">
              <div className="flex items-center justify-between gap-4">
                <span className="label text-accent">{listLabel}</span>
                <Link
                  href={listLinkHref}
                  className="text-sm font-semibold text-accent hover:text-deep"
                >
                  {listLinkLabel}
                </Link>
              </div>

              <ul className="mt-1.5">
                {items.map((item) => (
                  <li key={item.href} className="border-b border-line last:border-b-0">
                    <Link href={item.href} className="group block py-4.75">
                      <span className="label block text-muted">
                        {item.kind}
                        {item.meta ? ` · ${item.meta}` : ""}
                      </span>
                      <span className="mt-2 block text-lead font-semibold group-hover:text-accent">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

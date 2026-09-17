import { Fragment } from "react";
import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import type { RegionCardsProps } from "./schema";

export function RegionCards({
  eyebrow,
  heading,
  headingTail,
  regions,
  footnoteLeft,
  footnoteRight,
}: RegionCardsProps) {
  if (regions.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} headingTail={headingTail} />

        <div className="mt-11 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
          {regions.map((region) => {
            const title = (
              <h3 className="text-h4">
                {region.href ? (
                  <Link href={region.href} className="transition-colors hover:text-accent">
                    {region.name}
                  </Link>
                ) : (
                  region.name
                )}
              </h3>
            );

            return (
              <article
                key={region.name}
                className="rounded-panel border border-line bg-canvas px-7 pt-6.5 pb-6 transition-[transform,box-shadow,border-color] duration-[240ms] ease-[var(--ease-out-soft)] hover:-translate-y-1.5 hover:border-line-soft hover:shadow-lift"
              >
                <div className="flex items-baseline justify-between gap-4">
                  {title}
                  <span className="text-stat font-bold tabular-nums tracking-[-0.04em] text-accent">
                    {region.count}
                  </span>
                </div>

                <div aria-hidden className="mt-4 h-px bg-rule" />

                {region.markets.length > 0 && (
                  <p className="mt-4 text-sm leading-[1.9] text-muted">
                    {region.markets.map((market, i) => (
                      <Fragment key={market.href}>
                        {i > 0 && <span className="text-sep"> · </span>}
                        <Link
                          href={market.href}
                          className="border-b border-transparent transition-[color,border-color] duration-150 hover:border-line-tint hover:text-accent"
                        >
                          {market.name}
                        </Link>
                      </Fragment>
                    ))}
                  </p>
                )}
              </article>
            );
          })}
        </div>

        {(footnoteLeft || footnoteRight) && (
          <div className="mt-6.5 flex flex-wrap justify-between gap-4 border-t border-line pt-4.5">
            {footnoteLeft && <span className="label text-muted">{footnoteLeft}</span>}
            {footnoteRight && <span className="label text-dim">{footnoteRight}</span>}
          </div>
        )}
      </div>
    </section>
  );
}

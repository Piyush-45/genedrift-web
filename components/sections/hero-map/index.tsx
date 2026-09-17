import Link from "next/link";
import { LAND_PATHS } from "@/lib/map/land";
import type { Market } from "@/lib/map/markets";
import { MarketSearch } from "./market-search";
import { WorldMap } from "./world-map";
import type { HeroMapProps } from "./schema";

/**
 * Server component. It renders the 111 landmass paths itself and passes them
 * into the client map as children, so 42KB of path data is streamed as HTML
 * and never parsed as JavaScript. Only the hover logic is client-side.
 *
 * Markets arrive as a PROP, resolved by lib/content/resolve.ts. This
 * component must never import the Markets collection — see that file.
 *
 * HEIGHT: 688px at lg, up from 632. The approved design sized the hero for a
 * column ending at the status card; the client then asked for the authority
 * bulletin strip beneath it, which collided with the updates ticker. With the
 * header at ~86px this still lands inside the 780px fold the design is built
 * around — measured, not assumed.
 */
export function HeroMap({
  markets = [],
  headingLead,
  headingJoin,
  standfirst,
  actions,
  defaultMarket,
  cardLabel,
  searchLabel,
  searchPlaceholder,
  searchEmptyLabel,
  bulletinLabel,
  bulletin,
  tickerLabel,
  ticker,
}: HeroMapProps & { markets?: Market[] }) {
  return (
    <section className="relative overflow-hidden pb-6 lg:h-172 lg:pb-0">
      <WorldMap
        markets={markets}
        defaultMarket={defaultMarket}
        cardLabel={cardLabel}
        bulletinLabel={bulletinLabel}
        bulletin={bulletin}
        headingLead={headingLead}
        headingJoin={headingJoin}
        intro={
          <>
            <p className="mt-4 text-md leading-normal text-mid">{standfirst}</p>

            {/* Phone only. See market-search.tsx for why the map stopped being
                the way into the markets below lg. */}
            <MarketSearch
              markets={markets}
              label={searchLabel}
              placeholder={searchPlaceholder}
              emptyLabel={searchEmptyLabel}
            />
            {actions.length > 0 && (
              <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6.5">
                {actions.map((a) => (
                  <Link
                    key={a.href}
                    href={a.href}
                    className={
                      a.variant === "solid"
                        ? "flex w-full items-center justify-center rounded-control bg-accent px-6.5 py-3.5 text-md font-semibold text-on-accent transition-colors hover:bg-deep lg:w-auto"
                        : // A ghost link stacked under a solid button on a phone
                          // reads as a section heading, not a control -- it was
                          // being skipped. Below lg it gets an outline and the
                          // same height so it is visibly the second button;
                          // above lg it is the design's plain text link again.
                          "flex w-full items-center justify-center rounded-control border border-line px-6.5 py-3.5 text-md font-semibold text-deep transition-colors hover:text-accent lg:w-auto lg:rounded-none lg:border-0 lg:px-0 lg:py-0"
                    }
                  >
                    {a.label}
                  </Link>
                ))}
              </div>
            )}
          </>
        }
      >
        <g fill="var(--color-line-tint)">
          {LAND_PATHS.map((d, i) => (
            <path key={i} d={d} className="land-path" style={{ "--i": i } as React.CSSProperties} />
          ))}
        </g>
      </WorldMap>

      {/* Softens the map behind the headline. Purely decorative. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 hidden lg:block"
        style={{
          background:
            "radial-gradient(50% 72% at 0% 24%, var(--color-canvas) 0%, var(--color-canvas) 42%, color-mix(in srgb, var(--color-canvas) 52%, transparent) 60%, transparent 80%)",
        }}
      />

      {/* Updates ticker */}
      {ticker.length > 0 && (
        <div className="relative z-10 mt-10 flex items-center gap-6.5 border-t border-rule bg-canvas py-3.5 lg:absolute lg:inset-x-0 lg:bottom-0 lg:mt-0">
          <div className="flex flex-none items-center gap-2.75 pl-gutter">
            <span aria-hidden className="block size-1.75 rounded-pill bg-accent" />
            <span className="label whitespace-nowrap text-faint">{tickerLabel}</span>
            <span aria-hidden className="ml-1.5 block h-3.75 w-px bg-line" />
          </div>

          <div
            className="flex-1 overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(90deg, transparent 0, #000 34px, #000 calc(100% - 90px), transparent 100%)",
            }}
          >
            {/* Duplicated once: the track translates -50%, so the second copy
                is what is on screen when the first has scrolled away. */}
            <div className="ticker-track flex w-max gap-11 text-xs whitespace-nowrap text-mid">
              {[0, 1].map((copy) =>
                ticker.map((item, i) => (
                  <span key={`${copy}-${i}`} aria-hidden={copy === 1 ? true : undefined}>
                    <strong className="font-semibold text-deep">{item.source}</strong> — {item.text}
                  </span>
                )),
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

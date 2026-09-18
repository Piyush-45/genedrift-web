import Link from "next/link";
import { COUNTRY_SHAPES } from "@/lib/map/countries";
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
 * HEIGHT: back to the approved design's 632px. It grew to 688 to fit the
 * bulletin strip under the status card; both strips are now full-width bands
 * below the hero, so the column ends at the card again, which is what the
 * design was sized for.
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
  authorityLabel,
  tickerLabel,
  ticker,
}: HeroMapProps & { markets?: Market[] }) {
  /** Markets carrying an authority, in map order. Derived, not typed in:
   *  the authority lives on the market record. */
  const authorities = markets
    .filter((m) => (m.authority ?? "").trim() !== "")
    .map((m) => ({ slug: m.slug, name: m.name, href: m.href, authority: m.authority as string }));

  return (
    <>
    <section className="relative overflow-hidden pb-6 lg:h-158 lg:pb-0">
      <WorldMap
        markets={markets}
        defaultMarket={defaultMarket}
        cardLabel={cardLabel}
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
                        : // The second action is an OUTLINED button at every
                          // width, not a bare text link. As plain text it read
                          // as a heading rather than a control -- on a phone,
                          // stacked under the solid button, it was being
                          // skipped entirely. It keeps the outline on desktop
                          // for the same reason: a link with no affordance
                          // beside a filled button is a link nobody presses.
                          // Hover fills it rather than only recolouring the
                          // text, so the whole target responds.
                          "flex w-full items-center justify-center rounded-control border border-line px-6.5 py-3.5 text-md font-semibold text-deep transition-colors hover:border-line-soft hover:bg-lavender hover:text-accent lg:w-auto"
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

        {/* The 46 market outlines, defined once and never painted here.
            `<use>` in the client map references them by id, so 43KB of path
            data is streamed as HTML exactly like the landmass above and none
            of it is serialised into the client payload. Only markets have a
            shape, so a country we do not operate in cannot light up. */}
        <defs>
          {markets.map((m) =>
            COUNTRY_SHAPES[m.slug] ? (
              <path key={m.slug} id={`country-${m.slug}`} d={COUNTRY_SHAPES[m.slug]} />
            ) : null,
          )}
        </defs>
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

      {/* The two running bands sit UNDER the hero, full width, matching the
          ticker above them. They were narrow boxes inside the 420px status
          column; a strip whose whole job is to run was the worst thing to put
          in the narrowest part of the page.

          Server-rendered: neither depends on which market is hovered, so
          nothing here needs to be a client component. */}
      <RunningBand label={bulletinLabel} count={bulletin.length}>
        {[0, 1].map((copy) =>
          bulletin.map((item, i) => (
            <span
              key={`${copy}-${item.authority}-${i}`}
              className="text-sm leading-6"
              aria-hidden={copy === 1 ? true : undefined}
            >
              <BulletinEntry item={item} />
            </span>
          )),
        )}
      </RunningBand>

      <RunningBand label={authorityLabel} count={authorities.length}>
        {[0, 1].map((copy) =>
          authorities.map((a) => (
            <span
              key={`${copy}-${a.slug}`}
              className="text-sm leading-6"
              aria-hidden={copy === 1 ? true : undefined}
            >
              <Link href={a.href} className="transition-colors hover:text-accent">
                <strong className="font-semibold text-deep">{a.authority}</strong>
                <span className="text-mid"> — {a.name}</span>
              </Link>
            </span>
          )),
        )}
      </RunningBand>
    </>
  );
}

/**
 * A full-width running band at the foot of the hero.
 *
 * The bulletin and the authority strip used to be narrow boxes stacked under
 * the status card, sharing a 420px column with everything else. Moved out to
 * the full width of the page on 18 September: a strip whose whole job is to
 * run needs room to run, and three bands of the same shape read as a system
 * rather than as two boxes and a ticker.
 *
 * Empty renders nothing, so switching a band off is an editing action.
 */
function RunningBand({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <div className="flex items-center gap-6.5 border-t border-rule bg-canvas py-3.5">
      <div className="flex flex-none items-center gap-2.75 pl-gutter">
        <span className="label whitespace-nowrap text-faint">{label}</span>
        <span aria-hidden className="ml-1.5 block h-3.75 w-px bg-line" />
      </div>
      <div
        className="bulletin-window flex-1"
        style={{ "--bulletin-count": count } as React.CSSProperties}
      >
        {/* Rendered TWICE: the track slides left by half its width, so the
            second copy is where the first started and the loop has no visible
            jump. The duplicate is hidden from screen readers. */}
        <div className="bulletin-track">{children}</div>
      </div>
    </div>
  );
}

/**
 * One bulletin line.
 *
 * The note is OPTIONAL by design: with every note empty the strip runs bare
 * authority names, which is what the client asked for before they had decided;
 * filled in, it reads as a headline feed. Their answer changes the content,
 * not this component.
 */
function BulletinEntry({ item }: { item: { authority: string; note: string; href: string } }) {
  const body = (
    <>
      <strong className="font-semibold text-deep">{item.authority}</strong>
      {item.note ? <span className="text-mid"> — {item.note}</span> : null}
    </>
  );

  return item.href ? (
    <Link href={item.href} className="transition-colors hover:text-accent">
      {body}
    </Link>
  ) : (
    body
  );
}

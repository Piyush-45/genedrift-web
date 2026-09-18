import Link from "next/link";
import { COUNTRY_SHAPES } from "@/lib/map/countries";
import { LAND_PATHS, MAP_VIEWBOX } from "@/lib/map/land";
import type { Market } from "@/lib/map/markets";
import { LocalTime } from "./local-time";
import type { CountryHeadProps } from "./schema";

/**
 * Server component. The locator map reuses the same approved landmass as the
 * hero — rendered as HTML, no JavaScript, no image request — with this one
 * market marked. Reusing the geometry means a country page can never show a
 * different world from the homepage.
 */
export function CountryHead({
  eyebrow,
  standfirst,
  localTimeLabel,
  showLocator,
  actions,
  market,
}: CountryHeadProps & { market?: Market }) {
  if (!market) return null;

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto grid max-w-body gap-10 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
        <div>
          <p className="label text-accent">{eyebrow}</p>

          <h1 className="mt-4 text-display font-bold">{market.name}</h1>

          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link
              href={`/markets/${market.regionSlug}`}
              className="label text-deep transition-colors hover:text-accent"
            >
              {market.region}
            </Link>
            <span className="label text-faint">
              {localTimeLabel} <LocalTime utcOffset={market.utcOffset} />
            </span>
            {/* The regulator a filing actually goes to — arguably the single
                most useful fact on this page, and it was missing. Same field
                that feeds the homepage authority strip, so it is edited once
                on the market record. Silent when the client has not set it. */}
            {market.authority && (
              <span className="label text-deep">{market.authority}</span>
            )}
          </div>

          {standfirst && <p className="mt-6 max-w-[58ch] text-lead text-muted">{standfirst}</p>}

          {actions.length > 0 && (
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {actions.map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className={
                    a.variant === "solid"
                      ? "rounded-control bg-accent px-6.5 py-3.5 text-md font-semibold text-on-accent transition-colors hover:bg-deep"
                      : "text-md font-semibold text-deep transition-colors hover:text-accent"
                  }
                >
                  {a.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        {showLocator && (
          <div className="w-full lg:w-125">
            <svg
              viewBox={MAP_VIEWBOX}
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={`Locator map showing ${market.name}. No international boundaries are drawn.`}
              className="block h-auto w-full"
            >
              <g fill="var(--color-hair)">
                {LAND_PATHS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>
              <defs>
                <radialGradient id="locator-glow">
                  <stop offset="0" stopColor="var(--color-accent)" stopOpacity=".55" />
                  <stop offset=".45" stopColor="var(--color-accent)" stopOpacity=".28" />
                  <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
                </radialGradient>
                <filter id="locator-halo" x="-40%" y="-40%" width="180%" height="180%">
                  <feGaussianBlur stdDeviation="7" />
                </filter>
                <filter id="locator-core" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.8" />
                </filter>
              </defs>

              {/* Same feathered fill as the hero. Every one of these 46 pages
                  used to show an identical world with a dot on it; now the page
                  shows its own country. Nothing to hover — this locator has one
                  subject and it is always lit. */}
              {COUNTRY_SHAPES[market.slug] && (
                <>
                  <path
                    d={COUNTRY_SHAPES[market.slug]}
                    fill="var(--color-accent-soft)"
                    opacity="0.55"
                    filter="url(#locator-halo)"
                  />
                  <path
                    d={COUNTRY_SHAPES[market.slug]}
                    fill="var(--color-accent)"
                    opacity="0.8"
                    filter="url(#locator-core)"
                  />
                </>
              )}
              <ellipse cx={market.x} cy={market.y} rx="49.4" ry="48.8" fill="url(#locator-glow)" />
              <circle cx={market.x} cy={market.y} r="11" fill="var(--color-accent)" opacity="0.34" />
              <circle cx={market.x} cy={market.y} r="4.4" fill="var(--color-deep)" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}

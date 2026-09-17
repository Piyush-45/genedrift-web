"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { MAP_VIEWBOX } from "@/lib/map/land";
import type { CapabilityStatus, Market } from "@/lib/map/markets";

const STATUS_LABEL: Record<CapabilityStatus, string> = {
  available: "Available",
  upcoming: "Upcoming",
  none: "Not available",
};

const STATUS_TEXT: Record<CapabilityStatus, string> = {
  available: "text-status-available",
  upcoming: "text-status-upcoming",
  none: "text-status-none",
};

function StatusIcon({ status }: { status: CapabilityStatus }) {
  const common = {
    width: 13,
    height: 13,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  } as const;
  if (status === "available")
    return <svg {...common} strokeWidth={2.6} aria-hidden><path d="m5 12.5 4.5 4.5L19 7" /></svg>;
  if (status === "upcoming")
    return (
      <svg {...common} strokeWidth={2.4} aria-hidden>
        <circle cx="12" cy="12" r="7" />
        <path d="M12 8.5v4" />
      </svg>
    );
  return <svg {...common} strokeWidth={2.4} aria-hidden><path d="M7 7l10 10M17 7L7 17" /></svg>;
}

/** Local wall-clock time in a market, from its UTC offset. */
function localTime(utcOffset: number): string {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60_000;
  const there = new Date(utcMs + utcOffset * 3_600_000);
  return `${String(there.getHours()).padStart(2, "0")}:${String(there.getMinutes()).padStart(2, "0")}`;
}

export function WorldMap({
  markets,
  defaultMarket,
  cardLabel,
  bulletinLabel,
  bulletin,
  headingLead,
  headingJoin,
  /** Standfirst + actions. Static, so it is rendered on the server. */
  intro,
  children,
}: {
  markets: readonly Market[];
  defaultMarket: string;
  cardLabel: string;
  bulletinLabel: string;
  bulletin: { authority: string; note: string; href: string }[];
  headingLead: string;
  headingJoin: string;
  intro: ReactNode;
  /** The landmass paths, rendered on the server so they never ship as JS. */
  children: ReactNode;
}) {
  const initial = useMemo(
    () => Math.max(0, markets.findIndex((m) => m.slug === defaultMarket)),
    [markets, defaultMarket],
  );
  /**
   * Per-marker click radius: half the distance to the nearest other marker,
   * clamped. A single fixed radius does not work -- Benin, Togo and Ghana sit
   * about 20 map units apart, so a uniform r=14 hit circle swallowed its
   * neighbours and seven markets were unreachable. Halving the gap guarantees
   * two hit areas can touch but never overlap.
   */
  const hitRadius = useMemo(
    () =>
      markets.map((m, i) => {
        let nearest = Infinity;
        markets.forEach((o, j) => {
          if (i === j) return;
          const d = Math.hypot(m.x - o.x, m.y - o.y);
          if (d < nearest) nearest = d;
        });
        return Math.min(14, Math.max(3, nearest * 0.45));
      }),
    [markets],
  );

  const [active, setActive] = useState(initial);
  // Rendered empty on the server: the visitor's clock is not knowable there,
  // and guessing it produces a hydration mismatch on every page load.
  const [time, setTime] = useState<string | null>(null);
  const rotating = useRef(false);

  const market = markets[active];

  useEffect(() => {
    if (!market) return;
    const tick = () => setTime(localTime(market.utcOffset));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [market]);

  // Touch devices have no hover, so the map rotates itself. Suppressed under
  // reduced motion, and stopped for good as soon as anyone taps a marker.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const touch = window.matchMedia("(hover: none)").matches;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!touch || still) return;
    const id = setInterval(() => {
      if (!rotating.current) setActive((i) => (i + 1) % markets.length);
    }, 3200);
    return () => clearInterval(id);
  }, [markets.length]);

  if (!market) return null;

  return (
    <>
      <div className="landwrap lg:absolute lg:top-7 lg:right-5 lg:left-95">
        <svg
          viewBox={MAP_VIEWBOX}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="World map showing the markets Genedrift operates in. No international boundaries are drawn."
          className="block h-auto w-full"
        >
          <defs>
            <radialGradient id="market-glow">
              <stop offset="0" stopColor="var(--color-accent)" stopOpacity=".62" />
              <stop offset=".45" stopColor="var(--color-accent)" stopOpacity=".34" />
              <stop offset="1" stopColor="var(--color-accent)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {children}

          <g>
            {markets.map((m, i) => {
              const on = i === active;
              return (
                // Client feedback 2026-09-15: clicking a marker goes to that
                // country's page. next/link renders an <a>, which inside an
                // <svg> is created in the SVG namespace -- a valid SVG anchor,
                // focusable and keyboard-activatable without tabIndex/role.
                <Link
                  key={m.slug}
                  href={m.href}
                  className="map-marker"
                  style={{ "--i": i } as React.CSSProperties}
                  aria-label={`${m.name}, ${m.region}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => {
                    rotating.current = true;
                    setActive(i);
                  }}
                >
                  <ellipse
                    cx={m.x}
                    cy={m.y}
                    rx="49.4"
                    ry="48.8"
                    fill="url(#market-glow)"
                    // pointer-events-none is load-bearing, not tidiness. This
                    // ellipse is ~100px across and `opacity-0` STILL receives
                    // clicks, so every marker used to carry an invisible disc
                    // covering its neighbours -- whichever came later in the
                    // list won. Clicking India landed on Pakistan. The hit
                    // target is the r=14 transparent circle below, nothing else.
                    className={cn(
                      "pointer-events-none transition-opacity duration-[260ms]",
                      on ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r="11"
                    fill="var(--color-accent)"
                    className={cn(
                      "pointer-events-none transition-opacity duration-200",
                      on ? "opacity-34" : "opacity-0",
                    )}
                  />
                  <circle cx={m.x} cy={m.y} r="4.4" fill="var(--color-deep)" className="pointer-events-none" />
                  <circle
                    cx={m.x}
                    cy={m.y}
                    r={hitRadius[i]}
                    fill="transparent"
                    className="cursor-pointer"
                  />
                  <title>{m.name}</title>
                </Link>
              );
            })}
          </g>
        </svg>

        {/* The cropped map has to end somewhere. A hard edge reads as a
            clipped image; this fades it into the page so the headline sits on
            clean ground. Mobile only -- at lg the map is the full world with
            the design's own radial wash behind the headline. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 lg:hidden"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--color-canvas) 86%, transparent) 62%, var(--color-canvas) 100%)",
          }}
        />
      </div>

      {/* Headline, standfirst, actions and status card are ONE flow column,
          exactly as in the design — absolutely positioned once at lg, stacked
          by normal margins inside. Positioning each block separately would
          mean hand-maintaining offsets that drift the moment copy changes. */}
      <div className="relative z-10 px-gutter lg:absolute lg:top-11 lg:left-gutter lg:w-105 lg:px-0">
        <h1 className="pointer-events-none text-display font-bold">
          <span className="block">{headingLead}</span>
          <span className="flex items-baseline gap-3.5">
            <span>{headingJoin}</span>
            <span className="text-accent transition-opacity duration-150">{market.name}.</span>
          </span>
        </h1>

        <div aria-hidden className="mt-4.5 h-0.5 w-18 bg-accent" />

        {intro}

        <div className="mt-6.5 rounded-panel border border-line bg-canvas px-5 pt-4 pb-4.5 shadow-lift">
          <div className="flex items-center justify-between">
            <span className="label text-faint">{cardLabel}</span>
            <span className="label tabular-nums text-faint">{time ?? "--:--"}</span>
          </div>

          <div className="mt-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-h4 font-bold">{market.name}</span>
              <span className="label text-deep">{market.region}</span>
            </div>

            <div aria-hidden className="mt-2.75 h-px bg-rule" />

            <dl className="mt-3 grid grid-cols-[auto_max-content] justify-between gap-x-4.5 gap-y-2.25 text-sm">
              {market.capabilities.map((c) => (
                <div key={c.name} className="contents">
                  <dt className="text-mid">{c.name}</dt>
                  <dd className={cn("flex items-center gap-1.5 font-semibold whitespace-nowrap", STATUS_TEXT[c.status])}>
                    <StatusIcon status={c.status} />
                    {STATUS_LABEL[c.status]}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Rolling health authority bulletin — client request, 15 Sept:
            a strip between the status card and the updates ticker.

            CSS ONLY, like every other motion on this site. The track holds one
            line per entry and steps through them, so it works for any number
            of entries without the component knowing how many. `--bulletin-count`
            is the one value that has to reach the stylesheet.

            An empty list renders nothing at all, so switching the strip off is
            an editing action rather than a deploy.

            MOBILE: "Health authority bulletin" is 25 characters of tracked-out
            mono. Inline at 390px it took two thirds of the strip and left a
            stub for the content it labels, so below lg the label sits on its
            own line above the rotating entry. */}
        {bulletin.length > 0 && (
          <div className="mt-3.5 flex flex-col gap-1 rounded-control border border-line bg-canvas px-4 py-2 lg:flex-row lg:items-center lg:gap-3 lg:py-1.5">
            <span className="label flex-none whitespace-nowrap text-faint">{bulletinLabel}</span>
            <span aria-hidden className="hidden h-3.75 w-px flex-none bg-line lg:block" />

            <div
              className="bulletin-window flex-1 overflow-hidden"
              style={{ "--bulletin-count": bulletin.length } as React.CSSProperties}
            >
              <div className="bulletin-track">
                {bulletin.map((item, i) => (
                  <p key={`${item.authority}-${i}`} className="truncate text-sm leading-6">
                    <BulletinEntry item={item} />
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </>
  );
}

/**
 * One bulletin line.
 *
 * The note is OPTIONAL by design: with every note empty the strip rotates bare
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

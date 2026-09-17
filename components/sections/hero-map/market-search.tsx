"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Market } from "@/lib/map/markets";

/**
 * "Find your market" — the hero's control BELOW lg, where the map is not one.
 *
 * WHY THIS EXISTS. Fitting 46 markers into a 390px map gives every one of them
 * a hit area smaller than a fingertip, and usability research on mobile
 * location finders is consistent: take the map out of the interactive path and
 * nobody asks for it back, provided the information is still reachable. So on
 * a phone the map became an illustration (see globals.css) and this became the
 * way in. Above lg it is not rendered at all — the map is the control there,
 * and two search fields on one screen is one too many.
 *
 * WHY IT NAVIGATES RATHER THAN FILTERS IN PLACE. A hero that grows a results
 * list pushes the rest of the page down under the reader's thumb while they
 * are still typing. Submitting goes to the best match; the suggestions are
 * links, so a tap goes straight there too.
 *
 * It reuses nothing from market-directory on purpose — that component filters
 * a table in place, which is right for /global-presence and wrong here.
 */
export function MarketSearch({
  markets,
  label,
  placeholder,
  emptyLabel,
}: {
  markets: readonly Market[];
  label: string;
  placeholder: string;
  emptyLabel: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState("");

  const query = q.trim().toLowerCase();

  /**
   * Prefix matches first, then anything containing the query. Typing "ind"
   * should offer India before Indonesia, which a plain `includes` filter does
   * not do -- both contain "ind", and the array order decides, which is
   * alphabetical, which is wrong.
   */
  const matches = useMemo(() => {
    if (!query) return [];
    const starts: Market[] = [];
    const contains: Market[] = [];
    for (const m of markets) {
      const name = m.name.toLowerCase();
      if (name.startsWith(query)) starts.push(m);
      else if (name.includes(query) || m.region.toLowerCase().includes(query)) contains.push(m);
    }
    return [...starts, ...contains].slice(0, 5);
  }, [markets, query]);

  return (
    <form
      className="mt-5 lg:hidden"
      onSubmit={(e) => {
        e.preventDefault();
        const best = matches[0];
        if (best) router.push(best.href);
      }}
    >
      <label htmlFor="hero-market-search" className="label block text-deep">
        {label}
      </label>

      <div className="mt-2 flex items-center gap-2.75 rounded-control border border-line px-4 py-3">
        <svg
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          aria-hidden
          className="flex-none text-faint"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.6-3.6" />
        </svg>
        <input
          id="hero-market-search"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full min-w-0 bg-transparent text-md text-ink outline-none placeholder:text-placeholder"
        />
      </div>

      {/* Nothing is announced until something has been typed: an empty-state
          message on first paint reads as an error. */}
      {query !== "" && (
        <div aria-live="polite">
          {matches.length === 0 ? (
            <p className="mt-2.5 text-sm text-mid">{emptyLabel}</p>
          ) : (
            <ul className="mt-2.5 flex flex-col">
              {matches.map((m) => (
                <li key={m.slug}>
                  <Link
                    href={m.href}
                    className="flex items-baseline justify-between gap-4 border-b border-rule py-3 text-md font-semibold text-deep"
                  >
                    {m.name}
                    <span className="label text-faint">{m.region}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}

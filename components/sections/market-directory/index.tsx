"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { SectionHead } from "@/components/ui/section-head";
import type { CapabilityStatus, Market } from "@/lib/map/markets";
import type { MarketDirectoryProps } from "./schema";

const STATUS_TEXT: Record<CapabilityStatus, string> = {
  available: "text-status-available",
  upcoming: "text-status-upcoming",
  none: "text-status-none",
};

const STATUS_LABEL: Record<CapabilityStatus, string> = {
  available: "Available",
  upcoming: "Upcoming",
  none: "Not available",
};

function StatusMark({ status }: { status: CapabilityStatus }) {
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

export function MarketDirectory({
  eyebrow,
  heading,
  standfirst,
  searchLabel,
  searchPlaceholder,
  countryColumnLabel,
  regionColumnLabel,
  emptyLabel,
  markets = [],
}: MarketDirectoryProps & { markets?: Market[] }) {
  const [q, setQ] = useState("");

  /**
   * Column headers are derived from the data, not stored. Capability names are
   * read off the markets in the order they first appear, so a market that gains
   * a fourth capability in Creator grows a fourth column here with no code
   * change. That is why `capabilities` was modelled as an array.
   */
  const columns = useMemo(() => {
    const seen: string[] = [];
    markets.forEach((m) => m.capabilities.forEach((c) => {
      if (!seen.includes(c.name)) seen.push(c.name);
    }));
    return seen;
  }, [markets]);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const sorted = [...markets].sort((a, b) => a.name.localeCompare(b.name));
    if (!needle) return sorted;
    return sorted.filter(
      (m) =>
        m.name.toLowerCase().includes(needle) || m.region.toLowerCase().includes(needle),
    );
  }, [markets, q]);

  if (markets.length === 0) return null;

  return (
    // Without its own heading this section sits directly under the page head,
    // so the full section rhythm leaves a hole. Half it in that case.
    <section className={cn("px-gutter", heading ? "pt-section" : "pt-10")}>
      <div className="mx-auto max-w-body">
        {heading ? (
          <SectionHead eyebrow={eyebrow ?? ""} heading={heading} standfirst={standfirst} />
        ) : null}

        <div className="max-w-[34rem]">
          <label htmlFor="market-search" className="label block text-accent">
            {searchLabel}
          </label>
          <input
            id="market-search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={searchPlaceholder}
            autoComplete="off"
            className="mt-3 w-full rounded-control border border-line bg-canvas px-5 py-3.5 text-body transition-[border-color] placeholder:text-placeholder focus-visible:border-accent"
          />
          <p aria-live="polite" className="mt-2.5 text-sm text-muted">
            {rows.length} of {markets.length} markets
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[46rem] border-collapse text-left">
            <thead>
              <tr className="border-y border-line">
                <th scope="col" className="label py-3.5 pr-6 text-faint">{countryColumnLabel}</th>
                <th scope="col" className="label py-3.5 pr-6 text-faint">{regionColumnLabel}</th>
                {columns.map((c) => (
                  <th key={c} scope="col" className="label py-3.5 pr-6 text-faint whitespace-nowrap">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.slug} className="border-b border-hair transition-colors hover:bg-lavender">
                  <th scope="row" className="py-4 pr-6 font-semibold">
                    <Link href={m.href} className="text-ink transition-colors hover:text-accent">
                      {m.name}
                    </Link>
                  </th>
                  <td className="py-4 pr-6 text-md text-muted whitespace-nowrap">{m.region}</td>
                  {columns.map((name) => {
                    const cap = m.capabilities.find((c) => c.name === name);
                    const status: CapabilityStatus = cap ? cap.status : "none";
                    return (
                      <td key={name} className="py-4 pr-6">
                        <span
                          className={cn(
                            "flex items-center gap-1.5 text-sm font-semibold whitespace-nowrap",
                            STATUS_TEXT[status],
                          )}
                        >
                          <StatusMark status={status} />
                          {STATUS_LABEL[status]}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          {rows.length === 0 && (
            <p className="py-10 text-center text-lead text-muted">{emptyLabel}</p>
          )}
        </div>
      </div>
    </section>
  );
}

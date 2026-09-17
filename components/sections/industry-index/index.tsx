"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { SectionHead } from "@/components/ui/section-head";
import { IndustryGlyph } from "./icons";
import type { IndustryIndexProps } from "./schema";

/**
 * Concept B — industries down the left, the selected industry's product types
 * on the right in two columns. Client's choice, 2026-09-15.
 *
 * This is the one section on the page that ships JavaScript. Five tabs could
 * be done with hidden radios and `:checked ~` selectors, but that needs one
 * generated CSS rule per tab and gives keyboard users no arrow-key movement.
 * A ~40-line client component is the smaller, more honest cost.
 *
 * Only the active pane is rendered. Absolutely stacking all five to cross-fade
 * them means a fixed height that has to hold the longest list at every
 * breakpoint — which breaks the moment an editor adds a product type.
 */
export function IndustryIndex({
  eyebrow,
  heading,
  standfirst,
  countLabel,
  items,
}: IndustryIndexProps) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const current = items[Math.min(active, items.length - 1)];
  if (!current) return null;

  function onKey(e: React.KeyboardEvent, i: number) {
    const last = items.length - 1;
    const next =
      e.key === "ArrowDown" || e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
      : e.key === "ArrowUp" || e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : -1;
    if (next < 0) return;
    e.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  }

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <div className="mt-11 grid overflow-hidden rounded-card border border-line lg:grid-cols-[392px_1fr]">
          <div
            role="tablist"
            aria-label={eyebrow}
            aria-orientation="vertical"
            className="bg-rail lg:border-r lg:border-line"
          >
            {items.map((item, i) => {
              const on = i === active;
              return (
                <button
                  key={item.title}
                  ref={(el) => {
                    tabs.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`industry-tab-${i}`}
                  aria-selected={on}
                  aria-controls={`industry-pane-${i}`}
                  tabIndex={on ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-4 border-b border-rule border-l-[3px] px-6.5 py-5.5 text-left transition-[background-color,color,border-color] duration-200 last:border-b-0",
                    on
                      ? "border-l-accent bg-canvas text-ink"
                      : "border-l-transparent text-mid hover:bg-lavender",
                  )}
                >
                  <span className="flex shrink-0 text-accent">
                    {item.icon ? <IndustryGlyph name={item.icon} /> : null}
                  </span>
                  <span className="block">
                    <span className="block text-lead font-bold">{item.title}</span>
                    {/* Derived, never stored. */}
                    <span className="label mt-1 block text-dim">
                      {item.productTypes.length} {countLabel}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id={`industry-pane-${active}`}
            aria-labelledby={`industry-tab-${active}`}
            tabIndex={0}
            className="bg-canvas px-9.5 py-8.5 lg:min-h-99"
          >
            <p className="label text-accent">{current.summary}</p>
            <h3 className="mt-3 text-h3 font-bold">{current.title}</h3>

            <div className="mt-5.5 grid gap-x-10 sm:grid-cols-2">
              {current.productTypes.map((t, i) => (
                <div
                  key={t}
                  className="flex items-baseline gap-3.5 border-b border-rail-line py-2.75 text-md"
                >
                  <span className="font-mono text-label text-ghost tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t}</span>
                </div>
              ))}
            </div>

            {current.href && (
              <Link
                href={current.href}
                className="mt-6 inline-block text-sm font-semibold text-accent"
              >
                {current.title} regulatory support
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/cn";
import { SectionHead } from "@/components/ui/section-head";
import type { ProofBillboardProps } from "./schema";

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg
      aria-hidden
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={dir === "prev" ? "rotate-180" : undefined}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ProofBillboard({
  eyebrow,
  heading,
  standfirst,
  cases,
}: ProofBillboardProps) {
  const [active, setActive] = useState(0);
  const [held, setHeld] = useState(false);
  const [hovered, setHovered] = useState(false);

  const total = cases.length;
  const paused = held || hovered;

  const go = useCallback(
    (delta: number) => setActive((i) => (i + delta + total) % total),
    [total],
  );

  if (total === 0) return null;

  const state = held ? "Held" : hovered ? "Paused" : "Rotating";

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <div
          className="mt-10 grid border-t border-line lg:grid-cols-[1fr_392px]"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* Stage. All cases stay mounted and stacked so the height is the
              tallest one and the panel never jumps between stories. */}
          <div className="relative min-h-[268px] pt-8.5 pr-0 pb-6 lg:pr-16">
            {cases.map((story, i) => (
              <article
                key={story.title}
                aria-hidden={i !== active}
                className={cn(
                  "transition-[opacity,transform] duration-[460ms] ease-[var(--ease-out-soft)]",
                  i === active
                    ? "relative opacity-100"
                    : "pointer-events-none absolute inset-0 translate-y-3 opacity-0",
                )}
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute -top-1.5 right-0 text-watermark leading-none font-bold tracking-[-0.05em] tabular-nums text-hair"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <p className="label text-accent">{story.label}</p>
                <h3 className="mt-4 max-w-[40rem] text-h2">{story.title}</h3>
                <p className="mt-4 max-w-[38.75rem] text-lead text-muted">{story.body}</p>

                {story.tags.length > 0 && (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {story.tags.map((tag) => (
                      <li
                        key={tag}
                        className="rounded-pill bg-surface px-3.5 py-1.5 text-xs text-slate"
                      >
                        {tag}
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>

          {/* Playlist */}
          <div className="flex flex-col pt-8.5 pb-6 lg:border-l lg:border-line">
            {cases.map((story, i) => {
              const on = i === active;
              return (
                <button
                  key={story.title}
                  type="button"
                  aria-current={on}
                  onClick={() => {
                    setActive(i);
                    setHeld(true);
                  }}
                  className="grid grid-cols-[34px_1fr] items-start gap-x-1 border-b border-hair py-3.5 text-left lg:pl-9"
                >
                  <span
                    className={cn(
                      "pt-[3px] font-mono text-label tabular-nums transition-colors duration-200",
                      on ? "text-accent" : "text-ghost",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "text-md leading-[1.45] transition-colors duration-200",
                      on ? "font-semibold text-ink" : "text-faint hover:text-slate-soft",
                    )}
                  >
                    {story.title}
                  </span>
                  <span
                    className={cn(
                      "col-start-2 mt-3 h-0.5 overflow-hidden bg-rule transition-opacity duration-200",
                      on ? "opacity-100" : "opacity-0",
                    )}
                  >
                    {on && (
                      <i
                        key={active}
                        className="bb-bar"
                        data-paused={paused}
                        onAnimationEnd={() => go(1)}
                      />
                    )}
                  </span>
                </button>
              );
            })}

            <div className="mt-auto flex items-center justify-between gap-3.5 pt-4 lg:pl-9">
              <span className="label text-dim" aria-live="polite">
                {state}
              </span>
              <div className="flex gap-2">
                {(["prev", "next"] as const).map((dir) => (
                  <button
                    key={dir}
                    type="button"
                    aria-label={dir === "prev" ? "Previous story" : "Next story"}
                    onClick={() => {
                      go(dir === "prev" ? -1 : 1);
                      setHeld(true);
                    }}
                    className="flex size-9.5 items-center justify-center rounded-pill border border-line bg-canvas text-deep transition-[border-color,background-color] duration-[180ms] hover:border-accent hover:bg-lavender"
                  >
                    <Arrow dir={dir} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

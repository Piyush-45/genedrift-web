"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import type { TocEntry } from "@/lib/content/toc";

/**
 * "On this page": the article's sections, with the one being read
 * highlighted. The highlight follows the last heading that has passed the top
 * third of the window. Links are ordinary #anchors, so it works without
 * JavaScript too; the script only adds the highlight.
 */
export function TocNav({ entries, className }: { entries: TocEntry[]; className?: string }) {
  const [active, setActive] = useState<string | null>(entries[0]?.id ?? null);

  useEffect(() => {
    const headings = entries
      .map((e) => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight / 3;
      let current: string | null = headings[0]?.id ?? null;
      for (const h of headings) {
        if (h.getBoundingClientRect().top - line <= 0) current = h.id;
      }
      setActive(current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [entries]);

  return (
    <nav aria-label="On this page" className={className}>
      <p className="label text-faint">On this page</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {entries.map((e) => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              aria-current={active === e.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors",
                active === e.id
                  ? "border-accent font-semibold text-accent"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

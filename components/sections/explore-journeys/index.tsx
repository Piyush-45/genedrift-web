import Link from "next/link";
import { cn } from "@/lib/cn";
import { SectionHead } from "@/components/ui/section-head";
import { FOOTER_CERTIFICATIONS } from "@/lib/nav";
import type { ExploreJourneysProps } from "./schema";

export function ExploreJourneys({
  eyebrow,
  heading,
  standfirst,
  linkLabel,
  items,
  certificationsLabel,
  showCertifications,
}: ExploreJourneysProps) {
  if (items.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        <div className="needs-row mt-12 grid border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Link
              key={item.href}
              href={item.href}
              data-resting={item.resting}
              className={cn(
                // Client feedback 2026-09-15: every panel carries left padding at
                // rest (the copy used to sit flush against the divider), and the
                // highlight is rounded. `rounded-panel` is invisible until a
                // panel has a background, so it only ever shows on the active one.
                "need-panel group block rounded-panel border-b border-line py-7.5 pr-7 pl-6.5 sm:border-b-0 sm:border-r sm:last:border-r-0 lg:border-b-0",
                item.resting
                  ? "bg-accent text-on-accent sm:border-r-transparent"
                  : "hover:bg-accent hover:pl-7.5 hover:text-on-accent",
              )}
            >
              <span
                className={cn(
                  "need-no font-mono text-label tracking-[0.1em] tabular-nums",
                  item.resting ? "text-on-accent/60" : "text-dim group-hover:text-on-accent/60",
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span className="mt-5 block text-h5 leading-snug font-bold">{item.title}</span>

              <span
                className={cn(
                  "need-sub mt-2.5 block text-md leading-[1.6]",
                  item.resting ? "text-on-accent-muted" : "text-muted group-hover:text-on-accent-muted",
                )}
              >
                {item.body}
              </span>

              <span
                className={cn(
                  "need-go mt-4.5 inline-block text-sm font-semibold",
                  item.resting ? "text-on-accent" : "text-accent group-hover:text-on-accent",
                )}
              >
                {linkLabel}
              </span>
            </Link>
          ))}
        </div>

        {showCertifications && (
          <div className="mt-10 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-line pt-5.5">
            {certificationsLabel && (
              <span className="label whitespace-nowrap text-accent">{certificationsLabel}</span>
            )}
            {/* Same list as the footer — see the warning in lib/nav.ts. */}
            <ul className="flex flex-wrap gap-x-8.5 gap-y-2 text-sm font-medium text-slate">
              {FOOTER_CERTIFICATIONS.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

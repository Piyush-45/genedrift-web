import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import { byFamily, caseStudyHref, hasDetail, type CaseStudy } from "@/lib/content/case-study";
import type { CaseStudyIndexProps } from "./schema";

/**
 * A server component. There is no interaction here that CSS cannot do, so
 * nothing about eight cards needs to reach the browser as JavaScript.
 *
 * Two card states, and the difference is deliberate: a record with a complete
 * narrative links to its page, and a record with only a summary does not link
 * anywhere at all. It is not disabled, greyed out or labelled "coming soon" —
 * it is simply a summary, which is exactly what the client publishes for those
 * two today. See `hasDetail` in lib/content/case-study.ts.
 */
function Arrow() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-[220ms] ease-[var(--ease-out-soft)] group-hover:translate-x-1"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function Body({ study, n, readLabel }: { study: CaseStudy; n: number; readLabel: string }) {
  const linked = hasDetail(study);
  return (
    <>
      <span className="font-mono text-label tabular-nums text-ghost transition-colors duration-200 group-hover:text-accent">
        {String(n).padStart(2, "0")}
      </span>

      <h3 className="mt-5 max-w-[22ch] text-h4 font-bold text-balance">{study.title}</h3>

      {study.teaser && <p className="mt-3.5 max-w-[46ch] text-sm text-muted">{study.teaser}</p>}

      {study.tags.length > 0 && (
        <ul className="mt-6 flex flex-wrap gap-2">
          {study.tags.map((tag) => (
            <li key={tag} className="rounded-pill bg-surface px-3.5 py-1.5 text-xs text-slate">
              {tag}
            </li>
          ))}
        </ul>
      )}

      {linked && (
        <span className="mt-auto flex items-center gap-2 pt-7 text-md font-semibold text-accent">
          {readLabel}
          <Arrow />
        </span>
      )}
    </>
  );
}

export function CaseStudyIndex({
  eyebrow,
  heading,
  standfirst,
  readLabel,
  studies = [],
}: CaseStudyIndexProps & { studies?: CaseStudy[] }) {
  if (studies.length === 0) return null;

  const groups = byFamily(studies);

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        {groups.map((group) => (
          <div key={group.familySlug} className="mt-14">
            <div className="flex items-baseline justify-between gap-6 border-t border-line pt-5">
              <h2 className="text-h3 font-bold">{group.family}</h2>
              <span className="label tabular-nums text-faint">
                {String(group.studies.length).padStart(2, "0")}
              </span>
            </div>

            {/* Hairline grid: one pixel of --color-line shows between cells,
                so the block reads as a table rather than as floating cards.
                Same idiom as metric-row. */}
            <ul className="mt-7 grid gap-px border border-line bg-line sm:grid-cols-2">
              {group.studies.map((study, i) => (
                <li key={study.slug} className="bg-canvas">
                  {hasDetail(study) ? (
                    <Link
                      href={caseStudyHref(study)}
                      className="group flex h-full flex-col p-7 transition-colors duration-[180ms] hover:bg-lavender lg:p-9"
                    >
                      <Body study={study} n={i + 1} readLabel={readLabel} />
                    </Link>
                  ) : (
                    <div className="group flex h-full flex-col p-7 lg:p-9">
                      <Body study={study} n={i + 1} readLabel={readLabel} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

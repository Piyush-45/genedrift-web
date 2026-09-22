import Link from "next/link";
import { caseStudyHref, type CaseStudy } from "@/lib/content/case-study";
import type { CaseStudyBodyProps } from "./schema";

/**
 * Three ruled steps, numbered. The left column carries the number and the
 * label, the right column carries the prose — the same two-column editorial
 * rhythm the process grid uses, so a case study reads as part of the site
 * rather than as an imported template.
 *
 * A step with no text is omitted rather than rendered as an empty heading. The
 * route already refuses to serve a record with an incomplete narrative, so in
 * practice this only guards against a partially published CMS row.
 */
export function CaseStudyBody({
  scenarioLabel,
  solutionLabel,
  resultLabel,
  pagerLabel,
  caseStudy,
  nextStudy,
}: CaseStudyBodyProps & { caseStudy?: CaseStudy; nextStudy?: CaseStudy }) {
  if (!caseStudy) return null;

  const steps = [
    { label: scenarioLabel, text: caseStudy.scenario },
    { label: solutionLabel, text: caseStudy.solution },
    { label: resultLabel, text: caseStudy.result },
  ].filter((s) => s.text.trim() !== "");

  if (steps.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <ol className="border-b border-line">
          {steps.map((step, i) => (
            <li
              key={step.label}
              className="grid gap-5 border-t border-line py-9 lg:grid-cols-[14rem_1fr] lg:gap-16 lg:py-12"
            >
              <div className="flex items-baseline gap-4">
                <span className="font-mono text-label tabular-nums text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-h4 font-bold">{step.label}</h2>
              </div>
              <p className="max-w-[62ch] text-lead text-mid">{step.text}</p>
            </li>
          ))}
        </ol>

        {nextStudy && (
          <Link
            href={caseStudyHref(nextStudy)}
            className="group mt-10 flex flex-col gap-2 rounded-card border border-line px-7 py-7 transition-colors duration-[180ms] hover:border-line-soft hover:bg-lavender lg:px-9"
          >
            <span className="label text-faint">{pagerLabel}</span>
            <span className="flex items-center gap-3 text-h4 font-bold">
              {nextStudy.title}
              <span
                aria-hidden
                className="text-accent transition-transform duration-[220ms] ease-[var(--ease-out-soft)] group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          </Link>
        )}
      </div>
    </section>
  );
}

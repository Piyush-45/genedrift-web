import Link from "next/link";
import { CASE_STUDY_BASE, type CaseStudy } from "@/lib/content/case-study";
import type { CaseStudyHeadProps } from "./schema";

export function CaseStudyHead({
  backLabel,
  caseStudy,
}: CaseStudyHeadProps & { caseStudy?: CaseStudy }) {
  if (!caseStudy) return null;

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        <Link
          href={CASE_STUDY_BASE}
          className="label text-faint transition-colors hover:text-accent"
        >
          {backLabel}
        </Link>

        <p className="label mt-9 flex items-center gap-2.5 text-accent">
          <span aria-hidden className="block size-1.5 bg-accent" />
          {caseStudy.family}
        </p>

        <h1 className="mt-6 max-w-[20ch] text-display font-bold text-balance">
          {caseStudy.title}
        </h1>

        {caseStudy.teaser && (
          <p className="mt-6 max-w-[58ch] text-lead text-muted">{caseStudy.teaser}</p>
        )}

        {caseStudy.tags.length > 0 && (
          <ul className="mt-8 flex flex-wrap gap-2">
            {caseStudy.tags.map((tag) => (
              <li key={tag} className="rounded-pill bg-surface px-3.5 py-1.5 text-xs text-slate">
                {tag}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

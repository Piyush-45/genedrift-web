import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import type { Job } from "@/lib/jobs";
import type { JobListProps } from "./schema";

export function JobList({
  eyebrow,
  heading,
  standfirst,
  emptyMessage,
  emptyCtaLabel,
  emptyCtaHref,
  jobs = [],
}: JobListProps & { jobs?: Job[] }) {
  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow={eyebrow} heading={heading} standfirst={standfirst} />

        {jobs.length === 0 ? (
          <div className="mt-11 rounded-panel border border-line bg-surface px-8 py-10">
            <p className="text-lead text-muted">{emptyMessage}</p>
            {emptyCtaLabel && emptyCtaHref && (
              <Link
                href={emptyCtaHref}
                className="mt-4 inline-block text-sm font-semibold text-accent"
              >
                {emptyCtaLabel}
              </Link>
            )}
          </div>
        ) : (
          <ul className="mt-11 border-t border-line">
            {jobs.map((job) => (
              <li key={job.slug} className="border-b border-line">
                <Link
                  href={`/careers/${job.slug}`}
                  className="group grid gap-x-8 gap-y-3 py-7 transition-colors hover:bg-lavender lg:grid-cols-[1fr_auto] lg:items-center lg:px-6"
                >
                  <div>
                    {/* "Astt Manager – Pharmacovigilance": role and department
                        on one line, as the client asked in their September review, instead of
                        the department as a small label above. "Genedrift" is
                        the reader's fallback when a record has no department,
                        so it is not appended. */}
                    <span className="block text-h4 font-bold group-hover:text-accent">
                      {job.function && job.function !== "Genedrift"
                        ? `${job.title} – ${job.function}`
                        : job.title}
                    </span>
                    {/* Joined here rather than inline: the client's Openings
                        form has no experience field, and interpolating an
                        empty one leaves a trailing separator. */}
                    <span className="mt-2 block text-sm text-muted">
                      {[job.location, job.employmentType, job.experience]
                        .filter((part) => (part ?? "").trim() !== "")
                        .join(" · ")}
                    </span>
                  </div>
                  <span className="text-sm font-semibold whitespace-nowrap text-accent">
                    View role
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

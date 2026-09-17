import Link from "next/link";
import type { Job } from "@/lib/jobs";
import type { JobDetailProps } from "./schema";

function Facts({ job }: { job: Job }) {
  const rows: [string, string | undefined][] = [
    ["Function", job.function],
    ["Location", job.location],
    ["Employment type", job.employmentType],
    ["Experience", job.experience],
    ["Qualification", job.qualification],
  ];
  return (
    <dl className="rounded-panel border border-line bg-surface px-7 py-6">
      {rows
        .filter(([, v]) => v)
        .map(([k, v]) => (
          <div key={k} className="border-b border-rule py-3 first:pt-0 last:border-b-0 last:pb-0">
            <dt className="label text-faint">{k}</dt>
            <dd className="mt-1.5 text-md font-medium">{v}</dd>
          </div>
        ))}
    </dl>
  );
}

export function JobDetail({
  applyLabel,
  responsibilitiesLabel,
  requirementsLabel,
  unverifiedNotice,
  job,
}: JobDetailProps & { job?: Job }) {
  if (!job) return null;

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        {unverifiedNotice && (
          <p
            role="note"
            className="mb-8 rounded-control border border-line-soft bg-lavender px-5 py-3.5 text-sm text-deep"
          >
            {unverifiedNotice}
          </p>
        )}

        <Link href="/careers" className="label text-accent hover:text-deep">
          ← All openings
        </Link>

        <h1 className="mt-5 max-w-[22ch] text-display font-bold">{job.title}</h1>

        <p className="mt-5 max-w-[60ch] text-lead text-muted">{job.summary}</p>

        <div className="mt-11 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-16">
          <div>
            {job.responsibilities.length > 0 && (
              <>
                <h2 className="text-h3">{responsibilitiesLabel}</h2>
                <ul className="mt-5 space-y-3">
                  {job.responsibilities.map((r) => (
                    <li key={r} className="flex gap-3.5 text-body text-mid">
                      <span aria-hidden className="mt-2.5 block size-1.5 shrink-0 bg-accent" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.requirements.length > 0 && (
              <>
                <h2 className="mt-11 text-h3">{requirementsLabel}</h2>
                <ul className="mt-5 space-y-3">
                  {job.requirements.map((r) => (
                    <li key={r} className="flex gap-3.5 text-body text-mid">
                      <span aria-hidden className="mt-2.5 block size-1.5 shrink-0 bg-accent" />
                      {r}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="lg:sticky lg:top-8">
            <Facts job={job} />
            <Link
              href={job.applyHref}
              className="mt-4 block rounded-control bg-accent px-6 py-3.5 text-center text-md font-semibold text-on-accent transition-colors hover:bg-deep"
            >
              {applyLabel}
            </Link>
            {job.marketSlug && (
              <p className="mt-4 text-sm text-muted">
                This role supports our{" "}
                <Link href={`/markets`} className="font-semibold text-accent">
                  market operations
                </Link>
                .
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

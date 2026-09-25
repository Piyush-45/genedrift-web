import Link from "next/link";
import type { Job } from "@/lib/jobs";
import type { JobDetailProps } from "./schema";

/**
 * Fixed to UTC, like every other date on the site: a date rendered from the
 * server's local zone can disagree with the same date rendered elsewhere.
 */
function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Facts({ job }: { job: Job }) {
  const rows: [string, string | undefined][] = [
    ["Function", job.function],
    ["Location", job.location],
    ["Employment type", job.employmentType],
    ["Preferred joining", job.preferredJoining],
    ["Experience", job.experience],
    ["Qualification", job.qualification],
    // Their own reference. HR and candidates both quote it, and it is the only
    // stable identifier an opening has.
    ["Reference", job.reference],
    ["Posted", formatDate(job.postedOn)],
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
  emptyMessage,
  job,
  jobSource,
}: JobDetailProps & { job?: Job; jobSource?: "zoho" | "built-in" }) {
  if (!job) return null;

  /**
   * The sample-content warning belongs on an INVENTED advert, not on the
   * client's own live vacancy. Once openings are read from their Creator app
   * the notice is not merely unnecessary, it is wrong — it tells a real
   * candidate that a real job is fake.
   */
  const showNotice = Boolean(unverifiedNotice) && jobSource !== "zoho";

  /**
   * Only the sections that have content. Their records are uneven — some
   * openings have a full description and candidate profile, some have one,
   * some have neither — so the page is assembled from what exists rather than
   * rendering a heading above an empty list.
   */
  const sections = [
    { label: responsibilitiesLabel, items: job.responsibilities },
    { label: requirementsLabel, items: job.requirements },
  ].filter((section) => section.items.length > 0);

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        {showNotice && (
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

        {/* The department sits above the title. Their records hold the
            designation alone — "Astt Manager" — which says nothing on its own
            about what the role actually is. */}
        {job.function && <p className="label mt-8 text-accent">{job.function}</p>}

        <h1 className="mt-4 max-w-[22ch] text-display font-bold text-balance">{job.title}</h1>

        {/* Optional. Records whose description lives in the rich-text field
            have no lead paragraph, and an empty <p> leaves a gap that reads as
            a missing element. */}
        {job.summary && (
          <p className="mt-6 max-w-[58ch] text-lead text-muted">{job.summary}</p>
        )}

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-16">
          <div>
            {/* Prose is capped at a readable measure rather than the full
                column. At 1440 the content column is over 800px wide, and a
                bullet running the whole way across is hard to track back from
                the end of one line to the start of the next. */}
            {sections.map((section, i) => (
              <section key={section.label} className="border-t border-line pt-7 first:border-t-0 first:pt-0 [&+*]:mt-12">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-label tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-h3">{section.label}</h2>
                </div>
                <ul className="mt-6 max-w-[64ch] space-y-3.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3.5 text-body text-mid">
                      <span aria-hidden className="mt-2.5 block size-1.5 shrink-0 bg-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}

            {/* Some of their openings carry a title and nothing else. Saying so
                is better than a blank column, and better than us writing a
                description they have not approved. */}
            {sections.length === 0 && (
              <p className="max-w-[58ch] rounded-panel border border-line bg-surface px-7 py-6 text-body text-muted">
                {emptyMessage}
              </p>
            )}

            {/* Repeated at the end of the advert. On a long role the sidebar
                button has scrolled out of reach by the time someone finishes
                reading, and asking them to scroll back up to apply loses
                candidates. */}
            {sections.length > 0 &&
              (job.applyHref ? (
                <Link
                  href={job.applyHref}
                  className="mt-12 inline-flex rounded-control border border-line-soft px-6.5 py-3.5 text-md font-semibold text-deep transition-colors hover:border-accent hover:bg-lavender hover:text-accent lg:hidden"
                >
                  {applyLabel}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="mt-12 inline-flex cursor-default rounded-control border border-line px-6.5 py-3.5 text-md font-semibold text-faint lg:hidden"
                >
                  {applyLabel}
                </span>
              ))}
          </div>

          <div className="lg:sticky lg:top-8">
            <Facts job={job} />
            {/*
              Always rendered, so the page reads as designed — but only a link
              when there is somewhere to send the candidate. With no apply
              destination configured it is inert: visible, not clickable, and
              marked disabled for assistive technology. The alternative, a
              working-looking button that 404s, tells someone they have applied
              for a job when they have not.

              The destination is the client's published application form; see
              ZOHO_APPLY_URL in lib/content/jobs-source.ts.
            */}
            {job.applyHref ? (
              <Link
                href={job.applyHref}
                className="mt-4 block rounded-control bg-accent px-6 py-3.5 text-center text-md font-semibold text-on-accent transition-colors hover:bg-deep"
              >
                {applyLabel}
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="mt-4 block cursor-default rounded-control bg-accent px-6 py-3.5 text-center text-md font-semibold text-on-accent opacity-60"
              >
                {applyLabel}
              </span>
            )}

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

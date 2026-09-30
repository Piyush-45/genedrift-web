import Link from "next/link";
import type { CountryService } from "@/lib/content/country-services-source";

/**
 * One country service page, e.g. Drug Registration, Philippines.
 *
 * Built from what exists: every block is optional except the title, because
 * their content will arrive unevenly. A heading above an empty list reads as a
 * broken page; a missing block does not.
 */
export function ServicePage({ service, regionName }: { service: CountryService; regionName: string }) {
  const facts: [string, string][] = (
    [
      ["Regulator", service.regulator],
      ["Covers", service.covers],
      ["Typical timeline", service.timeline],
      ["Validity", service.validity],
    ] as [string, string][]
  ).filter(([, v]) => v !== "");

  const blocks = [
    service.process.length > 0 ? "process" : null,
    service.documents.length > 0 || service.downloadUrl ? "documents" : null,
  ].filter((b): b is "process" | "documents" => b !== null);

  const countryHref = `/markets/${service.regionSlug}/${service.marketSlug}`;

  return (
    <section className="px-gutter pt-12 lg:pt-16">
      <div className="mx-auto max-w-body">
        <nav aria-label="Breadcrumb" className="label flex flex-wrap gap-x-2 text-faint">
          <Link href="/markets" className="hover:text-accent">Markets</Link>
          <span aria-hidden>/</span>
          <Link href={`/markets/${service.regionSlug}`} className="hover:text-accent">{regionName}</Link>
          <span aria-hidden>/</span>
          <Link href={countryHref} className="text-accent hover:text-deep">{service.marketName}</Link>
        </nav>

        <h1 className="mt-8 max-w-[24ch] text-display font-bold text-balance">
          {service.serviceName}
          <span className="text-dim">, {service.marketName}</span>
        </h1>

        {service.summary && <p className="mt-6 max-w-[58ch] text-lead text-muted">{service.summary}</p>}

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-16">
          <div>
            {blocks.map((block, i) => (
              <section key={block} className="border-t border-line pt-7 first:border-t-0 first:pt-0 [&+*]:mt-12">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-label tabular-nums text-accent">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="text-h3">{block === "process" ? "How it works" : "Documents you will need"}</h2>
                </div>

                {block === "process" && (
                  <div className="mt-6 max-w-[64ch] space-y-4">
                    {service.process.map((p) => (
                      <p key={p} className="text-body text-mid">{p}</p>
                    ))}
                  </div>
                )}

                {block === "documents" && (
                  <>
                    {service.documents.length > 0 && (
                      <ul className="mt-6 max-w-[64ch] space-y-3.5">
                        {service.documents.map((d) => (
                          <li key={d} className="flex gap-3.5 text-body text-mid">
                            <span aria-hidden className="mt-2.5 block size-1.5 shrink-0 bg-accent" />
                            {d}
                          </li>
                        ))}
                      </ul>
                    )}
                    {service.downloadUrl && (
                      <a
                        href={service.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex rounded-control border border-line-soft px-6 py-3 text-md font-semibold text-deep transition-colors hover:border-accent hover:bg-lavender hover:text-accent"
                      >
                        {service.downloadLabel || "Download the checklist"}
                      </a>
                    )}
                  </>
                )}
              </section>
            ))}

            {blocks.length === 0 && (
              <p className="max-w-[58ch] rounded-panel border border-line bg-surface px-7 py-6 text-body text-muted">
                Full details for this service are being prepared. Speak to our team for the current requirements.
              </p>
            )}
          </div>

          <div className="lg:sticky lg:top-8">
            {facts.length > 0 && (
              <dl className="rounded-panel border border-line bg-surface px-7 py-6">
                {facts.map(([k, v]) => (
                  <div key={k} className="border-b border-rule py-3 first:pt-0 last:border-b-0 last:pb-0">
                    <dt className="label text-faint">{k}</dt>
                    <dd className="mt-1.5 text-md font-medium">{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Link
              href="/contact/enquiry"
              className="mt-4 block rounded-control bg-accent px-6 py-3.5 text-center text-md font-semibold text-on-accent transition-colors hover:bg-deep"
            >
              Speak to an expert
            </Link>
            <p className="mt-4 text-sm text-muted">
              More on{" "}
              <Link href={countryHref} className="font-semibold text-accent">
                {service.marketName}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

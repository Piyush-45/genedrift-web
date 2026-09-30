import Link from "next/link";
import { SectionHead } from "@/components/ui/section-head";
import type { CountryService } from "@/lib/content/country-services-source";

/**
 * "Services in {country}" on a country page, linking to each service page.
 * Renders nothing when the country has no published service pages.
 */
export function ServiceList({ marketName, services }: { marketName: string; services: CountryService[] }) {
  if (services.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow="Regulatory services" heading={`Services in ${marketName}.`} />
        <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <li key={s.serviceSlug}>
              <Link
                href={s.href}
                className="group flex h-full flex-col rounded-panel border border-line bg-canvas px-7.5 pt-7 pb-8 transition-colors hover:border-accent hover:bg-lavender"
              >
                <span className="text-h4 font-bold group-hover:text-accent">{s.serviceName}</span>
                {s.summary && (
                  <span className="mt-3 line-clamp-3 text-md leading-[1.6] text-muted">{s.summary}</span>
                )}
                <span className="mt-auto pt-5 text-sm font-semibold text-accent">View service</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

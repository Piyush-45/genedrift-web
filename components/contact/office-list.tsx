import { SectionHead } from "@/components/ui/section-head";
import type { Office } from "@/lib/content/site-source";

/**
 * Offices and locations, on the Contact page. Work Order 1(i).
 *
 * Every line is optional except the name: an office with no phone number
 * simply shows no phone line, rather than a label with nothing after it.
 * Renders nothing at all until at least one office is published.
 */
export function OfficeList({ offices }: { offices: Office[] }) {
  if (offices.length === 0) return null;

  return (
    <section className="px-gutter pt-section">
      <div className="mx-auto max-w-body">
        <SectionHead eyebrow="Offices" heading="Where to find us." />

        {/* Bordered cards with a gap, not the hairline-grid trick used
            elsewhere: with a hairline grid, two offices in a three-column row
            leave a grey empty cell. */}
        <ul className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((office) => {
            const place = [office.city, office.postalCode, office.country]
              .filter((part) => part !== "")
              .join(", ");
            return (
              <li key={office.name} className="flex flex-col rounded-panel border border-line bg-canvas px-7.5 pt-7 pb-8">
                <h3 className="text-h4 font-bold">{office.name}</h3>

                {(office.address || place) && (
                  <address className="mt-3 text-md leading-[1.6] text-muted not-italic">
                    {office.address && <span className="block whitespace-pre-line">{office.address}</span>}
                    {place && <span className="block">{place}</span>}
                  </address>
                )}

                <dl className="mt-4 space-y-1 text-sm">
                  {office.phone && (
                    <div className="flex gap-2">
                      <dt className="sr-only">Phone</dt>
                      <dd>
                        <a href={`tel:${office.phone.replace(/[^+\d]/g, "")}`} className="text-ink hover:text-accent">
                          {office.phone}
                        </a>
                      </dd>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex gap-2">
                      <dt className="sr-only">Email</dt>
                      <dd>
                        <a href={`mailto:${office.email}`} className="text-accent">
                          {office.email}
                        </a>
                      </dd>
                    </div>
                  )}
                  {office.hours && (
                    <div className="flex gap-2">
                      <dt className="sr-only">Office hours</dt>
                      <dd className="text-muted">{office.hours}</dd>
                    </div>
                  )}
                </dl>

                {office.mapUrl && (
                  <a
                    href={office.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto pt-5 text-sm font-semibold text-accent"
                  >
                    View on map
                  </a>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

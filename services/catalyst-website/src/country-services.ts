import { z } from "zod";

/**
 * Country service pages: one page per service per country, for example
 * "Drug Registration, Philippines" at
 * /markets/asia-pacific/philippines/drug-registration.
 *
 * Added 30 Sept 2026 as a change to the approved sitemap (SOW section 09),
 * built at the client's request. The shape follows the client's own pages on
 * the old genedrift.com (drug-registration-* and regulatory-resources-*): a
 * short introduction, a facts box, the process, the documents, a download.
 *
 * Published WHOLE, like case studies: the country page lists its services and
 * each service page reads the same rows, so deletion must be expressible as
 * "absent from the next publish".
 */

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lower-case words joined by single hyphens",
  });

const httpsOrEmpty = z
  .string()
  .trim()
  .max(1000)
  .default("")
  .refine((v) => v === "" || v.startsWith("https://"), {
    message: "Link must start with https://, or be left empty",
  });

const text = (max: number) => z.string().trim().max(max).default("");

export const countryServiceSchema = z.object({
  /** The market's own slug and region slug, taken from the linked market. */
  marketSlug: slug,
  regionSlug: slug,
  /** The country as visitors read it, from the linked market. */
  marketName: z.string().trim().min(1).max(120),
  serviceSlug: slug,
  serviceName: z.string().trim().min(1).max(120),
  summary: text(1200),
  /** Facts box. Every line optional; an empty one is simply not shown. */
  regulator: text(200),
  covers: text(300),
  timeline: text(200),
  validity: text(200),
  /** Paragraphs, separated by blank lines. */
  process: text(8000),
  /** One document per line. */
  documents: text(6000),
  downloadUrl: httpsOrEmpty,
  downloadLabel: text(120),
  seoTitle: text(160),
  seoDescription: text(320),
  displayOrder: z.coerce.number().int().default(0),
});

export const countryServicesPublishRequestSchema = z.object({
  // Zero is allowed: removing the last service page is a real instruction,
  // unlike an empty world map.
  countryServices: z.array(countryServiceSchema).max(2000),
  publishNote: z.string().trim().max(2000).optional().nullable(),
});

export type CountryServicesPublishRequest = z.infer<typeof countryServicesPublishRequestSchema>;
export type CountryServiceInput = z.infer<typeof countryServiceSchema>;

export type PublishedCountryService = Omit<CountryServiceInput, "displayOrder"> & {
  href: string;
  order: number;
};

export interface PublishedCountryServices {
  schemaVersion: 1;
  publicationId: string;
  contentHash: string;
  publishedAt: string;
  countryServices: PublishedCountryService[];
}

/**
 * Two rows for the same service in the same country means one page silently
 * wins. Named, so an editor can find it.
 */
export function findDuplicateService(rows: CountryServiceInput[]): string | null {
  const seen = new Set<string>();
  for (const r of rows) {
    const key = `${r.marketSlug}/${r.serviceSlug}`;
    if (seen.has(key)) return key;
    seen.add(key);
  }
  return null;
}

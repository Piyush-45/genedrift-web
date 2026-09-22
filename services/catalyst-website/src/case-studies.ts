import { z } from "zod";

/**
 * The Case Studies collection.
 *
 * Published WHOLE, like markets and for the same reasons: the listing, both
 * detail pages and any future "featured case study" block all read the same
 * rows, and deletion has to be expressible. A case study removed in Creator is
 * simply absent from the next publish; there is no tombstone per record.
 *
 * The three narrative fields are Scenario / Solution / Result because that is
 * the shape the client already writes case studies in on genedrift.com. The
 * schema follows their content, not the other way round.
 */

const slug = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Slug must be lower-case words joined by single hyphens",
  });

const metricSchema = z.object({
  value: z.string().trim().min(1).max(24),
  label: z.string().trim().min(1).max(60),
  displayOrder: z.coerce.number().int().default(0),
});

export const caseStudySchema = z.object({
  slug,
  title: z.string().trim().min(1).max(160),
  /** Display name of the family, e.g. "Delivering Excellence". */
  family: z.string().trim().min(1).max(80),
  familySlug: slug,
  teaser: z.string().trim().max(600).default(""),
  /**
   * All three narrative fields are OPTIONAL, deliberately.
   *
   * Two of the client's own case studies have a listing summary and nothing
   * behind it. Refusing to publish those would mean either dropping them from
   * the site or writing the missing halves for them — and inventing a client
   * outcome is the one thing that must never happen here. A record with an
   * incomplete narrative publishes as a summary card and has no detail page.
   */
  scenario: z.string().trim().max(4000).default(""),
  solution: z.string().trim().max(4000).default(""),
  result: z.string().trim().max(4000).default(""),
  /**
   * ⚠️ Every figure here is a public claim about the business. It must come
   * from the narrative it sits beside — see the warning on the website's
   * metric-row schema.
   */
  metrics: z.array(metricSchema).max(8).default([]),
  tags: z.array(z.string().trim().min(1).max(60)).max(12).default([]),
  displayOrder: z.coerce.number().int().default(0),
});

export const caseStudiesPublishRequestSchema = z.object({
  caseStudies: z.array(caseStudySchema).min(1).max(200),
  publishNote: z.string().trim().max(2000).optional().nullable(),
});

export type CaseStudiesPublishRequest = z.infer<typeof caseStudiesPublishRequestSchema>;
export type PublishedCaseStudy = z.infer<typeof caseStudySchema>;

export interface PublishedCaseStudies {
  schemaVersion: 1;
  publicationId: string;
  contentHash: string;
  publishedAt: string;
  caseStudies: Array<
    Omit<PublishedCaseStudy, "metrics" | "displayOrder"> & {
      href: string;
      order: number;
      metrics: Array<{ value: string; label: string }>;
    }
  >;
}

/**
 * Two rows claiming the same slug means one case study silently wins and the
 * other disappears with no error anywhere — the same failure duplicate market
 * slugs cause.
 */
export function findDuplicateSlug(studies: PublishedCaseStudy[]): string | null {
  const seen = new Set<string>();
  for (const s of studies) {
    if (seen.has(s.slug)) return s.slug;
    seen.add(s.slug);
  }
  return null;
}

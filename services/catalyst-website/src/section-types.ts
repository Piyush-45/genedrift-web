/**
 * The section types this service will accept.
 *
 * GENERATED — do not edit by hand. Run `npm run sync:catalyst-types` in the
 * website repo root, which regenerates this file from
 * `public/section-schemas.json` (itself emitted on every website build).
 *
 * Catalyst rejects any section type not in this list. That is the point: an
 * unknown type reaching the renderer is how a CMS save white-screens a live
 * site. Rejecting at publish time means the live site is never touched.
 */
export const SECTION_TYPES = [
  "article-body",
  "article-grid",
  "article-head",
  "capability-panels",
  "capability-status",
  "contact-form",
  "contact-split",
  "country-head",
  "explore-journeys",
  "faq-accordion",
  "hero-map",
  "industry-index",
  "insight-feed",
  "job-detail",
  "job-list",
  "market-directory",
  "metric-row",
  "page-head",
  "pill-row",
  "process-grid",
  "proof-billboard",
  "region-cards",
  "statement",
  "sub-capability-grid",
  "value-grid",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_SET: ReadonlySet<string> = new Set(SECTION_TYPES);

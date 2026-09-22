/**
 * A case study record.
 *
 * WHY THIS SHAPE. It is the client's own model, taken from the case studies
 * on genedrift.com: every one of their case studies is a Scenario, a Solution
 * and a Result, filed under one of two families — "Delivering Excellence" and
 * "Strategic Filing". We did not invent a richer structure and then ask them
 * to fill it; we took the structure they already write in, so the eight
 * records they have transfer without anyone having to write anything new.
 *
 * `metrics` exists only because some of their narratives already carry
 * figures ("5000 SKUs, 27 countries", "saved over two years"). It is optional
 * and must never be padded — see the warning on `metric-row`'s schema. Every
 * number here is a public claim about the business.
 */
export interface CaseStudyMetric {
  value: string;
  label: string;
}

export interface CaseStudy {
  slug: string;
  /** The client's own title, unedited. */
  title: string;
  /** Display name of the family — "Delivering Excellence". */
  family: string;
  familySlug: string;
  /** The one or two sentences that appear on the listing. */
  teaser: string;
  scenario: string;
  solution: string;
  result: string;
  metrics: CaseStudyMetric[];
  /** Capability and market tags, so a record can surface on those pages later. */
  tags: string[];
  /** Ordering within its family. Lower first. */
  order: number;
}

export const CASE_STUDY_BASE = "/client-success/case-studies";

export function caseStudyHref(study: Pick<CaseStudy, "slug">): string {
  return `${CASE_STUDY_BASE}/${study.slug}`;
}

/**
 * A record earns a detail page only when it has all three parts of the
 * narrative. Two of the client's eight — API Vendor Review and Biosimilars —
 * have a listing summary and nothing behind it on their current site either,
 * so they render as summary cards and do not link anywhere.
 *
 * This is deliberate. The alternative is a page with two empty headings, or
 * copy we wrote pretending to be theirs.
 */
export function hasDetail(study: CaseStudy): boolean {
  return (
    study.scenario.trim() !== "" && study.solution.trim() !== "" && study.result.trim() !== ""
  );
}

/** Groups in the client's own order, preserving first-seen family order. */
export function byFamily(studies: CaseStudy[]): { family: string; familySlug: string; studies: CaseStudy[] }[] {
  const groups: { family: string; familySlug: string; studies: CaseStudy[] }[] = [];
  for (const study of studies) {
    let group = groups.find((g) => g.familySlug === study.familySlug);
    if (!group) {
      group = { family: study.family, familySlug: study.familySlug, studies: [] };
      groups.push(group);
    }
    group.studies.push(study);
  }
  for (const group of groups) group.studies.sort((a, b) => a.order - b.order);
  return groups;
}

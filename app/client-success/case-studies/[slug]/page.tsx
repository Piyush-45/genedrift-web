import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyHead } from "@/components/sections/case-study-head";
import { CaseStudyBody } from "@/components/sections/case-study-body";
import { MetricRow } from "@/components/sections/metric-row";
import { ContactSplit } from "@/components/sections/contact-split";
import { contactSplitFixture } from "@/components/sections/contact-split/fixture";
import { getCaseStudies, getCaseStudy } from "@/lib/content/case-studies-source";
import { hasDetail } from "@/lib/content/case-study";
import { resolveSection } from "@/lib/content/resolve";

/**
 * One case study, at /client-success/case-studies/{slug}.
 *
 * `dynamicParams` is TRUE for the same reason as every other CMS-backed
 * route: a case study published after the last deploy must render, not 404.
 * Unknown slugs still 404 below.
 *
 * A record with only a summary — no Scenario, Solution and Result — has no
 * page. It is not a stub with empty headings; the listing does not link to it
 * and this route treats it as not found. See `hasDetail`.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getCaseStudies()).filter(hasDetail).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return { title: "Case studies — Genedrift" };
  return {
    title: `${study.title} — Genedrift case study`,
    description: study.teaser || undefined,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study || !hasDetail(study)) notFound();

  // The sections resolve through the same seam a CMS page would use, so
  // moving this page into Creator later is a data change, not a rewrite.
  const head = await resolveSection({ type: "case-study-head", caseSlug: slug, backLabel: "← All case studies" });
  const body = await resolveSection({
    type: "case-study-body",
    caseSlug: slug,
    scenarioLabel: "Scenario",
    solutionLabel: "Solution",
    resultLabel: "Result",
    pagerLabel: "Next case study",
  });

  return (
    <main className="pb-section">
      <CaseStudyHead {...(head as React.ComponentProps<typeof CaseStudyHead>)} />
      {/* Before the narrative, not after it. The body ends with the pager to
          the next case study, and a proof number printed below that reads as
          belonging to the wrong story. */}
      {study.metrics.length > 0 && (
        <MetricRow type="metric-row" eyebrow="By the numbers" items={study.metrics} />
      )}
      <CaseStudyBody {...(body as React.ComponentProps<typeof CaseStudyBody>)} />
      <ContactSplit {...contactSplitFixture} />
    </main>
  );
}

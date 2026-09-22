import type { Metadata } from "next";
import { CaseStudyIndex } from "@/components/sections/case-study-index";
import { caseStudyIndexFixture } from "@/components/sections/case-study-index/fixture";
import { PageHead } from "@/components/sections/page-head";
import { ContactSplit } from "@/components/sections/contact-split";
import { contactSplitFixture } from "@/components/sections/contact-split/fixture";
import { getCaseStudies } from "@/lib/content/case-studies-source";

/**
 * The case studies listing, at /client-success/case-studies.
 *
 * This is a STATIC segment and therefore wins over `app/[pillar]/[slug]`,
 * which would otherwise try to serve the same path as a CMS page. Nothing
 * else changes: /client-success itself is still the generic hub.
 *
 * Page family 11 in the 5 September architecture document.
 */
export const metadata: Metadata = {
  title: "Case studies — Genedrift",
  description:
    "Regulatory and pharmacovigilance engagements: the scenario, what we did and what changed.",
};

export default async function CaseStudiesIndex() {
  const studies = await getCaseStudies();

  return (
    <main className="pb-section">
      <PageHead
        type="page-head"
        eyebrow="Client success"
        heading="Case studies."
        headingTail="What the work looked like."
        standfirst="Engagements across regulatory affairs, pharmacovigilance and lifecycle management. Client names are withheld unless we hold written permission to use them."
        actions={[{ label: "Speak to an expert", href: "/contact/enquiry", variant: "solid" }]}
      />
      <CaseStudyIndex {...caseStudyIndexFixture} studies={studies} />
      <ContactSplit {...contactSplitFixture} />
    </main>
  );
}

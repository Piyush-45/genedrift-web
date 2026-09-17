import type { PageHeadProps } from "./schema";

export const pageHeadFixture: PageHeadProps = {
  type: "page-head",
  eyebrow: "Expertise",
  heading: "Regulatory Affairs, Pharmacovigilance and local representation,",
  headingTail: "delivered in-house.",
  standfirst:
    "Placeholder standfirst — replaced through the CMS. The team that files your dossier is the team that maintains it.",
  actions: [
    { label: "Speak to an Expert", href: "/contact/enquiry", variant: "solid" },
    { label: "Our operating model", href: "/company/operating-model", variant: "quiet" },
  ],
};

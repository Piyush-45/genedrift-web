import type { FaqAccordionProps } from "./schema";

/**
 * ⚠️ Placeholder questions and answers. Plausible for an RA/PV consultancy
 * and entirely unverified — several touch on regulatory obligations, where a
 * confidently wrong answer on a public site is a liability, not a typo.
 */
export const faqAccordionFixture: FaqAccordionProps = {
  type: "faq-accordion",
  eyebrow: "Common questions",
  heading: "What people ask before they engage.",
  items: [
    {
      question: "Do we need a local entity to register a product?",
      answer:
        "Placeholder answer — the client's regulatory team must supply and approve this. In most markets a local presence of some form is required, but the specific mechanism varies by country and product type.",
    },
    {
      question: "Can you hold the marketing authorisation on our behalf?",
      answer:
        "Placeholder answer. MAH and local representation is one of the three core capabilities; availability differs per market and is shown on each country page.",
    },
    {
      question: "How is pharmacovigilance handled across multiple markets?",
      answer:
        "Placeholder answer covering local QPPV cover, case intake, aggregate reporting and inspection readiness.",
    },
    {
      question: "What happens after approval?",
      answer:
        "Placeholder answer covering variations, renewals, transfers and withdrawals — stages nine through twelve of the operating model.",
    },
  ],
};

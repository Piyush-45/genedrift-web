import type { ContactSplitProps } from "./schema";

export const contactSplitFixture: ContactSplitProps = {
  type: "contact-split",
  eyebrow: "Speak to an expert",
  heading: "Tell us the product and the market. We'll map the pathway.",
  fields: [
    { label: "Name", wide: false },
    { label: "Work email", wide: false },
    { label: "Company", wide: false },
    { label: "Country", wide: false },
    { label: "Contact number", wide: false },
    { label: "Purpose / remarks — tell us why you are getting in touch", wide: true },
  ],
  submitLabel: "Submit enquiry",
  submitHref: "/contact/enquiry",
  routes: [
    {
      title: "Request a proposal",
      body: "Defined scope, timeline and commercial terms.",
      href: "/contact/proposal",
      emphasis: "neutral",
    },
    {
      title: "Partnership enquiry",
      body: "For CROs, consultancies and local agents.",
      href: "/contact/partnership",
      emphasis: "neutral",
    },
    {
      // Added on client request, 2026-09-15: a fourth card routing to Careers.
      title: "Submit your CV",
      body: "Looking to join us? Send your CV and see the roles we are hiring for.",
      href: "/careers",
      linkLabel: "View openings",
      emphasis: "neutral",
    },
    {
      title: "Pharmacovigilance & safety",
      body: "Report an adverse event or product safety concern. Handled separately from commercial enquiries.",
      href: "/contact/safety",
      linkLabel: "Safety reporting",
      emphasis: "safety",
    },
  ],
  generalLabel: "General enquiries",
  generalEmail: "cs@genedrift.com",
};

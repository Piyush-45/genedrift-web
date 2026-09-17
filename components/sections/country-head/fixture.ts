import type { CountryHeadProps } from "./schema";

export const countryHeadFixture: CountryHeadProps = {
  type: "country-head",
  eyebrow: "Market",
  regionSlug: "asia-pacific",
  marketSlug: "india",
  standfirst:
    "Placeholder standfirst — the client's own description of this market replaces it through the CMS. Nothing on this page has been verified against current authority requirements.",
  localTimeLabel: "Local time",
  showLocator: true,
  actions: [
    { label: "Speak to an Expert", href: "/contact/enquiry", variant: "solid" },
    { label: "All markets", href: "/markets", variant: "quiet" },
  ],
};

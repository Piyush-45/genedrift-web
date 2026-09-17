import type { HeroMapProps } from "./schema";

/**
 * The ticker entries are placeholder — they are marked as sample content in
 * the design. They will come from the Knowledge Hub's regulatory updates once
 * Insights is ported. Do not present these as real authority notices.
 */
export const heroMapFixture: HeroMapProps = {
  type: "hero-map",
  headingLead: "Get it approved",
  headingJoin: "in",
  standfirst: "46 markets, 6 regions, in-house delivery.",
  actions: [
    { label: "Speak to an Expert", href: "/contact/enquiry", variant: "solid" },
    { label: "Our operating model", href: "/company/operating-model", variant: "quiet" },
  ],
  defaultMarket: "india",
  marketSource: "all",
  cardLabel: "Market status",
  /**
   * ⚠️ PLACEHOLDER. The client asked for this strip "starting with FDA" and
   * has not said what it should contain — authority names alone, or real
   * headlines. Notes are left EMPTY on purpose: bare authority names are the
   * safe reading of the request, and an invented regulatory headline on a
   * pharmaceutical consultancy's homepage is not a placeholder, it is a false
   * statement. Filling the notes in is an editing action, not a code change.
   */
  bulletinLabel: "Health authority bulletin",
  bulletin: [
    { authority: "FDA", note: "", href: "" },
    { authority: "EMA", note: "", href: "" },
    { authority: "CDSCO", note: "", href: "" },
    { authority: "SFDA", note: "", href: "" },
    { authority: "NAFDAC", note: "", href: "" },
  ],
  tickerLabel: "Latest updates",
  ticker: [
    { source: "India · CDSCO", text: "import licence timeline revised" },
    { source: "Saudi Arabia · SFDA", text: "variation guidance updated" },
    { source: "Nigeria · NAFDAC", text: "renewal window opens" },
    { source: "Kenya · PPB", text: "retention fee schedule published" },
    { source: "Uzbekistan", text: "pharmacovigilance inspection notice" },
    { source: "Peru · DIGEMID", text: "labelling annex revised" },
  ],
};

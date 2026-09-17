import type { RegionCardsProps } from "./schema";

/**
 * The 46 markets and their regions, taken from the approved design.
 *
 * Two things to know about this data:
 *  - The design's slug for Côte d'Ivoire was `c-te-divoire`, produced by a
 *    slugifier that choked on the accent. Corrected to `cote-divoire` here.
 *  - The client's own sitemap names Gulf markets (Qatar, Oman, Kuwait,
 *    Bahrain) that are not in this list, and the hero says forty-six while
 *    their metrics row says thirty-plus. Both are open with the client —
 *    see context/blocked-on-client.md. Treat the list as shape, not as final
 *    content.
 */
const market = (region: string) => (name: string, slug: string) => ({
  name,
  href: `/markets/${region}/${slug}`,
});

const ap = market("asia-pacific");
const af = market("africa");
const la = market("latin-america");
const cis = market("cis");
const me = market("middle-east");
const ee = market("eastern-europe");

export const regionCardsFixture: RegionCardsProps = {
  type: "region-cards",
  eyebrow: "Global presence",
  heading: "Local execution across emerging markets —",
  headingTail: "46 markets, one accountability team",
  regions: [
    {
      name: "Asia Pacific",
      count: "15",
      href: "/markets/asia-pacific",
      markets: [
        ap("India", "india"),
        ap("Sri Lanka", "sri-lanka"),
        ap("Philippines", "philippines"),
        ap("Myanmar", "myanmar"),
        ap("Vietnam", "vietnam"),
        ap("Thailand", "thailand"),
        ap("Indonesia", "indonesia"),
        ap("Malaysia", "malaysia"),
        ap("Singapore", "singapore"),
        ap("Hong Kong", "hong-kong"),
        ap("Taiwan", "taiwan"),
        ap("Cambodia", "cambodia"),
        ap("Brunei", "brunei"),
        ap("Laos", "laos"),
        ap("Pakistan", "pakistan"),
      ],
    },
    {
      name: "Africa",
      count: "17",
      href: "/markets/africa",
      markets: [
        af("Nigeria", "nigeria"),
        af("Kenya", "kenya"),
        af("South Africa", "south-africa"),
        af("Tanzania", "tanzania"),
        af("Ethiopia", "ethiopia"),
        af("Uganda", "uganda"),
        af("Zimbabwe", "zimbabwe"),
        af("Ghana", "ghana"),
        af("Côte d’Ivoire", "cote-divoire"),
        af("Senegal", "senegal"),
        af("Burkina Faso", "burkina-faso"),
        af("Togo", "togo"),
        af("Benin", "benin"),
        af("Cameroon", "cameroon"),
        af("DR Congo", "dr-congo"),
        af("Chad", "chad"),
        af("Madagascar", "madagascar"),
      ],
    },
    {
      name: "Latin America",
      count: "06",
      href: "/markets/latin-america",
      markets: [
        la("Peru", "peru"),
        la("Chile", "chile"),
        la("Guatemala", "guatemala"),
        la("Honduras", "honduras"),
        la("El Salvador", "el-salvador"),
        la("Nicaragua", "nicaragua"),
      ],
    },
    {
      name: "CIS",
      count: "04",
      href: "/markets/cis",
      markets: [
        cis("Uzbekistan", "uzbekistan"),
        cis("Kazakhstan", "kazakhstan"),
        cis("Kyrgyzstan", "kyrgyzstan"),
        cis("Azerbaijan", "azerbaijan"),
      ],
    },
    {
      name: "Middle East",
      count: "02",
      href: "/markets/middle-east",
      markets: [
        me("Saudi Arabia", "saudi-arabia"),
        me("United Arab Emirates", "united-arab-emirates"),
      ],
    },
    {
      name: "Eastern Europe",
      count: "02",
      href: "/markets/eastern-europe",
      markets: [ee("Russia", "russia"), ee("Ukraine", "ukraine")],
    },
  ],
  footnoteLeft: "Every market name links to its country page",
  footnoteRight: "Markets shown as points · no international boundaries are drawn",
};

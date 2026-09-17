import type { InsightFeedProps } from "./schema";

/**
 * ⚠️ FALLBACK ONLY. These entries are replaced at render time by the newest
 * published articles — see lib/content/resolve.ts. They appear only when the
 * editorial feed is empty or unreachable, which is why they are BRACKETED
 * placeholders rather than plausible-looking notices. The design showed [BRACKETED
 * PLACEHOLDERS] here precisely because no real articles were supplied.
 * These read as real regulatory notices and must not reach a client
 * screenshot without being labelled as sample content. Real records arrive
 * when Insights is ported — see context/integration.md.
 */
export const insightFeedFixture: InsightFeedProps = {
  type: "insight-feed",
  featuredSlug: "",
  limit: 4,
  eyebrow: "Knowledge Hub",
  heading: "Regulatory intelligence, structured.",
  standfirst: "Published from the editorial workspace your team already uses.",
  featured: {
    kind: "Featured insight",
    meta: "[DATE] · [READ TIME]",
    title: "[FEATURED ARTICLE HEADLINE — editor-curated from the Knowledge Hub]",
    standfirst:
      "[Two-to-three line standfirst. Records carry content type, market, capability and industry tags so this module is curated without changing the source record.]",
    href: "/insights",
  },
  listLabel: "Latest updates & blogs",
  listLinkLabel: "View all",
  listLinkHref: "/insights",
  items: [
    { kind: "Regulatory update", meta: "[MARKET] · [DATE]", title: "[AUTHORITY UPDATE HEADLINE]", href: "/insights/regulatory-updates" },
    { kind: "Country intelligence", meta: "[MARKET] · [DATE]", title: "[COUNTRY INTELLIGENCE HEADLINE]", href: "/insights/country-intelligence" },
    { kind: "Blog", meta: "[CAPABILITY] · [DATE]", title: "[BLOG TITLE]", href: "/insights" },
    { kind: "Whitepaper", meta: "[REGION] · [DATE]", title: "[WHITEPAPER TITLE]", href: "/insights/whitepapers" },
  ],
};

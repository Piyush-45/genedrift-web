/**
 * Site navigation.
 *
 * This is the shape the `Nav_Items` / `Global_Content` Creator collections
 * will hold — one level of children, an optional description per child, no
 * arbitrary nesting. Keeping it flat is deliberate: a self-nesting menu is
 * how a client builds a five-level dropdown nobody can use on a phone.
 *
 * Children were taken from the footer columns of the approved design, which
 * is the only place the sub-navigation is enumerated.
 *
 * NOTE: the design's footer lists five Markets regions and omits Eastern
 * Europe, which does exist on the map and in the region cards. The six real
 * regions are used here. That inconsistency is the client's, and is recorded
 * in context/blocked-on-client.md.
 */
export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV: readonly NavItem[] = [
  {
    label: "Explore",
    href: "/explore",
    children: [
      { label: "Business Needs", href: "/explore/business-needs" },
      { label: "Guided Journeys", href: "/explore/guided-journeys" },
      { label: "Questionnaire", href: "/explore/questionnaire" },
    ],
  },
  {
    label: "Expertise",
    href: "/expertise",
    children: [
      { label: "Regulatory Affairs", href: "/expertise/regulatory-affairs" },
      { label: "Pharmacovigilance", href: "/expertise/pharmacovigilance" },
      { label: "MAH & Local Representation", href: "/expertise/mah-local-representation" },
      { label: "Regulatory Intelligence", href: "/expertise/regulatory-intelligence" },
      { label: "Managed Services", href: "/expertise/managed-services" },
      { label: "Dedicated Teams", href: "/expertise/dedicated-teams" },
    ],
  },
  {
    label: "Markets",
    href: "/markets",
    children: [
      /* Added 2026-09-15 on client request. Sits beside the region list rather
         than replacing /markets -- see globalPresencePage() in
         lib/content/pages.ts for the open question. */
      { label: "Global presence", href: "/global-presence" },
      { label: "Asia Pacific", href: "/markets/asia-pacific" },
      { label: "Africa", href: "/markets/africa" },
      { label: "Latin America", href: "/markets/latin-america" },
      { label: "CIS", href: "/markets/cis" },
      { label: "Middle East", href: "/markets/middle-east" },
      { label: "Eastern Europe", href: "/markets/eastern-europe" },
    ],
  },
  {
    label: "Knowledge Hub",
    href: "/insights",
    children: [
      { label: "Insights", href: "/insights" },
      /* Taxonomy links filter via the QUERY STRING (they previously pointed
         at /insights/<taxonomy>, which is the article route — every one was a
         broken link). The public API matches `category` by DISPLAYED NAME, not
         slug, so these values are names.

         ⚠️ They must match the real `Categories` records in Creator. Until
         that list is confirmed, a mismatch shows the listing's empty state —
         harmless, but check them against `facets.categories` once the API is
         connected. */
      { label: "Regulatory Updates", href: "/insights?category=Regulatory+Updates" },
      { label: "Country Intelligence", href: "/insights?category=Country+Intelligence" },
      { label: "Whitepapers", href: "/insights?category=Whitepapers" },
      { label: "Expert Opinions", href: "/insights?category=Expert+Opinions" },
      { label: "Authority News", href: "/insights?category=Authority+News" },
    ],
  },
  { label: "Client Success", href: "/client-success" },
  {
    label: "Company",
    href: "/company",
    children: [
      { label: "About", href: "/company/about" },
      { label: "Leadership", href: "/company/leadership" },
      { label: "Operating Model", href: "/company/operating-model" },
      { label: "Quality & Compliance", href: "/company/quality-compliance" },
      { label: "Contact", href: "/contact" },
    ],
  },
  { label: "Careers", href: "/careers" },
];

export const HEADER_CTA = { label: "Speak to an Expert", href: "/contact/enquiry" };

/**
 * Footer. The five link columns are DERIVED from NAV — any item with
 * children becomes a column — so the footer cannot drift out of step with
 * the header. Adding a nav child adds a footer link, once.
 */
export const FOOTER_COLUMNS = NAV.filter((i) => i.children?.length);

export const FOOTER_BRAND = {
  tagline: "Invent. Reinvent.",
  description: "Global Regulatory Affairs & Pharmacovigilance solutions.",
  site: "genedrift.com",
  email: "cs@genedrift.com",
  /** Placeholder in the approved design. Must be real before launch. */
  address: "[REGISTERED ADDRESS]",
};

/**
 * ⚠️ COMPLIANCE CLAIMS — DO NOT EDIT OR "CORRECT" WITHOUT THE CLIENT.
 *
 * These are certification assertions on a pharmaceutical consultancy's site.
 * They came from the client's own material and are reproduced verbatim.
 *
 * One looks wrong: **ISO 9001:2000** was superseded by 9001:2008 and then
 * 9001:2015, and has been withdrawn for years. It is very likely meant to be
 * 9001:2015. It has NOT been silently changed here, because quietly editing a
 * certification claim is worse than displaying a stale one — either way the
 * client must confirm, and every one of these needs a certificate number and
 * an expiry date before launch.
 */
export const FOOTER_CERTIFICATIONS = [
  "ISO 9001:2000",
  "ISO 27001:2022",
  "GDPR",
  "21 CFR Part 11",
  "SOC 2 Type II",
];

export const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Use", href: "/legal/terms" },
  { label: "Cookie Settings", href: "/legal/cookies" },
];

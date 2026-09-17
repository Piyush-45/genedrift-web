/* Stands in for the Creator SDK so the widget can be reviewed outside Zoho. */
const PAGES = [
  { ID: "1", Page_UUID: "PG-home-0001", Path: "/", Internal_Title: "Home", Status: "Published", SEO_Title: "Genedrift", SEO_Description: "", Last_Published_At: "16-Sep-2026" },
  { ID: "2", Page_UUID: "PG-about-0001", Path: "/company/about", Internal_Title: "About Genedrift", Status: "Draft", SEO_Title: "About — Genedrift", SEO_Description: "", Last_Published_At: "" },
];
const SECTIONS = [
  { ID: "10", Section_UUID: "S1", Page: { ID: "1", display_value: "/" }, Display_Order: 10, Section_Type: "hero-map",
    Section_Data: JSON.stringify({ headingLead: "Get it approved", headingJoin: "in", standfirst: "46 markets, 6 regions, in-house delivery.", defaultMarket: "india", cardLabel: "Market status", tickerLabel: "Latest updates", actions: [{ label: "Speak to an Expert", href: "/contact/enquiry", variant: "solid" }, { label: "Our operating model", href: "/company/operating-model", variant: "quiet" }], ticker: [{ source: "India · CDSCO", text: "import licence timeline revised" }] }), Hidden: "false", Is_Required: "true" },
  { ID: "11", Section_UUID: "S2", Page: { ID: "1", display_value: "/" }, Display_Order: 20, Section_Type: "explore-journeys",
    Section_Data: JSON.stringify({ eyebrow: "Explore", heading: "Start with the problem, not our service names.", standfirst: "Most people arrive knowing the outcome they need.", linkLabel: "Explore", items: [{ title: "Enter a new market", body: "Pathway, classification and the filing route.", href: "/explore/business-needs", resting: false }, { title: "Build or maintain PV compliance", body: "A local QPPV, case intake and aggregate reports.", href: "/expertise/pharmacovigilance", resting: false }] }), Hidden: "false", Is_Required: "true" },
  { ID: "12", Section_UUID: "S3", Page: { ID: "1", display_value: "/" }, Display_Order: 30, Section_Type: "statement",
    Section_Data: JSON.stringify({ eyebrow: "Where regulatory clarity becomes market access", lead: "We do not sell hours. We take responsibility for an outcome" }), Hidden: "false", Is_Required: "false" },
  { ID: "13", Section_UUID: "S4", Page: { ID: "2", display_value: "/company/about" }, Display_Order: 10, Section_Type: "page-head",
    Section_Data: JSON.stringify({ eyebrow: "Company", heading: "This heading is coming from Zoho Creator,", headingTail: "not from the codebase." }), Hidden: "false", Is_Required: "false" },
];
window.ZOHO = {
  CREATOR: {
    init: () => Promise.resolve(),
    DATA: {
      getRecords: ({ report_name }) =>
        Promise.resolve({ code: 3000, data: report_name.startsWith("Website_Pages") ? PAGES : SECTIONS }),
      updateRecordById: () => Promise.resolve({ code: 3000, data: { ID: "1" } }),
      addRecords: () => Promise.resolve({ code: 3000, data: { ID: "99" } }),
      invokeCustomApi: () => Promise.resolve({ code: 3000, result: { ok: true, sectionCount: 3 } }),
    },
    UTIL: { getInitParams: () => Promise.resolve({}) },
  },
};

/**
 * End-to-end smoke test against a locally running service.
 * Usage:  node test/smoke.mjs http://localhost:9000
 */
import { createHash, createHmac, randomUUID } from "node:crypto";

const BASE = process.argv[2] ?? "http://localhost:9000";
const SECRET = process.env.WEBSITE_HMAC_SECRET;
if (!SECRET) throw new Error("WEBSITE_HMAC_SECRET is required");

const sha256 = (v) => createHash("sha256").update(v).digest("hex");

async function signedPost(path, body) {
  const raw = Buffer.from(JSON.stringify(body));
  const timestamp = String(Math.floor(Date.now() / 1000));
  const nonce = randomUUID();
  const base = ["POST", path, timestamp, nonce, sha256(raw)].join("\n");
  const signature = createHmac("sha256", SECRET).update(base).digest("hex");

  const res = await fetch(BASE + path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-GeneDrift-Timestamp": timestamp,
      "X-GeneDrift-Nonce": nonce,
      "X-GeneDrift-Signature": signature,
    },
    body: raw,
  });
  return { status: res.status, json: await res.json().catch(() => null) };
}

const results = [];
const check = (name, pass, detail) => {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? "  — " + detail : ""}`);
};

const PAGE = {
  page: {
    pageUuid: "PG-test-0001",
    path: "/test",
    internalTitle: "Test page",
    pageFamily: "Hub",
    robotsDirective: "Index Follow",
  },
  sections: [
    {
      sectionUuid: "SEC-test-0001",
      displayOrder: 10,
      sectionType: "statement",
      sectionData: '{"eyebrow":"Test","heading":"Hello from Creator."}',
      hidden: false,
      isRequired: false,
    },
  ],
};

// 1 — health
{
  const res = await fetch(BASE + "/health");
  check("health returns ok", res.status === 200);
}

// 2 — unsigned publish is refused
{
  const res = await fetch(BASE + "/v1/website/publications", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(PAGE),
  });
  check("unsigned publish is rejected 401", res.status === 401, `got ${res.status}`);
}

// 3 — bad signature is refused
{
  const raw = Buffer.from(JSON.stringify(PAGE));
  const res = await fetch(BASE + "/v1/website/publications", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-GeneDrift-Timestamp": String(Math.floor(Date.now() / 1000)),
      "X-GeneDrift-Nonce": randomUUID(),
      "X-GeneDrift-Signature": "de".repeat(32),
    },
    body: raw,
  });
  check("wrong signature is rejected 401", res.status === 401, `got ${res.status}`);
}

// 4 — signed publish succeeds
let publicationId = null;
{
  const { status, json } = await signedPost("/v1/website/publications", PAGE);
  publicationId = json?.publicationId ?? null;
  check("signed publish returns 201", status === 201, JSON.stringify(json));
  check("publication id returned", Boolean(publicationId));
}

// 5 — republishing identical content is idempotent
{
  const { status, json } = await signedPost("/v1/website/publications", PAGE);
  check(
    "identical republish yields the same publication id",
    status === 201 && json?.publicationId === publicationId,
    `${json?.publicationId}`,
  );
}

// 6 — the page reads back, with Section_Data parsed
{
  const res = await fetch(BASE + "/v1/public/pages/test");
  const json = await res.json();
  const section = json?.page?.sections?.[0];
  check("published page reads back 200", res.status === 200);
  check(
    "Section_Data arrives as a parsed object",
    section?.sectionData?.heading === "Hello from Creator.",
    JSON.stringify(section?.sectionData),
  );
}

// 7 — an unknown section type is refused, and says which field
{
  const bad = structuredClone(PAGE);
  bad.sections[0].sectionType = "industry-accordion"; // the renamed one
  const { status, json } = await signedPost("/v1/website/publications", bad);
  check("unknown section type is rejected 422", status === 422, `got ${status}`);
  check(
    "rejection names the offending field",
    json?.issues?.[0]?.path?.includes("sectionType"),
    JSON.stringify(json?.issues),
  );
}

// 8 — malformed Section_Data is refused
{
  const bad = structuredClone(PAGE);
  bad.sections[0].sectionData = "{not json";
  const { status } = await signedPost("/v1/website/publications", bad);
  check("malformed Section_Data is rejected 422", status === 422, `got ${status}`);
}

// 9 — a bad path is refused
{
  const bad = structuredClone(PAGE);
  bad.page.path = "no-leading-slash";
  const { status } = await signedPost("/v1/website/publications", bad);
  check("path without a leading slash is rejected 422", status === 422, `got ${status}`);
}

// 10 — hidden sections are dropped from the published document
{
  const withHidden = structuredClone(PAGE);
  withHidden.sections.push({
    sectionUuid: "SEC-test-0002",
    displayOrder: 20,
    sectionType: "page-head",
    sectionData: "{}",
    hidden: true,
    isRequired: false,
  });
  await signedPost("/v1/website/publications", withHidden);
  const json = await (await fetch(BASE + "/v1/public/pages/test")).json();
  check("hidden sections are not published", json?.page?.sections?.length === 1, `${json?.page?.sections?.length}`);
}

// 10b — Deluge may send checkboxes as the STRING "false". JavaScript
// truthiness would make that true and publish every hidden section.
{
  const stringBools = structuredClone(PAGE);
  stringBools.sections[0].hidden = "false";
  stringBools.sections[0].isRequired = "true";
  stringBools.sections.push({
    sectionUuid: "SEC-test-0003",
    displayOrder: 30,
    sectionType: "page-head",
    sectionData: "{}",
    hidden: "true",
    isRequired: "false",
  });
  await signedPost("/v1/website/publications", stringBools);
  const json = await (await fetch(BASE + "/v1/public/pages/test")).json();
  const kept = json?.page?.sections ?? [];
  check('hidden:"false" is treated as visible', kept.length === 1, `${kept.length} kept`);
  check('hidden:"true" is treated as hidden', !kept.some((s) => s.sectionUuid === "SEC-test-0003"));
  check('isRequired:"true" survives as a real boolean', kept[0]?.isRequired === true, `${kept[0]?.isRequired}`);
}

// 10c — the HOME PAGE, which lives at "/" and is requested as `_root`.
// A trailing-slash URL matches the index route instead, which is how
// publishing the homepage silently did nothing.
{
  const homePage = structuredClone(PAGE);
  homePage.page.pageUuid = "PG-home-0001";
  homePage.page.path = "/";
  homePage.page.internalTitle = "Home";
  homePage.sections[0].sectionUuid = "SEC-home-0001";
  homePage.sections[0].sectionData = '{"eyebrow":"Home","heading":"Home from Creator."}';
  await signedPost("/v1/website/publications", homePage);

  const viaRoot = await fetch(BASE + "/v1/public/pages/_root");
  const json = await viaRoot.json();
  check("home page reads back via _root", viaRoot.status === 200, `got ${viaRoot.status}`);
  check(
    "home page carries its own content",
    json?.page?.sections?.[0]?.sectionData?.heading === "Home from Creator.",
    JSON.stringify(json?.page?.sections?.[0]?.sectionData),
  );

  // The index must still be the index, not the home page.
  const index = await (await fetch(BASE + "/v1/public/pages")).json();
  check("the index route still returns the list", Array.isArray(index?.pages));
}

// 11 — the live index lists the page
{
  const json = await (await fetch(BASE + "/v1/public/pages")).json();
  check("live index contains /test", json?.pages?.some((p) => p.path === "/test"));
}

// 12 — unknown path is 404
{
  const res = await fetch(BASE + "/v1/public/pages/nope");
  check("unknown path returns 404", res.status === 404, `got ${res.status}`);
}

// 13 — unpublish gives 410, not 404
{
  await signedPost("/v1/website/unpublish", { path: "/test", reason: "smoke test" });
  const res = await fetch(BASE + "/v1/public/pages/test");
  const json = await res.json();
  check("unpublished page returns 410 Gone", res.status === 410, `got ${res.status}`);
  check("410 carries the reason", json?.reason === "smoke test", JSON.stringify(json));
}

// 14 — rollback restores the frozen publication
{
  const { status } = await signedPost("/v1/website/rollback", { path: "/test", publicationId });
  const res = await fetch(BASE + "/v1/public/pages/test");
  check("rollback restores the page", status === 200 && res.status === 200, `rollback ${status}, read ${res.status}`);
}

/* ------------------------------------------------------------- markets --- */

const MARKETS = {
  markets: [
    {
      slug: "kenya",
      name: "Kenya",
      region: "Africa",
      regionSlug: "africa",
      utcOffset: 3,
      x: 660,
      y: 270,
      capabilities: [
        { name: "Regulatory Affairs", status: "Available", displayOrder: 10 },
        { name: "Pharmacovigilance", status: "Coming soon", displayOrder: 20 },
        { name: "MAH & Local Representation", status: "Not available", displayOrder: 30 },
      ],
    },
    {
      slug: "india",
      name: "India",
      region: "Asia Pacific",
      regionSlug: "asia-pacific",
      utcOffset: 5.5,
      x: 780,
      y: 220,
      capabilities: [{ name: "Regulatory Affairs", status: "available", displayOrder: 10 }],
    },
  ],
};

// 15 — markets are not published yet on a fresh store, or already are from a
// previous run; either way an unsigned publish must be refused.
{
  const res = await fetch(BASE + "/v1/website/markets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(MARKETS),
  });
  check("unsigned markets publish is rejected 401", res.status === 401, `got ${res.status}`);
}

let marketsPublicationId = null;
// 16 — signed markets publish succeeds and normalises the dropdown words
{
  const { status, json } = await signedPost("/v1/website/markets", MARKETS);
  marketsPublicationId = json?.publicationId ?? null;
  check("signed markets publish returns 201", status === 201, JSON.stringify(json));
  check("market count is reported", json?.marketCount === 2, `${json?.marketCount}`);
  check("regions are derived when not sent", json?.regionCount === 2, `${json?.regionCount}`);
}

// 17 — the collection reads back, with statuses normalised and href derived
{
  const res = await fetch(BASE + "/v1/public/markets");
  const json = await res.json();
  const byslug = Object.fromEntries((json?.markets?.markets ?? []).map((m) => [m.slug, m]));
  check("markets read back 200", res.status === 200, `got ${res.status}`);
  check(
    "href is derived from region and slug",
    byslug.kenya?.href === "/markets/africa/kenya",
    byslug.kenya?.href,
  );
  check(
    '"Coming soon" normalises to upcoming',
    byslug.kenya?.capabilities?.[1]?.status === "upcoming",
    JSON.stringify(byslug.kenya?.capabilities),
  );
  check(
    '"Not available" normalises to none',
    byslug.kenya?.capabilities?.[2]?.status === "none",
  );
  check(
    "a market may carry fewer capabilities than its neighbours",
    byslug.india?.capabilities?.length === 1,
    `${byslug.india?.capabilities?.length}`,
  );
}

// 18 — identical republish is idempotent, exactly as for pages
{
  const { json } = await signedPost("/v1/website/markets", MARKETS);
  check(
    "identical markets republish yields the same publication id",
    json?.publicationId === marketsPublicationId,
    `${json?.publicationId}`,
  );
}

// 19 — an unknown status word is REFUSED rather than silently becoming "none".
// Quietly downgrading a market to "no services here" is a commercial claim
// nobody authorised.
{
  const bad = structuredClone(MARKETS);
  bad.markets[0].capabilities[0].status = "Maybe";
  const { status, json } = await signedPost("/v1/website/markets", bad);
  check("unknown capability status is rejected 422", status === 422, `got ${status}`);
  check(
    "the rejection names the status field",
    JSON.stringify(json?.issues ?? "").includes("status"),
    JSON.stringify(json?.issues),
  );
}

// 20 — two markets on the same path is refused with the slug named
{
  const bad = structuredClone(MARKETS);
  bad.markets.push(structuredClone(bad.markets[0]));
  const { status, json } = await signedPost("/v1/website/markets", bad);
  check("duplicate market path is rejected 409", status === 409, `got ${status}`);
  check("the duplicate is named", String(json?.message ?? "").includes("africa/kenya"), json?.message);
}

// 21 — a bad slug is refused before it can become a 404 route
{
  const bad = structuredClone(MARKETS);
  bad.markets[0].slug = "Kenya Republic";
  const { status } = await signedPost("/v1/website/markets", bad);
  check("a non-URL-safe slug is rejected 422", status === 422, `got ${status}`);
}

// 22 — removing a market from the payload removes it from the site. This is
// the whole reason the collection publishes as a set.
{
  const fewer = { markets: [MARKETS.markets[1]] };
  await signedPost("/v1/website/markets", fewer);
  const json = await (await fetch(BASE + "/v1/public/markets")).json();
  const slugs = (json?.markets?.markets ?? []).map((m) => m.slug);
  check("a market dropped from the payload disappears", !slugs.includes("kenya"), slugs.join(","));
}

// 23 — rollback restores the earlier collection
{
  const { status } = await signedPost("/v1/website/markets/rollback", {
    publicationId: marketsPublicationId,
  });
  const json = await (await fetch(BASE + "/v1/public/markets")).json();
  const slugs = (json?.markets?.markets ?? []).map((m) => m.slug);
  check(
    "markets rollback restores the earlier set",
    status === 200 && slugs.includes("kenya"),
    `${status} ${slugs.join(",")}`,
  );
}

/* ---------------------------------------------------------------- site --- */

const SITE = {
  nav: [
    { key: "explore", label: "Explore", href: "/explore", displayOrder: 10, visible: true },
    { key: "expertise", label: "Expertise", href: "/expertise", displayOrder: 20, visible: true },
    { key: "careers", label: "Careers", href: "/careers", displayOrder: 30, visible: "false" },
    { key: "ra", label: "Regulatory Affairs", href: "/expertise/regulatory-affairs", parentKey: "expertise", displayOrder: 10, visible: true },
    { key: "pv", label: "Pharmacovigilance", href: "/expertise/pharmacovigilance", parentKey: "expertise", displayOrder: 20, visible: true },
    { key: "orphan", label: "Orphan", href: "/nowhere", parentKey: "deleted-parent", displayOrder: 30, visible: true },
    { key: "privacy", label: "Privacy Policy", href: "/legal/privacy", displayOrder: 10, visible: true, group: "legal" },
  ],
  footer: {
    tagline: "Invent. Reinvent.",
    description: "Global Regulatory Affairs & Pharmacovigilance solutions.",
    site: "genedrift.com",
    email: "cs@genedrift.com",
    address: "[REGISTERED ADDRESS]",
  },
  certifications: [
    { name: "ISO 27001:2022", expiresOn: "2027-03-31", displayOrder: 20 },
    { name: "GDPR", expiresOn: "", displayOrder: 10 },
  ],
};

// 24 — unsigned publish is refused
{
  const res = await fetch(BASE + "/v1/website/site", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(SITE),
  });
  check("unsigned site publish is rejected 401", res.status === 401, `got ${res.status}`);
}

let sitePublicationId = null;
// 25 — signed publish nests the menu and drops what should be dropped
{
  const { status, json } = await signedPost("/v1/website/site", SITE);
  sitePublicationId = json?.publicationId ?? null;
  check("signed site publish returns 201", status === 201, JSON.stringify(json));
  check(
    "a hidden top-level item is not published",
    json?.menuCount === 2,
    `${json?.menuCount} menu items`,
  );
  check("legal links are separated from the menu", json?.legalCount === 1, `${json?.legalCount}`);
}

// 26 — the nested shape reads back correctly
{
  const res = await fetch(BASE + "/v1/public/site");
  const json = await res.json();
  const nav = json?.site?.nav ?? [];
  const expertise = nav.find((n) => n.key === "expertise");
  check("site reads back 200", res.status === 200, `got ${res.status}`);
  check("children are nested under their parent", expertise?.children?.length === 2, JSON.stringify(expertise));
  check("menu order is respected", nav[0]?.key === "explore", nav.map((n) => n.key).join(","));
  check(
    'visible:"false" hides the item',
    !nav.some((n) => n.key === "careers"),
    nav.map((n) => n.key).join(","),
  );
  // An orphan promoted to the top level would appear as a brand-new menu item
  // on every page — much louder than a missing sub-link.
  check(
    "an orphaned child is dropped, not promoted",
    !nav.some((n) => n.key === "orphan"),
    nav.map((n) => n.key).join(","),
  );
  check(
    "certifications are ordered by displayOrder",
    json?.site?.certifications?.[0]?.name === "GDPR",
    JSON.stringify(json?.site?.certifications),
  );
  check("footer copy round-trips", json?.site?.footer?.email === "cs@genedrift.com");
}

// 27 — hiding a parent takes its children with it, rather than leaving six
// orphaned links in a footer column whose heading no longer exists.
{
  const hiddenParent = structuredClone(SITE);
  hiddenParent.nav.find((n) => n.key === "expertise").visible = false;
  await signedPost("/v1/website/site", hiddenParent);
  const json = await (await fetch(BASE + "/v1/public/site")).json();
  const keys = (json?.site?.nav ?? []).flatMap((n) => [n.key, ...n.children.map((c) => c.key)]);
  check("hiding a parent hides its children too", !keys.includes("ra") && !keys.includes("pv"), keys.join(","));
}

// 28 — publishing with everything hidden is refused
{
  const allHidden = structuredClone(SITE);
  for (const item of allHidden.nav) item.visible = false;
  const { status, json } = await signedPost("/v1/website/site", allHidden);
  check("an entirely hidden menu is refused 422", status === 422, `got ${status}`);
  check("the refusal explains why", String(json?.message ?? "").includes("no menu"), json?.message);
}

// 29 — duplicate keys are refused with the key named
{
  const dup = structuredClone(SITE);
  dup.nav.push({ key: "explore", label: "Explore again", href: "/explore", displayOrder: 99, visible: true });
  const { status, json } = await signedPost("/v1/website/site", dup);
  check("duplicate nav key is rejected 409", status === 409, `got ${status}`);
  check("the duplicate key is named", String(json?.message ?? "").includes("explore"), json?.message);
}

// 30 — a malformed expiry is refused rather than silently ignored. An expiry
// that does not parse would mean a lapsed certification displaying forever.
{
  const bad = structuredClone(SITE);
  bad.certifications[0].expiresOn = "31/03/2027";
  const { status, json } = await signedPost("/v1/website/site", bad);
  check("a malformed certification expiry is rejected 422", status === 422, `got ${status}`);
  check(
    "the rejection names the expiry field",
    JSON.stringify(json?.issues ?? "").includes("expiresOn"),
    JSON.stringify(json?.issues),
  );
}

// 31 — a link that is neither a path nor a URL is refused
{
  const bad = structuredClone(SITE);
  bad.nav[0].href = "javascript:alert(1)";
  const { status } = await signedPost("/v1/website/site", bad);
  check("a non-path, non-URL link is rejected 422", status === 422, `got ${status}`);
}

// 32 — rollback restores the earlier chrome
{
  const { status } = await signedPost("/v1/website/site/rollback", {
    publicationId: sitePublicationId,
  });
  const json = await (await fetch(BASE + "/v1/public/site")).json();
  const expertise = (json?.site?.nav ?? []).find((n) => n.key === "expertise");
  check(
    "site rollback restores the earlier menu",
    status === 200 && expertise?.children?.length === 2,
    `${status}`,
  );
}

/* -------------------------------------------------------- case studies --- */

const CASE_STUDIES = {
  caseStudies: [
    {
      slug: "label-artwork-management",
      title: "Label / Artwork Management",
      family: "Delivering Excellence",
      familySlug: "delivering-excellence",
      teaser: "Artwork for over 5,000 SKUs across 27 countries.",
      scenario: "Multiple regulatory guidelines, 5,000 SKUs, 27 countries.",
      solution: "Every guideline redrafted against the client's product basket.",
      result: "Labels managed across all functional teams; non-compliances minimised.",
      metrics: [
        { value: "27", label: "Countries", displayOrder: 2 },
        { value: "5,000+", label: "SKUs covered", displayOrder: 1 },
      ],
      tags: ["Labelling & artwork"],
      displayOrder: 2,
    },
    {
      slug: "api-vendor-review",
      title: "API Vendor Review",
      family: "Delivering Excellence",
      familySlug: "delivering-excellence",
      teaser: "Reviewing the entry of a new API manufacturer alongside variation filings.",
      displayOrder: 3,
    },
  ],
};

let caseStudiesPublicationId = null;

// 33 — an unsigned case-studies publish is rejected
{
  const res = await fetch(BASE + "/v1/website/case-studies", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(CASE_STUDIES),
  });
  check("unsigned case-studies publish is rejected 401", res.status === 401, `got ${res.status}`);
}

// 34 — a signed publish succeeds, derives the href and orders the metrics
{
  const { status, json } = await signedPost("/v1/website/case-studies", CASE_STUDIES);
  caseStudiesPublicationId = json?.publicationId ?? null;
  check("signed case-studies publish returns 201", status === 201, JSON.stringify(json));

  const read = await fetch(BASE + "/v1/public/case-studies");
  const body = await read.json();
  const bySlug = Object.fromEntries(
    (body?.caseStudies?.caseStudies ?? []).map((c) => [c.slug, c]),
  );
  check("case studies read back 200", read.status === 200, `got ${read.status}`);
  check(
    "href is derived from the slug",
    bySlug["label-artwork-management"]?.href === "/client-success/case-studies/label-artwork-management",
    bySlug["label-artwork-management"]?.href,
  );
  check(
    "metrics are ordered by displayOrder",
    bySlug["label-artwork-management"]?.metrics?.[0]?.value === "5,000+",
    JSON.stringify(bySlug["label-artwork-management"]?.metrics),
  );
  // The regression this guards against is the `authority` bug on markets:
  // validation accepted the field and the mapper silently dropped it.
  check(
    "every narrative field survives the mapper",
    ["teaser", "scenario", "solution", "result"].every(
      (k) => typeof bySlug["label-artwork-management"]?.[k] === "string",
    ),
    JSON.stringify(bySlug["label-artwork-management"]),
  );
  check(
    "a summary-only record publishes with empty narrative fields",
    bySlug["api-vendor-review"]?.scenario === "" && bySlug["api-vendor-review"]?.teaser !== "",
    JSON.stringify(bySlug["api-vendor-review"]),
  );
}

// 35 — two case studies on the same slug is refused with the slug named
{
  const bad = structuredClone(CASE_STUDIES);
  bad.caseStudies.push(structuredClone(bad.caseStudies[0]));
  const { status, json } = await signedPost("/v1/website/case-studies", bad);
  check(
    "duplicate case-study slug is rejected 409",
    status === 409 && json?.code === "CASE_STUDY_SLUG_DUPLICATE",
    JSON.stringify(json),
  );
}

// 36 — republishing identical content reuses the publication
{
  const { json } = await signedPost("/v1/website/case-studies", CASE_STUDIES);
  check(
    "identical case-studies republish yields the same publication id",
    json?.publicationId === caseStudiesPublicationId,
    `${json?.publicationId} vs ${caseStudiesPublicationId}`,
  );
}

// 37 — removing a record removes it from the live collection
{
  await signedPost("/v1/website/case-studies", { caseStudies: [CASE_STUDIES.caseStudies[0]] });
  const json = await (await fetch(BASE + "/v1/public/case-studies")).json();
  const slugs = (json?.caseStudies?.caseStudies ?? []).map((c) => c.slug);
  check(
    "a removed case study disappears from the live collection",
    slugs.length === 1 && !slugs.includes("api-vendor-review"),
    slugs.join(","),
  );
}

// 38 — rollback restores the earlier collection
{
  const { status } = await signedPost("/v1/website/case-studies/rollback", {
    publicationId: caseStudiesPublicationId,
  });
  const json = await (await fetch(BASE + "/v1/public/case-studies")).json();
  check(
    "case-studies rollback restores both records",
    status === 200 && (json?.caseStudies?.caseStudies ?? []).length === 2,
    `${status}`,
  );
}

const failed = results.filter((r) => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);

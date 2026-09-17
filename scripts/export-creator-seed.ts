/**
 * Turns the site's built-in page content into two files you can IMPORT into
 * the Creator forms, so the CMS starts full rather than empty.
 *
 * Run:  npx tsx scripts/export-creator-seed.ts
 * Out:  creator-seed/website-pages.tsv
 *       creator-seed/website-sections.tsv
 *
 * ## Why this exists
 *
 * The editor widget can only edit a page that exists as a Creator record.
 * Entering ~25 pages and ~150 sections by hand is a day of typing and a
 * guaranteed source of typos in fields nobody will check. The content is
 * already written, in `lib/content/pages.ts` — this copies it across.
 *
 * ## Why TSV and not CSV
 *
 * `Section_Data` is JSON: full of commas and double quotes. CSV survives that
 * only through correct quote-escaping, which Creator's importer handles
 * inconsistently in practice. JSON never contains a tab, so TSV needs no
 * escaping at all and cannot be mis-parsed.
 *
 * ## What is deliberately NOT exported
 *
 * - **The 46 country pages and 6 region pages.** They are generated from
 *   `lib/map/markets.ts` — one record per market, not one per page. They
 *   become editable when the Markets collection exists in Creator, and
 *   creating 46 page records now would mean maintaining the same content
 *   twice.
 * - **Article and job pages.** Driven by records in the editorial platform
 *   and the careers report respectively.
 * - **`/test`** — it is scaffolding.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  PILLARS,
  builtInPage,
  careersPage,
  detailRoutes,
  globalPresencePage,
  marketsHubPage,
} from "../lib/content/pages";
import type { Section } from "../lib/schema/section";

interface PageRecord {
  path: string;
  internalTitle: string;
  pageFamily: string;
  seoTitle: string;
  seoDescription: string;
  sections: Section[];
}

function fromRecord(record: unknown, path: string, family: string, title: string): PageRecord | null {
  if (!record || typeof record !== "object") return null;
  const row = record as { title?: string; seo?: { title?: string; description?: string }; sections?: Section[] };
  return {
    path,
    internalTitle: title,
    pageFamily: family,
    seoTitle: row.seo?.title ?? row.title ?? "",
    seoDescription: row.seo?.description ?? "",
    sections: row.sections ?? [],
  };
}

const pages: PageRecord[] = [];

/* Home */
const home = fromRecord(builtInPage("home"), "/", "Home", "Home");
if (home) pages.push(home);

/* The four pillar hubs */
for (const pillar of PILLARS) {
  const label = pillar.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const page = fromRecord(builtInPage(pillar), `/${pillar}`, "Hub", label);
  if (page) pages.push(page);
}

/* Every detail page under a pillar */
for (const { pillar, slug, label } of detailRoutes()) {
  const page = fromRecord(builtInPage(`${pillar}/${slug}`), `/${pillar}/${slug}`, "Detail", label);
  if (page) pages.push(page);
}

/* The standalone pages that are prose rather than records */
// `marketsHubPage` is async — markets are CMS records now, so it awaits the
// collection. Forgetting the await here would seed a Promise as page content.
const standalone: [unknown, string, string, string][] = [
  [await marketsHubPage(), "/markets", "Hub", "Markets"],
  [globalPresencePage(), "/global-presence", "Hub", "Global presence"],
  [careersPage(), "/careers", "Hub", "Careers"],
];
for (const [record, path, family, title] of standalone) {
  const page = fromRecord(record, path, family, title);
  if (page) pages.push(page);
}

/* ------------------------------------------------------------------ files */

/** A UUID that is STABLE for a given path, so re-running does not duplicate. */
function slugId(prefix: string, ...parts: string[]): string {
  const key = parts
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${prefix}-${key || "root"}`;
}

/** Tabs and newlines would break the row; nothing else needs escaping. */
function cell(value: string): string {
  return value.replace(/[\t\r\n]+/g, " ").trim();
}

const pageRows = [
  ["Page_UUID", "Path", "Internal_Title", "Page_Family", "Status", "SEO_Title", "SEO_Description", "Robots_Directive"].join("\t"),
  ...pages.map((p) =>
    [
      slugId("PG", p.path),
      p.path,
      cell(p.internalTitle),
      p.pageFamily,
      "Draft",
      cell(p.seoTitle),
      cell(p.seoDescription),
      "Index Follow",
    ].join("\t"),
  ),
];

const sectionRows = [
  ["Section_UUID", "Page", "Display_Order", "Section_Type", "Section_Data", "Hidden", "Is_Required"].join("\t"),
];

let total = 0;
for (const page of pages) {
  page.sections.forEach((section, i) => {
    // `type` is the discriminator, not content — it lives in Section_Type.
    const { type, ...data } = section as Section & Record<string, unknown>;
    sectionRows.push(
      [
        slugId("SEC", page.path, String(i + 1)),
        page.path, // the lookup matches on the displayed Path
        String((i + 1) * 10),
        type,
        cell(JSON.stringify(data)),
        "false",
        // Every seeded section is part of the approved design, so none of them
        // may be removed by an editor.
        "true",
      ].join("\t"),
    );
    total += 1;
  });
}

const dir = join(process.cwd(), "creator-seed");
mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "website-pages.tsv"), pageRows.join("\n") + "\n");
writeFileSync(join(dir, "website-sections.tsv"), sectionRows.join("\n") + "\n");

console.log(`[export-creator-seed] ${pages.length} pages, ${total} sections → creator-seed/`);

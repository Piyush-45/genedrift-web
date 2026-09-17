/**
 * Turns the built-in navigation, footer and certification row into files you
 * can IMPORT into Creator.
 *
 * Run:  npx tsx scripts/export-site-seed.ts
 * Out:  creator-seed/website-nav-items.tsv
 *       creator-seed/website-certifications.tsv
 *       creator-seed/website-footer.tsv          (one row)
 *
 * ## What an editor can change, and what they cannot
 *
 * `Link` is a SYSTEM field. It is seeded here once and hidden on the form.
 * An editor renames, reorders and hides; they never retype a URL.
 *
 * That is the entire safety model for navigation, and it is structural rather
 * than validated: a menu that cannot point anywhere new cannot point at a page
 * that does not exist. The alternative — letting them type a path and checking
 * it afterwards — means Catalyst having to know every route the site
 * generates, including 46 country pages and every article, and being quietly
 * wrong about it.
 *
 * ## Keys
 *
 * `Key` is the item's identity, derived from its path. It is what makes a
 * rename a rename rather than a delete plus an add, and it is what a child
 * points at through `Parent Key`. Also a system field.
 *
 * ## Certifications
 *
 * Exported with EMPTY expiry dates, because none were supplied. Every one
 * needs a certificate number and an expiry from the client before launch —
 * and note that `ISO 9001:2000` is a withdrawn standard, reproduced verbatim
 * rather than silently corrected. See lib/nav.ts.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  FOOTER_BRAND,
  FOOTER_CERTIFICATIONS,
  FOOTER_LEGAL,
  HEADER_CTA,
  NAV,
} from "../lib/nav";

/**
 * `/expertise/regulatory-affairs` -> `expertise-regulatory-affairs`.
 *
 * TWO ITEMS CAN SHARE A LINK. "Knowledge Hub" points at `/insights` and so
 * does its first child, "Insights" — the link that shows everything rather
 * than one category. Deriving the key from the link alone gave both the key
 * `insights`, the unique constraint in Creator dropped the second, and the
 * import came back 36 of 37 with no error against any row.
 *
 * So a collision gets `-all` (a child sharing its parent's link is the
 * "everything" link by definition), and anything beyond that is numbered.
 * Keys are identity, and silently losing one loses a menu item.
 */
function makeKeyFactory() {
  const used = new Set<string>();
  return (href: string, parentKey = ""): string => {
    const base = href.replace(/^\//, "").replace(/\//g, "-") || "home";
    if (!used.has(base)) {
      used.add(base);
      return base;
    }
    const candidates = [parentKey ? `${base}-all` : `${base}-2`];
    for (let n = 2; n < 50; n += 1) candidates.push(`${base}-${n}`);
    const free = candidates.find((c) => !used.has(c)) ?? `${base}-${used.size}`;
    used.add(free);
    return free;
  };
}

const keyFor = makeKeyFactory();

function tsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => cell.replace(/[\t\r\n]+/g, " ").trim()).join("\t"))
    .join("\n");
}

const navRows: string[][] = [
  ["Key", "Label", "Link", "Parent_Key", "Display_Order", "Visible", "Nav_Group"],
];

NAV.forEach((item, index) => {
  const key = keyFor(item.href);
  // Tens, so an item can be slotted between two others without renumbering.
  navRows.push([key, item.label, item.href, "", String((index + 1) * 10), "true", "menu"]);

  (item.children ?? []).forEach((child, childIndex) => {
    navRows.push([
      keyFor(child.href, key),
      child.label,
      child.href,
      key,
      String((childIndex + 1) * 10),
      "true",
      "menu",
    ]);
  });
});

FOOTER_LEGAL.forEach((link, index) => {
  navRows.push([
    keyFor(link.href),
    link.label,
    link.href,
    "",
    String((index + 1) * 10),
    "true",
    "legal",
  ]);
});

const certificationRows: string[][] = [
  ["Certification_Name", "Expires_On", "Certificate_Number", "Display_Order"],
  ...FOOTER_CERTIFICATIONS.map((name, index) => [
    name,
    // Empty on purpose: none were supplied, and an invented expiry on a
    // compliance claim would be worse than a missing one.
    "",
    "",
    String((index + 1) * 10),
  ]),
];

const footerRows: string[][] = [
  ["Tagline", "Description", "Site", "Email", "Address", "CTA_Label", "CTA_Link"],
  [
    FOOTER_BRAND.tagline,
    FOOTER_BRAND.description,
    FOOTER_BRAND.site,
    FOOTER_BRAND.email,
    FOOTER_BRAND.address,
    HEADER_CTA.label,
    HEADER_CTA.href,
  ],
];

const outDir = join(process.cwd(), "creator-seed");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "website-nav-items.tsv"), tsv(navRows) + "\n", "utf8");
writeFileSync(
  join(outDir, "website-certifications.tsv"),
  tsv(certificationRows) + "\n",
  "utf8",
);
writeFileSync(join(outDir, "website-footer.tsv"), tsv(footerRows) + "\n", "utf8");

console.log(
  `[export-site-seed] ${navRows.length - 1} nav items, ` +
    `${certificationRows.length - 1} certifications, 1 footer record → creator-seed/`,
);

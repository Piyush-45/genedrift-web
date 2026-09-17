/**
 * Turns the built-in 46 markets into two files you can IMPORT into Creator,
 * so the Markets collection starts full rather than empty.
 *
 * Run:  npx tsx scripts/export-markets-seed.ts
 * Out:  creator-seed/website-markets.tsv               46 rows
 *       creator-seed/website-market-capabilities.tsv  138 rows
 *
 * ## Why two files
 *
 * A market has a LIST of capabilities, not three named fields. The client's
 * own words on 15 September: "the CMS must support adding, removing and
 * reorganising capabilities per market." Three columns called
 * `Capability_1_Status` would make a fourth capability a code change in React,
 * a schema change in Catalyst and a form change in Creator — for something the
 * client was told they could do themselves.
 *
 * So capabilities are their own form, linked back to the market. Adding
 * "Clinical Trial Applications" to Kenya is one new row.
 *
 * ## How the link is made
 *
 * `Website_Market_Capabilities.Market` is a LOOKUP into `Website_Markets`, and
 * a spreadsheet has no Creator record IDs in it. So the capability file
 * carries the market's slug in a plain helper column, and
 * `creator/link_capabilities_to_markets.deluge` fills the lookups once, after
 * both imports.
 *
 *   IMPORT ORDER MATTERS: markets first, capabilities second, then run the
 *   linking function. A capability whose market does not exist yet has nothing
 *   to link to, and the function names every row it could not match.
 *
 * ## Why TSV
 *
 * Same reason as the page seed: no field here contains a tab, so nothing needs
 * escaping and nothing can be mis-parsed. `MAH & Local Representation` has an
 * ampersand in it, which some CSV importers do handle and some do not.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { MARKETS, type CapabilityStatus } from "../lib/map/markets";

/**
 * The words the Creator dropdown shows. Catalyst maps them back to the three
 * states the website understands, and REFUSES anything it does not recognise
 * rather than quietly treating it as "not available" — see
 * services/catalyst-website/src/markets.ts.
 */
const STATUS_LABEL: Record<CapabilityStatus, string> = {
  available: "Available",
  upcoming: "Upcoming",
  none: "Not available",
};

function tsv(rows: string[][]): string {
  return rows
    .map((row) =>
      row
        // A stray tab or newline would shift every following column by one.
        // Strip rather than escape: TSV has no escaping, and silently wrong
        // columns are worse than a missing space.
        .map((cell) => cell.replace(/[\t\r\n]+/g, " ").trim())
        .join("\t"),
    )
    .join("\n");
}

const marketRows: string[][] = [
  ["Market_Slug", "Market_Name", "Region", "UTC_Offset", "Map_X", "Map_Y", "Active"],
];

/**
 * `Import_Market_Slug` is a helper column, not the real link.
 *
 * A spreadsheet has no Creator record IDs in it, so an imported capability row
 * cannot fill a LOOKUP field by itself. The slug goes in a plain text column
 * and `creator/link_capabilities_to_markets.deluge` does the join once, after
 * both imports. That function is safe to run twice, so if Creator's importer
 * does manage to match the lookup on its own, it simply reports "0 linked".
 */
const capabilityRows: string[][] = [
  ["Import_Market_Slug", "Capability_Name", "Status", "Display_Order"],
];

for (const market of MARKETS) {
  marketRows.push([
    market.slug,
    market.name,
    market.region,
    String(market.utcOffset),
    String(market.x),
    String(market.y),
    // Creator imports a checkbox from "true"/"false".
    "true",
  ]);

  market.capabilities.forEach((capability, index) => {
    capabilityRows.push([
      // Not the lookup itself — the helper column the linking function reads.
      market.slug,
      capability.name,
      STATUS_LABEL[capability.status],
      // Tens, not ones: inserting a capability between two others later is
      // then a number someone can pick without renumbering the rest.
      String((index + 1) * 10),
    ]);
  });
}

const outDir = join(process.cwd(), "creator-seed");
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, "website-markets.tsv"), tsv(marketRows) + "\n", "utf8");
writeFileSync(
  join(outDir, "website-market-capabilities.tsv"),
  tsv(capabilityRows) + "\n",
  "utf8",
);

console.log(
  `[export-markets-seed] ${marketRows.length - 1} markets, ` +
    `${capabilityRows.length - 1} capabilities → creator-seed/`,
);

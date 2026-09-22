/**
 * Turns the built-in eight case studies into two files you can IMPORT into
 * Creator, so the collection starts full rather than empty.
 *
 * Run:  npx tsx scripts/export-case-studies-seed.ts
 * Out:  creator-seed/website-case-studies.tsv          8 rows
 *       creator-seed/website-case-study-metrics.tsv    6 rows
 *
 * ## Why two files
 *
 * A case study has a LIST of figures, not two named fields — same reasoning as
 * market capabilities. A third number must be a new row, not a schema change
 * in React, Catalyst and Creator at once.
 *
 * ## How the link is made
 *
 * `Website_Case_Study_Metrics.Case_Study` is a LOOKUP, and a spreadsheet has
 * no Creator record IDs in it. So the metrics file carries the case study's
 * slug in the helper column `Import_Case_Study_Slug`, and
 * `creator/link_metrics_to_case_studies.deluge` fills the lookups once, after
 * both imports.
 *
 *   IMPORT ORDER MATTERS: case studies first, metrics second, then run the
 *   linking function.
 *
 * ## Why TSV
 *
 * Same reason as the markets seed: no field here contains a tab, so nothing
 * needs escaping and nothing can be mis-parsed. Several titles contain a
 * slash, an em dash or an ampersand, which CSV importers handle inconsistently.
 *
 * Multi-line narrative would break TSV, so the exporter collapses any newline
 * to a space. None of the eight narratives has one today.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BUILT_IN_CASE_STUDIES } from "../lib/content/case-studies-source";

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

const studyRows: string[][] = [
  [
    "Case_Study_Slug",
    "Case_Study_Title",
    "Family",
    "Teaser",
    "Scenario",
    "Solution",
    "Result",
    "Tags",
    "Display_Order",
    "Active",
  ],
];

const metricRows: string[][] = [
  ["Import_Case_Study_Slug", "Metric_Value", "Metric_Label", "Display_Order"],
];

for (const study of BUILT_IN_CASE_STUDIES) {
  studyRows.push([
    study.slug,
    study.title,
    study.family,
    study.teaser,
    study.scenario,
    study.solution,
    study.result,
    study.tags.join(", "),
    // Tens, not ones: inserting a record between two others later is then a
    // number someone can pick without renumbering the rest.
    String(study.order * 10),
    // Creator imports a checkbox from "true"/"false".
    "true",
  ]);

  study.metrics.forEach((metric, index) => {
    metricRows.push([
      // Not the lookup itself — the helper column the linking function reads.
      study.slug,
      metric.value,
      metric.label,
      String((index + 1) * 10),
    ]);
  });
}

const outDir = join(process.cwd(), "creator-seed");
mkdirSync(outDir, { recursive: true });

writeFileSync(join(outDir, "website-case-studies.tsv"), tsv(studyRows) + "\n", "utf8");
writeFileSync(
  join(outDir, "website-case-study-metrics.tsv"),
  tsv(metricRows) + "\n",
  "utf8",
);

console.log(
  `creator-seed/website-case-studies.tsv        ${studyRows.length - 1} rows\n` +
    `creator-seed/website-case-study-metrics.tsv  ${metricRows.length - 1} rows\n` +
    `\nImport case studies FIRST, then metrics, then run link_metrics_to_case_studies.`,
);

/**
 * Regenerates services/catalyst-website/src/section-types.ts from
 * public/section-schemas.json.
 *
 * The website and the publishing service must agree on the section type list
 * character for character. Keeping two hand-maintained lists in sync is how
 * "unknown section type" errors appear weeks after the rename that caused
 * them, so this derives one from the other.
 */
import { readFileSync, writeFileSync } from "node:fs";

const src = JSON.parse(readFileSync("public/section-schemas.json", "utf8"));
const types = [...src.sectionTypes].sort();

const out = `/**
 * The section types this service will accept.
 *
 * GENERATED — do not edit by hand. Run \`npm run sync:catalyst-types\` in the
 * website repo root, which regenerates this file from
 * \`public/section-schemas.json\` (itself emitted on every website build).
 *
 * Catalyst rejects any section type not in this list. That is the point: an
 * unknown type reaching the renderer is how a CMS save white-screens a live
 * site. Rejecting at publish time means the live site is never touched.
 */
export const SECTION_TYPES = [
${types.map((t) => `  "${t}",`).join("\n")}
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_TYPE_SET: ReadonlySet<string> = new Set(SECTION_TYPES);
`;

writeFileSync("services/catalyst-website/src/section-types.ts", out);
console.log(`[sync-catalyst-types] wrote ${types.length} section types`);

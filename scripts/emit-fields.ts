/**
 * Build-time only. Turns the JSON Schema of every section type into a COMPACT
 * FIELD SPEC the Creator editor widget renders forms from.
 *
 * Why not have the widget read the JSON Schema directly: JSON Schema describes
 * validation, not editing. It says `minLength: 1`; it does not say "this is a
 * heading, give it a wide box, and call it Heading". Interpreting it inside
 * the widget means that interpretation lives in a zip file someone has to
 * rebuild and re-upload to change. Doing it here means the widget stays dumb
 * and the labels live with the code that owns them.
 *
 * Derived from the same schemas the components are typed from, so the form
 * fields and the renderer's props cannot drift apart. Regenerated on every
 * build.
 *
 * Run:  npx tsx scripts/emit-fields.ts     (wired into `npm run build`)
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { SECTION_SCHEMAS } from "../lib/schema/section";

type Json = {
  type?: string;
  const?: unknown;
  enum?: string[];
  default?: unknown;
  minLength?: number;
  maxItems?: number;
  properties?: Record<string, Json>;
  required?: string[];
  items?: Json;
  anyOf?: Json[];
};

export type FieldKind = "text" | "longtext" | "select" | "boolean" | "number" | "textlist" | "grouplist";

export interface FieldSpec {
  key: string;
  label: string;
  kind: FieldKind;
  required: boolean;
  options?: string[];
  /** For grouplist: the fields of one row. */
  fields?: FieldSpec[];
  /** For grouplist: the row field used as its summary line. */
  titleKey?: string;
  maxItems?: number;
  help?: string;
}

/**
 * Fields an editor must never see. `type` is structural. The rest are
 * REFERENCES into other collections — "all markets", "this article" — which
 * the widget cannot offer a sensible picker for until those collections exist
 * in Creator. Showing a raw slug box would invite someone to type a slug that
 * silently matches nothing.
 */
const SYSTEM_KEYS = new Set([
  "type",
  "marketSource",
  "marketSlug",
  "navSource",
  "articleSlug",
  "jobSlug",
  "regionSlug",
]);

/**
 * Keys hidden in ONE section only.
 *
 * `items` and `featured` are real editable fields in other section types, so
 * they cannot go in SYSTEM_KEYS above — that set is global. In the insight
 * feed both are filled from the editorial platform at render time, so showing
 * them to an editor offers a box whose contents are overwritten on every page
 * load.
 */
const SECTION_HIDDEN: Record<string, Set<string>> = {
  "insight-feed": new Set(["featured", "items"]),
};

/** "headingTail" -> "Heading tail". "seoTitle" -> "Seo title" is fixed below. */
const LABEL_OVERRIDES: Record<string, string> = {
  headingLead: "Heading",
  headingJoin: "Joining word",
  headingTail: "Heading — second line (lighter)",
  standfirst: "Intro paragraph",
  eyebrow: "Small label above the heading",
  lead: "Opening line",
  tail: "Closing line (lighter)",
  href: "Link",
  label: "Button text",
  variant: "Style",
  body: "Text",
  summary: "Short description",
  countLabel: "Word after the number",
  linkLabel: "Link text",
  cardLabel: "Card label",
  tickerLabel: "Ticker label",
  defaultMarket: "Market shown first",
  productTypes: "Product types",
  items: "Items",
  actions: "Buttons",
  ticker: "Ticker entries",
  panels: "Panels",
  regions: "Regions",
  routes: "Cards",
  fields: "Form fields",
  bulletin: "Health authority bulletin",
  bulletinLabel: "Bulletin label",
  authority: "Authority",
  note: "Note",
  featuredSlug: "Featured article",
  limit: "How many in the list",
};

/** Notes for fields whose meaning is not obvious from the label alone. */
const HELP: Record<string, string> = {
  href: "A path on this site, like /contact — or a full https:// address.",
  defaultMarket:
    "The market shown before a visitor touches the map. Use the country's URL name, e.g. india.",
  eyebrow: "The small line above the heading.",
  bulletin:
    "The strip that rotates under the market status card. Leave it empty to hide the strip entirely.",
  authority: "The authority's short name, as people know it — FDA, EMA, CDSCO.",
  note:
    "Optional. Leave empty and the strip shows the authority name on its own; fill it in and it reads as a headline.",
  featuredSlug:
    "The article shown in the big card, by its URL name — e.g. cdsco-import-licence-timeline-revised. Leave empty for the newest one.",
  limit: "How many articles appear in the list beside the featured card.",
};

function humanise(key: string): string {
  if (LABEL_OVERRIDES[key]) return LABEL_OVERRIDES[key]!;
  const spaced = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1).toLowerCase();
}

/** Long boxes for the fields people actually write sentences in. */
const LONG_KEYS = new Set([
  "standfirst",
  "body",
  "lead",
  "answer",
  "quote",
  "description",
  "seoDescription",
]);

function unwrapOptional(node: Json): Json {
  // Zod emits `anyOf: [T, {type:"null"}]` for nullable fields.
  if (node.anyOf) {
    const real = node.anyOf.find((n) => n.type !== "null");
    if (real) return real;
  }
  return node;
}

function fieldFor(key: string, rawNode: Json, required: boolean): FieldSpec | null {
  const node = unwrapOptional(rawNode);

  if (node.const !== undefined) return null;

  if (node.enum) {
    return { key, label: humanise(key), kind: "select", required, options: node.enum };
  }

  if (node.type === "boolean") {
    return { key, label: humanise(key), kind: "boolean", required };
  }

  if (node.type === "number" || node.type === "integer") {
    return { key, label: humanise(key), kind: "number", required };
  }

  if (node.type === "array") {
    const item = unwrapOptional(node.items ?? {});
    if (item.type === "object" && item.properties) {
      const rowRequired = new Set(item.required ?? []);
      const fields = Object.entries(item.properties)
        .map(([k, v]) => fieldFor(k, v, rowRequired.has(k)))
        .filter((f): f is FieldSpec => f !== null);
      // The first text field is the row's summary line in a collapsed list.
      const titleKey = fields.find((f) => f.kind === "text" || f.kind === "longtext")?.key;
      return {
        key,
        label: humanise(key),
        kind: "grouplist",
        required,
        fields,
        titleKey,
        maxItems: node.maxItems,
      };
    }
    return { key, label: humanise(key), kind: "textlist", required, maxItems: node.maxItems };
  }

  return {
    key,
    label: humanise(key),
    kind: LONG_KEYS.has(key) ? "longtext" : "text",
    required,
    ...(HELP[key] ? { help: HELP[key] } : {}),
  };
}

/**
 * What each section is CALLED to the person editing it.
 *
 * Without this the widget shows "Hero map", "Explore journeys", "Proof
 * billboard" — the names we gave the code. An editor has never seen the code.
 * They know the page by what they can point at on it.
 */
const SECTION_LABELS: Record<string, string> = {
  "hero-map": "Headline & world map",
  "page-head": "Page heading",
  "sub-capability-grid": "Links to sub-pages",
  "metric-row": "Numbers strip",
  "faq-accordion": "Questions & answers",
  "country-head": "Country heading",
  "capability-status": "What we offer here",
  "job-list": "Job openings list",
  "job-detail": "Job advert",
  "article-grid": "Article listing",
  "article-head": "Article heading",
  "article-body": "Article body",
  "contact-form": "Contact form",
  "explore-journeys": "Explore panels",
  "statement": "Big statement",
  "capability-panels": "Service panels",
  "industry-index": "Industries list",
  "market-directory": "Country search table",
  "region-cards": "Regions & markets",
  "process-grid": "How we work — stages",
  "pill-row": "Certifications strip",
  "value-grid": "Values",
  "proof-billboard": "Client proof",
  "insight-feed": "Knowledge Hub feed",
  "contact-split": "Enquiry form & route cards",
};

function sectionLabel(type: string): string {
  return SECTION_LABELS[type] ?? humanise(type.replace(/-/g, " "));
}

const sections: Record<string, { label: string; fields: FieldSpec[] }> = {};

for (const schema of SECTION_SCHEMAS) {
  const json = z.toJSONSchema(schema, { io: "input" }) as Json;
  const literal = (schema.shape.type as unknown as { value: string }).value;
  const required = new Set(json.required ?? []);

  const fields = Object.entries(json.properties ?? {})
    .filter(([key]) => !SYSTEM_KEYS.has(key) && !SECTION_HIDDEN[literal]?.has(key))
    .map(([key, node]) => fieldFor(key, node, required.has(key)))
    .filter((f): f is FieldSpec => f !== null);

  sections[literal] = { label: sectionLabel(literal), fields };
}

const out = {
  generatedAt: new Date().toISOString(),
  sections,
};

writeFileSync(
  join(process.cwd(), "public", "section-fields.json"),
  JSON.stringify(out, null, 2) + "\n",
);

console.log(
  `[emit-fields] ${Object.keys(sections).length} section types → public/section-fields.json`,
);

import { REGISTERED_TYPES } from "@/components/sections/registry";
import type { Page, Section } from "@/lib/schema/section";
import { SECTION_DEFAULTS } from "@/lib/schema/section-defaults.generated";

/**
 * The runtime boundary check.
 *
 * Deliberately shallow. Deep per-field validation belongs at PUBLISH time, in
 * Catalyst, where a bad save can still be rejected and the editor told why. By
 * the time data reaches this app it is already an immutable published
 * snapshot — re-parsing all 26 section shapes on every request would burn
 * time to discover a problem it is far too late to fix.
 *
 * So this asks only the two questions that stop a render crashing:
 *   1. is the record the right shape at the top level?
 *   2. is every section's `type` one we have a component for?
 *
 * Anything deeper is Catalyst's job. An unknown type is dropped rather than
 * thrown, matching the registry's behaviour — one bad section must not take
 * the whole page down.
 *
 * This file imports no validation library and runs in the request path. The
 * Zod schemas run once, at build time, in scripts/emit-schemas.ts.
 */

const KNOWN = new Set<string>(REGISTERED_TYPES);

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export type GuardResult =
  | { ok: true; page: Page; dropped: string[] }
  | { ok: false; reason: string };

export function guardPage(raw: unknown): GuardResult {
  if (!isObject(raw)) return { ok: false, reason: "record is not an object" };
  if (typeof raw.slug !== "string") return { ok: false, reason: "missing slug" };
  if (typeof raw.title !== "string") return { ok: false, reason: "missing title" };
  if (!Array.isArray(raw.sections)) return { ok: false, reason: "sections is not an array" };

  const dropped: string[] = [];
  const sections: Section[] = [];

  for (const entry of raw.sections) {
    if (!isObject(entry) || typeof entry.type !== "string") {
      dropped.push("<malformed>");
      continue;
    }
    if (!KNOWN.has(entry.type)) {
      dropped.push(entry.type);
      continue;
    }
    // Apply the schema's own defaults for any field the record omits.
    //
    // This is the one place the build-time/runtime split leaks. Every
    // `.default([])` in a section schema is applied by Zod at parse time, and
    // Zod never runs here — so a CMS record that omits `actions` would reach a
    // component as `undefined` and crash on `actions.length`. Fixtures hid
    // this because a fixture author always writes the whole object; the first
    // real Creator page did not.
    //
    // The defaults are generated from the schemas themselves
    // (scripts/emit-schemas.ts), so they cannot drift from what Zod would have
    // applied. Undefined values are treated as absent, which matches Zod.
    const defaults = SECTION_DEFAULTS[entry.type];
    if (defaults) {
      const filled: Record<string, unknown> = { ...defaults };
      for (const [key, value] of Object.entries(entry)) {
        if (value !== undefined) filled[key] = value;
      }
      sections.push(filled as unknown as Section);
    } else {
      sections.push(entry as unknown as Section);
    }
  }

  return { ok: true, page: { ...(raw as object), sections } as Page, dropped };
}

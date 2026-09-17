import { z } from "zod";
import { SECTION_TYPE_SET } from "./section-types";

/**
 * What Creator is allowed to send, and what the public API gives back.
 *
 * This file is the contract. If a publish does not match it, the publish is
 * refused and the live site is untouched — which is the entire reason this
 * service sits between Creator and the website.
 *
 * NOTE ON DEPTH OF VALIDATION. Section TYPE is checked strictly against the
 * generated list. Section DATA is checked only for "is valid JSON, and an
 * object" — not field by field against each section's schema. That is a
 * deliberate first step, not an oversight:
 *
 *   - an unknown TYPE is the failure that breaks a page, because the renderer
 *     has no component for it. That is refused here.
 *   - a missing or malformed FIELD degrades gracefully: the website's schemas
 *     carry defaults, and sections with no items render nothing.
 *
 * Full per-type validation means running the emitted JSON Schema here. Worth
 * doing once the chain is proven end to end; see context/BUILD-GUIDE.md.
 */

/** A path is the page's identity. Leading slash, no trailing slash, no query. */
export const pathSchema = z
  .string()
  .trim()
  .min(1)
  .max(250)
  .regex(/^\/(?:[A-Za-z0-9._~-]+(?:\/[A-Za-z0-9._~-]+)*)?$/, {
    message: "Path must start with / and contain only URL-safe segments",
  })
  .refine((v) => v === "/" || !v.endsWith("/"), {
    message: "Path must not end with a trailing slash",
  });

export const robotsDirectiveSchema = z.enum([
  "Index Follow",
  "Noindex Follow",
  "Noindex Nofollow",
]);

/**
 * Deluge's Map.toString() does not always emit a JSON boolean. A Creator
 * checkbox can arrive as true, "true", "false", "Yes", "No", 1, 0 or "".
 *
 * `z.coerce.boolean()` would be WRONG here and dangerously so: it follows
 * JavaScript truthiness, so the string "false" becomes TRUE. That would
 * publish every hidden section and hide nothing — silently, with no error
 * anywhere. Parse the value properly instead.
 */
const creatorBoolean = z
  .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (value === null || value === undefined) return false;
    return ["true", "yes", "1", "on", "checked"].includes(value.trim().toLowerCase());
  });

export const sectionSchema = z.object({
  sectionUuid: z.string().trim().min(1).max(64),
  displayOrder: z.coerce.number().int(),
  sectionType: z.string().trim().refine((v) => SECTION_TYPE_SET.has(v), {
    message: "Unknown section type",
  }),
  /**
   * Creator stores this as text. It arrives either already parsed or as a
   * JSON string; both are accepted, because asking Deluge to send a nested
   * object reliably is a fight not worth having.
   */
  sectionData: z
    .union([z.record(z.string(), z.unknown()), z.string(), z.null(), z.undefined()])
    .transform((value, ctx) => {
      if (value === null || value === undefined || value === "") return {};
      if (typeof value !== "string") return value;
      try {
        const parsed = JSON.parse(value);
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
          ctx.addIssue({ code: "custom", message: "Section_Data must be a JSON object" });
          return z.NEVER;
        }
        return parsed as Record<string, unknown>;
      } catch {
        ctx.addIssue({ code: "custom", message: "Section_Data is not valid JSON" });
        return z.NEVER;
      }
    }),
  hidden: creatorBoolean.default(false),
  isRequired: creatorBoolean.default(false),
});

export const publishRequestSchema = z.object({
  page: z.object({
    pageUuid: z.string().trim().min(1).max(64),
    path: pathSchema,
    internalTitle: z.string().trim().min(1).max(250),
    pageFamily: z.string().trim().min(1).max(64),
    seoTitle: z.string().trim().max(250).optional().nullable(),
    seoDescription: z.string().trim().max(2000).optional().nullable(),
    robotsDirective: robotsDirectiveSchema.optional().nullable(),
    canonicalUrlOverride: z.string().trim().max(500).optional().nullable(),
    publishNote: z.string().trim().max(2000).optional().nullable(),
  }),
  sections: z.array(sectionSchema).max(100),
});

export type PublishRequest = z.infer<typeof publishRequestSchema>;
export type PublishedSection = z.infer<typeof sectionSchema>;

export const unpublishRequestSchema = z.object({
  path: pathSchema,
  reason: z.string().trim().max(500).optional().nullable(),
});

/** What gets frozen in Stratus and served to the website. */
export interface PublishedPage {
  schemaVersion: 1;
  publicationId: string;
  contentHash: string;
  publishedAt: string;
  page: PublishRequest["page"];
  sections: Array<{
    sectionUuid: string;
    displayOrder: number;
    sectionType: string;
    sectionData: Record<string, unknown>;
    isRequired: boolean;
  }>;
}

/** One entry per live path. Small, so the whole index is one object. */
export interface LiveIndexEntry {
  path: string;
  pageUuid: string;
  publicationId: string;
  publishedAt: string;
  internalTitle: string;
}

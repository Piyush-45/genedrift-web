import { z } from "zod";

/**
 * Site chrome — the navigation, the footer, and the certification row.
 *
 * WHY ONE COLLECTION AND NOT THREE. These three things appear on EVERY page,
 * they are edited together ("we renamed the section and the footer says the
 * old name"), and the footer's link columns are derived from the navigation.
 * Publishing them separately would let the header and footer disagree for as
 * long as it took someone to press the second button.
 *
 * WHAT AN EDITOR CAN CHANGE, AND WHAT THEY CANNOT:
 *
 *   label        yes   rename "Expertise" to "What we do"
 *   displayOrder yes   reorder the menu
 *   visible      yes   hide an item without deleting it
 *   href         NO    it is a system field, seeded once
 *
 * That last line is the whole safety model, and it is structural rather than
 * validated. A menu that cannot point anywhere new cannot point at a page
 * that does not exist. Checking links after the fact would mean this service
 * needing to know every route the site generates — including the 46 country
 * pages and every article — and being wrong about it silently.
 *
 * Adding a genuinely new top-level section still means building the page it
 * leads to, which is a deploy either way.
 */

const href = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .refine((v) => v.startsWith("/") || v.startsWith("https://") || v.startsWith("mailto:"), {
    message: "Link must be a site path (/about), an https:// address, or a mailto: link",
  });

export const navItemSchema = z.object({
  /** Stable identity, so a rename is a rename and not a delete plus an add. */
  key: z.string().trim().min(1).max(80),
  label: z.string().trim().min(1).max(80),
  href,
  /** Empty for a top-level item; otherwise the parent item's key. */
  parentKey: z.string().trim().max(80).default(""),
  displayOrder: z.coerce.number().int().default(0),
  visible: z
    .union([z.boolean(), z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) => {
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (value === null || value === undefined) return true;
      return ["true", "yes", "1", "on", "checked"].includes(value.trim().toLowerCase());
    }),
  /**
   * `menu` is the header and the footer's link columns. `legal` is the small
   * print row at the very bottom. Same form, one field apart — a separate
   * form for three links would be a form nobody remembers exists.
   */
  group: z.enum(["menu", "legal"]).default("menu"),
});

export const footerSchema = z.object({
  tagline: z.string().trim().max(200).default(""),
  description: z.string().trim().max(400).default(""),
  site: z.string().trim().max(200).default(""),
  email: z.string().trim().max(200).default(""),
  address: z.string().trim().max(400).default(""),
  ctaLabel: z.string().trim().max(80).default(""),
  ctaHref: z.union([href, z.literal("")]).default(""),
});

/**
 * A certification carries an EXPIRY, and the website hides it once that date
 * passes.
 *
 * This is not bureaucracy. The row currently shipped reads `ISO 9001:2000` —
 * a standard withdrawn years ago, almost certainly meant to be 9001:2015 —
 * and it survived this long precisely because a free-text list has nothing in
 * it that ever goes stale on its own. On a pharmaceutical consultancy's site
 * these are compliance assertions, so the safe failure is to stop making the
 * claim rather than to keep making an expired one.
 *
 * An empty expiry means "no expiry recorded" and still displays: refusing to
 * show a certification because nobody typed a date would be worse.
 */
export const certificationSchema = z.object({
  name: z.string().trim().min(1).max(120),
  /** ISO date, or empty. */
  expiresOn: z
    .union([z.string(), z.null(), z.undefined()])
    .transform((v) => (v ?? "").toString().trim())
    .refine((v) => v === "" || /^\d{4}-\d{2}-\d{2}$/.test(v), {
      message: "Expiry must be a date like 2027-03-31, or left empty",
    }),
  certificateNumber: z.string().trim().max(120).default(""),
  displayOrder: z.coerce.number().int().default(0),
});

export const sitePublishRequestSchema = z.object({
  nav: z.array(navItemSchema).min(1).max(200),
  footer: footerSchema,
  certifications: z.array(certificationSchema).max(50).default([]),
});

export type SitePublishRequest = z.infer<typeof sitePublishRequestSchema>;
export type PublishedNavItem = z.infer<typeof navItemSchema>;

export interface PublishedSite {
  schemaVersion: 1;
  publicationId: string;
  contentHash: string;
  publishedAt: string;
  /** Top-level items in order, each with its children already nested. */
  nav: Array<{
    key: string;
    label: string;
    href: string;
    children: Array<{ key: string; label: string; href: string }>;
  }>;
  legal: Array<{ key: string; label: string; href: string }>;
  footer: z.infer<typeof footerSchema>;
  certifications: Array<{ name: string; expiresOn: string; certificateNumber: string }>;
}

/**
 * Two items claiming the same key means one silently wins — the same failure
 * mode as two markets on one path.
 */
export function findDuplicateKey(items: PublishedNavItem[]): string | null {
  const seen = new Set<string>();
  for (const item of items) {
    if (seen.has(item.key)) return item.key;
    seen.add(item.key);
  }
  return null;
}

/**
 * Flat rows to the nested shape the header renders.
 *
 * Hidden items are dropped here, and a hidden PARENT takes its children with
 * it — otherwise hiding "Expertise" would leave six orphaned links in the
 * footer column of a menu item that no longer exists.
 *
 * A child whose parent key matches nothing is dropped rather than promoted to
 * the top level: a stray orphan appearing as a new top-level menu item is a
 * much louder failure than a missing sub-link.
 */
export function nestNav(items: PublishedNavItem[]): PublishedSite["nav"] {
  const visible = items.filter((i) => i.visible && i.group === "menu");
  const byOrder = (a: PublishedNavItem, b: PublishedNavItem) =>
    a.displayOrder - b.displayOrder || a.label.localeCompare(b.label);

  const tops = visible.filter((i) => i.parentKey === "").sort(byOrder);
  const topKeys = new Set(tops.map((t) => t.key));

  return tops.map((top) => ({
    key: top.key,
    label: top.label,
    href: top.href,
    children: visible
      .filter((i) => i.parentKey === top.key && topKeys.has(i.parentKey))
      .sort(byOrder)
      .map((c) => ({ key: c.key, label: c.label, href: c.href })),
  }));
}

export function legalLinks(items: PublishedNavItem[]): PublishedSite["legal"] {
  return items
    .filter((i) => i.visible && i.group === "legal")
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((i) => ({ key: i.key, label: i.label, href: i.href }));
}

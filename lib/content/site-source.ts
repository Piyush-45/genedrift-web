import {
  FOOTER_BRAND,
  FOOTER_CERTIFICATIONS,
  FOOTER_LEGAL,
  HEADER_CTA,
  NAV,
  type NavItem,
} from "@/lib/nav";
import { websiteCatalystBaseUrl } from "./website-pages";

/**
 * The navigation, footer and certification row — from the CMS when it has
 * them, from `lib/nav.ts` when it does not.
 *
 * These render on EVERY page, which shapes two decisions:
 *
 *   1. They are ONE fetch, not three. Next memoises it per render pass, so a
 *      page costs one request no matter how many components ask.
 *   2. The fallback is not optional. A site that renders with no menu is
 *      broken on every page at once — far worse than a menu showing last
 *      week's labels.
 */

export interface SiteLink {
  label: string;
  href: string;
}

export interface SiteFooterBrand {
  tagline: string;
  description: string;
  site: string;
  email: string;
  address: string;
}

export interface SiteChrome {
  nav: NavItem[];
  legal: SiteLink[];
  footer: SiteFooterBrand;
  certifications: string[];
  headerCta: SiteLink;
  source: "cms" | "built-in";
}

const BUILT_IN: SiteChrome = {
  nav: NAV.map((i) => ({ ...i })),
  legal: FOOTER_LEGAL.map((l) => ({ ...l })),
  footer: { ...FOOTER_BRAND },
  certifications: [...FOOTER_CERTIFICATIONS],
  headerCta: { ...HEADER_CTA },
  source: "built-in",
};

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toLink(value: unknown): SiteLink | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const label = str(row.label);
  const href = str(row.href);
  return label && href ? { label, href } : null;
}

/**
 * A certification is shown unless its expiry has PASSED.
 *
 * An empty expiry still displays — refusing to show a certification because
 * nobody typed a date would be a worse failure than showing one whose expiry
 * is unrecorded. But a date in the past removes the claim automatically,
 * which is the entire point: `ISO 9001:2000` sat in the footer for years
 * precisely because a plain text list has nothing in it that can go stale on
 * its own.
 *
 * Compared in UTC against the date only, so a certificate does not vanish a
 * few hours early for a visitor in Auckland.
 */
export function currentCertifications(
  rows: Array<{ name: string; expiresOn?: string }>,
  today: Date,
): string[] {
  const todayIso = today.toISOString().slice(0, 10);
  return rows
    .filter((c) => c.name && (!c.expiresOn || c.expiresOn >= todayIso))
    .map((c) => c.name);
}

export async function fetchSiteChrome(): Promise<SiteChrome> {
  const baseUrl = websiteCatalystBaseUrl();
  if (!baseUrl) return BUILT_IN;

  try {
    const res = await fetch(`${baseUrl}/v1/public/site`, {
      next: { tags: ["website-site"], revalidate: 60 },
    });
    if (!res.ok) return BUILT_IN;

    const body = (await res.json()) as { ok?: boolean; site?: Record<string, unknown> };
    if (!body?.ok || !body.site) return BUILT_IN;

    const rawNav = Array.isArray(body.site.nav) ? body.site.nav : [];
    const nav = rawNav
      .map((value) => {
        const top = toLink(value);
        if (!top) return null;
        const row = value as Record<string, unknown>;
        const children = Array.isArray(row.children)
          ? row.children.map(toLink).filter((c): c is SiteLink => c !== null)
          : [];
        return children.length > 0 ? { ...top, children } : top;
      })
      .filter((i): i is NavItem => i !== null);

    // An empty menu is treated as no menu at all. Catalyst already refuses to
    // publish one, so reaching here means something else went wrong, and the
    // built-in menu is a better answer than a header with nothing in it.
    if (nav.length === 0) return BUILT_IN;

    const rawCerts = Array.isArray(body.site.certifications) ? body.site.certifications : [];
    const certifications = currentCertifications(
      rawCerts.map((c) => {
        const row = (c ?? {}) as Record<string, unknown>;
        return { name: str(row.name), expiresOn: str(row.expiresOn) };
      }),
      new Date(),
    );

    const footerRow = (body.site.footer ?? {}) as Record<string, unknown>;
    const footer: SiteFooterBrand = {
      tagline: str(footerRow.tagline) || FOOTER_BRAND.tagline,
      description: str(footerRow.description) || FOOTER_BRAND.description,
      site: str(footerRow.site) || FOOTER_BRAND.site,
      email: str(footerRow.email) || FOOTER_BRAND.email,
      address: str(footerRow.address) || FOOTER_BRAND.address,
    };

    const ctaLabel = str(footerRow.ctaLabel);
    const ctaHref = str(footerRow.ctaHref);

    return {
      nav,
      legal: (Array.isArray(body.site.legal) ? body.site.legal : [])
        .map(toLink)
        .filter((l): l is SiteLink => l !== null),
      footer,
      certifications,
      headerCta: ctaLabel && ctaHref ? { label: ctaLabel, href: ctaHref } : { ...HEADER_CTA },
      source: "cms",
    };
  } catch {
    return BUILT_IN;
  }
}

/** Link columns are derived, never stored — so header and footer cannot drift. */
export function footerColumns(nav: NavItem[]): NavItem[] {
  return nav.filter((i) => i.children && i.children.length > 0);
}

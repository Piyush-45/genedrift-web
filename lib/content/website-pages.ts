import type { Page, Section } from "@/lib/schema/section";

/**
 * Reads published website pages from the WEBSITE Catalyst service.
 *
 * ⚠️ This is a DIFFERENT service from the one that serves articles.
 *
 *   CATALYST_API_BASE_URL          → articles, from the editorial platform
 *   CATALYST_WEBSITE_API_BASE_URL  → website pages, from the website CMS
 *
 * Two Catalyst projects, two Creator applications, no shared storage. That
 * separation is deliberate — each can be handed to the client independently —
 * so the two hosts are two variables and must never be conflated.
 *
 * Not `NEXT_PUBLIC_`: every fetch happens in a server component, so the host
 * never reaches the browser bundle.
 */

export function websiteCatalystBaseUrl(): string | null {
  const raw = process.env.CATALYST_WEBSITE_API_BASE_URL?.trim();
  return raw ? raw.replace(/\/$/, "") : null;
}

/** The document shape the publishing service serves. */
interface ApiPage {
  page: {
    pageUuid: string;
    path: string;
    internalTitle: string;
    seoTitle?: string | null;
    seoDescription?: string | null;
  };
  sections: Array<{
    sectionUuid: string;
    displayOrder: number;
    sectionType: string;
    sectionData: Record<string, unknown>;
    isRequired: boolean;
  }>;
}

/**
 * Turn the published document into the `Page` shape the renderer already
 * takes. This is the ONLY place that knows the API's field names — the same
 * role `map-article.ts` plays for articles.
 *
 * `sectionData` is spread alongside `type`, because a section component's
 * props ARE its data plus its type. `guardPage` then drops any section whose
 * type has no component, so an unknown type cannot take a page down.
 */
export function toPage(doc: ApiPage): unknown {
  const sections = doc.sections.map((s) => ({
    ...s.sectionData,
    type: s.sectionType,
  })) as unknown as Section[];

  const title = doc.page.seoTitle?.trim() || doc.page.internalTitle;

  return {
    slug: doc.page.path.replace(/^\//, "") || "home",
    title,
    seo: {
      title,
      description: doc.page.seoDescription?.trim() ?? "",
    },
    sections,
  } satisfies Record<string, unknown> as unknown as Page;
}

export type WebsitePageFetch =
  | { state: "ok"; record: unknown }
  | { state: "missing" }
  | { state: "gone"; reason?: string | null }
  | { state: "unconfigured" };

/**
 * `path` is the site path with a leading slash: "/", "/company/about".
 *
 * A failure is reported as `missing`, never as an exception. The caller falls
 * back to the built-in content, so a Catalyst outage degrades the site to the
 * last-known-good copy rather than taking it offline.
 */
export async function fetchWebsitePage(path: string): Promise<WebsitePageFetch> {
  const baseUrl = websiteCatalystBaseUrl();
  if (!baseUrl) return { state: "unconfigured" };

  // The home page is requested as `_root`, never as an empty segment.
  // `/v1/public/pages/` (trailing slash, nothing after it) matches the
  // service's INDEX route instead — Express treats a trailing slash as
  // optional — so the site received the list of live paths, found no page in
  // it, and fell back to built-in content. Publishing the homepage looked
  // like it did nothing.
  const suffix = path === "/" ? "_root" : path.replace(/^\//, "");
  const url = `${baseUrl}/v1/public/pages/${suffix}`;

  try {
    const res = await fetch(url, {
      // Tagged so a publish can revalidate exactly this page later.
      next: { tags: ["website-page", `website-page:${path}`], revalidate: 60 },
    });

    if (res.status === 404) return { state: "missing" };
    if (res.status === 410) {
      const body = (await res.json().catch(() => null)) as { reason?: string } | null;
      return { state: "gone", reason: body?.reason ?? null };
    }
    if (!res.ok) return { state: "missing" };

    const body = (await res.json()) as { ok?: boolean; page?: ApiPage };
    if (!body?.ok || !body.page) return { state: "missing" };

    return { state: "ok", record: toPage(body.page) };
  } catch {
    // Network failure. Fall back rather than throw — see the note above.
    return { state: "missing" };
  }
}

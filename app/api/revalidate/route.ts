import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Called by Creator immediately after a successful publish, so an edit appears
 * on the site at once rather than at the end of the 60-second cache window.
 *
 *   POST /api/revalidate
 *   { "path": "/company/about" }        one page
 *   { "collection": "markets" }         every page that renders a market
 *   { "collection": "case-studies" }    the case studies listing and details
 *   { "collection": "site" }            the menu and footer, i.e. every page
 *   Authorization: Bearer <REVALIDATE_SECRET>
 *
 * WHY THIS EXISTS. Pages are cached with `revalidate: 60`, so an edit already
 * appears within a minute on its own. This endpoint turns "within a minute"
 * into "immediately", which is the difference between an editor believing the
 * CMS works and an editor pressing Publish three more times.
 *
 * WHY IT IS A SEPARATE SECRET from the publish HMAC: this one is handed to a
 * different caller for a different job, and a cache flush is far less
 * dangerous than a content write. Blast radius should match the key.
 *
 * Unset secret = disabled, returning 503. It does NOT fall back to accepting
 * unauthenticated requests: an open cache-flush endpoint is a free denial of
 * service against the site's own origin.
 */
function authorised(header: string | null): boolean {
  const secret = process.env.REVALIDATE_SECRET?.trim();
  if (!secret) return false;

  const provided = header?.replace(/^Bearer\s+/i, "").trim() ?? "";
  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  // Length check first — timingSafeEqual throws on a mismatch, and the length
  // of a secret is not itself secret.
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!process.env.REVALIDATE_SECRET?.trim()) {
    return NextResponse.json({ ok: false, code: "REVALIDATE_DISABLED" }, { status: 503 });
  }
  if (!authorised(request.headers.get("authorization"))) {
    return NextResponse.json({ ok: false, code: "UNAUTHORISED" }, { status: 401 });
  }

  let path: unknown;
  let collection: unknown;
  try {
    ({ path, collection } = (await request.json()) as {
      path?: unknown;
      collection?: unknown;
    });
  } catch {
    return NextResponse.json({ ok: false, code: "BODY_NOT_JSON" }, { status: 400 });
  }

  /**
   * A COLLECTION, not a page.
   *
   * Publishing markets changes the homepage map, the Global Presence table,
   * six region pages and 46 country pages. Listing 54 paths here would be a
   * list that silently goes out of date the moment a market is added, so the
   * markets fetch carries a tag and the tag is what gets invalidated.
   */
  /**
   * The menu and footer render on EVERY page, so this is the one invalidation
   * that genuinely touches the whole site. Still a single tag: enumerating
   * every path would be a list that goes stale the moment a page is added.
   */
  if (collection === "site") {
    revalidateTag("website-site", { expire: 0 });
    return NextResponse.json({ ok: true, collection: "site" });
  }

  if (collection === "case-studies") {
    revalidateTag("website-case-studies", { expire: 0 });
    return NextResponse.json({ ok: true, collection: "case-studies" });
  }

  if (collection === "markets") {
    // Next 16 requires the expiry profile explicitly. `{ expire: 0 }` means
    // "stale now" — the next request refetches. `updateTag` would be wrong
    // here: it is for Server Actions, and this is a webhook.
    revalidateTag("website-markets", { expire: 0 });
    return NextResponse.json({ ok: true, collection: "markets" });
  }

  if (typeof path !== "string" || !path.startsWith("/")) {
    return NextResponse.json({ ok: false, code: "PATH_INVALID" }, { status: 422 });
  }

  revalidatePath(path);

  return NextResponse.json({ ok: true, path });
}

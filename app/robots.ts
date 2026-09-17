import type { MetadataRoute } from "next";

/**
 * Search engine instructions.
 *
 * DEFAULT IS "DO NOT INDEX". A deployment is only crawlable when
 * `SITE_INDEXABLE` is exactly "true", which means a new environment — a
 * preview, a staging domain, someone's experiment — is private unless somebody
 * deliberately opens it.
 *
 * That default is the right way round for this site specifically. What is
 * currently deployed carries placeholder body copy, capability claims the
 * client has not verified, a withdrawn ISO standard in the footer and a
 * placeholder registered address. None of it should surface in a search for
 * Genedrift, and a staging site that quietly gets indexed is very hard to
 * un-index afterwards.
 *
 * robots.txt is only ADVISORY — well-behaved crawlers honour it and others do
 * not. The `X-Robots-Tag` header in next.config.ts is the enforcing half; this
 * file and that header are flipped by the same variable so they cannot
 * disagree.
 */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

export default function robots(): MetadataRoute.Robots {
  if (!SITE_INDEXABLE) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    ...(base ? { sitemap: `${base}/sitemap.xml` } : {}),
  };
}

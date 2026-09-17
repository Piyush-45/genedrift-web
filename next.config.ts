import type { NextConfig } from "next";

/**
 * Indexable ONLY when SITE_INDEXABLE is exactly "true".
 *
 * Read here as well as in app/robots.ts, from the same variable, so the
 * robots.txt file and the HTTP header can never disagree about whether this
 * deployment is public.
 */
const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * `X-Robots-Tag` is the ENFORCING half of the no-index pair. robots.txt is
   * advisory — a crawler may ignore it — whereas this header travels with
   * every response, including ones reached by a direct link that never touched
   * robots.txt.
   *
   * Belt and braces is warranted here: what is deployed carries placeholder
   * copy, unverified capability claims and a withdrawn ISO standard, and a
   * staging site that gets indexed is far harder to remove than to prevent.
   */
  async headers() {
    if (SITE_INDEXABLE) return [];
    return [
      {
        source: "/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  // Catalyst Stratus serves published media; add its host before using next/image with it.
  images: {
    // Catalyst Stratus serves published article media. Host confirmed against
    // the live development API, 2026-09-16. Production will have its own
    // bucket host — add it here when the production Catalyst URL is issued.
    remotePatterns: [
      { protocol: "https", hostname: "gd-genedrift-publishing-public-development.zohostratus.in" },
    ],
  },
};

export default nextConfig;

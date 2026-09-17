/**
 * Catalyst public API — configuration and client.
 *
 * ## The base URL is NEVER hardcoded
 *
 * Staging/UAT points at the current `.development.catalystappsail.in` host;
 * production gets its own. Both come from the environment, so the same build
 * artefact runs in either and no development host can ship to production.
 *
 *   CATALYST_API_BASE_URL    required in production
 *   CATALYST_API_TOKEN       optional bearer/auth header
 *
 * Deliberately NOT `NEXT_PUBLIC_`. Every article fetch happens in a server
 * component, so the API host never reaches the browser bundle — one less
 * internal hostname published to the world, and no risk of a staging URL
 * showing up in a production page's JavaScript.
 *
 * ## Failure behaviour
 *
 * In production a missing base URL throws. That is deliberate: a site that
 * silently serves fixture articles as though they were real regulatory
 * notices is far worse than a site that refuses to build. In development the
 * fixtures are used and a warning is logged.
 */

export interface CatalystConfig {
  baseUrl: string;
  token?: string;
}

export function catalystConfig(): CatalystConfig | null {
  const baseUrl = process.env.CATALYST_API_BASE_URL?.trim();

  if (!baseUrl) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "CATALYST_API_BASE_URL is not set. Refusing to build a production site " +
          "that would serve fixture content as real articles.",
      );
    }
    return null;
  }

  return { baseUrl: baseUrl.replace(/\/$/, ""), token: process.env.CATALYST_API_TOKEN };
}

/** True when a real API is configured; false means fixtures (development only). */
export function isCatalystConfigured(): boolean {
  return Boolean(process.env.CATALYST_API_BASE_URL?.trim());
}

/** Public API prefix. The env var holds the ORIGIN only. */
export const PUBLIC_API_PREFIX = "/v1/public";

/**
 * Result of a public read.
 *
 * `gone` is modelled separately from `missing` because the API distinguishes
 * them: a retracted article returns **410**, an unknown slug returns 404. That
 * difference matters on a regulatory site — an article that was withdrawn
 * should say so, not silently behave as though it never existed.
 */
export type CatalystResult<T> =
  | { state: "ok"; data: T }
  | { state: "missing" }
  /** 410. Catalyst sends the retraction reason and a replacement path with it. */
  | { state: "gone"; reason?: string | null; replacementPath?: string | null }
  | { state: "error" };

/**
 * Typed GET against the public API.
 *
 * `revalidate` is per-call so the listing and an article can age differently,
 * and `tags` lets Catalyst's existing revalidation hooks invalidate exactly
 * the affected paths — the mechanism the old frontend already proved.
 *
 * The API is open GET-only today; the optional token header is kept so adding
 * auth later is configuration, not a code change.
 */
export async function catalystGet<T>(
  path: string,
  opts: { revalidate?: number; tags?: string[] } = {},
): Promise<CatalystResult<T>> {
  const config = catalystConfig();
  if (!config) return { state: "error" };

  const url = `${config.baseUrl}${PUBLIC_API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(config.token ? { Authorization: config.token } : {}),
      },
      next: { revalidate: opts.revalidate ?? 300, tags: opts.tags },
    });

    if (response.status === 404) return { state: "missing" };

    if (response.status === 410) {
      // The retraction payload is useful — surface it rather than discarding it.
      const body = (await response.json().catch(() => ({}))) as {
        reason?: string | null;
        replacementPath?: string | null;
      };
      return { state: "gone", reason: body.reason, replacementPath: body.replacementPath };
    }

    if (!response.ok) {
      console.error(`[catalyst] ${response.status} from ${path}`);
      return { state: "error" };
    }

    return { state: "ok", data: (await response.json()) as T };
  } catch (error) {
    console.error(`[catalyst] request to ${path} failed`, error);
    return { state: "error" };
  }
}

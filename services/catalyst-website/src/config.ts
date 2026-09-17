import { z } from "zod";

/**
 * Every value this service needs, and nothing it does not.
 *
 * Deliberately much smaller than the editorial service's config: the website
 * publisher has no media pipeline, no async job pool, and never calls back
 * into Creator. Creator POSTs a complete page and gets its answer in the same
 * response, so there is no OAuth, no callback URL and no retry outbox.
 *
 * A missing or too-short secret fails at boot. A service that starts with an
 * empty signing secret and accepts unsigned publishes is worse than one that
 * refuses to start.
 */
export const environmentSchema = z.object({
  /** Shared with Creator. Generate a NEW one — do not reuse the editorial secret. */
  WEBSITE_HMAC_SECRET: z.string().min(32),

  /** Private Stratus bucket holding publications and the live pointers. */
  CATALYST_STRATUS_PRIVATE_BUCKET: z.string().trim().min(3),

  /** How far a request timestamp may drift before it is rejected, in seconds. */
  REQUEST_CLOCK_SKEW_SECONDS: z.coerce.number().int().positive().default(300),

  /** Largest publish payload accepted, in bytes. */
  MAX_PAYLOAD_BYTES: z.coerce.number().int().positive().default(1_048_576),

  /**
   * AppSail injects the port it expects the app to listen on as
   * X_ZOHO_CATALYST_LISTEN_PORT. Listening on a hardcoded 9000 works only
   * while that happens to be the injected value — bind to what the platform
   * actually asks for, and fall back to 9000 for local runs.
   */
  PORT: z.coerce.number().int().positive().default(9000),
});

export type Environment = z.infer<typeof environmentSchema>;

/**
 * The editorial service accepts `GD_`-prefixed aliases because Catalyst's
 * console once wrote them that way. Same courtesy here.
 */
const ALIASES: Record<string, string> = {
  CATALYST_STRATUS_PRIVATE_BUCKET: "GD_STRATUS_PRIVATE_BUCKET",
  WEBSITE_HMAC_SECRET: "GD_WEBSITE_HMAC_SECRET",
};

export function loadEnvironment(source: NodeJS.ProcessEnv = process.env): Environment {
  const normalised: NodeJS.ProcessEnv = { ...source };
  normalised.PORT =
    normalised.X_ZOHO_CATALYST_LISTEN_PORT ?? normalised.PORT ?? undefined;
  for (const [canonical, alias] of Object.entries(ALIASES)) {
    normalised[canonical] = normalised[canonical] ?? normalised[alias];
  }
  return environmentSchema.parse(normalised);
}

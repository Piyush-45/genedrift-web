import { createHash, createHmac, timingSafeEqual } from "node:crypto";

/**
 * Request signing — IDENTICAL scheme to the editorial service, so the Deluge
 * function that signs a publish is the same shape your team already knows.
 *
 * The signature covers the method, the path, a timestamp, a nonce and a hash
 * of the raw body. Signing the body hash rather than the body keeps the string
 * short; including the timestamp and path stops a captured request being
 * replayed later or against a different endpoint.
 */

export function sha256Hex(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function signatureBase(
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  rawBody: Buffer,
): string {
  return [method.toUpperCase(), path, timestamp, nonce, sha256Hex(rawBody)].join("\n");
}

export function signRequest(
  secret: string,
  method: string,
  path: string,
  timestamp: string,
  nonce: string,
  rawBody: Buffer,
): string {
  return createHmac("sha256", secret)
    .update(signatureBase(method, path, timestamp, nonce, rawBody))
    .digest("hex");
}

export class AuthError extends Error {
  constructor(message: string, readonly code: string) {
    super(message);
  }
}

export function verifyRequestSignature(
  secret: string,
  method: string,
  path: string,
  rawBody: Buffer,
  headers: { timestamp?: string; nonce?: string; signature?: string },
  now: Date,
  maxClockSkewSeconds: number,
): void {
  const { timestamp, nonce, signature } = headers;
  if (!timestamp || !nonce || !signature) {
    throw new AuthError("Missing request authentication headers", "AUTH_HEADERS_MISSING");
  }
  if (!/^[A-Za-z0-9._:-]{8,200}$/.test(nonce)) {
    throw new AuthError("Invalid request nonce", "AUTH_NONCE_INVALID");
  }
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) {
    throw new AuthError("Invalid request timestamp", "AUTH_TIMESTAMP_INVALID");
  }
  if (Math.abs(Math.floor(now.getTime() / 1000) - seconds) > maxClockSkewSeconds) {
    throw new AuthError("Request timestamp is outside the allowed clock skew", "AUTH_TIMESTAMP_EXPIRED");
  }

  const expected = Buffer.from(signRequest(secret, method, path, timestamp, nonce, rawBody), "hex");
  const actual = Buffer.from(signature, "hex");
  // Length check first: timingSafeEqual throws on a length mismatch, and the
  // length of a hex signature is not a secret.
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new AuthError("Invalid request signature", "AUTH_SIGNATURE_INVALID");
  }
}

/** Key order must not change a content hash, so serialise deterministically. */
export function stableJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) return `[${value.map(stableJson).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableJson(record[key])}`)
    .join(",")}}`;
}

export function deterministicId(prefix: string, ...parts: string[]): string {
  return `${prefix}_${sha256Hex(parts.join("\n")).slice(0, 40)}`;
}

/**
 * Article dates. The API sends full ISO timestamps
 * ("2026-10-02T15:48:23.707Z"); fixtures send date-only strings
 * ("2026-09-08"). The old helper appended "T00:00:00Z" to everything, which
 * turned every real timestamp into an invalid date, so live cards showed no
 * date at all. Accept both.
 */
export function formatArticleDate(iso?: string, month: "short" | "long" = "short"): string | null {
  if (!iso) return null;
  const d = new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T00:00:00Z` : iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month, year: "numeric", timeZone: "UTC" });
}

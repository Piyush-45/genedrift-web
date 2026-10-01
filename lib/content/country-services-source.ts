import { websiteCatalystBaseUrl } from "./website-pages";

/**
 * Country service pages, e.g. "Drug Registration, Philippines", read from the
 * CMS. Added 30 Sept 2026 as a change to the approved sitemap.
 *
 * There is NO built-in fallback. Every line on these pages is a regulatory
 * claim (a regulator, a timeline, a document list) and inventing one is the
 * thing this site must never do. With nothing published, country pages simply
 * show no services list and the service URLs 404.
 */

export interface CountryService {
  marketSlug: string;
  regionSlug: string;
  marketName: string;
  serviceSlug: string;
  serviceName: string;
  summary: string;
  regulator: string;
  covers: string;
  timeline: string;
  validity: string;
  /** Paragraphs, already split on blank lines. */
  process: string[];
  /** One document per entry. */
  documents: string[];
  downloadUrl: string;
  downloadLabel: string;
  seoTitle: string;
  seoDescription: string;
  href: string;
  order: number;
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function paragraphs(value: string): string[] {
  return value
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p !== "");
}

function lines(value: string): string[] {
  return value
    .split(/\n/)
    .map((l) => l.replace(/^[\s\-*•·]+/, "").trim())
    .filter((l) => l !== "");
}

function toService(value: unknown): CountryService | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const marketSlug = str(row.marketSlug);
  const regionSlug = str(row.regionSlug);
  const serviceSlug = str(row.serviceSlug);
  const serviceName = str(row.serviceName);
  if (!marketSlug || !regionSlug || !serviceSlug || !serviceName) return null;
  const downloadUrl = str(row.downloadUrl);
  return {
    marketSlug,
    regionSlug,
    marketName: str(row.marketName),
    serviceSlug,
    serviceName,
    summary: str(row.summary),
    regulator: str(row.regulator),
    covers: str(row.covers),
    timeline: str(row.timeline),
    validity: str(row.validity),
    process: paragraphs(str(row.process)),
    documents: lines(str(row.documents)),
    // Catalyst already refuses anything else; checked again because it
    // ends up in an href.
    downloadUrl: downloadUrl.startsWith("https://") ? downloadUrl : "",
    downloadLabel: str(row.downloadLabel),
    seoTitle: str(row.seoTitle),
    seoDescription: str(row.seoDescription),
    href: `/markets/${regionSlug}/${marketSlug}/${serviceSlug}`,
    order: typeof row.order === "number" ? row.order : 0,
  };
}

export async function fetchCountryServices(): Promise<CountryService[]> {
  const baseUrl = websiteCatalystBaseUrl();
  if (!baseUrl) return [];
  try {
    const res = await fetch(`${baseUrl}/v1/public/country-services`, {
      next: { tags: ["website-country-services"], revalidate: 3600 },
    });
    if (!res.ok) return [];
    const body = (await res.json()) as {
      ok?: boolean;
      countryServices?: { countryServices?: unknown[] };
    };
    const rows = Array.isArray(body?.countryServices?.countryServices)
      ? body.countryServices.countryServices
      : [];
    return rows.map(toService).filter((s): s is CountryService => s !== null);
  } catch {
    return [];
  }
}

export async function getServicesForMarket(regionSlug: string, marketSlug: string) {
  return (await fetchCountryServices())
    .filter((s) => s.regionSlug === regionSlug && s.marketSlug === marketSlug)
    .sort((a, b) => a.order - b.order || a.serviceName.localeCompare(b.serviceName));
}

export async function getCountryService(regionSlug: string, marketSlug: string, serviceSlug: string) {
  return (await fetchCountryServices()).find(
    (s) => s.regionSlug === regionSlug && s.marketSlug === marketSlug && s.serviceSlug === serviceSlug,
  );
}

export async function countryServiceRoutes() {
  return (await fetchCountryServices()).map((s) => ({
    region: s.regionSlug,
    country: s.marketSlug,
    service: s.serviceSlug,
  }));
}

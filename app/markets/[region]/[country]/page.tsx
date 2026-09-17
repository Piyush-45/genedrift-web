import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { countryPage, marketRoutes } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

/**
 * Template D — one page per market. 46 routes from one file, generated from
 * the Markets data rather than enumerated by hand.
 */
/**
 * `dynamicParams` is TRUE, not false.
 *
 * `generateStaticParams` prerenders the markets that existed at BUILD time.
 * Markets are now CMS records, so a market added in Creator has no prerendered
 * route — with `false` it would 404 until the next deploy, and a published
 * page that is later revalidated has no fallback to fall back to. That exact
 * setting took pages down once already; see context/decisions.md.
 *
 * Unknown markets still 404, because the page function returns null when the
 * collection has no such record.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  return marketRoutes();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string; country: string }>;
}): Promise<Metadata> {
  const { region, country } = await params;
  const page = await countryPage(region, country);
  return page?.seo
    ? { title: page.seo.title, description: page.seo.description }
    : { title: "Markets — Genedrift" };
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ region: string; country: string }>;
}) {
  const { region, country } = await params;
  const page = await countryPage(region, country);
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

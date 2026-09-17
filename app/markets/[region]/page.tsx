import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { regionPage, regionRoutes } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

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
  return regionRoutes();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ region: string }>;
}): Promise<Metadata> {
  const { region } = await params;
  const page = await regionPage(region);
  return page?.seo
    ? { title: page.seo.title, description: page.seo.description }
    : { title: "Markets — Genedrift" };
}

export default async function RegionPage({
  params,
}: {
  params: Promise<{ region: string }>;
}) {
  const { region } = await params;
  const page = await regionPage(region);
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

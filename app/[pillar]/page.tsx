import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPage, PILLARS, type Pillar } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

/**
 * Template B — the pillar hub. One file covers all seven pillars.
 *
 * `dynamicParams` is TRUE, and that is a REVERSAL of the earlier decision —
 * read this before setting it back to false.
 *
 * The original reason for false was that this segment is a catch-all which
 * would otherwise swallow every unmatched top-level URL and render a hub for
 * it. That worry is real but it is already handled one layer down: `raw()` in
 * lib/content/pages.ts refuses anything outside PILLARS, `getPage` returns
 * null, and this component calls notFound(). `/legal` still 404s. Verified.
 *
 * What false cost us: **on-demand revalidation is incompatible with it.**
 * Once a prerendered page is invalidated, Next has no fallback to render for a
 * closed param set, so the path 404s permanently instead of regenerating —
 * measured, not assumed. Since CMS pages must update when someone presses
 * Publish, false was the wrong trade.
 *
 * It also unblocks pages created in the CMS that were not known at build time.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return PILLARS.map((pillar) => ({ pillar }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string }>;
}): Promise<Metadata> {
  const { pillar } = await params;
  const page = await getPage(pillar);
  return page?.seo
    ? { title: page.seo.title, description: page.seo.description }
    : { title: page?.title ?? "Genedrift" };
}

export default async function PillarHub({
  params,
}: {
  params: Promise<{ pillar: string }>;
}) {
  const { pillar } = await params;
  if (!PILLARS.includes(pillar as Pillar)) notFound();

  const page = await getPage(pillar);
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { detailRoutes, getPage } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

/**
 * Template C — the detail page under a pillar. Five route families, one file.
 *
 * Routes are derived from the navigation, so a nav child and a real URL are
 * the same fact.
 *
 * `dynamicParams` is TRUE for the same reason as the hub — on-demand
 * revalidation cannot regenerate a path outside a closed param set, so a
 * published edit would 404 the page instead of updating it. Unknown slugs
 * still 404 through getPage() returning null.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return detailRoutes().map(({ pillar, slug }) => ({ pillar, slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}): Promise<Metadata> {
  const { pillar, slug } = await params;
  const page = await getPage(`${pillar}/${slug}`);
  return page?.seo
    ? { title: page.seo.title, description: page.seo.description }
    : { title: page?.title ?? "Genedrift" };
}

export default async function PillarDetail({
  params,
}: {
  params: Promise<{ pillar: string; slug: string }>;
}) {
  const { pillar, slug } = await params;
  const page = await getPage(`${pillar}/${slug}`);
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

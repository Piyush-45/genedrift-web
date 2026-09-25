import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobPage, jobRoutes } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

/** Template G — one page per opening, generated from the Openings records. */
/**
 * TRUE, not false. Openings live in the client's own Creator app and are
 * published by their HR team, not by a deploy. With dynamicParams false, a
 * role added after the last build would 404 until someone redeployed the site.
 */
export const dynamicParams = true;

export async function generateStaticParams() {
  return jobRoutes();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ job: string }>;
}): Promise<Metadata> {
  const { job } = await params;
  const page = await jobPage(job);
  return page?.seo
    ? { title: page.seo.title, description: page.seo.description }
    : { title: "Careers — Genedrift" };
}

export default async function JobPage({ params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  const page = await jobPage(job);
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

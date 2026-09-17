import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { jobPage, jobRoutes } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

/** Template G — one page per opening, generated from the Openings records. */
export const dynamicParams = false;

export function generateStaticParams() {
  return jobRoutes();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ job: string }>;
}): Promise<Metadata> {
  const { job } = await params;
  const page = jobPage(job);
  return page?.seo
    ? { title: page.seo.title, description: page.seo.description }
    : { title: "Careers — Genedrift" };
}

export default async function JobPage({ params }: { params: Promise<{ job: string }> }) {
  const { job } = await params;
  const page = jobPage(job);
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

import { notFound } from "next/navigation";
import { getPage } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

export default async function HomePage() {
  const page = await getPage("home");
  if (!page) notFound();

  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

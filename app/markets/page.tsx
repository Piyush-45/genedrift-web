import type { Metadata } from "next";
import { marketsHubPage } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

export const metadata: Metadata = {
  title: "Markets — Genedrift",
  description: "Forty-six markets across six regions.",
};

export default async function MarketsHub() {
  const page = await marketsHubPage();
  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

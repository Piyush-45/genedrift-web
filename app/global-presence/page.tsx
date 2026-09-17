import type { Metadata } from "next";
import { globalPresencePage } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

export const metadata: Metadata = {
  title: "Global presence — Genedrift",
  description: "Search 46 markets and see which services are available in each.",
};

export default function GlobalPresence() {
  const page = globalPresencePage();
  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

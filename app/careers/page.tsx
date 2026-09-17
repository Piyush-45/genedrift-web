import type { Metadata } from "next";
import { careersPage } from "@/lib/content/pages";
import { RenderSections } from "@/components/sections/registry";

export const metadata: Metadata = {
  title: "Careers — Genedrift",
  description: "Regulatory and pharmacovigilance roles, in-house.",
};

export default function Careers() {
  const page = careersPage();
  return (
    <main className="pb-section">
      <RenderSections sections={page.sections} />
    </main>
  );
}

import type { ComponentType } from "react";
import type { Section, SectionType } from "@/lib/schema/section";
import { resolveSections } from "@/lib/content/resolve";
import { HeroMap } from "./hero-map";
import { ExploreJourneys } from "./explore-journeys";
import { InsightFeed } from "./insight-feed";
import { CountryHead } from "./country-head";
import { CapabilityStatus } from "./capability-status";
import { PageHead } from "./page-head";
import { SubCapabilityGrid } from "./sub-capability-grid";
import { MetricRow } from "./metric-row";
import { FaqAccordion } from "./faq-accordion";
import { JobList } from "./job-list";
import { JobDetail } from "./job-detail";
import { ArticleGrid } from "./article-grid";
import { ArticleHead } from "./article-head";
import { ArticleBody } from "./article-body";
import { ContactForm } from "./contact-form";
import { Statement } from "./statement";
import { CapabilityPanels } from "./capability-panels";
import { IndustryIndex } from "./industry-index";
import { MarketDirectory } from "./market-directory";
import { RegionCards } from "./region-cards";
import { ProcessGrid } from "./process-grid";
import { PillRow } from "./pill-row";
import { ValueGrid } from "./value-grid";
import { ProofBillboard } from "./proof-billboard";
import { ContactSplit } from "./contact-split";

/**
 * type -> component. This map is the renderer. A page is a loop over an
 * ordered array of sections; each one is looked up here and rendered.
 */
const REGISTRY: { [K in SectionType]: ComponentType<Extract<Section, { type: K }>> } = {
  "hero-map": HeroMap,
  "page-head": PageHead,
  "sub-capability-grid": SubCapabilityGrid,
  "metric-row": MetricRow,
  "faq-accordion": FaqAccordion,
  "country-head": CountryHead,
  "job-list": JobList,
  "article-grid": ArticleGrid,
  "article-head": ArticleHead,
  "article-body": ArticleBody,
  "contact-form": ContactForm,
  "job-detail": JobDetail,
  "capability-status": CapabilityStatus,
  "explore-journeys": ExploreJourneys,
  "insight-feed": InsightFeed,
  statement: Statement,
  "capability-panels": CapabilityPanels,
  "industry-index": IndustryIndex,
  "market-directory": MarketDirectory,
  "region-cards": RegionCards,
  "process-grid": ProcessGrid,
  "pill-row": PillRow,
  "value-grid": ValueGrid,
  "proof-billboard": ProofBillboard,
  "contact-split": ContactSplit,
};

export async function RenderSections({ sections }: { sections: Section[] }) {
  // Relationships are resolved here, once, before render — so no component
  // ever reaches for a collection itself. See lib/content/resolve.ts.
  //
  // Async because markets are fetched from the CMS. This is a server
  // component; the section components it renders are unaffected and several
  // of them are still client components.
  const resolved = await resolveSections(sections);
  return (
    <>
      {resolved.map((section, i) => {
        const Component = REGISTRY[section.type] as ComponentType<Section>;
        if (!Component) {
          if (process.env.NODE_ENV !== "production") {
            console.warn(`[sections] no component registered for "${section.type}"`);
          }
          return null;
        }
        return <Component key={`${section.type}-${i}`} {...section} />;
      })}
    </>
  );
}

export const REGISTERED_TYPES = Object.keys(REGISTRY) as SectionType[];

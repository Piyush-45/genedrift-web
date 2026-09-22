import { z } from "zod";
import { heroMapSchema } from "@/components/sections/hero-map/schema";
import { exploreJourneysSchema } from "@/components/sections/explore-journeys/schema";
import { insightFeedSchema } from "@/components/sections/insight-feed/schema";
import { countryHeadSchema } from "@/components/sections/country-head/schema";
import { capabilityStatusSchema } from "@/components/sections/capability-status/schema";
import { pageHeadSchema } from "@/components/sections/page-head/schema";
import { subCapabilityGridSchema } from "@/components/sections/sub-capability-grid/schema";
import { metricRowSchema } from "@/components/sections/metric-row/schema";
import { faqAccordionSchema } from "@/components/sections/faq-accordion/schema";
import { jobListSchema } from "@/components/sections/job-list/schema";
import { jobDetailSchema } from "@/components/sections/job-detail/schema";
import { articleGridSchema } from "@/components/sections/article-grid/schema";
import { articleHeadSchema } from "@/components/sections/article-head/schema";
import { articleBodySchema } from "@/components/sections/article-body/schema";
import { contactFormSchema } from "@/components/sections/contact-form/schema";
import { statementSchema } from "@/components/sections/statement/schema";
import { capabilityPanelsSchema } from "@/components/sections/capability-panels/schema";
import { industryIndexSchema } from "@/components/sections/industry-index/schema";
import { marketDirectorySchema } from "@/components/sections/market-directory/schema";
import { regionCardsSchema } from "@/components/sections/region-cards/schema";
import { processGridSchema } from "@/components/sections/process-grid/schema";
import { pillRowSchema } from "@/components/sections/pill-row/schema";
import { valueGridSchema } from "@/components/sections/value-grid/schema";
import { proofBillboardSchema } from "@/components/sections/proof-billboard/schema";
import { contactSplitSchema } from "@/components/sections/contact-split/schema";
import { caseStudyIndexSchema } from "@/components/sections/case-study-index/schema";
import { caseStudyHeadSchema } from "@/components/sections/case-study-head/schema";
import { caseStudyBodySchema } from "@/components/sections/case-study-body/schema";

/**
 * Every section type the site can render. Adding one means: create the folder
 * under components/sections/, add its schema here, add it to the registry.
 * Nothing else changes — templates pick sections up automatically.
 */
/**
 * The same list, addressable one at a time.
 *
 * `scripts/emit-schemas.ts` walks this to extract each type's field DEFAULTS,
 * which the runtime boundary applies to CMS content. A discriminated union
 * cannot be iterated back into its members, so the array is named.
 */
export const SECTION_SCHEMAS = [
  heroMapSchema,
  pageHeadSchema,
  subCapabilityGridSchema,
  metricRowSchema,
  faqAccordionSchema,
  countryHeadSchema,
  capabilityStatusSchema,
  jobListSchema,
  jobDetailSchema,
  articleGridSchema,
  articleHeadSchema,
  articleBodySchema,
  contactFormSchema,
  exploreJourneysSchema,
  statementSchema,
  capabilityPanelsSchema,
  industryIndexSchema,
  marketDirectorySchema,
  regionCardsSchema,
  processGridSchema,
  pillRowSchema,
  valueGridSchema,
  proofBillboardSchema,
  insightFeedSchema,
  contactSplitSchema,
  caseStudyIndexSchema,
  caseStudyHeadSchema,
  caseStudyBodySchema,
] as const;

export const sectionSchema = z.discriminatedUnion("type", [...SECTION_SCHEMAS]);

export type Section = z.infer<typeof sectionSchema>;
export type SectionType = Section["type"];

/** A published page as it arrives from Catalyst. */
export const pageSchema = z.object({
  slug: z.string(),
  title: z.string(),
  seo: z.object({ title: z.string(), description: z.string() }).optional(),
  sections: z.array(sectionSchema),
});

export type Page = z.infer<typeof pageSchema>;

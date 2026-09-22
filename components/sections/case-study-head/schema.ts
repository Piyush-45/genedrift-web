import { z } from "zod";

/**
 * The h1 block for one case study. Stores the slug, not the record —
 * resolve.ts supplies the resolved case study, exactly as `article-head`
 * works for an article.
 */
export const caseStudyHeadSchema = z.object({
  type: z.literal("case-study-head"),
  caseSlug: z.string().min(1),
  backLabel: z.string().default("← All case studies"),
});

export type CaseStudyHeadProps = z.infer<typeof caseStudyHeadSchema>;

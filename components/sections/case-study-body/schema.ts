import { z } from "zod";

/**
 * The narrative of one case study: Scenario, Solution, Result.
 *
 * The three step labels are editable because they are the client's words, not
 * ours — but the THREE steps are fixed, because the record has exactly three
 * narrative fields. A fourth step would be a schema change in Creator, in
 * Catalyst and here, which is the correct amount of friction for changing the
 * shape of every case study on the site at once.
 */
export const caseStudyBodySchema = z.object({
  type: z.literal("case-study-body"),
  caseSlug: z.string().min(1),
  scenarioLabel: z.string().default("Scenario"),
  solutionLabel: z.string().default("Solution"),
  resultLabel: z.string().default("Result"),
  pagerLabel: z.string().default("Next case study"),
});

export type CaseStudyBodyProps = z.infer<typeof caseStudyBodySchema>;

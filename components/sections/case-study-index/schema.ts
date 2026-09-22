import { z } from "zod";

/**
 * The case studies listing.
 *
 * The section stores a REFERENCE ("all"), not the records — resolve.ts turns
 * that into resolved case studies before render, the same seam markets use.
 * So the same section can sit on the Client Success hub later without any
 * component knowing where the records came from.
 *
 * Grouping is NOT configured here. Records carry their own family, and the
 * component groups by it, because the client's own site is organised that way
 * and adding a third family should be a row in Creator rather than a code
 * change here.
 */
export const caseStudyIndexSchema = z.object({
  type: z.literal("case-study-index"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  /** "all", or a family slug to show one family only. */
  source: z.string().default("all"),
  readLabel: z.string().default("Read the case study"),
});

export type CaseStudyIndexProps = z.infer<typeof caseStudyIndexSchema>;

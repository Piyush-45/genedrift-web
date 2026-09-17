import { z } from "zod";

/**
 * One opening — template G.
 *
 * `jobSlug` references the Openings collection; nothing about the role is
 * stored in the section. The apply destination is the job record's own
 * `applyHref`, so HR can repoint applications without a developer.
 */
export const jobDetailSchema = z.object({
  type: z.literal("job-detail"),
  jobSlug: z.string().min(1),
  applyLabel: z.string().default("Apply for this role"),
  responsibilitiesLabel: z.string().default("What you will do"),
  requirementsLabel: z.string().default("What you will bring"),
  /**
   * Shown above the advert while content is unverified. This is a safety
   * feature, not decoration — see context/blocked-on-client.md.
   */
  unverifiedNotice: z.string().optional(),
});

export type JobDetailProps = z.infer<typeof jobDetailSchema>;

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
  /**
   * Shown when an opening has no description and no candidate profile — which
   * happens in the client's own data. Editable, because "get in touch" is
   * their voice to choose, not ours.
   */
  emptyMessage: z
    .string()
    .default(
      "The full description for this role is being finalised. Please get in touch and we will send it to you.",
    ),
});

export type JobDetailProps = z.infer<typeof jobDetailSchema>;

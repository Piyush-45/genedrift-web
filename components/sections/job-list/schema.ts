import { z } from "zod";

/**
 * The openings list. Replaces the embedded Zoho Creator report iframe that
 * genedrift.com/openings uses today — same records, a real page.
 *
 * Jobs are a REFERENCE (`source`), resolved by lib/content/resolve.ts. This
 * section stores only its own editorial copy and the empty-state message,
 * which matters: an openings page with no openings is a normal state, not an
 * error, and "nothing right now" needs to be said in the client's voice.
 */
export const jobListSchema = z.object({
  type: z.literal("job-list"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  source: z.string().default("all"),
  emptyMessage: z.string().default("No openings are listed right now."),
  emptyCtaLabel: z.string().optional(),
  emptyCtaHref: z.string().optional(),
});

export type JobListProps = z.infer<typeof jobListSchema>;

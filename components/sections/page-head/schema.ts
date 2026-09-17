import { z } from "zod";

/**
 * The h1 block for any page that is not the homepage or a country page.
 *
 * This exists because hubs and detail pages were borrowing `statement`, which
 * renders an <h2>. Every page needs exactly one <h1>, and a page whose only
 * heading is an <h2> is wrong for both screen readers and search.
 */
export const pageHeadSchema = z.object({
  type: z.literal("page-head"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  /** Rendered in a lighter tone after the heading, as on the homepage. */
  headingTail: z.string().optional(),
  standfirst: z.string().optional(),
  actions: z
    .array(z.object({ label: z.string().min(1), href: z.string().min(1), variant: z.enum(["solid", "quiet"]) }))
    .max(2)
    .default([]),
});

export type PageHeadProps = z.infer<typeof pageHeadSchema>;

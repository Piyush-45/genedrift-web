import { z } from "zod";

/**
 * Explore — "start with the problem, not our service names". Four panels;
 * one carries the highlight at rest and hover moves it.
 *
 * `resting` marks which panel is highlighted before anyone interacts. The
 * client asked (2026-09-15) for NOTHING highlighted on load -- highlight on
 * hover only -- so all four fixtures now carry `resting: false`. The field is
 * kept because Creator can still set it, and because the CSS that dims the
 * resting panel when a sibling is hovered depends on it.
 *
 * The certification strip is the same list as the footer's — see the warning
 * on FOOTER_CERTIFICATIONS in lib/nav.ts before touching it.
 */
export const exploreJourneysSchema = z.object({
  type: z.literal("explore-journeys"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  linkLabel: z.string().default("Explore"),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        body: z.string().min(1),
        href: z.string().min(1),
        resting: z.boolean().default(false),
      }),
    )
    .default([]),
  certificationsLabel: z.string().optional(),
  showCertifications: z.boolean().default(false),
});

export type ExploreJourneysProps = z.infer<typeof exploreJourneysSchema>;

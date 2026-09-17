import { z } from "zod";

/**
 * The children of a pillar, as a grid of links — what a hub page is for.
 *
 * `navSource` is a REFERENCE: name a pillar and the items resolve from the
 * navigation, so a hub page can never list a child the menu does not have.
 * `items` is the manual escape hatch for a grid that is not a nav mirror.
 * If both are given, `items` wins.
 *
 * See lib/content/resolve.ts — this component never imports the nav itself.
 */
export const subCapabilityGridSchema = z.object({
  type: z.literal("sub-capability-grid"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  navSource: z.string().optional(),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        href: z.string().min(1),
        body: z.string().optional(),
      }),
    )
    .default([]),
});

export type SubCapabilityGridProps = z.infer<typeof subCapabilityGridSchema>;

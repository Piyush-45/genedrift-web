import { z } from "zod";

/**
 * Industries & product categories — concept B, the two-panel index.
 *
 * Chosen by the client 2026-09-15, replacing concept A (the accordion
 * register) which was picked on 2026-09-13. See context/decisions.md. The
 * DATA SHAPE is identical to the accordion's — only the presentation changed —
 * so nothing downstream of this file had to move.
 *
 * The count shown on each tab is DERIVED from the product list, never stored.
 * A stored count is a number that goes stale the first time an editor adds a
 * product type and forgets to bump it.
 *
 * `icon` is a key into a fixed set drawn in the component. Editors pick from
 * the list; they cannot supply artwork.
 */
export const industryIcons = [
  "pharmaceuticals",
  "devices",
  "supplements",
  "cosmetics",
  "veterinary",
] as const;

export const industryIndexSchema = z.object({
  type: z.literal("industry-index"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  /** Suffix after the number: "10 types". */
  countLabel: z.string().default("types"),
  items: z
    .array(
      z.object({
        title: z.string().min(1),
        summary: z.string().min(1),
        icon: z.enum(industryIcons).optional(),
        href: z.string().optional(),
        productTypes: z.array(z.string().min(1)).default([]),
      }),
    )
    .default([]),
});

export type IndustryIndexProps = z.infer<typeof industryIndexSchema>;
export type IndustryIcon = (typeof industryIcons)[number];

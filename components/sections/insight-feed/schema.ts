import { z } from "zod";

/**
 * Knowledge Hub — one featured article beside a list of recent items.
 *
 * Articles are REFERENCES, not copy. `featured` and `items` are FILLED IN at
 * render time from the editorial platform's published articles — see
 * lib/content/resolve.ts. Whatever is stored in them is a fallback for when
 * the feed is empty or unreachable.
 *
 * WHY AUTOMATIC. A homepage block captioned "Latest updates" is the one thing
 * on a site nobody remembers to maintain by hand, and one showing three-month
 * -old news is worse than one showing none. The editor still controls the
 * heading, the labels and which article is featured.
 *
 * `image` is optional and intentionally so: the design's featured card shows a
 * flat tint where the image goes, and no real imagery has been supplied.
 */
const article = z.object({
  title: z.string().min(1),
  href: z.string().min(1),
  kind: z.string().min(1),
  meta: z.string().optional(),
  standfirst: z.string().optional(),
  image: z.string().optional(),
});

export const insightFeedSchema = z.object({
  type: z.literal("insight-feed"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  featured: article.optional(),
  listLabel: z.string().min(1),
  listLinkLabel: z.string().default("View all"),
  listLinkHref: z.string().default("/insights"),
  items: z.array(article).default([]),

  /**
   * The article to show in the large card, by its slug. Empty means "the most
   * recent one". A slug that no longer resolves falls back to the most recent
   * rather than leaving a hole.
   */
  featuredSlug: z.string().default(""),

  /** How many rows in the list beside the featured card. */
  limit: z.number().int().min(1).max(8).default(4),
});

export type InsightFeedProps = z.infer<typeof insightFeedSchema>;

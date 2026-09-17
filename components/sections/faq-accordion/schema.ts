import { z } from "zod";

/**
 * FAQs. Same native <details> mechanism as the industry accordion, sharing
 * the `.disclosure` styles — no JavaScript, correct keyboard and ARIA.
 *
 * Unlike Industries these are NOT exclusive: `name` is omitted so a reader
 * can open several answers and compare them, which is what people actually
 * do with an FAQ.
 */
export const faqAccordionSchema = z.object({
  type: z.literal("faq-accordion"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  items: z
    .array(z.object({ question: z.string().min(1), answer: z.string().min(1) }))
    .default([]),
});

export type FaqAccordionProps = z.infer<typeof faqAccordionSchema>;

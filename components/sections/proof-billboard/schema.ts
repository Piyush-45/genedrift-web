import { z } from "zod";

/**
 * Client impact. Three case stories as a playlist rather than one hero story —
 * the client said explicitly not to limit this to a single success story.
 *
 * Each record carries a capability and a market tag so the same record can
 * surface on those pages later. That is why `tags` is an array of strings and
 * not three named fields.
 */
export const proofBillboardSchema = z.object({
  type: z.literal("proof-billboard"),
  eyebrow: z.string().min(1),
  heading: z.string().min(1),
  standfirst: z.string().optional(),
  cases: z
    .array(
      z.object({
        label: z.string().min(1),
        title: z.string().min(1),
        body: z.string().min(1),
        tags: z.array(z.string()).default([]),
        href: z.string().optional(),
      }),
    )
    .default([]),
});

export type ProofBillboardProps = z.infer<typeof proofBillboardSchema>;

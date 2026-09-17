import type { ProofBillboardProps } from "./schema";

/**
 * The three stories the client cleared for use. Named clients are
 * deliberately anonymised ("Leading consumer healthcare company") because
 * that is how they were supplied — do not substitute real names without the
 * client confirming permission in writing.
 */
export const proofBillboardFixture: ProofBillboardProps = {
  type: "proof-billboard",
  eyebrow: "Client impact",
  heading: "Work our clients let us talk about.",
  standfirst:
    "Three engagements, each tagged to a capability and a market so the same record surfaces on those pages too.",
  cases: [
    {
      label: "Pharmacovigilance · QPPV",
      title: "Leading consumer healthcare company",
      body: "Local QPPV, Deputy QPPV and end-to-end pharmacovigilance support across the local market, with inspection-ready documentation maintained throughout.",
      tags: ["Pharmacovigilance", "QPPV", "Local market"],
    },
    {
      label: "Dedicated FTE · Lifecycle",
      title: "Leading US regulatory consulting organisation",
      body: "Dedicated FTE supporting lifecycle management for 170+ products, with hybrid onsite deployment scaled to the client's filing calendar.",
      tags: ["Dedicated FTE", "Lifecycle management", "Hybrid onsite"],
    },
    {
      label: "Intelligence · Saudi Arabia",
      title: "Multinational regulatory intelligence programme",
      body: "50+ regulatory intelligence reports and 10+ Saudi regulatory roadmaps delivered for multinational organisations entering the Gulf.",
      tags: ["Regulatory intelligence", "Saudi Arabia", "Roadmaps"],
    },
  ],
};

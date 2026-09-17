import type { ProcessGridProps } from "./schema";

export const processGridFixture: ProcessGridProps = {
  type: "process-grid",
  eyebrow: "Operating model",
  heading: "Twelve stages, filing to withdrawal.",
  standfirst:
    "The same team carries a product from the first strategy call through every renewal that follows.",
  stages: [
    {
      title: "Regulatory strategy",
      body: "Target markets, pathway and sequencing agreed before anything is written.",
    },
    {
      title: "Regulatory intelligence",
      body: "Current country requirements, mapped and kept current.",
    },
    {
      title: "Classification & gap analysis",
      body: "What you have, against what each authority expects.",
    },
    {
      title: "Dossier preparation",
      body: "Compiled to the receiving authority's format, not a generic template.",
    },
    { title: "eCTD publishing", body: "Validated output, lifecycle-ready sequences." },
    {
      title: "Submission management",
      body: "Filed locally, tracked centrally, reported to you.",
    },
    {
      title: "Authority interaction",
      body: "Queries answered by the people who wrote the dossier.",
    },
    {
      title: "Approval",
      body: "The licence issued, with every commitment logged for what follows.",
    },
    {
      title: "Lifecycle management",
      body: "Variations, renewals, transfers, notifications, withdrawals.",
    },
    {
      title: "MAH / local representation",
      body: "Licence held locally where you have no entity.",
    },
    {
      title: "Pharmacovigilance",
      body: "Local QPPV, case processing, aggregate reports, inspections.",
    },
    {
      title: "Dedicated resource",
      body: "Named FTE and embedded teams as the portfolio grows.",
    },
  ],
};

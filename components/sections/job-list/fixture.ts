import type { JobListProps } from "./schema";

export const jobListFixture: JobListProps = {
  type: "job-list",
  eyebrow: "Current openings",
  heading: "Roles open right now.",
  standfirst:
    "Every role is in-house. We do not place contractors with clients under our name.",
  source: "all",
  emptyMessage:
    "No openings are listed right now. We still read speculative applications from regulatory and pharmacovigilance specialists.",
  emptyCtaLabel: "Send a speculative application",
  emptyCtaHref: "/contact/enquiry",
};

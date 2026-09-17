/**
 * Jobs — stand-in for the Creator Openings collection.
 *
 * ## What we learned from the live site (2026-09-13)
 *
 * genedrift.com/openings embeds a **public Zoho Creator report** in an iframe:
 *
 *   creatorapp.zohopublic.com/genedrift/proton/report-embed/OpeningsReport/…
 *
 * So the client already runs a Creator application named `proton` with an
 * Openings form, and their current careers page is that report in an iframe on
 * a Zoho Sites page. Two consequences:
 *
 * 1. **Do not create a new Jobs collection.** Extend `proton`'s existing
 *    Openings form. The client's team already knows it and already keeps it
 *    current; a parallel form would immediately drift.
 * 2. The iframe is why the current page "looks rubbish" — it is an embedded
 *    report, not a designed page. Replacing it with real pages that read the
 *    same records is the whole win here.
 *
 * The exact field names could not be read (the embed URL is disallowed by
 * robots.txt). The shape below is the minimum a job page needs; it must be
 * reconciled against the real Openings form before wiring.
 *
 * ⚠️ Every record below is INVENTED. context/blocked-on-client.md is explicit:
 * a fake job advert can have a real person apply to it. None of this ships.
 */

export interface Job {
  slug: string;
  title: string;
  /** Regulatory Affairs, Pharmacovigilance, Quality, Corporate… */
  function: string;
  location: string;
  /** Market slug, when the role maps to one — links the job to its country page. */
  marketSlug?: string;
  employmentType: string;
  experience: string;
  qualification?: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
  postedOn: string;
  /** The Creator form the application goes to. */
  applyHref: string;
}

export const JOB_FUNCTIONS = [
  "Regulatory Affairs",
  "Pharmacovigilance",
  "Quality & Compliance",
  "Corporate",
] as const;

export const JOBS: readonly Job[] = [
  {
    slug: "regulatory-affairs-consultant-india",
    title: "Regulatory Affairs Consultant",
    function: "Regulatory Affairs",
    location: "Hyderabad, India",
    marketSlug: "india",
    employmentType: "Full time",
    experience: "3–6 years",
    qualification: "B.Pharm / M.Pharm or life sciences equivalent",
    summary:
      "[PLACEHOLDER] Own dossier preparation and submission management for assigned markets, working directly with the authorities rather than through an intermediary.",
    responsibilities: [
      "[PLACEHOLDER] Prepare and review CTD/eCTD dossiers for assigned markets",
      "[PLACEHOLDER] Manage submissions and respond to authority queries",
      "[PLACEHOLDER] Maintain lifecycle activities — variations, renewals, notifications",
    ],
    requirements: [
      "[PLACEHOLDER] Experience with emerging-market submissions",
      "[PLACEHOLDER] Working knowledge of eCTD publishing tools",
    ],
    postedOn: "2026-09-01",
    applyHref: "/careers/apply",
  },
  {
    slug: "qppv-deputy",
    title: "Deputy QPPV",
    function: "Pharmacovigilance",
    location: "Remote · India",
    marketSlug: "india",
    employmentType: "Full time",
    experience: "5–8 years",
    qualification: "Medical or life sciences degree",
    summary:
      "[PLACEHOLDER] Support the local QPPV across case processing, aggregate reporting and inspection readiness for multiple client portfolios.",
    responsibilities: [
      "[PLACEHOLDER] ICSR intake, triage and submission within regulatory timelines",
      "[PLACEHOLDER] Contribute to PSUR/PBRER and PSMF maintenance",
      "[PLACEHOLDER] Support inspection and audit readiness",
    ],
    requirements: [
      "[PLACEHOLDER] Hands-on pharmacovigilance experience in a regulated environment",
      "[PLACEHOLDER] Familiarity with safety databases",
    ],
    postedOn: "2026-08-24",
    applyHref: "/careers/apply",
  },
  {
    slug: "qms-specialist",
    title: "QMS Specialist",
    function: "Quality & Compliance",
    location: "Hyderabad, India",
    employmentType: "Full time",
    experience: "4–7 years",
    qualification: "Life sciences degree; ISO 9001 lead auditor an advantage",
    summary:
      "[PLACEHOLDER] Maintain and improve the quality management system that underpins every filing and safety obligation the business carries.",
    responsibilities: [
      "[PLACEHOLDER] Own SOP lifecycle, CAPA and internal audit programme",
      "[PLACEHOLDER] Prepare the organisation for client and authority audits",
    ],
    requirements: [
      "[PLACEHOLDER] Experience maintaining a certified QMS",
      "[PLACEHOLDER] Audit experience in a pharma or CRO setting",
    ],
    postedOn: "2026-08-18",
    applyHref: "/careers/apply",
  },
];

export function findJob(slug: string): Job | undefined {
  return JOBS.find((j) => j.slug === slug);
}

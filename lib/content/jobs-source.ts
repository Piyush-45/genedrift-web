import type { Job } from "@/lib/jobs";
import { JOBS } from "@/lib/jobs";
import { decodeEntities, plainTextToLines, richTextToLines, sentencesOf } from "./sanitize";

/**
 * Openings, read from the client's OWN Zoho Creator app.
 *
 * ## Why we read their app rather than build a Jobs collection
 *
 * genedrift.com/careers already embeds a published Creator report from an app
 * called `proton`. Their HR team maintains it and keeps it current. A parallel
 * Jobs form in the website CMS would drift from it within a month, and someone
 * would have to remember to update both. So the website reads the same records
 * and renders them properly — the embed is what made the old page look poor,
 * not the data behind it.
 *
 * ## How it is read, and why there are no credentials here
 *
 * Creator's PUBLISH API serves a published component using its permalink key
 * instead of OAuth:
 *
 *   GET https://www.zohoapis.com/creator/v2.1/publish/<owner>/<app>/report/<report>
 *       ?privatelink=<key>&field_config=all
 *       Accept: application/json        ← required; without it the API 400s
 *
 * **`field_config=all` is not optional.** The default, `quick_view`, returns
 * only the columns the report happens to display — which on their Openings
 * report is six fields. The job description, the candidate profile, the
 * qualifications and the joining time all live in the detail-view layout, and
 * without this parameter a role whose text sits in `Job_Profile` publishes as
 * a title with nothing under it. That is exactly how the Malaysia opening
 * first appeared.
 *
 * The whole URL, key included, lives in ZOHO_OPENINGS_URL. It is NOT
 * `NEXT_PUBLIC_`: anyone holding that key can read the report, so it stays on
 * the server and never reaches the browser bundle.
 *
 * OAuth (client id, secret, refresh token) is the better long-term
 * arrangement and needs no code change here — swapping the env var for a
 * token-bearing fetch is a change in this one file.
 *
 * ## Falling back
 *
 * Unset variable, unreachable API or an empty list → the built-in placeholder
 * roles, which are bracketed [PLACEHOLDER] and must never be presented as
 * real. That is the opposite of the markets rule, and deliberate: a placeholder
 * market is a cosmetic problem, a placeholder job advert can have a real person
 * apply to it. `JOBS_SOURCE` says which was used; the careers page refuses to
 * present fallback roles as live.
 */

export interface JobCollection {
  jobs: Job[];
  source: "zoho" | "built-in";
}

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * "Pharmacovigilance (DIN17)" → "Pharmacovigilance".
 *
 * The bracketed code is an internal department identifier. It belongs on their
 * report, not on a public careers page.
 */
function departmentName(value: string): string {
  return value.replace(/\s*\([^)]*\)\s*$/, "").trim();
}

/**
 * Their market slugs, for the country names that appear on openings. A job in
 * a market we have a page for can link to it; anything else simply does not.
 */
const MARKET_BY_COUNTRY: Record<string, string> = {
  india: "india",
  malaysia: "malaysia",
  indonesia: "indonesia",
  philippines: "philippines",
  vietnam: "vietnam",
  thailand: "thailand",
  singapore: "singapore",
  kenya: "kenya",
  nigeria: "nigeria",
  uzbekistan: "uzbekistan",
};

/**
 * The description arrives as one string of paragraphs separated by blank
 * lines. The first becomes the summary; the rest become the bulleted
 * responsibilities, which is how their own records read.
 */
function splitDescription(raw: string): { summary: string; responsibilities: string[] } {
  const paragraphs = decodeEntities(raw)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\u200b/g, "").replace(/\s+/g, " ").trim())
    .filter((p) => p !== "");

  if (paragraphs.length === 0) return { summary: "", responsibilities: [] };

  /**
   * ONE PARAGRAPH IS NOT ALWAYS ONE PARAGRAPH.
   *
   * Some of their records separate every sentence with a non-breaking space
   * rather than a line break, so the whole advert arrives as a single block.
   * Rendered as written it is a twenty-line wall of prose that no candidate
   * reads — and it looked, fairly, like a design failure rather than a data
   * one. Anything past this length with no internal breaks is split into
   * sentences and shown as a list instead.
   */
  const RUN_ON = 400;
  if (paragraphs.length === 1 && paragraphs[0]!.length > RUN_ON) {
    const sentences = sentencesOf(paragraphs[0]!);
    if (sentences.length > 2) {
      // The first sentence still leads as the summary; the rest become the
      // bullets, which is the shape the well-formed records already have.
      return { summary: sentences[0] ?? "", responsibilities: sentences.slice(1) };
    }
  }

  return { summary: paragraphs[0] ?? "", responsibilities: paragraphs.slice(1) };
}

/**
 * Build the apply link. ZOHO_APPLY_URL is their published application form; the
 * opening's reference is passed as a query parameter so the application arrives
 * already tagged to the role rather than the applicant retyping it.
 *
 * ZOHO_APPLY_REF_FIELD is the link name of the field on that form which holds
 * the reference. Unset means no prefill — the link still works, the applicant
 * types it.
 *
 * No form configured → empty string, and the component hides the button rather
 * than offering an "Apply" that goes nowhere.
 */
function applyHref(refNo: string): string {
  const base = process.env.ZOHO_APPLY_URL?.trim();
  if (!base) return "";

  const field = process.env.ZOHO_APPLY_REF_FIELD?.trim();
  if (!field || !refNo) return base;

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}${encodeURIComponent(field)}=${encodeURIComponent(refNo)}`;
}

/**
 * One API row → one Job.
 *
 * ⚠️ THE LOOKUP COMES BACK TWICE. Creator returns the linked JobCodeOpening
 * record both as a nested object AND as flattened keys whose names CONTAIN a
 * dot — "JobCodeOpening.Job_Description1". Those must be read with bracket
 * notation; `row.JobCodeOpening.Job_Description1` reads a property that does
 * not exist on the nested object and silently yields undefined.
 *
 * A row with no designation has no title to render, so it is dropped rather
 * than published as a blank advert.
 */
function toJob(value: unknown): Job | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;

  const opening = (row.JobCodeOpening ?? {}) as Record<string, unknown>;

  const designation = str(opening.Designation);
  if (!designation) return null;

  const refNo = str(row.Ref_No);
  const department = departmentName(str(opening.DepartmentText));
  const country = str(row.Country);
  const workLocation = str(row.Location_of_Work);

  /**
   * THE DESCRIPTION LIVES IN TWO PLACES AND NEITHER IS RELIABLE ALONE.
   *
   * `Job_Description1` is plain text on the linked job-code record and is the
   * better source when present — it reads as paragraphs. `Job_Profile` is a
   * rich-text field on the opening itself, holding pasted Google Docs markup.
   *
   * Their own careers page renders `Job_Profile`, which is why an opening can
   * look complete there and empty here: RV97 has no `Job_Description1` at all.
   * So: prefer the clean text, fall back to the rich field, and reduce either
   * to lines the website renders in its own styles.
   */
  const plain = str(row["JobCodeOpening.Job_Description1"]);
  const { summary, responsibilities } = plain
    ? splitDescription(plain)
    : { summary: "", responsibilities: richTextToLines(str(row.Job_Profile)) };

  /** Their "Candidate Profile" — one requirement per line. */
  const requirements = plainTextToLines(str(row.Candidate_Profile));

  /**
   * A multi-select of qualifications, each carrying its own display value.
   * Joined rather than listed: the facts panel is a definition list of single
   * values, and two degrees is a sentence, not a section.
   */
  const qualifications = Array.isArray(row.Educational_Qualifications)
    ? row.Educational_Qualifications
        .map((q) => (q && typeof q === "object" ? str((q as Record<string, unknown>).zc_display_value) : ""))
        .filter((q) => q !== "")
    : [];

  // Ref_No is unique per opening; the words in front of it are for the reader
  // and for search. Two openings of the same role in the same country are
  // therefore still two distinct URLs.
  const slug = slugify([designation, department, refNo].filter(Boolean).join(" "));
  if (!slug) return null;

  return {
    slug,
    title: designation,
    function: department || "Genedrift",
    location: [country, workLocation].filter(Boolean).join(" · "),
    marketSlug: MARKET_BY_COUNTRY[country.toLowerCase()],
    employmentType: str(opening.Type_field) || str(row["JobCodeOpening.Type_field"]),
    // Not a field on their form. Left empty rather than parsed out of the
    // candidate profile prose, which would be guessing at a factual claim.
    experience: "",
    qualification: qualifications.join(" · ") || undefined,
    summary,
    responsibilities,
    requirements,
    postedOn: publishedDate(str(row.Date_Publish)),
    applyHref: applyHref(refNo),
    reference: refNo || undefined,
    preferredJoining: joiningTime(str(row.Preferred_Date_for_Joining)),
  };
}

/**
 * "30" → "Within 30 days". "Immediate" → "Immediate". Their field holds
 * either a number of days or a word, so anything non-numeric passes through
 * as written rather than being reworded.
 */
function joiningTime(raw: string): string | undefined {
  if (!raw) return undefined;
  return /^\d+$/.test(raw) ? `Within ${raw} days` : raw;
}

/**
 * "26-Aug-2026 23:44:09" → "2026-08-26". Their format is not one Date parses
 * reliably across runtimes, so it is read by hand. An unrecognised value
 * yields no date rather than a wrong one.
 */
const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mar: "03", apr: "04", may: "05", jun: "06",
  jul: "07", aug: "08", sep: "09", oct: "10", nov: "11", dec: "12",
};

function publishedDate(raw: string): string {
  const match = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})/.exec(raw.trim());
  if (!match) return "";
  const month = MONTHS[match[2]!.toLowerCase()];
  if (!month) return "";
  return `${match[3]}-${month}-${match[1]!.padStart(2, "0")}`;
}

export async function fetchJobs(): Promise<JobCollection> {
  const url = process.env.ZOHO_OPENINGS_URL?.trim();
  if (!url) return { jobs: [...JOBS], source: "built-in" };

  try {
    const res = await fetch(url, {
      // Without this the API returns 9210 "Please enter a valid input for
      // 'accept' header key" — which is why the URL looks broken in a browser
      // and works from here.
      headers: { Accept: "application/json" },
      next: { tags: ["zoho-openings"], revalidate: 300 },
    });
    if (!res.ok) return { jobs: [...JOBS], source: "built-in" };

    const body = (await res.json()) as { code?: number; data?: unknown };
    // 3000 is Creator's success code. Anything else is an error payload that
    // still arrives with HTTP 200.
    if (body?.code !== 3000 || !Array.isArray(body.data)) {
      return { jobs: [...JOBS], source: "built-in" };
    }

    const jobs = body.data.map(toJob).filter((j): j is Job => j !== null);

    // An empty list is a REAL state here, unlike markets: a consultancy with no
    // current vacancies is normal, and the openings section already has copy
    // for it. Falling back to placeholder adverts would be far worse.
    return { jobs, source: "zoho" };
  } catch {
    return { jobs: [...JOBS], source: "built-in" };
  }
}

export async function getJobs(): Promise<Job[]> {
  return (await fetchJobs()).jobs;
}

export async function getJob(slug: string): Promise<Job | undefined> {
  return (await getJobs()).find((j) => j.slug === slug);
}

# Careers — how the openings reach the site

**25 September 2026.** The careers pages read the client's live openings from
their own Zoho Creator app. Read this before touching `lib/content/jobs-source.ts`
or anything under `app/careers/`.

---

## The one-line version

Their HR team publishes an opening in Creator → it appears on `/careers` with
its own page within five minutes. No deploy, no developer, no credentials.

---

## Where the data comes from

The client already runs a Creator app called **`proton`** with an **Openings**
form. Their old careers page embedded that report in an iframe — which is what
made it look poor, not the data. We read the same records and render them
properly.

**Do not create a Jobs collection in the website CMS.** Their team already
maintains `proton`; a parallel form would drift within a month.

| | |
|---|---|
| Account owner | `genedrift` |
| App link name | `proton` |
| Report link name | `OpeningsReport` |
| Data centre | **US** (`zohoapis.com`) |

---

## How it is read — no OAuth

Creator's **Publish API** serves a published component using its permalink key
instead of OAuth credentials:

```
GET https://www.zohoapis.com/creator/v2.1/publish/genedrift/proton/report/OpeningsReport
    ?privatelink=<key>&field_config=all
Accept: application/json
```

Three things that each cost time to find:

1. **`Accept: application/json` is mandatory.** Without it the API returns
   `9210 — Please enter a valid input for 'accept' header key`. That is why the
   URL looks broken in a browser and works from the server.
2. **`field_config=all` is mandatory.** The default (`quick_view`) returns only
   the six columns the report displays. The description, candidate profile,
   qualifications and joining time are in the detail-view layout. Without this
   parameter, a role whose text sits in `Job_Profile` publishes as a title with
   nothing under it — that is exactly how the Malaysia opening first appeared.
3. **`code: 3000` is success.** Errors can arrive with HTTP 200, so the reader
   checks the code, not the status.

The full URL including the key lives in **`ZOHO_OPENINGS_URL`** — `.env.local`
and Vercel. It is **not** `NEXT_PUBLIC_`: anyone holding that key can read the
report, so it never reaches the browser bundle.

OAuth (client ID, secret, refresh token) is the tidier long-term arrangement and
would be a change in `jobs-source.ts` only. **Not needed for anything today.**

---

## The fields, and how each is used

| Their field | Becomes | Note |
|---|---|---|
| `JobCodeOpening.Designation` | title | "Astt Manager" — their wording, kept as-is |
| `JobCodeOpening.DepartmentText` | function / eyebrow | the `(DIN17)` code is stripped |
| `Ref_No` | reference, and part of the slug | unique per opening |
| `Country` + `Location_of_Work` | location | "India · WFH" |
| `JobCodeOpening.Type_field` | employment type | |
| `JobCodeOpening.Job_Description1` | summary + "What you will do" | plain text; **preferred** |
| `Job_Profile` | "What you will do" | rich text; **fallback** when the above is empty |
| `Candidate_Profile` | "What you will bring" | one requirement per line |
| `Educational_Qualifications` | qualification | multi-select, joined |
| `Preferred_Date_for_Joining` | preferred joining | "30" → "Within 30 days" |
| `Date_Publish` | posted | "26-Aug-2026 23:44:09", parsed by hand |

⚠️ **The lookup comes back twice** — nested under `JobCodeOpening`, and again as
flattened keys whose names *contain a dot*: `row["JobCodeOpening.Job_Description1"]`.
Dot access on the nested object silently returns undefined.

**Slugs** are `designation-department-refno`, e.g.
`astt-manager-pharmacovigilance-rv98`. Two openings of the same role are still
two URLs.

---

## Their data is uneven — the reader normalises it

Every record passes through `lib/content/sanitize.ts` before a component sees
it, so a badly-formatted record degrades to a simpler page rather than a broken
one:

- **Two description fields, neither reliable alone.** RV97 has no
  `Job_Description1`; their own page renders `Job_Profile`.
- **`Job_Profile` is pasted Google Docs markup** — inline `font-family: Carlito`
  and hardcoded colours. Sanitised, reduced to lines, re-rendered in our styles.
- **HTML entities in plain-text fields** — `&nbsp;`, `&amp;`, `&#39;` arrive
  literally and are decoded.
- **Run-on descriptions.** Some records separate sentences with `&nbsp;` or with
  nothing — "markets.Adequacy Review". Anything over 400 characters with no
  breaks is split into sentences, guarded so "i.e. CTD" stays together.
- **Zero-width spaces** throughout, which survive `.trim()`.

The job page renders only the sections that have content, and an empty state
("The full description for this role is being finalised…") for a title-only
opening.

---

## Falling back

Unset `ZOHO_OPENINGS_URL`, unreachable API, or a non-3000 response → the
built-in placeholder roles in `lib/jobs.ts`, bracketed `[PLACEHOLDER]`.

An **empty list from Zoho is a real state**, not a failure — a consultancy with
no vacancies is normal. It does not fall back to placeholders.

The "sample content" warning on a job page shows **only** for placeholder roles
(`jobSource !== "zoho"`). On a real vacancy it would tell a candidate a genuine
job is fake.

---

## The Apply button — waiting on the client

Always rendered in the design. **Inert until `ZOHO_APPLY_URL` is set** —
visible, not clickable, `aria-disabled`. An Apply that 404s tells a candidate
they have applied when they have not.

Applications go to **their own published application form** — we link to it,
nothing passes through the site, so no credentials are needed. Their form
handles CV and photo uploads.

```
ZOHO_APPLY_URL=<their application form permalink>
ZOHO_APPLY_REF_FIELD=<link name of the field holding the job reference>
```

With the second set, the link carries `?<field>=RV98` so applications arrive
tagged to the role.

---

## Apply, wired 28 September

Their Candidates form (form-embed link, in `ZOHO_APPLY_URL`) has a hidden
lookup, `OpeningsMFLUDropDown`, that takes the opening's **record ID**.
`applyHref()` appends `?OpeningsMFLUDropDown=<row.ID>`. Verified by loading the
form with a real ID: the lookup filled and resolved to RV98. `Ref_No` also
exists on the form as plain text but is not what they asked for.

The client confirmed the Openings report holds **only open roles**.

## Content observations, not raised with the client

Recorded so the next person knows; Piyush chose to keep the 25 Sept email
focused.

- **JP56 (Malaysia) Candidate Profile states "Female candidates preferred."** It
  publishes verbatim. A stated gender preference in a public job advert is
  unlawful in most of their markets. Their content, their call — but it should
  be raised before careers is promoted publicly.
- Descriptions are inconsistently formatted across records (see above). The site
  copes; tidying them in Creator improves the pages with no code change.

## Not built, deliberately

The approved careers design also has a stat row, "Life at Genedrift", eight
benefits, "Two ways in", and a five-step hiring process. **All of that copy is
ours and invented.** Not asked for, not verified, not built. With real vacancies
now on the page, invented benefits beside them would read as commitments nobody
at Genedrift made. Build only when the client supplies the content.

# Case studies in the CMS — setup and how it works

**22 September 2026.** Page family 11 from the 5 September architecture
document, finally built: `/client-success/case-studies` and
`/client-success/case-studies/{slug}`.

It was blocked for three weeks on "3 approved case studies **if the client can
supply evidence**", and the evidence never arrived. It is unblocked because the
evidence was already public: the client has **eight** case studies on
genedrift.com, with their own two-family structure and their own
Scenario / Solution / Result narrative. The build carries those eight.

**Transcribed is not approved.** Nothing was written for them and nothing was
embellished, but the copy still needs their sign-off before launch — some of it
reads as though it was written several years ago. This is on the UAT checklist.

---

## What one case study controls

| Where | What it shows |
|---|---|
| `/client-success/case-studies` | Its card, inside its family group |
| `/client-success/case-studies/<slug>` | Its own page — narrative, numbers, next-study pager |
| `/client-success` | Reached through the section list on the hub |

One record, read by all of them. Same reasoning as markets.

---

## Two forms, not one

Figures are a **list**, not two named fields, for the same reason capabilities
are a list on a market: a third number must be a new row, not a schema change.

### `Website_Case_Studies` — one row per case study

| Field label | Link name | Type | Notes |
|---|---|---|---|
| Case Study Slug | `Case_Study_Slug` | Single Line — **mandatory, unique** | Lower case, hyphens, no spaces. This is the URL: `label-artwork-management` |
| Case Study Title | `Case_Study_Title` | Single Line — mandatory | The client's own title, e.g. `Label / Artwork Management` |
| Family | `Family` | Dropdown — mandatory | `Delivering Excellence` · `Strategic Filing` |
| Teaser | `Teaser` | Multi Line | The one or two sentences shown on the listing card |
| Scenario | `Scenario` | Multi Line | **May be left empty** — see below |
| Solution | `Solution` | Multi Line | **May be left empty** |
| Result | `Result` | Multi Line | **May be left empty** |
| Tags | `Tags` | Single Line | Comma separated: `Labelling & artwork, Regulatory affairs`. Display labels only — nothing links to them |
| Display Order | `Display_Order` | Number | Order within the family. Lower first |
| Active | `Active` | Checkbox, **ticked by default** | Unticking takes it off the site and keeps the record |

**Check every link name in field properties.** Creator silently appends a number
if a name was ever used before, and the publish function reads these names
exactly. This is the failure that cost two days on `Health_Authority`.

The **family slug is not a field**. It is derived from the family name, so a
typed slug can never disagree with the group it belongs to.

### `Website_Case_Study_Metrics` — one row per figure

| Field label | Link name | Type | Notes |
|---|---|---|---|
| Case Study | `Case_Study` | Lookup → Website_Case_Studies — mandatory | Which record this belongs to |
| Metric Value | `Metric_Value` | Single Line — mandatory | `5,000+`, `27`, `2 yrs`. Text, not a number — the `+` matters |
| Metric Label | `Metric_Label` | Single Line — mandatory | `SKUs covered`, `Countries` |
| Display Order | `Display_Order` | Number | Left to right |

⚠️ **Every figure here is a public claim about the business.** It must come from
the narrative it sits beside. Do not add a number to make a page look fuller.

---

## A record with no narrative is a valid record

Scenario, Solution and Result are all optional, and that is deliberate.

Two of the client's eight — **API Vendor Review** and **Biosimilars** — have a
listing summary and nothing behind it on their current site either. They publish
as cards on the listing and have **no detail page**: the card does not link
anywhere, and the URL 404s.

That is the honest state. The alternatives were dropping them, shipping a page
with two empty headings, or writing the missing halves for them — and inventing
a client outcome is the one thing that must never happen on this site.

When the client supplies the missing copy, filling in the three fields and
publishing creates the page. No code change.

---

## Publishing

Same shape as markets: **the whole collection, in one call.**

- Report: `Website_Case_Studies`
- Action item: **Publish case studies** → workflow `Publish_Case_Studies`
- Set execution to run **once for the report**, not once per selected record.
  Otherwise three selected rows fire three publishes.
- Function: `creator/publish_case_studies.deluge` in the repo is the source of truth
- Button action: `creator/publish_case_studies_button_action.deluge`
- Catalyst endpoint: `POST <base>/v1/website/case-studies`
- Public read: `GET <base>/v1/public/case-studies`

No new application variables. It uses the same `Publishing` namespace the page
and market publishers already use.

**Publishing goes live immediately.** There is no draft stage for a collection,
so no test values here — the same warning that applies to markets.

---

## Adding a field later

The seven-step path in `handover.md`, and step 4 is the one that bites:

1. Creator field — check the **link name**
2. `creator/publish_case_studies.deluge` — one `studyItem.put(...)` line
3. `services/catalyst-website/src/case-studies.ts` — the schema
4. `services/catalyst-website/src/service.ts` — **and** the object
   `CaseStudiesService.publish` builds, field by field. Validation accepting a
   field the mapper then drops returns a clean 200 with the key silently
   missing. There is a smoke test guarding exactly this.
5. Deploy Catalyst, then publish again
6. `lib/content/case-studies-source.ts` — parse it in `toCaseStudy`
7. The section component — render it

Verify at `<appsail-url>/v1/public/case-studies` and search for the key. That is
ground truth.

---

## Where the content lives until the CMS has it

`lib/content/case-studies-source.ts` holds the eight records, and the site falls
back to them whenever Catalyst is unreachable or the collection has never been
published — the same deliberate fallback markets use. An **empty** published
collection is treated as no collection, because publishing zero case studies is
far more likely to be an accident than an instruction to empty the section.

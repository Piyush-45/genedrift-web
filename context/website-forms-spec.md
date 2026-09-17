# Website content forms — build spec

Rewritten 2026-09-16 for the **two-form model**. Follow this in the Creator UI.
Every field below is decided — nothing here needs a judgement call while you are
clicking.

---

## Decision 1 — a SEPARATE Creator application

**`GeneDrift Website`, not inside the Editorial Platform app.** Piyush's call,
2026-09-14. The reason is handover: when this moves to the client's Zoho
account they get two independent apps that can be permissioned, supported and
transferred separately.

Consequence: this app shares no records with the editorial app. It does not
need to — see "What this app does NOT need" below.

## Decision 2 — TWO forms, not three

**Superseded 2026-09-16.** The earlier spec had three forms including
`Website_Page_Revisions`, with an eight-state approval workflow. That was the
article model copied across without asking whether a website needs it.
Piyush challenged it and was right.

What the revision table was buying, and where each thing actually comes from
now:

| Need | Three-form answer | Two-form answer |
|---|---|---|
| Save without publishing | Draft revision | Edit sections freely; nothing is live until **Publish** is pressed |
| Rollback | Revision history | **Catalyst.** Every publish is an immutable version; rollback moves a pointer. This was always true — the Creator table was duplicating it |
| Approval gate | `In Review` / `Approved` states | **Dropped.** Genedrift has one or two people touching website copy, not an editorial desk |
| Two people editing one page safely | Separate draft revisions | **Lost.** Last save wins. Acceptable at this scale |

Cost of being wrong: adding `Website_Page_Revisions` later is one form and one
Deluge change. Un-teaching a client three forms is not. If the client asks for
an approval step, add it then.

SEO fields moved up into `Website_Pages`, since there is no revision record to
hold them.

---

## Form 1 — `Website_Pages`

One row per URL. Never deleted — unpublish instead, so the path keeps its
history. Success message: `Page saved.`

| # | Field Name | Type | Required | Settings |
|---|---|---|---|---|
| 1 | `Page_UUID` | Single Line | Yes | Max 64 · **Unique** |
| 2 | `Path` | Single Line | Yes | Max 250 · **Unique**. Leading slash, no trailing slash: `/expertise/pharmacovigilance` |
| 3 | `Internal_Title` | Single Line | Yes | Max 250. Editor-facing, never public |
| 4 | `Page_Family` | Dropdown | Yes | values below |
| 5 | `Status` | Dropdown | Yes | `Draft`, `Published`, `Unpublished` — default `Draft` |
| 6 | `SEO_Title` | Single Line | No | Max 250 |
| 7 | `SEO_Description` | Multi Line | No | 100px |
| 8 | `Robots_Directive` | Dropdown | No | `Index Follow`, `Noindex Follow`, `Noindex Nofollow` — default `Index Follow` |
| 9 | `Canonical_URL_Override` | URL | No | |
| 10 | `Owner_Email` | Email | No | Plain email. No cross-app lookup exists and none is wanted |
| 11 | `Live_Publication_ID` | Single Line | No | Max 128. **Written by Catalyst's reply, never typed.** This is what makes rollback possible |
| 12 | `Last_Published_At` | Date-Time | No | Written by the publish function |
| 13 | `Publish_Note` | Multi Line | No | 100px. "What changed", for the publish log |

**`Page_Family` values** — this drives nothing in code today; it exists so the
client can filter a long page list sensibly.

```
Home
Hub
Detail
Market Region
Market Country
Article Listing
Article
Job
Contact
Institutional
```

**`Status` values:**

```
Draft
Published
Unpublished
```

Default: `Draft`.

> Three states, not eight. `Draft` means never been live. `Published` means
> live. `Unpublished` means it was live and was pulled. Catalyst decides what
> the site actually serves; this field is what the editor sees.

---

## Form 2 — `Website_Sections`

The ordered sections that make up a page. Success message: `Section saved.`

A separate form with a lookup, not a subform — the same pattern
`Article_Contributors` already proves in the editorial app, and ordering is
explicit rather than implied by row position.

| # | Field Name | Type | Required | Settings |
|---|---|---|---|---|
| 1 | `Section_UUID` | Single Line | Yes | Max 64 · **Unique** |
| 2 | `Page` | Lookup → `Website_Pages` | Yes | Display field: `Path` |
| 3 | `Display_Order` | Number | Yes | Use 10, 20, 30… so a section can be inserted without renumbering everything |
| 4 | `Section_Type` | Dropdown | Yes | the 25 values below |
| 5 | `Section_Data` | Multi Line | No | 400px. The JSON payload |
| 6 | `Hidden` | Checkbox | No | Default unchecked. Hides a section without deleting it |
| 7 | `Is_Required` | Checkbox | No | Default unchecked. Marks sections the client may edit but not remove |
| 8 | `Notes` | Multi Line | No | 100px. Editorial notes, never published |

### `Section_Type` values — exactly these 25

```
article-body          article-grid          article-head          capability-panels
capability-status     contact-form          contact-split         country-head
explore-journeys      faq-accordion         hero-map              industry-index
insight-feed          job-detail            job-list              market-directory
metric-row            page-head             pill-row              process-grid
proof-billboard       region-cards          statement             sub-capability-grid
value-grid
```

They must match `public/section-schemas.json` character for character —
Catalyst rejects a type it does not recognise, which is the intended behaviour.
**Regenerate this list from that file rather than copying it from memory**; it
is emitted on every `npm run build`.

> Changed 2026-09-16: `industry-accordion` became `industry-index` when the
> client chose concept B, and `market-directory` was added for the new Global
> Presence page. If you built the dropdown before this date, fix those two.

**Do not add a field per section type.** All 25 shapes live in `Section_Data`.
That is what makes section 26 cost zero Creator work.

**Editors never see raw JSON.** `Section_Data` is a plain text field because
that is what Creator can store; the editing widget renders proper fields from
`section-schemas.json`. Until that widget exists, editing JSON by hand is a
developer task, not a client task — do not hand this form to the client yet.

---

## What this app does NOT need

Stated plainly, because an earlier draft of this file said the opposite:

| Thing | Verdict |
|---|---|
| A media / image system | **Not needed.** Every visual on the site is SVG drawn in code. The only images anywhere are article images, which come from the editorial platform through Catalyst |
| A people list | **Not needed.** `Owner_Email` is a plain email field |
| An audit trail | **Later.** Catalyst records every publication immutably, which answers "what went live and when" |
| Redirects | **Later.** Nothing has moved yet |
| A job pool / scheduled publishing | **Not needed.** Website pages publish immediately. Add only if the client asks to schedule changes |
| A revisions table | **Dropped** — see Decision 2 |

The two apps share no records, by design. That is what makes each one
independently transferable.

---

## Order of work

1. These 2 forms — about 40 minutes
2. Catalyst `website_page` — the publish endpoint and the public read endpoint
3. **One page, ONE section type, end to end** before anything else is built
4. Then the remaining pages, then the editing widget

Do not build anything else before step 3.

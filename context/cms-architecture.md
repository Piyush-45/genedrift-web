# CMS architecture — Creator, Catalyst, and this app

Written 2026-09-13, answering: what does the content architecture look like, how
many Creator forms and subforms does it need, how do we build them, and in what
order.

Read `integration.md` first for the three-box picture. This file is the level
below it.

---

## 1. The decision everything else hangs off

A page is an **ordered list of sections**, and each section type has a different
shape. `statement` has an eyebrow and two heading halves. `region-cards` has six
regions each holding up to seventeen market links. `proof-billboard` has three
case stories with tag arrays.

Creator has no concept of a discriminated union. So there are three ways to
store that, and the choice decides how much manual form-building we do — not
just now, but every time we add a section type for the rest of the engagement.

| Option | Creator forms | Cost of section type #27 |
|---|---|---|
| A. One form per section type | ~26 forms | Build a whole new form, by hand |
| B. One form, superset of every field, shown/hidden by type | 1 form, ~150 fields | Add fields to a form already at the field limit |
| C. **One subform: `Section_Type` + typed payload + relationship fields** | **1 subform** | **Zero Creator work** |

**We are doing C.** Not because it is clever — because A and B both mean the CMS
has to be edited every time the website gains a section, and that is the thing
that makes a CMS handover rot.

### Why C is not "make the client edit JSON"

The client never sees JSON. The editor widget (already built, in the other repo)
renders the form. What it renders *from* is the point:

```
components/sections/<name>/schema.ts     ← the Zod schema. Already written.
        │
        ├── z.toJSONSchema()  →  public/section-schemas.json
        │                            │
        │                            ├──▶ editor widget renders the form
        │                            └──▶ Catalyst validates on publish
        │
        └── z.infer<>          →  the React component's props
```

One definition, four consumers: the component's types, the editor's form fields,
Catalyst's publish-time validation, and this app's read-time validation. They
cannot drift, because there is only one of them.

That is also the answer to "there is no language we can run to make the forms."
There is — it is the Zod schemas, and they already exist for the eight sections
built so far. The widget is the renderer; Creator is just the store.

### The payload / relationship rule

Not everything goes in the payload. The rule:

> **If a human types it, it is payload. If it points at another record, it is a
> relationship field.**

`region-cards` is the clearest case. Its payload holds an eyebrow and two
heading halves — about thirty words. The six regions and forty-six markets are
**not** in the payload; they are a relationship to the `Regions` and `Markets`
collections. That is what makes "edit a market once, every page referencing it
refreshes" work, and it is what the blueprint means by resolving relationships
to explicit published versions.

Get this line wrong in the direction of payload and you get the same market name
stored in nine places. Get it wrong in the direction of relationships and the
client has to create a record to change a heading.

---

## 2. The forms

### Governance — 3 forms, 1 subform

| Record | Shape | Notes |
|---|---|---|
| `Website_Pages` | form | Stable identity: path, page family, owner, state. One row per URL, never deleted. |
| `Website_Page_Revisions` | form | Draft / in-review / published. SEO title, meta, canonical, robots. Many per page. |
| ↳ `Website_Sections` | **subform** of Revisions | Ordered rows: `Section_Type`, `Section_Data` (payload), relationship fields, `Hidden`. |
| `Website_Redirects` | form | Old path → new path. Technical, not a client editing area. |

`Website_Sections` is a **subform, not a standalone form**. Sections belong to
exactly one revision, are ordered, and die with it — that is precisely what a
subform is. Making it a standalone form means hand-maintaining a sort order
column and orphan cleanup for no gain.

Review assignments, publication jobs and audit events **reuse the article app's
existing records**. Do not rebuild them with a `Website_` prefix.

### Reusable collections — 13 forms, 5 subforms

These are real relational data, used by many pages. They earn their own forms.

| Record | Subform | Feeds |
|---|---|---|
| `Regions` | — | region-cards, market pages, nav |
| `Markets` | ↳ `Capability_Status` | region-cards, hero map, template D |
| `Capabilities` | ↳ `Sub_Capabilities` | capability-panels, template B |
| `Industries` | ↳ `Product_Types` | industries section, template C |
| `Case_Studies` | ↳ `Tags` | proof-billboard, market and capability pages |
| `Jobs` | — | template G |
| `People` | — | leadership |
| `Offices` | — | contact, world clock |
| `Explore_Journeys` | — | explore section |
| `Proof_Points` | — | metrics rows |
| `FAQs` | — | template C |
| `Calls_To_Action` | — | contact-split routes |
| `Global_Content` | ↳ `Footer_Columns` | header, footer, contact details |
| `Nav_Items` | — | self-referencing parent for the mega menu |

**Totals: ~17 forms, ~6 subforms.** That lines up with the blueprint's
seventeen record types, and it does not grow when the site gains sections.

### What is deliberately *not* a form

The 26 section types. All of them live in the one `Website_Sections` subform.
That is the whole saving.

---

## 3. Building the forms

You are right that Zia is not the tool for this and that most of it is manual.
But before committing ~20 forms of clicking, two levers are worth one hour of
testing, because they are the difference between a day and a week.

**1. `.ds` import.** A Creator application's structure is stored as a `.ds`
file — plain text — and an app can be *created* by importing one. Build one
collection form by hand, export the app, and read the `.ds`. If the format is
authorable, generate the remaining flat collections from the same Zod schemas
and import once. If it is not, you have lost an hour and you build by hand
knowing you checked.

**2. Create-form-by-importing-data.** Upload a CSV and Creator infers the fields
from the headers. Crude, no subforms, no validation — but it does two jobs at
once for the flat collections (`Markets`, `Offices`, `People`, `Jobs`): it makes
the form *and* seeds the rows. The build plan already wants seeded placeholder
content rather than empty forms, so this is not wasted.

Neither lever handles subforms, Deluge or workflow. So:

- **Governance forms: manual.** There are only three. Subforms and publish logic
  make them hand work regardless.
- **Flat collections: try the levers first.**
- **Collections with subforms** (Markets, Capabilities, Industries,
  Case_Studies, Global_Content): manual, or import the parent and add the
  subform by hand.

---

## 4. Workflow, end to end

```
1.  Editor opens a page in the Website Workspace
2.  Widget reads public/section-schemas.json, renders typed fields per section
3.  Save  →  draft revision + section rows in Creator.  Public site unchanged.
4.  Preview  →  authenticated route renders the draft with the REAL components
5.  Review  →  approve, or request changes
6.  Publish  →  Catalyst validates: section contracts, relationships resolve to
                published versions, paths exist, media exists
7.  Catalyst writes an immutable snapshot, advances the pointer, one operation
8.  Catalyst fires revalidation for affected paths and tags
9.  Vercel serves the new version.  Rollback = move the pointer back.
```

Three validation gates, all from the same schema: the widget on edit, Catalyst
on publish, this app on read. A malformed save fails typed at step 6 — it never
reaches production.

---

## 5. Build order

The blueprint says the Home vertical slice should be the first CMS
implementation, and it is right. But **slice means one section, not twelve.**

### Now — no CMS coupling

- Finish the remaining homepage sections against fixtures. Hero + map needs
  `scripts/build-map.ts`; industries needs the client's A/B/C choice.
- Port the two Insights templates out of the old `frontend/` and cut over.

### Parallel — no Creator needed

- Catalyst `website_page` content type.
- Export `public/section-schemas.json` from the Zod schemas. This is the
  contract both other teams build against, so it lands early.

### Then — Creator, in three waves

1. **Governance** (3 forms + 1 subform) and **one section type end to end**.
   Prove edit → preview → review → publish → render. One section proves it as
   well as twelve, and rework at this stage is cheap.
2. **Unblocked collections**: Capabilities, Case_Studies, Industries (shape
   only), Global_Content, Nav_Items, CTAs, Proof_Points, FAQs, Explore_Journeys.
3. **Blocked collections**, once the client answers: Markets and Regions (the
   capability-count question), Jobs (Recruit vs Creator).

---

## 6. Why not start the full homepage on the CMS now

Three reasons, in order of how much they cost to get wrong:

1. **`Markets` is blocked.** Whether a market always has exactly three
   capabilities decides whether `Capability_Status` is a subform or three
   fields. Wrong answer means migrating 46 records — and both `region-cards`
   and the hero map read it.
2. **The client has not reviewed the built sections.** The round-three email
   went out 2026-09-12 and Ashish has not replied. Wiring CMS fields to sections
   he may change means doing the rework twice, in two systems.
3. **`Jobs` is blocked** on Recruit vs Creator, which decides whether that
   collection exists at all.

None of these block the fixture-driven build. All of them block the CMS. So the
fixture work continues at full speed and the CMS starts with the parts that no
client answer can invalidate.

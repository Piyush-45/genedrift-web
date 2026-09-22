# Client sitemap vs. what is live

**Rewritten 2026-09-22.** An earlier version of this file listed the Company and
Careers topics as missing pages. That was wrong and overstated what is owed —
see "What the earlier version got wrong" at the bottom. Check this against the
sources before repeating any of it to the client.

---

## The three documents, and which one governs

| Document | Whose | What it actually is |
|---|---|---|
| `reference/PHASE_2_WEBSITE_REVAMP_CLIENT_BASELINE.md` | **theirs** (summarised from their docx/PDFs) | Nine IA pillars, topic lists per pillar, a URL pattern list |
| `reference/PHASE_2_WEBSITE_INFORMATION_AND_EDITING_ARCHITECTURE_2026-09-05.md` | **ours** | Our architecture proposal, 14 page families, and a **recommended launch scope** |
| `reference/PHASE_2_CMS_FORM_AND_COMPONENT_BLUEPRINT_V1.md` | **ours** | The CMS collections that follow from it |

This distinction matters commercially. The client's baseline is a wish list with
patterns. Our IA document is a plan. **Neither is an approved scope**, because
their own closing question — *"Which exact pages are required for the first
launch versus future phases?"* — was never answered, and our own document's
status line says *"launch scope and visual direction still require selection"*.

So the honest framing is: **the build follows our documented recommendation, and
the client never selected anything.** Not "they agreed", and not "we missed
things".

---

## Their baseline is topic lists, not pages

Under each of the nine pillars they list content topics — 15 under Company, 8
under Careers, 8 under Client Success, 15 under Knowledge Hub, 6 Contact
intents. Their **URL architecture** does not mirror those lists. It gives
generic patterns:

```
/company/{page-slug}          <- one line, not fifteen
/careers/{job-slug}
/contact/{intent-slug}        "only where standalone pages are approved"
```

And immediately under that list they write:

> *"Not every sitemap item should become a unique static page. Preserve the IA
> while avoiding page proliferation."*

Our IA document made the same point with a number: if every named item became a
page it would be **about 96 pages**, "thin pages and a large content burden".

**Therefore: a topic in their bullet list is not a commitment to a page.**
"Culture" and "Benefits" as sections on `/careers` is a legitimate reading of
their brief, and is what is built.

---

## Our recommended launch scope, and what was delivered against it

From our IA document, §"Recommended launch scope":

| Recommended | Delivered |
|---|---|
| All 9 top-level hub/landing destinations | ✅ all 9 |
| All 6 primary Expertise pages | ✅ all 6 |
| All 5 Industry pages *"if useful content exists"* | ⚠️ built as a homepage section — see below |
| 4 regional Markets pages | ✅ **6** |
| **6 to 10 priority country pages** | ✅ **46** |
| 5–6 priority Explore journeys | ✅ 3 pages carrying the journeys |
| **3–5 essential Company pages: About, Leadership, Operating Model, Quality & Compliance, Global Presence** | ✅ **all five** |
| 3 approved case studies *"if the client can supply evidence"* | ❌ no evidence ever supplied |
| Careers landing and Contact | ✅ both, plus 4 contact intents and 46 job routes |
| Insights archive and published articles | ✅ |

Estimated range in that document: **37–46 curated launch pages.** The build is
comfortably above it, mostly because 46 country pages were built where 6 to 10
were recommended.

**The Company list is not outstanding.** Our own launch scope names exactly the
five that exist. The other ten topics — Our Story, Why Genedrift, Corporate
Values, Governance, Technology Platform, Partners, Awards, News, CSR, Media
Kit — were deprioritised in that same document, deliberately.

Same for Careers: "Careers landing and Contact" is what was recommended, and it
is what exists. The eight Careers topics were never launch scope.

---

## What is genuinely not built

Three things, and they are not equal.

### 1 · Case studies — the real one

- Page family **11** in our IA document: `/client-success/case-studies/{slug}`,
  "repeatable proof record".
- `Case_Studies` is collection **10** in the CMS blueprint.
- `/client-success/case-studies/{case-slug}` is in the client's own URL list.
- Named in the launch scope as *"3 approved case studies if the client can
  supply evidence"*.

Specified in three documents, so this is a real page family that does not exist —
in the site or in the CMS. **But it was conditional on evidence the client never
supplied**, and their own blueprint lists "approved case studies, client names,
outcomes and metrics" as content still owed by them.

For a consultancy these are usually the most-read pages on the site, and
`/client-success` is currently a hub leading nowhere. Worth raising — as a
content dependency, not as a delivery failure.

### 2 · Regional regulatory guides — specified, never scheduled

`/markets/guides/{guide-slug}` in their URL list, and under Markets they write
"market features include compare markets, regional regulatory guides and an
interactive coverage map". Named twice, but **not in the recommended launch
scope**, and our IA document counts market guides among the things added *after*
the launch package. Future phase unless they say otherwise.

### 3 · Contact routes — two of six

They name six intents: Request Proposal, Schedule Consultation, Partnership
Enquiry, Location, Media Enquiries, General Contact. Built: general enquiry,
proposal, partnership, plus the adverse-event route (their September request,
deliberately disabled). Missing: Schedule Consultation, Media Enquiries,
Location.

Their own URL line says standalone intent pages exist *"only where approved"*,
so this is a decision rather than a gap.

---

## Where the build deliberately differs, with the reasoning

**Industries.** Our IA document proposed page family 5, "repeatable industry
record", and the launch scope said "all 5 Industry pages **if useful content
exists**". It never did. Meanwhile the client's own baseline says *"Industry/
product categories are cross-cutting classifications, not primary
capabilities"*, industries is not one of their nine pillars, and it has no
section in their sitemap. So it is built as a homepage section. Defensible, but
it is a deviation from our own plan and should be named rather than buried.

**Sub-capability pages.** Their URL line is qualified "only when content depth
warrants it", and our page family 4 says sub-capabilities "start as sections".
Built as sections. Consistent with both documents.

**Article URLs.** Built as `/insights/{slug}` — Phase 1's shape, which our page
family 10 explicitly allows ("current `/insights/{slug}`, later optional typed
routes"). Their open question 2 asks whether to migrate to
`/insights/{content-type}/{slug}` with redirects. Unanswered. Migrating later
costs a redirect for every published article, so it is worth forcing an answer.

**Market comparison.** `/markets/compare` is in their URL list and is page family
8, "scope must be approved". They explicitly **cancelled** it on 15 September.
Correctly absent.

---

## Built and not in their baseline

- `/global-presence` — requested 15 September, approved, newer than the baseline.
- `/search` — ours.
- `/legal/privacy`, `/legal/terms`, `/legal/cookies` — **ours**. No legal URLs
  appear in their baseline, though it does list legal, privacy, cookie and
  accessibility copy as content still owed. The links are currently hidden in
  Creator because the pages do not exist.

---

## Data gaps, which are separate from page gaps

- Their Middle East list names **Qatar, Oman, Kuwait and Bahrain**; the site
  carries Saudi Arabia and UAE. Either four markets are missing from the data or
  the baseline overstates coverage.
- 46 markets in the hero versus "30+" in other client material.
- Capability data across all 46 markets is unconfirmed.

---

## What to actually say to the client

Not a list of missing pages — that invites "so build them". Something closer to:

> Your baseline lists content topics under each section without specifying which
> become pages, and notes that not every item should. The build follows the
> launch scope in our 5 September architecture document, and exceeds it — 46
> country pages against a recommended 6 to 10. Two things in that scope are
> outstanding and both need you: case studies, which were conditional on
> approved evidence, and the decision on which remaining topics become pages
> versus sections. Your own question 1 from the baseline has never been
> answered, and it governs the rest.

---

## What the earlier version of this file got wrong

Recorded so the same mistake is not repeated.

It listed the ten remaining **Company** topics and the eight **Careers** topics
as missing pages. They are not: our own recommended launch scope names exactly
the five Company pages that exist and deprioritises the rest, and specifies
"Careers landing and Contact", which exist.

The error came from reading the client's topic lists as a page manifest and not
cross-checking against the launch scope in our own architecture document. The
client's baseline says explicitly that not every item becomes a page; our
document put a number on the alternative. Read both before answering a scope
question.

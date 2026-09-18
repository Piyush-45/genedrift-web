# Genedrift website — client sitemap vs. what is live

**18 September 2026.** Compared line by line against the client's own
`Genedrift Final Sitemap Vendor Development Brief` baseline (5 September),
not from memory.

**Their own open question #1, never answered:**
> "Which exact pages are required for the first launch versus future phases?"

Everything below is that question, made concrete.

---

## The nine pillars

All nine top-level pillars from their IA exist and are reachable.
Home · Explore · Expertise · Markets · Knowledge Hub · Client Success ·
Company · Careers · Contact.

The gaps are all *depth*, not structure.

---

## Pillar by pillar

### Explore — complete enough

Their baseline lists ten outcome-led journeys. Three pages exist
(Business Needs, Guided Journeys, Questionnaire) and the journeys live as
content inside them. Consistent with their instruction not to turn every
sitemap item into a page.

### Expertise — complete at the level built

All six canonical capabilities have pages. Sub-capabilities (eCTD publishing,
QPPV, PSUR/PBRER, and about twenty more) are named in the baseline as
*"important sub-capabilities"*, and the URL line for them is qualified
**"only when content depth warrants it"**. Not built; conditional by their
own wording.

### Industries — not a gap

Their baseline says plainly: *"Industry/product categories are cross-cutting
classifications, not primary capabilities."* Industries is not one of the nine
pillars and has no section in their sitemap. It is built as a section on the
homepage, which matches that description. The `/industries/{slug}` line in
their URL list is inconsistent with the rest of their own document.

### Markets — built, but the market list is short

Regions, 46 country pages and the interactive coverage map are live.

Three things from their baseline are not:

| Item | Status |
|---|---|
| Compare markets | **Cancelled by the client, 15 September.** Correctly absent |
| Regional regulatory guides (`/markets/guides/{slug}`) | Not built, never discussed since |
| Middle East: Qatar, Oman, Kuwait, Bahrain | **Not in the market data at all** |

The last one matters. Their baseline names six Middle East markets; the site
carries two (Saudi Arabia, UAE). Either four markets are missing from the data
or the baseline overstates coverage. This is the same class of problem as the
"46 markets vs 30+" discrepancy already raised.

### Knowledge Hub — the article pipeline, not the full ecosystem

Their baseline lists sixteen content types. Live: Insights with category
filters for Regulatory Updates, Country Intelligence, Whitepapers, Expert
Opinions and Authority News.

Not built: Regulatory Roadmaps, Market Entry Guides, Learning Centre,
Webinars, Videos, Downloads, Regulatory Calendar, Newsletter. Their baseline
already marks the AI Knowledge Assistant as a future feature.

Also open, and it is **their** question #2: whether article URLs stay at
`/insights/{slug}` (Phase 1's shape, which is what is live) or migrate to
`/insights/{content-type}/{slug}` with redirects. Migrating later costs
redirects for every published article.

### Client Success — hub only

Their baseline lists a full "proof ecosystem": Case Studies, Client Stories,
Industry Experience, Success Metrics, Delivery Models, Global Programs,
Strategic Partnerships, Featured Projects.

Live: a hub page with no children. There is **no case-study record type
anywhere in the system** — not in the site, not in the CMS.

This is the largest genuine gap. For a consultancy, case studies are usually
the most-read pages on the site, and they cannot be invented: they are client
work, with client permissions attached.

### Company — four of fifteen

Live: About, Leadership, Operating Model, Quality & Compliance.

In their baseline and not built: Our Story, Why GeneDrift, Corporate Values,
Corporate Governance, Technology Platform, Partners, Awards, News, CSR,
Media Kit. (Global Presence is built, at `/global-presence`.)

Each is a short page. None can be written without their words.

### Careers — page built, programme content not

Live: the careers page and job detail pages.

In their baseline: Life at GeneDrift, Culture, Benefits, Graduate Program,
Experienced Professionals, Recruitment Process, Talent Community. Current
Openings is built but not connected — it still needs the report URL and
credentials.

**All careers content currently on the site is placeholder and was written by
us.** It must not go live as-is.

### Contact — four of six routes

| Their route | Status |
|---|---|
| General Contact | ✅ `/contact/enquiry` |
| Request Proposal | ✅ `/contact/proposal` |
| Partnership Enquiry | ✅ `/contact/partnership` |
| Adverse event / safety | ✅ built, **deliberately disabled** pending routing and accountable owner |
| Schedule Consultation | ❌ |
| Media Enquiries | ❌ |
| Location | ❌ |

And the form itself delivers nowhere until the Creator endpoint is supplied.

---

## Built and not in their baseline

- `/global-presence` — requested 15 September, approved, newer than the baseline.
- `/search` — ours.
- `/legal/privacy`, `/legal/terms`, `/legal/cookies` — **ours**. No legal URLs
  appear anywhere in their baseline, though it does list legal, privacy, cookie
  and accessibility copy as content still owed. Currently 404 and hidden.

---

## Summary

**Structural gaps, in order of commercial weight**

1. **Case studies** — a whole content type, absent from site and CMS.
2. **Company pages** — ten short pages, all needing their words.
3. **Careers programme content** — seven pages, plus the live openings feed.
4. **Regional regulatory guides** — a content type, never discussed since the baseline.
5. **Contact routes** — Schedule Consultation, Media Enquiries, Location.
6. **Knowledge Hub content types** — eight beyond the article pipeline.

**Data gaps**

- Four Middle East markets named in their baseline and absent from the site.
- Capability data unverified across all 46 markets.

**Decisions owed by them**

- Which of the above is launch scope and which is a later phase (their question 1).
- Article URL shape: keep `/insights/{slug}` or migrate (their question 2).

**Not gaps**

- Industries — correctly built as a cross-cutting section, per their own wording.
- Compare markets — they cancelled it.
- Expertise sub-capability pages — conditional in their own baseline.

---

## Note on scope

The baseline document sets Phase 2 as *"three sample templates/design
concepts... not full production implementation"*, with the production build to
follow once a direction was chosen. What is live is already well beyond that.
Worth establishing in writing which of the above was ever in the current
engagement before it is assumed to be.

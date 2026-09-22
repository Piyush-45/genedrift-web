# Progress

Update this file at the end of a working session. It is the first thing a new
chat reads after `00-start-here.md`.

---

## Status as of 2026-09-22 — case studies, the last real page family

`/client-success/case-studies` and `/client-success/case-studies/{slug}` are
built and CMS-editable. This was page family 11 in the 5 September architecture
document, collection 10 in the CMS blueprint, and in the client's own URL list —
the one item the scope analysis called a genuine gap.

**What unblocked it.** The launch scope said "3 approved case studies *if the
client can supply evidence*", and the evidence never came. It turned out to be
public: genedrift.com carries **eight** case studies, grouped into two families
the client named themselves — Delivering Excellence and Strategic Filing — each
written as Scenario, Solution, Result. The build carries all eight, in their own
words, with nothing written for them.

**The content model follows theirs**, not a richer one we invented and then
asked them to fill. Three narrative fields, a teaser, tags and an optional list
of figures — figures only where a number already appears in the narrative.

**Two records have no detail page.** API Vendor Review and Biosimilars have a
summary and nothing behind it on the client's own site. Their cards do not link
anywhere and their URLs 404. Filling in the three fields in Creator creates the
page; no code change.

**Shipped in this pass**

- `lib/content/case-study.ts` and `case-studies-source.ts` — the record and a
  CMS-first reader with the built-in eight as the fallback, same contract as
  markets
- three sections: `case-study-index`, `case-study-head`, `case-study-body`,
  resolved through `resolve.ts` so they can move onto a CMS page later without a
  rewrite
- `app/client-success/case-studies/` — a static segment, so it wins over
  `[pillar]/[slug]`; that path is excluded from `detailRoutes()` so nothing
  prerenders a dead second copy
- Catalyst: `case-studies.ts`, `CaseStudiesService`, store methods, publish,
  rollback and public-read routes, plus six smoke checks — **72/72 passing**
- `creator/publish_case_studies.deluge` and its button action
- `metric-row` now sizes its grid to the item count; two metrics no longer draw
  a half-width empty cell
- "Case Studies" added under Client Success in the nav, so the hub leads
  somewhere

**Setup instructions for Creator are in `case-studies-cms.md`.** Two forms,
`Website_Case_Studies` and `Website_Case_Study_Metrics`, no new application
variables.

**Still owed by the client:** a read-through of the eight, since transcribed is
not approved, and the narrative for the two summary-only records.

---

## Status as of 2026-09-21 — the map highlights countries, and the hero re-laid out

The last open item from the client's September review is closed. Everything
below shipped between 18 and 21 September.

### The country highlight (client 1.3 and 1.5)

The map carries real country geometry for the first time, from Natural Earth
**`ne_10m_admin_0_countries_ind`** — the India point-of-view edition, de jure
rather than de facto. `lib/map/land.ts` is regenerated from the same file in the
same run so the base silhouette and the 46 market shapes cannot drift apart.
Full detail in **`map-geometry.md`**; read that before touching `lib/map/`.

**The highlight is a blurred fill, and the blur is the requirement.** 1.3 asks
for the whole country and 1.4 forbids prominent boundaries — a fill has an edge
and that edge is a border, but a feathered fill has no edge to read as a line.
The client's own reference image showed this, which is how a tension we had
flagged as unresolvable got resolved. Do not stroke the shape.

Three layers: base landmass, a wide halo in accent-soft, and a core filled with
a radial gradient whose source is the country's own interior point. That last
part is what makes it read as lit from within rather than painted over.

Shapes are rendered into `<defs>` by the server and referenced with `<use>`, so
43KB of paths stream as HTML and never enter the client payload. `<use>` carries
the hit area too, so the country is hoverable without the client holding any
geometry.

### 25 of the 46 markers were outside their own country

Found because Piyush noticed Sri Lanka sitting on the Tamil Nadu coast. It was
not alone: Chile's marker was in Argentina, Malaysia's at sea, South Africa's
45px north of South Africa.

The error is systematic — equatorial markers too far north, far-northern ones
too far south — the signature of marker positions laid out against a different
latitude mapping from the landmass. They came from the approved artwork, so it
has been wrong from the beginning; a lone dot near a country looks fine, and
only lighting the country up exposes it.

Positions are now derived: the generator computes each country's pole of
inaccessibility and `markets-source.ts` prefers it over the stored x/y, for both
CMS and built-in data. **Map X / Map Y in Creator therefore have no visible
effect** for any market with geometry, which needs saying at handover.

### Mobile hero rebuilt

Fitting the map into 390px rendered every marker at about 2px with
sub-fingertip hit areas. Below `lg` it is now **cropped** in CSS — one SVG, no
second copy of the path data — to the region carrying 37 of the 46 markets, and
a **"Find your market"** search is the way in. Prefix matches rank first, so
`ind` offers India before Indonesia; submitting navigates rather than filtering
in place, which would push the page around mid-type.

The second hero action gained an outline at every width. As bare text beside a
filled button it read as a heading and was being skipped.

### The authority strip, and a Catalyst bug worth remembering

Markets gained a `Health_Authority` field end to end: Creator form → Deluge →
Catalyst schema → reader → hero strip → country pages. Derived from the market
record rather than typed into the homepage, because an authority belongs to a
market and a second list would drift.

**The bug:** the field was added to the Catalyst publish schema but not to the
object `service.ts` builds from it. Validation accepted it and the mapper
dropped it one line later. The publish returned a clean 200 and the only symptom
was a key missing from the public JSON, with no error anywhere. The mapping is
field-by-field on purpose so a spread cannot leak Creator's payload into the
public API — the cost is that a new field must be added in two places.

Second trap, same feature: publications are **immutable**. Publishing before the
new Catalyst build was deployed froze a document without the field, and
redeploying did not retroactively fix it. Field → Deluge → deploy → publish, in
that order.

### Both strips became full-width running bands

They shipped as one-line steppers inside the 420px status column — the worst
place on the page for something whose job is to run. The client asked for both
to glide like the updates ticker; they now use the ticker's own
duplicate-and-translate mechanism and sit under it as full-width bands.

Worth knowing when someone asks why a name is hard to catch: **stepping was
better for reading**, and the client chose motion with that trade named.

Moving them out also let the hero return to the approved design's **632px**,
which the bulletin had pushed to 688.

### Also closed

- `/industries/*` links removed. The approved concept-B design has no links in
  it; a per-industry CTA had been added beyond the design and 404'd live. See
  the 2026-09-18 entry in `decisions.md` — those pages are not a gap.
- Section defaults regenerated. `npm run emit:schemas` runs as part of
  `npm run build`; a few builds used `npx next build` and shipped stale
  defaults, which reached a CMS page as an undefined label.

### Documents added this week

`handover.md` · `map-geometry.md` · `sitemap-gap-analysis.md` ·
`map-highlight-options-note.md` · `uat-checklist.md`

### Still open

Unchanged, and all of it is content or decisions owed by the client.
`handover.md` has the full picture; `sitemap-gap-analysis.md` has the scope
comparison against their own sitemap.

---

## Live — 2026-09-17

The site is on the internet and the CMS loop is verified end to end: a line
added to the Leadership page in Creator appeared on the live site.

| Piece | Where |
|---|---|
| Repo | `Piyush-45/genedrift-web`, private, branch `main` |
| Host | Vercel, team `ztm`, project `genedrift-web`, preset **Next.js** |
| Domain | `www.genedrift.site` — DNS was already pointing at the old preview project, so it moved with no GoDaddy change |
| Publishing API | Catalyst AppSail, same base URL as before |
| CMS | Creator `genedrift-website` |

### Three things to know about this deployment

**Vercel auto-detected the wrong preset.** It found the Express service in
`services/catalyst-website` and offered a multi-service build. It was changed
to **Next.js** by hand. Do not accept the `vercel.json` it suggests — it
rewires the build to the service, not the site.

**`SITE_INDEXABLE` is off.** Only the exact string `"true"` makes a deployment
crawlable. Both halves are wired: `app/robots.ts` serves `Disallow: /` and
`next.config.ts` sends `X-Robots-Tag: noindex, nofollow`. Verified live —
a fetch of the site was refused by robots, which is the proof.

**Three env vars were deliberately left empty** — `CATALYST_API_TOKEN`,
`CREATOR_CONTACT_ENDPOINT`, `CREATOR_CONTACT_TOKEN`. All three are optional in
code. The consequence of the second one is real and worth saying out loud:
**the contact form accepts a submission and delivers it nowhere.** That needs
the Creator endpoint before anyone is invited to use the site.

### Cache timing — what "1m" actually means

`revalidate: 60` does not mean the page refreshes every minute. It means the
page goes *stale* after 60 seconds; the next request after that serves the old
copy and regenerates in the background. So a change shows on the **second**
reload, not the first. This is also why `npm run dev` never shows it —
revalidation is a production behaviour. Use `npm run build && npm run start`.

The Creator publish buttons skip the wait by calling `/api/revalidate`
directly, which is why an editor sees their change immediately.

### Still outstanding on our side

- **Add the bare `genedrift.site`** in Vercel. Only `www.` resolves today.
- **Revoke the GitHub token** that was printed to a terminal during setup:
  GitHub → Settings → Applications → Authorized OAuth Apps → GitHub CLI →
  Revoke.
- **Rotate both signing secrets** before handover.
- **Creator trial expired 2026-09-18** — everything built this week lives in
  that application.
- Rename the certifications report button to "Publish menu & footer" (it
  publishes all three forms; the name is the only thing wrong).
- Read-only system fields (Key, Link, Parent Key, CTA Link) are hidden on the
  forms rather than permission-locked. Deferred to handover.

### Migration

`claude/genedrift-migration-guide.md` in the project docs covers moving the
Zoho apps to the client's account. Two constraints found while writing it,
both worth knowing before promising a date:

- **Creator `.ds` exports cannot be imported.** Migration is an ownership
  transfer of the existing application, not an export/import.
- **Catalyst does not move.** The zip is redeployed into the new account and
  the base URL changes — which means every Creator application variable
  pointing at it changes too.

---

## Where the client's September feedback actually stands — 2026-09-17

Checked item by item against `client-feedback-2026-09-15.md`, not from memory.

### Closed

| § | Item |
|---|---|
| 1.1, 1.2 | Black box, marker → country page |
| 3 | Explore section — padding, corners, hover, nothing on load |
| 4 | Industries rebuilt as concept B |
| 5 | Global presence page, search, derived table, no compare |
| 6 | Markets fully editable — the CMS request |
| 8 | Fourth CTA card, "Submit your CV" |
| 9 | Rolling health authority bulletin |

### Still to build — ours, not theirs

**§1.3 / 1.5 — highlight the whole country, not the dot.** The only client
request left that nobody is blocking. `lib/map/land.ts` is a dissolved
landmass: 111 paths with no country identity in them, so there is nothing to
highlight per country. Needs Natural Earth
`ne_10m_admin_0_countries_ind` — the India POV file, not the default —
rendered FILLED, never stroked, per §1.4.

Note §1.3 and §1.4 remain in tension and the client knows: a shape encodes a
border whether or not a line is drawn.

### Blocked on the client, not on us

| § | Waiting for |
|---|---|
| 2 | Hero geo-IP — blocked on the **hosting decision**, which is also §11 |
| 7.2, 7.3 | Adverse-event form: mandatory fields, routing, accountable owner. **The safety intent stays disabled until answered** |
| 7.1 | The real PV contact list — page is built, placeholders in place |
| 10.2, 10.3 | Careers: openings report URL and OAuth credentials (the report is private) |
| 11 | Hosting — which Zoho account, Catalyst subscription. The *frontend* is settled (Vercel + genedrift.site); this is the Zoho half |

### Not from the client, but ours to finish

- **Creator trial expires 2026-09-18.** Everything built this week lives in it.
- Rotate both signing secrets. The editorial one is in plaintext in every `.ds`
  export.
- 19 of 21 pages are still Draft in Creator.
- The capability data itself is **unverified** — "Regulatory Affairs available,
  the other two not" across most of Africa came from the design file, not from
  the client confirming it. Goes to them with the rest.

---

## Status as of 2026-09-17 — menu, footer and certifications are CMS records

The last of the site-wide content moved out of `lib/nav.ts`. Setup guide:
**`context/site-chrome-cms.md`**.

| Layer | Change |
|---|---|
| Catalyst | `src/site.ts`; `SiteService`; `POST /v1/website/site`, `/site/rollback`, `GET /v1/public/site` |
| Website | `lib/content/site-source.ts` — CMS first, `lib/nav.ts` as fallback |
| Components | `SiteHeader` and `SiteFooter` are now async and read the same memoised fetch |
| Creator | `publish_site.deluge` + a button for the Nav Items and Certifications reports |
| Seeds | `scripts/export-site-seed.ts` → 37 nav items, 5 certifications, 1 footer record |
| Cache | `POST /api/revalidate` accepts `{"collection":"site"}` |

Smoke tests: **61/61** (was 41).

### The decision that shapes it: links are not editable

Editors rename, reorder and hide. They never retype a URL, and they cannot add
a menu item. Piyush's call, from three options.

A menu that cannot point anywhere new **cannot point at a page that does not
exist**. The alternative — let someone type a path, validate it afterwards —
means Catalyst having to know every route the site generates, including 46
country pages and every article, and being quietly wrong about it. Structural
beats validated.

### Certifications now carry an expiry, and expired ones disappear

`ISO 9001:2000` — a standard withdrawn years ago — has been in that footer the
whole time, precisely because a plain text list has nothing in it that goes
stale on its own. These are compliance assertions on a pharmaceutical
consultancy's site, so the safe failure is to stop making the claim.

An empty expiry still displays: refusing to show a certification because nobody
typed a date would be the worse failure. **9001:2000 is still not corrected** —
that remains the client's to confirm.

### Footer columns are derived from the menu, not stored

Two lists that must agree will eventually disagree, and nobody notices until a
client does.

### Rolling health authority bulletin — built

Client feedback §9, the last outstanding item from their September review. A
strip in the hero between the market status card and the updates ticker,
rotating authority names, starting with FDA.

**Their open question was designed around rather than waited for.** They had
not said whether it shows authority names or real headlines, and that was
blocking the build. Each entry is an authority plus an optional note — empty
notes give bare names, filled notes give headlines. Their answer became a
content decision.

Seeded with five authorities and **no notes**. An invented regulatory headline
on a pharma homepage is a false statement, not a placeholder.

CSS-only, `steps(N)` over a one-line window so each name sits still long enough
to read. Under reduced motion the window grows and shows all five rather than
freezing on the first — stopping the animation would silently hide content.

The hero grew 632px -> 688px at lg. The approved design sized that column to
end at the status card and the strip collided with the ticker; verified the new
height still lands inside the 780px fold.

### Not done

- **Still no preview and no rollback button** for any collection.
- **One level of sub-navigation.** A self-nesting menu is how a client builds a
  five-level dropdown nobody can use on a phone.
- **The homepage "Latest updates" ticker is still placeholder content** and is
  NOT the authority bulletin — they sit one above the other and look alike at a
  glance. The bulletin is the strip under the status card.

---

## Status as of 2026-09-16 (later) — markets are CMS records

The 46 markets moved out of `lib/map/markets.ts` and into the CMS. Full setup
guide: **`context/markets-cms.md`**.

This closes the client's own request of 15 September — "Global presence must be
freely editable; the CMS must support adding, removing and reorganising
capabilities per market."

| Layer | Change |
|---|---|
| Catalyst | `src/markets.ts` contract; `MarketsService`; `POST /v1/website/markets`, `/markets/rollback`, `GET /v1/public/markets` |
| Website | `lib/content/markets-source.ts` — CMS first, built-in 46 as fallback |
| Render path | `resolveSection` and `RenderSections` are now **async**; market pages await the collection |
| Creator | `publish_markets.deluge`, its report button, and a one-time import repair |
| Seeds | `scripts/export-markets-seed.ts` → 46 markets + 138 capability rows |
| Cache | `POST /api/revalidate` accepts `{"collection":"markets"}` — one tag, not 54 paths |

Smoke tests: **41/41** (was 24; seventeen of the checks are new and cover
markets).

### Three decisions worth knowing

**Capabilities are a list, not three fields.** Three columns called
`Capability_1_Status` would make a fourth capability a change in React, in
Catalyst and in Creator — for the one thing the client was explicitly promised
they could do themselves. So capabilities are their own Creator form, and the
Global Presence table derives its columns from whatever is there.

**The collection publishes whole, never one market at a time.** A market is
rendered by four different pages. Row-by-row publishing means those four can
disagree for as long as the publish takes, and gives no way at all to express
"this market is gone".

**An unrecognised status word is refused, not defaulted.** Mapping an unknown
value to "not available" would quietly tell the world Genedrift does not serve
a country. Catalyst refuses the publish and names the row.

### `dynamicParams = false` was still on both market routes

Same trap that took pages down earlier in the week, still armed on the 52
market routes: markets are CMS records now, so a country added in Creator would
have 404'd until the next deploy, and a revalidated page would have had no
fallback to render. Both flipped to `true`. Unknown countries still 404,
because the page function returns null when the collection has no such record.

### Not done

- **No preview and no rollback button.** Rollback works over the API with a
  publication ID; nothing in Creator calls it yet.
- **Regions are still six fixed slugs**, and a region page's own sentence is
  generated rather than editable.
- **Map position is two raw numbers.** No picker. Fine for the seeded 46,
  awkward for a brand-new country.
- The markets form is **not in the editor widget** — publishing is a report
  button. The widget edits pages; markets are a different shape and would need
  their own screen.

---

## Status as of 2026-09-16 — client feedback round 1

The client reviewed the build on 2026-09-15. Their feedback is in
`context/client-feedback-2026-09-15.md`, split into what was actioned, what
needed Piyush's decision, and what is still waiting on the client.

**Decisions Piyush took on the contested items are in `decisions.md` under
"Client feedback round, 2026-09-15".** Two of them reverse earlier calls; the
reasoning is recorded there, not here.

### Done this session

| Item | Change |
|---|---|
| Black box on marker click | Focus outline on an SVG `<g>` paints as a filled rect. Suppressed in `globals.css`; the glow is the focus indicator. |
| Explore section | Left padding at rest, rounded highlight, **nothing highlighted on load** — all four fixtures now `resting: false`. |
| CTA block | Fourth card, "Submit your CV" → `/careers`. |
| Marker → country page | Each marker is a `next/link` rendered as an SVG anchor. |
| Industries | Rebuilt as **concept B**, the two-panel index. Concept A deleted. |
| Global presence | New page `/global-presence` + `market-directory` section. |

### The marker click bug was two bugs, and the second one was worse

Clicking India navigated to **Pakistan**. Nothing to do with geography or with
the visitor's own location — there is no geo code in the site yet.

1. Each marker's glow ellipse is ~100 map units across and was `opacity: 0`
   when inactive. **Opacity 0 still receives pointer events.** Every marker
   therefore carried an invisible disc over its neighbours, and whichever came
   later in the list won. Fixed with `pointer-events-none` on the glow, the
   halo and the dot; the hit target is now the transparent circle alone.
2. With that fixed, a sweep of all 46 markers still found **seven**
   unreachable — genuinely adjacent markets (Benin/Togo/Ghana are ~4px apart on
   screen) whose fixed r=14 hit circles overlapped. The radius is now
   **per-marker**: 0.45 × the distance to the nearest other marker, clamped to
   3..14, so two hit areas can touch but never overlap.

Verified by assertion, not by eye: `elementFromPoint` at every marker's centre
resolves to that marker's own anchor, 46 of 46.

**This class of bug is invisible to typechecking, to a build, and to a
screenshot.** The only thing that caught it was walking every marker
programmatically. Do that for any interactive set of more than a handful.

Worth knowing: the dot cluster in West Africa and Central America is inherently
cramped. The country-shape map (below) is the real fix, since a country's
outline is a much larger target than a 4px dot.

### Still to do from this round

1. **Map: real country geometry.** Natural Earth `..._ind` variant (India's own
   point of view), shapes rendered with **no stroke**, fill only on
   hover/active. No boundary lines are ever drawn. This is the largest item.
2. **Hero country by IP.** Show a market that is NOT the visitor's own country
   first; theirs may appear later in the rotation. Needs a geo lookup API —
   host-independent, since hosting is still undecided.
3. **Rolling Health Authority Bulletin** — new strip between the market status
   card and the Latest Updates ticker. Website content, editable in the website
   Creator app. No editorial/blog relationship.
4. **PV / safety page** — country, email, phone. Placeholders for now; the real
   contact list is the client's to supply.
5. **Careers** — fetch openings from a **private** Creator report. Report URL
   and OAuth credentials come from the client's own Zoho account, so the source
   must be driven entirely by environment variables.

### Open questions, not blockers

- **Hosting is still undecided** — Vercel, Catalyst or Hostinger. The domain is
  with Hostinger, which is irrelevant to this; only where the app *runs*
  matters, and it decides whether geo-IP is free or needs an external lookup.
- **Does `/global-presence` replace `/markets`, or sit beside it?** It sits
  beside it for now, linked as the first child of the Markets menu.
- **Adverse Event form** — who builds it, mandatory fields, routing, accountable
  owner. Unanswered since the first round. The safety intent stays disabled.

---

## Status as of 2026-09-13

**Phase: production build, section batch 2 complete. Phase 0 closed.**

### Sections: 24 of 26 built · 96 routes · templates A–H ALL DONE

`hero-map`, `explore-journeys`, `statement`, `capability-panels`,
`industry-accordion`, `region-cards`, `process-grid`, `pill-row`,
`value-grid`, `proof-billboard`, `insight-feed`, `contact-split`.

**The homepage now matches the approved design section for section.** Two were
missing and had not been flagged: Explore and the Knowledge Hub feed. Both are
built. The Explore highlight follows the cursor in CSS — the resting panel
drops its highlight while the row is hovered and the hovered panel takes it, so
no state and no client component.

Six of the remaining seventeen port from the old `frontend/`.

### Phase 0 — done

- **Schemas moved to build time.** `scripts/emit-schemas.ts` emits
  `public/section-schemas.json` during `npm run build`. Nothing in the request
  path imports a validation library; `lib/content/guard.ts` does a shallow
  boundary check instead. Verified: every app-side import of a schema is
  `import type`, so Zod is erased from the bundle entirely.
- **Fluid tokens.** Gutter, section rhythm, band padding and the top three type
  sizes are `clamp()`. A fixed 96px gutter had been leaving 208px of content on
  a 400px screen. Desktop values are unchanged at the 1440 canvas.
- **Map data extracted** from the approved design into `lib/map/` — 46 markets
  with projected coordinates, UTC offsets and capability statuses, plus the
  111-subpath Equal Earth landmass. Taken verbatim rather than regenerated so
  what ships is identical to what the client signed off.
- **Capabilities modelled as an array**, which removes blocker 1 from the
  frontend's critical path.

### Industries — concept A, built with no JavaScript

Concept A was chosen 2026-09-13. It is built on native `<details name="…">`,
which gives exclusive open/close, keyboard support and correct ARIA for free —
so the section stays a **server component** and no accordion library was added.
The unfold uses `::details-content` with `interpolate-size`; where a browser
lacks that, the panel opens instantly. That is graceful degradation, not a
defect — do not add JavaScript to "fix" it.

The product-type count on each row is **derived from the list, never stored**.
A stored count goes stale the first time an editor adds a type.

### Header, dropdowns and mobile nav — also no JavaScript

`components/layout/site-header.tsx` is a server component. Desktop dropdowns
open on `:hover` and `:focus-within` in CSS; the panel stays in the layout
(opacity + visibility, never `display:none`) so keyboard focus can move into
it. The mobile panel is a native `<details>` with the icon swapped by
`[open]`. No nav library, no client bundle.

Navigation data lives in `lib/nav.ts`, shaped as the `Nav_Items` /
`Global_Content` collections will hold it: one level of children, no arbitrary
nesting. Nesting is left out on purpose — a self-nesting menu is how a client
builds a five-level dropdown nobody can use on a phone.

Children came from the approved design's footer columns, the only place the
sub-navigation is enumerated. The design's footer lists five Markets regions
and omits Eastern Europe, which exists on the map and in the region cards; all
six are used here.

### Footer, and templates B and C

**Footer** (`components/layout/site-footer.tsx`) derives its five link columns
from `NAV` — any nav item with children becomes a column — so the header and
footer cannot drift. Adding a nav child adds a footer link, once.

**Templates B and C** are `app/[pillar]/page.tsx` and
`app/[pillar]/[slug]/page.tsx`. `dynamicParams = false` on both is
load-bearing: without it those segments are catch-alls that swallow every
unmatched top-level URL and render a hub for it, and `/contact`, `/legal` and
the rest would never get their own routes. Verified: `/not-a-pillar` returns
404, not a page.

Detail routes are derived from the navigation, so a nav child and a real URL
are the same fact.

`lib/content/fixtures.ts` became `lib/content/pages.ts` — a path-keyed page
registry. **35 static pages build**: home, 7 hubs, 24 detail routes, the
gallery and 404. Every one of them is an ordering of the same ten section
components; no page-specific React was written.

⚠️ **All copy below the homepage is placeholder** — structurally correct,
factually unverified. None of it goes live without the client's words.

### Template H — contact, and three rules it follows

`/contact` plus four intents: enquiry, proposal, partnership, safety.
Submissions POST to Creator via a server action, configured by
`CREATOR_CONTACT_ENDPOINT` and `CREATOR_CONTACT_TOKEN`. Field names in the
payload are ours and **must be mapped to the target Creator form's names** —
one object in `lib/forms/submit.ts`.

**1. Never pretend an enquiry was received.** If the endpoint is unset,
unreachable or rejects the payload, the visitor is told plainly and given the
email address. A form that shows a green tick and drops the message is worse
than no form: the sender believes they have been heard and nobody finds out.
Verified end to end — with no endpoint configured, a valid submission returns
the honest failure, not a fake success.

**2. The PV / safety route is deliberately disabled.** It renders the
escalation path and an email address instead of a form, is `noindex`, and the
server action refuses the intent even if a POST arrives directly. An
adverse-event channel is a regulatory obligation with a named accountable
owner — none supplied (blocked-on-client item 4). **Do not enable it to make
the page look finished.**

**3. Zod at runtime, here only.** The build-time rule exists because
re-validating already-published content wastes time. Form input is the
opposite: untrusted, arriving at runtime, must be checked then. `lib/forms/`
is an explicit narrow exception and the only one.

Also fixed here: **React 19 resets an uncontrolled form once its action
completes**, so a failed submission was wiping everything the visitor had
typed, including a long message. The action now echoes the submitted values
back and the fields re-render with them. Verified: after a validation failure
the untouched fields still hold their values.

### Templates E and F — Insights, built against the PUBLIC API

Confirmed model, 2026-09-13: Creator stays private for drafting and review,
Catalyst publishes the immutable public version, this site reads **only** the
Catalyst public API. No component touches a Creator form.

`lib/content/article.ts` is that public contract; `lib/content/articles-source.ts`
is the client (fixtures now, fetch later). Sections: `article-grid` (E),
`article-head` and `article-body` (F).

**Three things are deliberately left loose** until the backend contracts are
final, each in a way that costs nothing to firm up:

1. **URL shape.** `/insights/{slug}` vs `/insights/{content-type}/{slug}` is
   undecided. `articleHref()` and `articleParams()` are the only places that
   decide, and the route is a **catch-all** accepting either — the last segment
   is always the article slug. Flipping `URL_INCLUDES_CONTENT_TYPE` changes
   every link, route and sitemap entry. No route files change, no redirects to
   write.
2. **Authors.** Not in the publish payload today. `authors` is optional and the
   byline simply does not render when absent, so the page is correct either
   way. When Catalyst starts sending them it appears with no frontend change.
3. **Content type vs category.** `contentType` is optional; filtering and the
   card label fall back to `category`. `articleKind()` is the one place that
   decides.

Filtering and paging live in the **query string** (`?kind=`, `?page=`), not the
path — so we are not minting path-based taxonomy URLs we might have to redirect
away from once the content-type question is settled.

**The article body renders a closed set of block types as real React elements.
There is no `dangerouslySetInnerHTML` anywhere.** `Editor_Document` is
structured JSON, not HTML. The contract can express an `html` body but the
renderer deliberately does not render it: injecting unsanitised HTML into a
pharmaceutical client's site to save an afternoon is not a trade worth making.
When we know what Catalyst emits, add a sanitiser and switch it on.

### Template G — careers, and what the live site told us

**Finding, 2026-09-13.** genedrift.com/openings embeds a *public Zoho Creator
report* in an iframe:

    creatorapp.zohopublic.com/genedrift/proton/report-embed/OpeningsReport/…

So the client already runs a Creator application called **`proton`** with an
**Openings** form, and their current careers page is that report in an iframe
on a Zoho Sites page. That is why it looks the way it does — it is an embedded
report, not a designed page.

Two consequences:

1. **Do not create a new Jobs collection.** Extend `proton`'s existing
   Openings form. Their team already keeps it current; a parallel form would
   drift on day one. This supersedes "Jobs → new Creator collection" in
   `decisions.md` — the collection already exists.
2. The exact field names could not be read (the embed URL is disallowed by
   robots.txt). `lib/jobs.ts` holds the minimum shape a job page needs and
   **must be reconciled against the real Openings form** before wiring.

Built: `job-list` (replaces the iframe) and `job-detail` (template G).
`careers` was pulled out of the `[pillar]` tree for the same reason as
`markets` — its leaves come from records, not nav children.

Every advert carries a visible unverified-content notice. That is a safety
feature, not decoration: a real person can apply to a fake job advert.

### Batch 4 — hubs and details stopped being stubs

Four sections: `page-head`, `sub-capability-grid`, `metric-row`,
`faq-accordion`. Hub and detail pages were rewired onto them instead of
borrowing the homepage's sections wholesale, which is what made them read as
stubs.

**`page-head` exists for a specific reason.** Hubs were borrowing `statement`,
which renders an `<h2>`. Every page needs exactly one `<h1>`, and a page whose
only heading is an `<h2>` is wrong for screen readers and for search.
Verified: hub and detail pages now report exactly one `<h1>` each.

`sub-capability-grid` resolves its items from the navigation via `navSource`,
through the same seam as the markets — so a hub page can never list a child
the menu does not have.

`faq-accordion` reuses the `.disclosure` styles from the industry accordion
(the CSS was renamed from `.industry-row`, since it was never
industry-specific). It deliberately omits `name`, so answers are NOT exclusive
— people open several FAQ answers and compare them.

### Template D — 46 country pages, 6 regions

`markets` was pulled OUT of the `[pillar]` tree and given its own three-level
route family (`app/markets/`), because hub → region → country cannot be
expressed by `[pillar]/[slug]`. **81 routes now build**, up from 35. The 46
country pages are generated from `lib/map/markets.ts` — no route was typed by
hand. Verified: `/markets/narnia` and `/markets/asia-pacific/atlantis` both 404.

New sections: `country-head` (with a locator map reusing the same approved
landmass as the hero — no image request, no JS) and `capability-status`.

### The relationship seam — read before adding a section that shows records

`lib/content/resolve.ts` is the boundary between what an editor *stores* and
what a component *renders*:

- **Edit time** — the section stores a REFERENCE (`marketSource: "all"`,
  `marketSlug: "india"`). That is what the Zod schema describes and what the
  CMS form shows. A market is edited once in the Markets collection.
- **Render time** — the component receives RESOLVED RECORDS as props and has
  no idea where they came from.

`RenderSections` resolves once before rendering. Today it reads `lib/map/`;
when Catalyst is live the snapshot arrives already resolved and this becomes a
pass-through. Components do not change either way — that is the point.

**The rule: a section component must never import a collection.** `hero-map`
did (`import { MARKETS }`) and has been corrected. It would have broken the
moment Catalyst started supplying data, and template D would have copied the
mistake 46 times.

### Bug: the header was covering every non-home page

The header was `lg:absolute` on the assumption that the hero map ran up behind
the nav. Re-reading the design, the map starts at y=116 and the nav occupies
0..86 — they never overlap. The absolute header was silently sitting on top of
the first 86px of every page that was not the homepage; the country page's
`<h1>` was underneath it. The header is now in normal flow and the hero's
internal offsets were rebased by the nav's height. **Do not reintroduce
`absolute` on the header.**

### The platform repo is connected — and it corrected a runtime bug

Reading `catalyst/src/publicContent.ts` directly (rather than working from the
summary) showed our fetchers would have **compiled cleanly and failed at
runtime**: Catalyst returns `primaryCategory` as a plain string, tags as
strings, the detail response nested under `article`/`revision`, and the body as
top-level `html`. The list and detail responses are different shapes for the
same article.

`lib/content/map-article.ts` is now the boundary mapper. Components never see
the API shape, and when `authors`/`contentType` land it is the only file that
changes.

Also found already built and **not to be duplicated**: `/v1/public/taxonomy`,
`/v1/public/sitemap.xml`, `/v1/public/rss.xml`.

The Catalyst service is clean TypeScript with ports/adapters, Zod at the
boundary, 3k lines. `website_page` belongs in it as an extension — the
publish/pointer/rollback machinery is all reusable.

### Insights wired to the REAL public API contract

Endpoints, pagination, filters, status codes and body format confirmed with the
platform developer and implemented — see `context/article-contract.md` §5 for
the table. Highlights that changed code:

- `limit`, not `perPage`; max 50, clamped rather than truncated
- filter chips come from the API's `facets`, not derived locally
- `category`/`tag` match **displayed names, not slugs** — so nav taxonomy links
  carry names and must be checked against the real `Categories` records
- the body is **sanitised HTML** (`article.html`), not TipTap JSON
- **410 for a retracted article is handled separately from 404** — a withdrawn
  regulatory notice says it was withdrawn rather than appearing never to have
  existed
- `dynamicParams` is now true for articles: prerendering only build-time slugs
  would 404 everything published since the last deploy

### API base URL is configurable — no hardcoded host

`lib/content/catalyst.ts` reads `CATALYST_API_BASE_URL` and optional
`CATALYST_API_TOKEN`; `.env.example` documents every variable. UAT points at
the Catalyst development host, production gets its own, and the same build
artefact runs against either.

Two deliberate choices:

- **Not `NEXT_PUBLIC_`.** All article fetching is in server components, so the
  API host never reaches the browser bundle — no internal hostname published,
  and no staging URL can appear in a production page's JavaScript.
- **Missing value fails the production build**, and a failed fetch returns
  empty rather than falling back to fixtures. A site that silently serves
  invented regulatory notices as real ones is far worse than a site that
  refuses to build.

Verified: no `catalystappsail` host appears anywhere in executable code.

`context/notes-to-backend.md` holds the questions for the platform developer —
endpoint paths, pagination shape, whether Catalyst converts the editor JSON to
HTML, `publishedAt`, media host for `images.remotePatterns`, and whether the
`Redirects` form is served.

### Three broken links found by running the dev server — all real, all ours

Found 2026-09-13 from the browser console, not from a build. None of these
would have been caught by typechecking or a screenshot.

1. **`ERR_TOO_MANY_REDIRECTS` on `/insights/<anything-unknown>`.** The nav's
   Knowledge Hub children pointed at `/insights/regulatory-updates` and
   friends — path-based taxonomy URLs — while the listing filters by QUERY
   STRING. Those paths fell through to the article route, which was a
   catch-all with `dynamicParams = false`; on a catch-all that combination has
   no fallback to render, so Next threw internally and the client retried into
   a redirect loop. A redirect loop is much worse than a 404. Fixed: nav links
   now use `/insights?kind=…`, and the article route is a single dynamic
   segment.
2. **`/search` 404'd.** The header has linked to it since the header was
   built; the route never existed. Now a real search page over published
   articles — no placeholder, no dead link.
3. **No 404 page existed.** Added `app/not-found.tsx`.

**A correction worth keeping.** The `NoFallbackError` lines in the server log
were initially blamed on the catch-all. That was wrong. Measured on Next
16.3.3: **every 404 logs it**, including `/nope`, which touches no dynamic
route. It is a Next internal, it does not reach the user, and the response is a
correct 404. Do not go chasing it in application code. Worth re-checking once
on Vercel, where 404s are served differently.

### Verified, not assumed

`npm run build` green on the device. The app was also built and served in the
cloud container and screenshotted headless at 1440 and 400 — homepage and
`/dev/sections`. Both render correctly. That review loop now exists and is
cheap to repeat; use it after every batch.

Two bugs it caught that no amount of typechecking would have:

1. The hero's softening gradient was painting **over** the headline, erasing
   about 90% of "Get it approved in India." Fixed with explicit stacking.
2. A stale `next start` holding the port while a new build replaced its chunks
   on disk — produced a completely unstyled page and a 500 on the CSS. Kill the
   server before rebuilding, or use a fresh port.

### Not done

- **No Vercel preview deploy.** Needs Piyush's account.
- **No git remote.** See the warning at the bottom of this file.

- Catalyst has no `website_page` content type; the Creator website app does not
  exist.
- `scripts/build-map.ts` still unwritten. Lower priority now that `lib/map/`
  holds the approved data — it is a regeneration path, not a blocker.

### Next

1. Batch 4 — `page-head`, `sub-capability-grid`, `metric-row`, `faq-accordion`.
   Until these exist the hub and detail pages stay stubs.
2. Batch 6 — `rich-body`, `cta-band` → template C stops being identical
   on every route.
3. Port Insights E and F out of the old `frontend/`, then cut over and delete it.
2. Template D (markets/[region]/[country]) — the map data is already in `lib/map/`.
3. Templates G (job) and H (contact form).
4. Catalyst `website_page`, then the Creator forms.

### Content problems found while building — raise these together

Three places where the client's own source material contradicts itself:

1. **Two slugs for one country, twice.** The map said `c-te-d-ivoire` and
   `dem-rep-congo`; the region cards said `c-te-divoire` and `dr-congo`. Four
   spellings, two countries, two live URLs each. Canonicalised to
   `cote-divoire` and `dr-congo`.
2. **The footer omits Eastern Europe**, which exists on the map and in the
   region cards. All six regions are used.
3. **`ISO 9001:2000`** in the footer certification row. That version was
   superseded by 9001:2008 then 9001:2015 and has been withdrawn for years —
   almost certainly meant to be 9001:2015. **Deliberately not corrected**:
   quietly editing a certification claim on a pharma consultancy's site is
   worse than showing a stale one. Every entry in that row needs a certificate
   number and an expiry date before launch.

Plus the two already known: 46 vs 30+ markets, and markets vs offices being
different lists.

### Known rough edges, deliberately left

- The map is small and its markers are hard to read at 400px. Works, but a
  mobile-specific crop would be better.
- The two hero CTAs stack with more vertical gap than they need at 400px.
- The ticker's leading mask was tuned for desktop and clips oddly when narrow.

---

## ⚠️ Repo safety — read once

This folder was created on 2026-09-12 by moving the app out of a tooling sandbox
directory (`~/.codex/.chatgpt-projects/<hash>/`), where the whole Genedrift
engagement had been living with **no git remote and 141 uncommitted files**.

The old repo still holds Catalyst, Creator, the editor widget and the docs, and
still has no remote. That is one folder deletion away from losing the engagement.

**The website repo now has a remote** — `Piyush-45/genedrift-web`, private,
pushed 2026-09-17. `.env.local` and the tooling folder are gitignored and were
verified excluded before the first push.

**The platform repo still has none.** Catalyst, Creator, the editor widget and
its docs are still one folder deletion away from being lost. Push it.

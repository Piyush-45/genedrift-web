# Client feedback — 15 September 2026

Consolidated from the client's review PDF. **Website scope only.** The
editorial / blog platform is a separate application and nothing in it is
touched by this work.

Status key: ✅ done · 🔨 in progress · ⏳ waiting on someone

---

## 1 · World map

| # | Client asked for | Status | Note |
|---|---|---|---|
| 1.1 | Remove the black box that appears when a country dot is clicked | ✅ | Focus outline on an SVG `<g>` renders as a filled rectangle. Suppressed. |
| 1.2 | Clicking a country goes to that country's page | ✅ | Each marker is a real link. Two targeting bugs found and fixed — see `progress.md`. |
| 1.3 | Highlight the **entire country**, not just the dot | ✅ | Done 2026-09-18. Real country geometry, India POV edition. See `map-geometry.md`. |
| 1.4 | **No prominent geographical / political boundaries** — minimise litigation and boundary-dispute exposure | ✅ | The fill is BLURRED, so there is no edge to read as a line. Never stroke it. |
| 1.5 | Highlight on hover / select | ✅ | Done 2026-09-18. The country itself is a hover target, not only the dot. |

**RESOLVED 2026-09-18 — by the client's own reference image.** They sent a
screenshot of a country lit with a soft, feathered fill. A blurred fill has no
edge to read as a drawn line, so it shows the country's extent without stating
the boundary. That is what satisfies 1.3 and 1.4 at the same time, and it is why
the shape must never be stroked.

The exposure did not disappear, and they were told: the market list contains
India and Pakistan, Russia and Ukraine, Taiwan and Hong Kong, so giving countries
individual shapes means the map depicts a boundary in each of those pairs. The
India point-of-view Natural Earth edition is used for that reason. The options
put to them are in `map-highlight-options-note.md`.

**1.3 and 1.4 are in tension and the client was told so.** Highlighting a
country requires that country's shape, and a shape encodes a border whether or
not a line is drawn — a disputed-territory outline is still a claim. Piyush
chose to proceed with real geometry anyway (2026-09-16), because the client is
clear that they want an accurate map.

**Therefore: India must use the Survey-of-India point of view.** Natural Earth
publishes `ne_10m_admin_0_countries_ind` for exactly this. Use that file, not
the default, so every country's POV is consistent and India's is correct.

## 2 · Hero

| # | Client asked for | Status |
|---|---|---|
| 2.1 | The country shown first should **not** be the visitor's own country | ⏳ needs a geo lookup |
| 2.2 | The visitor's country may appear later in the rotation | ⏳ |
| 2.3 | A different country each time, if possible | ⏳ |

Geo-IP is free on Vercel (one request header) and needs an external lookup
service anywhere else. **Hosting is undecided**, so the implementation is being
written host-independent. The domain being with Hostinger does not affect this —
only where the application *runs* matters.

## 3 · Explore section

| # | Client asked for | Status |
|---|---|---|
| 3.1 | More left padding | ✅ |
| 3.2 | Rounded corners | ✅ |
| 3.3 | Highlight on hover only | ✅ |
| 3.4 | **Nothing** highlighted on initial load | ✅ reverses the original design, which rested the highlight on panel 04 |

## 4 · Industries

> "Concept B, using the two-panel index layout, is preferred."

✅ Rebuilt. This **reverses Piyush's 2026-09-13 choice of concept A**, which was
already built. Concept A has been deleted. The data shape did not change at
all — same fields, same fixture — so the Creator form for this section is
unaffected by the swap.

## 5 · Global presence

| # | Client asked for | Status |
|---|---|---|
| 5.1 | A new global-presence page | ✅ `/global-presence` |
| 5.2 | Country search bar | ✅ |
| 5.3 | Table of countries and the services offered | ✅ columns derived from the market data, so a fourth capability grows a fourth column with no code change |
| 5.4 | **No** compare-markets feature | ✅ deliberately absent |
| 5.5 | Use the blank area on the left | ✅ |

Confirmed 2026-09-16: the services shown are **the same capability data the
country pages already use**. This view personalises which row you land on; it
is not a second source of truth.

⏳ Open: whether this replaces `/markets` or sits beside it. It sits beside it
for now, as the first child of the Markets menu.

## 6 · Markets / CMS

> Global presence must be freely editable; the CMS must support adding,
> removing and reorganising capabilities per market.

✅ **Done 2026-09-16/17.** Markets are CMS records: 46 countries and 138
capability rows in Creator, published as one collection. Adding, removing and
reorganising capabilities per market is now a row edit — see
`context/markets-cms.md`.

This validated modelling `capabilities` as an **array** rather than three fixed
fields. Three columns called `Capability_1_Status` would have made a fourth
capability a code change in React, in Catalyst and in Creator — for the exact
thing the client was promised they could do themselves.

Beyond what they asked: the **menu, footer and certification row** are also CMS
records now (`context/site-chrome-cms.md`), so "editable without a developer"
covers everything except the job openings, the page structure, and the prose on
the generated country pages.

## 7 · Pharmacovigilance / safety

| # | Client asked for | Status |
|---|---|---|
| 7.1 | A separate page listing country, email and phone (phone not always available) | 🔨 built with **placeholders**; the client fills the real list through Creator |

| 7.2 | Adverse-event form built in Zoho Creator, embedded, with revised UI | ⏳ |
| 7.3 | "Required fields, routing rules and process owner should be confirmed before finalizing" | ⏳ **unanswered — the safety intent stays disabled** |

Adverse-event reporting is a regulatory obligation with a named accountable
owner. A form that looks finished but routes nowhere is worse than no form. Do
not enable it to make the page look complete.

## 8 · Contact CTA

> Add a fourth card, "Submit Your CV", linking to Careers.

✅ Done.

## 9 · Rolling Health Authority Bulletin

New strip between the Market Status card and the Latest Updates ticker,
rotating authority names, starting with FDA.

✅ Built 2026-09-17, in the hero between the status card and the ticker,
exactly as asked. Editable on the Home page in the widget under **Health
authority bulletin**.

**The open question was designed around rather than waited for.** Each entry
is an authority plus an OPTIONAL note: leave every note empty and the strip
rotates bare authority names; fill them in and it reads as a headline feed.
Their answer is now a content decision, not a rebuild.

Seeded with FDA, EMA, CDSCO, SFDA, NAFDAC and **no notes** — an invented
regulatory headline on a pharmaceutical consultancy's homepage is not a
placeholder, it is a false statement.

An empty list hides the strip entirely, so switching it off is also an edit.

The hero grew from 632px to 688px at desktop to make room: the approved design
sized that column to end at the status card, and the new strip collided with
the ticker. Still inside the 780px fold the design is built around — measured.

## 10 · Careers

| # | Client asked for | Status |
|---|---|---|
| 10.1 | Confirm placeholder status | ✅ every advert already carries a visible unverified-content notice |
| 10.2 | Use the existing Creator openings report | 🔨 |
| 10.3 | CV / application form | 🔨 |
| 10.4 | Video walkthrough | ⏳ out of website scope — Piyush is handling this separately |
| 10.5 | Interview scheduling form | ⏳ not scoped |

Confirmed 2026-09-16: the openings report is **private**, so the site cannot
read it without OAuth credentials. Those are generated from the client's own
Zoho API console once the application is on their account. **The report URL,
client ID, secret and refresh token must all be environment variables** — the
source has to be swappable without a code change.

## 11 · Hosting

The client is asking whether Catalyst needs a specific plan or subscription,
which Zoho account the site sits under, and whether Piyush should contact Zoho
Support.

⏳ Cannot be answered until the hosting target is chosen. See §2.

---

## Waiting on the client

1. Pharmacovigilance contact list — country, email, phone.
2. Adverse Event form — builder, mandatory fields, routing, process owner.
3. Rolling bulletin — authority names only, or real headlines?
4. Hosting — which Zoho account; Catalyst subscription status.
5. Careers — openings report URL, and API credentials (it is private).

# Markets in the CMS — setup and how it works

**16 September 2026.** The 46 markets move out of code and into Creator, so the
client can add a country, retire one, or change what Genedrift offers in it
without a developer.

This is the client's own request from the 15 September review:

> Global presence must be freely editable; the CMS must support adding,
> removing and reorganising capabilities per market.

---

## What one market controls

One record. Four places on the site.

| Where | What it shows |
|---|---|
| Homepage map | The dot, its position, the hover card |
| `/global-presence` | One row in the searchable table, one column per capability |
| `/markets/<region>` | The market in its region's list |
| `/markets/<region>/<country>` | Its own page — heading, local time, capability panel |

That is why markets are a **collection**, not 46 pages. "Kenya now offers
Pharmacovigilance" is one edit, not four.

---

## Two forms, not one

A market has a **list** of capabilities, not three named fields. Three fields
called `Capability_1_Status` would make a fourth capability a code change in
three separate places — for something the client was told they could do
themselves.

### `Website_Markets` — one row per country

| Field label | Type | Notes |
|---|---|---|
| Market Slug | Single Line — **mandatory, unique** | Lower case, hyphens, no spaces. This is the URL: `kenya` → `/markets/africa/kenya` |
| Market Name | Single Line — mandatory | What people see: `Kenya`, `UAE` |
| Region | Dropdown — mandatory | Asia Pacific · Africa · Latin America · CIS · Middle East · Eastern Europe |
| UTC Offset | Decimal | Hours from UTC. `5.5` for India — half-hour offsets are real |
| Map X | Decimal | Position on the map, 0–1000 |
| Map Y | Decimal | Position on the map, 0–500 |
| Active | Checkbox, **ticked by default** | Unticking takes the market off the site and keeps the record |

The **region slug is not a field**. It is worked out from the region name, so a
typed slug can never disagree with the region it belongs to.

### `Website_Market_Capabilities` — one row per service, per country

| Field label | Type | Notes |
|---|---|---|
| Market | Lookup → Website_Markets — mandatory | Which country this applies to |
| Capability Name | Single Line — mandatory | `Regulatory Affairs`, `Pharmacovigilance`, `MAH & Local Representation` |
| Status | Dropdown — mandatory | Available · Upcoming · Not available |
| Display Order | Number | Column order. Use 10, 20, 30 so there is room to insert one later |
| Import Market Slug | Single Line | **Import helper only.** Hide it on the form once the seed import is done |

Adding a fourth capability to a country is **one new row**. The website grows a
fourth column by itself — nothing in the code lists the capabilities.

---

## Setting it up, in order

| # | Step | Where |
|---|---|---|
| 1 | Create `Website_Markets` with the fields above | Creator → Design → New Form |
| 2 | Create `Website_Market_Capabilities` with the fields above | Creator → Design → New Form |
| 3 | Import `creator-seed/website-markets.tsv` | Website_Markets report → Import |
| 4 | Import `creator-seed/website-market-capabilities.tsv` | Capabilities report → Import |
| 5 | Add and run the function `link_capabilities_to_markets` once | Settings → Functions |
| 6 | Add the function `publish_markets` | Settings → Functions |
| 7 | Add a **Publish markets** action item on the Website_Markets report, running **once for the report**, not per record | Design → report → Actions |
| 8 | Click it | |

**Order matters at 3–5.** Capabilities link to markets by slug, so the markets
must exist first. Step 5 reports how many rows it linked and names any it could
not.

Nothing new to configure in Catalyst: the markets endpoint uses the same
application variables and the same signing secret as page publishing.

---

## What happens when you press Publish markets

```
Creator                Catalyst                          Website
───────                ────────                          ───────
all active markets ──▶ checks every row                  46 country pages
+ their capabilities   freezes the whole set        ──▶  6 region pages
                       points /v1/public/markets at it   /global-presence
                                                         homepage map
```

**The whole collection goes at once, never one market at a time.** If markets
published row by row, the map and the table could disagree with each other for
as long as the publish took. It is also the only way removal works: a market
that is unticked or deleted is simply not in the next payload, and disappears.

### What Catalyst refuses

It refuses the whole publish and names the problem. The live site is untouched.

| Refused | Why it matters |
|---|---|
| Two markets with the same region + slug | One country page would silently win and the other would vanish |
| A slug with a space or a capital in it | It becomes a URL. `Kenya Republic` is a 404 with no error anywhere |
| A status word it does not recognise | Guessing would mean quietly telling the world Genedrift does not serve a country |
| Zero active markets | Almost certainly an accident, never an instruction to empty the world map |

---

## If Catalyst is unreachable

The site renders the **built-in 46 markets** from `lib/map/markets.ts`.

That is deliberate. A map with no countries on it is a far worse failure than a
map showing last week's truth. The same applies if markets have never been
published: until step 8 above, the site simply carries on as it does today.

`lib/content/markets-source.ts` also drops any single row it cannot use — a
market with no slug, or no position on the map — rather than failing the page.

---

## Where each piece lives

| Piece | File |
|---|---|
| Publish function | `creator/publish_markets.deluge` |
| Report button | `creator/publish_markets_button_action.deluge` |
| One-time import repair | `creator/link_capabilities_to_markets.deluge` |
| Seed files | `creator-seed/website-markets.tsv`, `creator-seed/website-market-capabilities.tsv` |
| Seed generator | `scripts/export-markets-seed.ts` |
| Catalyst contract | `services/catalyst-website/src/markets.ts` |
| Catalyst publish/rollback | `MarketsService` in `services/catalyst-website/src/service.ts` |
| Endpoints | `POST /v1/website/markets`, `POST /v1/website/markets/rollback`, `GET /v1/public/markets` |
| Website reader | `lib/content/markets-source.ts` |
| Cache refresh | `POST /api/revalidate` with `{"collection":"markets"}` |

---

## Known limits, stated honestly

- **Regions are still a fixed list of six.** Adding a seventh region works —
  the name is slugified and the site picks it up — but the region's own page
  copy ("*N* markets in *Region*, one regional team across all of them") is
  generated, not editable. Editing that sentence is still a code change.
- **Map position is two numbers.** There is no map picker. Moving a dot means
  knowing roughly what X and Y mean. Every seeded market already has correct
  values, so this only bites when a brand-new country is added.
- **Country page body copy is not editable yet.** The heading and the
  capability panel come from the market record; the process section below them
  is still shared placeholder copy across all 46.
- **No preview.** Publish is live. Rollback exists
  (`/v1/website/markets/rollback` with a publication ID) but has no button yet.

# Blocked on the client

Asked 2026-09-12, in the round-three email to Ashish. None of these stop the build
— we need the *shape*, not the content — but each one decides a shape.

| # | Question | What it blocks | Cost of guessing wrong |
|---|---|---|---|
| 1 | **Markets** — always exactly three capabilities (RA / MAH / PV), or could more be added? Are country pages freely editable, or a fixed layout with fields? | The market data model and template D | Migrating 46 records |
| 2 | **Industries** — is there a grouping level between category and product type? | That section's shape | Rebuilding the section |
| 3 | **Careers** — Zoho Recruit or a Creator app? Where do applications land? | Where jobs come from (not the page itself) | Rework of one integration |
| 4 | **PV / safety contact** — routing, mandatory fields, accountable owner | That whole page | This is a regulatory obligation, not a form design question. Do not guess. |
| 5 | **Industries concept** — A, B or C | Which of the three built concepts becomes the real page | Two thrown away either way |

## Content issues we know about and have not resolved

- **46 vs 30+ markets.** The hero says forty-six; the metrics row says thirty-plus.
  Both numbers came from client material. Deliberately left out of the round-three
  email to keep the ask actionable — raise it on the call.
- **Markets and offices are different lists.** The client's own world-clock
  screenshot shows **17 offices**, including Japan, USA (New York and San
  Francisco) and Italy — none of which appear in the 46 markets. The offices page
  needs its own list, which we do not have.
- **All Careers content is invented** — roles, benefits, programme details. It is
  marked in the design with the sample-content toggle. It must not go live
  unverified. A fake job advert can have a real person apply to it.
- The client's sitemap names Gulf markets (Qatar, Oman, Kuwait, Bahrain) that are
  not on the map, and omits Latin America and Eastern Europe, which are.

## The principle that keeps this unblocked

**Shape, not content.** Shape is: a market has a name, a region and three
capability statuses. Content is: which markets. Everything can be built knowing
only the shape, then populated through the CMS — which is exactly what the client
asked for in section 21 of their review.

**Seed, do not ship empty.** Load the placeholder content already written into
Creator as initial draft records. The site then looks complete from day one and
every client edit is a replacement rather than a blank form. Handing someone 26
empty forms is how a CMS handover dies.

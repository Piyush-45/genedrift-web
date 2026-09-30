# Blocked on the client

> **Updated 2026-09-30 (later)** — country service pages built; they need `Website_Country_Services` created in Creator and v0.2.1 deployed on their Catalyst, then real content per country.
>
> **Updated 2026-09-30** — contact destination received (sent 28 Sept inline) and live. Our Catalyst trial expired: their Catalyst is now the top blocker.
>
> **Updated 2026-09-29** — application form received and wired; open-roles confirmed; hosting answered (Hostinger).
>
> **Updated 2026-09-25** — careers credentials resolved without OAuth; contact destination added as item 10.
>
> **Updated 2026-09-13.** Piyush ruled that responsive behaviour and any page the
> client has not yet seen are his call, and that the build should not wait. Four
> of the five questions below are now closed by decision rather than by answer —
> see `decisions.md`. Only the PV / safety routing remains genuinely blocked, and
> it is the one that must not be guessed.

## Still open

| # | Question | Why it cannot be decided here |
|---|---|---|
| 4 | **PV / safety contact** — routing, mandatory fields, accountable owner | An adverse-event channel is a regulatory obligation with a named owner at the client. The page can be built; its destination cannot be invented. Build the page, leave routing as a CMS field, ship it disabled until the client names the owner. **Raised again in the 2026-09-15 review and still unanswered.** |
| 11 | **Content sign-off** — ISO version in footer, registered address, FAQ answers, all placeholder text (editor's guide ch. 06 lists it) | Asked 27 and 28 Sept, not answered |
| 6 | **PV contact list** — country, email, phone per market | Genedrift's own contact details. The page is built with placeholders the client fills through Creator. |
| 7 | **Rolling Health Authority Bulletin** — authority names only, or real headlines? | Changes nothing structural; the strip is built either way. Asked so the client is not surprised by what they have to maintain. |
| 8 | ~~**Careers openings report** — the report URL, and OAuth credentials~~ **Resolved 25 Sept** | Read through the Publish API with the report's privatelink — **no credentials needed**. Live. See `careers-cms.md`. Application form and reference field **received 28 Sept and live**; report holds only open roles, **confirmed**. |
| 10 | ~~**Contact form destination**~~ **Resolved 30 Sept, live** | Scope confirmed in writing: one form, one displayed email, no bot. Only the destination is missing. 28 Sept: they will route it through a Creator form with AI review and send the link "shortly". Asked again 29 Sept, with email to cs@ offered as the alternative. |
| 9 | **Hosting** — answered in part 28 Sept: **Hostinger** for the site (plan to confirm: must run Node.js apps). Still open: which Zoho account and region; Catalyst payment method; confirm forms go into their existing `proton` app. DNS call Fri 2 Oct | Decides whether geo-IP for the hero is free (Vercel header) or needs an external lookup, and it is the client's own account either way. |

> Items 6–9 came out of the 2026-09-15 review. Full context:
> `client-feedback-2026-09-15.md`.

## Closed by decision, 2026-09-13

| # | Was | Now |
|---|---|---|
| 1 | Markets — always exactly three capabilities? | Modelled as an array, so the answer no longer blocks the frontend |
| 2 | Industries — a grouping level between category and product type? | Concept A absorbs one without a redesign |
| 3 | Careers — Recruit or Creator? | Creator collection |
| 5 | Industries concept A, B or C? | **A — accordion register** — ⚠️ REVERSED 2026-09-15, the client asked for **B, the two-panel index**. Built as B. |

---

## Original list, for the record

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

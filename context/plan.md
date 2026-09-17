# Delivery plan — phases, ownership, and what we are not doing

Written 2026-09-13. Supersedes the loose "next" list in `progress.md`.

Durations are working days of focused effort, not calendar time, and they assume
client answers arrive when Phase 7 needs them.

---

## Ownership key

| Who | What they can do |
|---|---|
| **C** (Claude) | Everything that is a file in a repo: components, schemas, Catalyst code, scripts, seed CSVs, field specs, Deluge snippets |
| **P** (Piyush) | Anything behind a login or a GUI: Vercel, git remotes, Creator form building, Zoho admin, the client relationship |
| **C+P** | Sign-offs and the one test that has to be watched end to end |

The hard line: **Claude cannot click in Zoho Creator.** So every Creator phase is
Claude producing an exact spec and Piyush executing it. Plan the time accordingly
— that is the one place the work does not parallelise.

---

## Phases

| # | Phase | Who | Days | Done when |
|---|---|---|---|---|
| 0 | Foundation hardening | C + P | 1 | Zod moved to build time; capabilities modelled as an array; git remote pushed; Vercel preview live |
| 1 | Frontend on fixtures | C | 8–10 | All unblocked sections + templates B/C/D/G/H built, responsive, Insights ported, old `frontend/` deleted |
| 2 | **Contract freeze** | C, sign-off C+P | 1 | `section-schemas.json` emitted; CMS field spec generated and agreed |
| 3 | Catalyst | C | 2–3 | `website_page` type live; publish, validate, pointer, rollback, revalidation |
| 4 | Creator forms | P, spec by C | 3–5 | Governance forms + unblocked collections exist and accept records |
| 5 | Vertical slice | C+P | 1 | One section: edit → preview → review → publish → render, observed working |
| 6 | Seed + expand | C seeds, P imports | 2–3 | Every unblocked collection populated with placeholder records |
| 7 | Blocked items | C, after client | 3–4 | Industries concept, Markets model, Jobs source, PV/safety page |
| 8 | Launch prep | C+P | 3–4 | Redirects, sitemap, analytics/consent, a11y pass, visual regression in CI |

**Phase 2 is the pivot.** Before it, the frontend is the only thing moving.
After it, Catalyst and Creator can both be built in parallel because they share
one written contract. Freezing it early is what stops the three pieces drifting.

---

## When design becomes code

Already happened, and it keeps happening in Phase 1. `context/design/` is the
spec; sections are built from it directly. There is no separate "design
handoff" step still to come — the handoff was the 2026-09-12 approval.

Two exceptions:

- **Industries** — three concepts exist, the client picks one. Phase 7.
- **Mobile** — never designed for any template. It is being decided in code
  during Phase 1, which is acceptable for a content site but means the
  responsive behaviour is Piyush's judgement call, not the client's approval.

---

## Creator: `.ds` or manual

Decide this with a one-hour spike at the start of Phase 4, not by argument.

| Step | Who | What |
|---|---|---|
| 1 | P | Build **one** collection form by hand (`Offices` — flat, no subform, low stakes) |
| 2 | P | Export the application as `.ds`, put the file in the repo |
| 3 | C | Read it. Is the format authorable? |
| 4a | C | **If yes** — generate the remaining flat collections from the Zod schemas, P imports once |
| 4b | P | **If no** — build manually, using the field spec from Phase 2 |

Either way:

| Form group | Method | Why |
|---|---|---|
| Governance (3 forms + 1 subform) | **Manual, always** | Subforms, workflow states and Deluge. Only three forms — not worth automating |
| Flat collections (Offices, People, Jobs, Proof_Points, FAQs, CTAs, Nav_Items) | `.ds` if authorable, else **CSV import** | CSV import infers fields from headers *and* seeds the rows at the same time |
| Collections with subforms (Markets, Capabilities, Industries, Case_Studies, Global_Content) | Parent by import, **subform by hand** | No import path builds a subform |

Zia is not used at any point. It is not the wrong tool because it is bad; it is
the wrong tool because the field definitions already exist as Zod schemas, and a
generated form that needs heavy correction is slower than a spec-driven one.

---

## What each phase produces

| Phase | Claude hands over | Piyush needs to supply |
|---|---|---|
| 0 | Refactored repo | Vercel account, git remote, delete permission on the folder |
| 1 | A complete, responsive, fixture-driven site | Judgement on mobile and on anything visually wrong |
| 2 | `section-schemas.json` + a human-readable field spec | Agreement that it is the contract |
| 3 | Catalyst `website_page` endpoints | Zoho credentials / deploy access |
| 4 | Field spec, CSVs, Deluge snippets, `.ds` verdict | The clicking |
| 5 | Preview route, publish wiring | Watching it work once |
| 6 | Seed CSVs for every collection | Importing them |
| 7 | Industries, Markets, Jobs, PV — built | The client's five answers |
| 8 | Redirect map, sitemap, a11y fixes, CI | Analytics/consent decisions, legal copy |

---

## What we are explicitly not building

Each of these has been considered and rejected. Re-proposing one needs a reason
that is not "it would be nice".

| Not doing | Instead |
|---|---|
| Storybook | `/dev/sections` — already renders every fixture, and doubles as the client link |
| A state manager | Server components plus URL state |
| Framer Motion / GSAP / Lottie | CSS transitions with `prefers-reduced-motion` |
| A component library (MUI, Chakra, wholesale shadcn) | The design system in `tokens.css` |
| Astro | Next 16 — Astro orphans the working Catalyst revalidation |
| A second deployable Next app | Port Insights, delete `frontend/`, one app only |
| Zia-generated forms | Spec-driven forms from the Zod schemas |
| A drag-and-drop page builder | Controlled section types, protected order |
| Runtime schema parsing on every request | Build-time schema emit + a shallow guard |
| A market comparison table | Removed — the client banned it |

---

## End state

One Next.js app on Vercel. Content edited in a Creator workspace whose forms were
generated from the same schemas the components use. Published through Catalyst as
immutable versions with a pointer, so any bad publish is one click back. Around
40 URLs from 8 templates and 26 section types, where adding section type 27 costs
one folder in this repo and nothing in Creator.

---

## The honest risk

Engineering is not the long pole. Content is.

All Careers copy is invented, the 17-office list does not exist in any document
we hold, markets are 46 in one client sentence and 30+ in another, there are no
leadership bios, and no logo files. Phase 8 cannot finish without those, and none
of them are things Claude or Piyush can produce.

Frame it to the client that way: **we are ~92% built and we need your words.**

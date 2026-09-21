# Start here

Last updated: 2026-09-21.

## What this project is

A full rebuild of genedrift.com. Genedrift is a global Regulatory Affairs and
Pharmacovigilance (RA/PV) consultancy — they get medicines licensed in markets
where the client has no local entity, and then carry the safety obligations that
follow. The buyer is a pharma company's regulatory or commercial lead.

Piyush is the developer and designer. The client contact is **Ashish Mishra**
(Commercial Services). **Akshay is the CEO.**

The design phase is finished and approved in principle. This folder is the
production build of that design.

## Read in this order

| If you are... | Read |
|---|---|
| Picking the project up cold | **`handover.md` first**, then this file, then `progress.md` |
| Touching `lib/map/`, or a marker position | `map-geometry.md` |
| Asked what is and is not built | `sitemap-gap-analysis.md` |
| Building or changing a section | `design-spec.md`, then `architecture.md` §section contract |
| Making a technical choice | `decisions.md` — check it is not already decided (or already rejected) |
| Wondering why something is unfinished | `blocked-on-client.md` |
| Asked about anything the client said in the September review | `client-feedback-2026-09-15.md` |
| Touching anything CMS or API shaped | `integration.md`, then `cms-architecture.md` |
| Building Insights (templates E/F) | `article-contract.md` — the real Creator model and publish payload |
| Needing the client's own words | `reference/` — their baseline doc, sitemap and URL architecture |

## The one-paragraph version

Next.js 16 App Router, React 19 server components, Tailwind v4 with the design
system in `styles/tokens.css`. A page is an ordered list of **sections**; each
section type is a folder under `components/sections/` holding a component, a Zod
schema and a fixture. The schemas compose into one discriminated union, and
`components/sections/registry.tsx` maps type to component. Content comes from
fixtures today and from the Catalyst API later — that swap is one function.

**The site is live at www.genedrift.site and the client is reviewing it.**
Twenty-five section types, every template A–H, the homepage, 46 country pages,
6 region pages, the hubs, Insights, Careers, Contact, Search and Global
Presence. Content comes from Creator through Catalyst, with the fixtures as the
fallback when nothing is published for a path.

Every item in the client's September feedback is closed. What remains is
content and decisions owed by them, plus page families in their sitemap that
were never designed — see `handover.md` and `sitemap-gap-analysis.md`.

## Where the design lives

`context/design/` holds the approved HTML sent to the client on 2026-09-12 —
homepage, three Industries concepts, Careers. **That is the spec.** Build against
those files, not against a description of them. They are design artefacts: no
responsiveness, no real components, inline everything. Do not copy their code.

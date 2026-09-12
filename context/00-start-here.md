# Start here

Last updated: 2026-09-12.

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
| Picking the project up cold | this file, then `progress.md` |
| Building or changing a section | `design-spec.md`, then `architecture.md` §section contract |
| Making a technical choice | `decisions.md` — check it is not already decided (or already rejected) |
| Wondering why something is unfinished | `blocked-on-client.md` |
| Touching anything CMS or API shaped | `integration.md` |
| Needing the client's own words | `reference/` — their baseline doc, sitemap and URL architecture |

## The one-paragraph version

Next.js 16 App Router, React 19 server components, Tailwind v4 with the design
system in `styles/tokens.css`. A page is an ordered list of **sections**; each
section type is a folder under `components/sections/` holding a component, a Zod
schema and a fixture. The schemas compose into one discriminated union, and
`components/sections/registry.tsx` maps type to component. Content comes from
fixtures today and from the Catalyst API later — that swap is one function.

Two sections exist. Twenty-four to go. The chain is proven end to end, so the
remaining work is volume, not risk.

## Where the design lives

`context/design/` holds the approved HTML sent to the client on 2026-09-12 —
homepage, three Industries concepts, Careers. **That is the spec.** Build against
those files, not against a description of them. They are design artefacts: no
responsiveness, no real components, inline everything. Do not copy their code.

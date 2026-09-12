# Architecture

## Stack, and why

| Choice | Why |
|---|---|
| **Next.js 16, App Router, React 19 RSC** | Content-driven, cacheable, on-demand revalidation already proven by the existing Insights pages. Astro was considered and rejected — less JS shipped, but it orphans the working Catalyst revalidation hooks. |
| **npm + `package-lock.json`** | Was going to be pnpm. Changed during scaffolding: npm is what is on the machine and in CI, and pnpm's symlinked `node_modules` is refused by Turbopack when the project sits on a mounted folder. |
| **Tailwind v4, CSS-first config** | The whole design system lives in `styles/tokens.css` under `@theme`. One file. Pin the version. |
| **CVA + tailwind-merge** | Component variants without prop soup, and override safety. |
| **Zod v4** | Validates the Catalyst payload at the boundary. Non-negotiable: a malformed editor save must fail typed, not white-screen production. The schemas also generate the editable-field list we hand the client as the CMS spec. |
| **Radix primitives** | Accordion, dialog, mega menu, mobile nav — keyboard and ARIA we would otherwise write badly. |
| **d3-geo `geoEqualEarth` + topojson-client** | Build-time only, for the world map. Equal Earth over Robinson: equal-area, so no territory is visually exaggerated. It is in d3-geo core, so `d3-geo-projection` is not needed. |
| **react-hook-form + @hookform/resolvers** | Contact and PV/safety forms, sharing the same Zod schemas. Server actions for submission. |
| **`next/font/local`, self-hosted** | Archivo (variable) and IBM Plex Mono woff2 sit in `app/fonts/`, taken from the `@fontsource*` packages. No Google Fonts request at build or runtime. |
| **Vitest + Playwright** | Schemas and mappers; e2e and visual regression against `/dev/sections`. |

## The section contract — the centre of the whole build

One folder per section type, schema co-located with component:

```
components/sections/capability-panels/
  index.tsx      the component
  schema.ts      its Zod schema
  fixture.ts     sample data
```

All section schemas compose into `z.discriminatedUnion("type", [...])` in
`lib/schema/section.ts`. A page record is `{ slug, title, seo?, sections: Section[] }`,
validated at the boundary.

One definition therefore yields three things: TypeScript types, runtime
validation, and the list of editable fields for the CMS spec.

**A page is then a loop:** fetch record → walk the ordered sections → render each
by name from the registry. Adding a section type is one folder plus one registry
line. Nothing else changes.

**Empty states are part of the contract.** Decide, per section, what happens with
zero items. Default: a section with no items does not render. Cheap now,
genuinely annoying to retrofit.

## Templates

8 templates cover roughly 40 URLs:

| | Template | Covers |
|---|---|---|
| A | Home | `/` |
| B | Hub | the 7 service pillars — one file |
| C | Detail | 5 route families under the pillars |
| D | Geo | `markets/[region]/[country]` |
| E | Article listing | Insights index — **ports from the old repo's `frontend/`** |
| F | Article | Insights detail — **ports from the old repo's `frontend/`** |
| G | Job | `careers/[job]` |
| H | Form | `contact/[intent]` |

B and C alone cover twelve routes. That is where the leverage is.

**26 sections total.** Six of them (filter bar, article grid, article head,
reading tools, pagination, footer) already exist in the old repo's `frontend/`
and port across. The other twenty are new.

## Folder layout

```
genedrift-web/
├─ CLAUDE.md                     read first, every session
├─ context/                      this folder — the project's memory
├─ app/
│  ├─ layout.tsx  page.tsx       home
│  ├─ fonts/                     self-hosted woff2
│  ├─ [pillar]/page.tsx          template B
│  ├─ [pillar]/[slug]/page.tsx   template C
│  ├─ markets/[region]/[country]/page.tsx
│  ├─ insights/…                 templates E, F (ported)
│  ├─ careers/[job]/page.tsx     template G
│  ├─ contact/[intent]/page.tsx  template H
│  └─ dev/sections/page.tsx      component gallery, noindex
├─ components/
│  ├─ sections/<name>/{index.tsx,schema.ts,fixture.ts}
│  ├─ sections/registry.tsx      type → component
│  └─ layout/  ui/
├─ lib/
│  ├─ content/                   fixtures now, Catalyst client later
│  └─ schema/                    the discriminated union
├─ styles/tokens.css             the design system
└─ scripts/build-map.ts          emits the world path data (not written yet)
```

## Conventions

- **No arbitrary Tailwind values.** This single rule is what keeps 26 components
  coherent. Lint should fail otherwise.
- **Animation in CSS**, `prefers-reduced-motion` handled globally.
- **Server components by default.** `"use client"` only where there is real
  interaction — map hover, billboard, accordion, nav.
- **Fixtures before components.** Shape first.
- `/dev/sections` renders every section from its fixture. Playwright snapshots it,
  so a CSS change that breaks section 14 fails CI. Cheaper than Storybook, and it
  doubles as the page to send the client when they want one component in isolation.

## Environment traps (each of these cost an hour to find)

- **Google Fonts is unreachable** from this machine's sandboxed shell — the egress
  proxy denies `fonts.googleapis.com`. This is why fonts are self-hosted. Do not
  reintroduce `next/font/google`; the build will fail.
- The npm registry **is** reachable, so `npm install` works normally.
- **Turbopack refuses a symlinked `node_modules`** pointing outside the project
  root. Build inside the project, not from a scratch dir with a linked modules dir.

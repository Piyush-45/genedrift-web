# Integration — how this app relates to everything else

## The three pieces

```
Zoho Creator  ──publish──▶  Zoho Catalyst  ──public API──▶  this Next.js app
(editorial                  (immutable                      (renders)
 workspace)                  versions +
                             pointer)
```

**Creator** is where the client's team writes and approves. It is the editorial
workspace, not the source of truth for the live site.

**Catalyst** stores immutable versions and serves the public API. Publishing
writes a *new version* and advances a pointer — it never edits in place. That is
what makes rollback possible and what makes a bad save non-fatal.

**This app** fetches from Catalyst, validates with Zod at the boundary, and
renders. It has no write path.

## Where the other pieces live

A **separate repo**, currently at
`~/.codex/.chatgpt-projects/g-p-6a8889a848888191b2ad25dd63f743ee/`:

- `catalyst/` — the publishing service
- `creator/` — the Creator application definition and deluge functions
- `editor-widget/` — the editing widget embedded in Creator
- `frontend/` — the **old** Next app, still live, holding the two Insights
  templates that need porting here
- `docs/` — the full documentation set; the four that matter here are copied into
  `context/reference/`

That repo is not part of this build and should not be edited from here except
when porting the Insights templates across.

## What still has to be built on that side

- **Catalyst: a `website_page` content type.** Extend, do not rebuild. A day or two.
- **Creator: a new application for website content** — `Website_Pages`,
  `Website_Page_Revisions`, `Website_Sections`, plus reusable collections. The
  existing article app is left alone; website pages are a different content model.

## The swap from fixtures to the API

`lib/content/fixtures.ts` exports `getPage(slug)`. Today it returns a hardcoded,
Zod-validated page. When Catalyst is ready, that one function fetches instead.
Nothing else in the app changes — that is the whole point of the section contract.

The Zod schemas are also what we hand the client as the CMS field spec, so the
editor forms and the renderer cannot drift apart.

## Revalidation

Catalyst already fires revalidation hooks, and the old `frontend/` already
consumes them. Port that wiring rather than reinventing it — it is the single
biggest reason Astro was rejected.

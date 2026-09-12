# Progress

Update this file at the end of a working session. It is the first thing a new
chat reads after `00-start-here.md`.

---

## Status as of 2026-09-12

**Phase: production build, section batch 1.**

### Done

**Design — approved in principle.** The client chose Meridian as the base and sent
22 sections of comments. All 22 were addressed. The consolidated homepage, three
Industries concepts and a first Careers page were sent for review on 2026-09-12.
Awaiting his reply.

**The vertical slice — proven end to end.** This was deliberately done before
building volume, so that 24 components are not written against an unproven renderer.

- Scaffolded: npm, TypeScript strict with `noUncheckedIndexedAccess`, Tailwind v4,
  the full design system in `styles/tokens.css`
- The discriminated union and the section registry, with exactly **two** sections:
  `statement` and `capability-panels`
- `/` renders from a fixture in `lib/content/fixtures.ts` — no CMS involved
- `/dev/sections` renders every fixture, `noindex`
- `npm run build` green, `tsc --noEmit` clean, both pages verified visually

What that proves: Zod union → registry → component → page → static build, with
tokens resolving and self-hosted fonts loading. The renderer is no longer a risk.
What remains is visual detail per section, which a screenshot resolves in one turn.

### Not done

- **No Vercel preview deploy yet.** Needs Piyush's account. This is the last item
  before the slice counts as fully closed.
- **No git remote.** See the warning at the bottom of this file.
- 24 of 26 sections unbuilt.
- The two Insights templates not yet ported from the old repo's `frontend/`.
- Catalyst has no `website_page` content type yet.
- The Creator website app does not exist yet.
- Mobile/responsive not started for any template.
- `scripts/build-map.ts` not written — the map data pipeline is still the Python
  scripts in the design folder.

### Next

1. Port the two Insights templates (E and F) out of the old `frontend/`. Do this
   **early** — week two, not month three. `lib/api.ts` there already talks to
   Catalyst, so it is roughly a day. Then one cutover, delete the old app, and
   there is only ever one live site. Two deployable Next apps in one repo is how
   a bug gets fixed in the wrong one.
2. Build the remaining sections in batches, reviewing after each batch rather than
   after all 24.
3. Extend Catalyst with `website_page`.
4. Create the Creator website app.

---

## ⚠️ Repo safety — read once

This folder was created on 2026-09-12 by moving the app out of a tooling sandbox
directory (`~/.codex/.chatgpt-projects/<hash>/`), where the whole Genedrift
engagement had been living with **no git remote and 141 uncommitted files**.

The old repo still holds Catalyst, Creator, the editor widget and the docs, and
still has no remote. That is one folder deletion away from losing the engagement.

**Push both repos to private remotes.** This is not a nice-to-have.

# Design spec

## The spec is the HTML, not this file

`context/design/` holds the approved design as sent to the client on 2026-09-12:

| Folder | What |
|---|---|
| `home/` | The consolidated homepage — Meridian base, Atrium elements merged, all 22 client comments applied |
| `industries/` | Three concepts, A / B / C. **Client has not yet chosen.** |
| `careers/` | Careers page. **All content is invented** — see `blocked-on-client.md` |
| `index.html` | The index page the client was given |

Open them in a browser and build against what you see. Do not build against a
description of them, and do not copy their code — they are design artefacts:
inline everything, no responsiveness, no components.

Also published (these survive independently of any folder):

| What | URL |
|---|---|
| Consolidated homepage | https://claude.ai/code/artifact/ff8251a7-cf37-41d2-a5f1-2aeb9567ad0a |
| Industries — 3 concepts | https://claude.ai/code/artifact/77fa8c4c-b026-4da8-bc62-58fb5ff910ee |
| Careers | https://claude.ai/code/artifact/ac58807d-25af-41c9-b0b3-860f403e7620 |
| Build map (templates + sections + file tree) | https://claude.ai/code/artifact/240f883a-d395-463e-9c84-35d79ecf9e06 |

## The sample-content toggle

The design pages carry a toggle that highlights invented content: **amber** means
invented, **purple** means needs verifying. 140 items are marked across the three
pages. Use it before showing anything to the client, and never let amber content
go live unverified.

## Design system

Everything is in `styles/tokens.css`. Abridged:

| Token group | Values |
|---|---|
| Ink | `--color-ink #181528`, `--color-mid #5b5770`, `--color-muted #6b6880`, `--color-faint #9a94b4`, `--color-ghost #c0bad2` |
| Lines | `--color-line #e7e4f2`, `--color-hair #f1eff8` |
| Grounds | `--color-canvas #ffffff`, `--color-surface #f4f5f7`, `--color-lavender #f0eefb`, `--color-band #f5f4f0` |
| Brand | `--color-accent #5b3fd2`, `--color-accent-soft #7c63e8`, `--color-deep #241653` |
| Type | Archivo for everything; IBM Plex Mono for eyebrows, tags and data |
| Scale | `--text-display 3.375rem`, `--text-h1 2.5rem`, `--text-h2 2.0625rem` |
| Rhythm | `--spacing-gutter 6rem`, `--spacing-section 7rem`, `--container-body 78rem` |
| Motion | `--ease-out-soft cubic-bezier(0.2, 0.7, 0.3, 1)` |

If a value you need is not there, **add a token** — do not inline it.

## What the homepage does, section by section

The page answers a buyer's questions in the order a buyer asks them:

1. **Hero + world map** — *where do you operate?* 46 markets as points on a
   borderless landmass; hovering one shows its capabilities and local time.
2. **Capability panels** — *what do you actually do?* RA, PV, MAH & Local
   Representation.
3. **Operating model** — *how do you work?* One regional team, one commercial
   relationship.
4. **Proof billboard** — *has this worked before?* Three case stories as a
   playlist with a progress bar; hover pauses, click holds. Built this way
   because the client explicitly said not to limit it to one success story.
5. **Industries** — *do you know my product type?*
6. **Insights** — *are you current?*
7. **Contact** — *how do I start?*

## Things the client banned

- The whole hero in the brand colour
- A market comparison table (and the "Compare Markets" footer link with it)
- Icons in the places their review names — check `reference/` before adding any

## Open design items

- **Marker style not finally chosen.** Six treatments were built. Recommendation:
  "core and ring", or "open ring" — both fix the cluster-blob problem that the
  current solid style has in West Africa and South East Asia.
- **Mobile not designed** for any template. The hero's touch fallback is a 3.2s
  auto-rotate, since there is no hover.
- Never built, previously offered: a great-circle reach arc from India to the
  hovered market, an idle scan, a coastline hairline.

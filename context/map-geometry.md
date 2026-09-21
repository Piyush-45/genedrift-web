# The map: where its geometry comes from and how to change it

**21 September 2026.** Everything about `lib/map/`. Read this before touching
the hero map, the country locators, or anything that positions a marker.

---

## The three files, and which are generated

| File | Generated? | What it holds |
|---|---|---|
| `lib/map/land.ts` | **yes** | The world as one silhouette — 160 paths, every country merged |
| `lib/map/countries.ts` | **yes** | `COUNTRY_SHAPES` (46 outlines) and `COUNTRY_MARKERS` (44 interior points + a radius) |
| `lib/map/markets.ts` | **no** | The 46 market records: names, regions, capabilities, and the fallback x/y |

The first two are written by `scripts/build-countries.mjs` and say so in their
headers. **Do not hand-edit them.** An edit survives until the next
regeneration and then vanishes without warning.

---

## The source file, and why it must be that one

```
ne_10m_admin_0_countries_ind        <- the INDIA point-of-view edition
```

Natural Earth's **default** edition draws *de facto* boundaries, "according to
who controls the territory". The **point-of-view** editions draw *de jure*
boundaries "as prescribed by the home country's law".

This site is published by an Indian company, so the India POV edition is the one
that may be used. Substituting `ne_10m_admin_0_countries` — the same name
without `_ind` — is the exact failure the 2026-09-12 decision in `decisions.md`
was written to prevent. The difference is one suffix and it is the whole point.

Download: naturalearthdata.com → **1:10m Cultural** → *Admin 0 – Countries
point-of-views* → **India POV**. The POV variants only exist at 10m. The file is
about 9MB, is an input rather than an asset, and is gitignored.

---

## Regenerating

```
npm i -D shapefile d3-geo topojson-server topojson-simplify topojson-client
node scripts/build-countries.mjs ~/path/to/ne_10m_admin_0_countries_ind
```

It writes both files and prints the sizes. It **exits non-zero** if any of the
46 markets has no matching geometry, because a market with no shape silently
loses its highlight.

Two knobs at the top of the script:

- `RETAIN` — fraction of the source's 455,000 vertices kept. `0.02` gives about
  115KB across both files. Raising it sharpens coastlines and costs payload in
  a straight line.
- `MIN_AREA` — smallest polygon kept, in square pixels of the final map.

---

## The projection was recovered, not documented

The approved design's map is Equal Earth pre-projected into a 1160×491 box, and
nobody wrote down the parameters. They were recovered by optimising scale and
translate against the coastline of the previous `land.ts`: **median error 4px
over 43,000 sample points.**

```
scale 223.1571   translate [578.145, 309.38]
```

They live in `PROJECTION` at the top of the generator. Change them and the map
moves relative to everything built around it.

---

## Marker positions override the CMS

`COUNTRY_MARKERS[slug]` is `[x, y, radius]`:

- **x, y** — the country's pole of inaccessibility, the interior point furthest
  from any coastline. Guaranteed inside the shape.
- **radius** — half the shape's bounding diagonal, used to size the light that
  glows from within the country. One radius for all 46 makes small countries a
  blob and large ones a pinprick.

`lib/content/markets-source.ts` applies these **in preference to the x/y on the
market record**, for both CMS and built-in data. The stored values came from the
approved artwork and put 25 of the 46 markers outside their own country; see
`decisions.md`. Singapore and Hong Kong have no usable interior at this scale
and keep whatever their record carries.

This means **editing Map X / Map Y in Creator has no visible effect** for any
market with geometry. That is intentional and should be explained at handover,
or those fields should be hidden on the form.

---

## How the highlight is drawn

Three layers, hero and country pages alike:

1. **Base landmass** — `LAND_PATHS`, filled `--color-line-tint`.
2. **Halo** — the country shape, `--color-accent-soft`, blurred wide (7).
3. **Core** — the same shape filled with a radial gradient whose source is the
   country's own interior point, blurred tight (1.8).

The gradient is what makes it read as lit from within rather than painted over.
It is positioned in user space against the live country, so it is rendered by
the client component rather than shared in the server's `<defs>`.

**Nothing is ever stroked.** The feathered edge is the requirement — see
`decisions.md`. A stroke would re-introduce exactly the drawn boundary the
client asked to avoid.

---

## How the shapes reach the browser without becoming JavaScript

The server renders all 46 outlines into `<defs>` as `<path id="country-{slug}">`
and the client map references them with `<use href="#country-{slug}">`. So 43KB
of path data streams as HTML and never enters the client payload — the same
reason the landmass is passed into the client component as `children`.

`<use>` also carries the hit area, which is why the country itself is hoverable
without the client ever holding the geometry.

---

## Known limits

- **Singapore, Hong Kong and Brunei** collapse to near-zero area at this
  simplification. Singapore is a degenerate three-point path. They are carried
  by their dot and glow; they cannot show a country shape at this map size.
- The **coastline is not pixel-identical** to the approved artwork. Different
  dataset, different simplification. The client was told before it shipped.
- In the India POV edition **Taiwan carries the ISO code `CN-TW`** rather than
  `TW`, which is why the slug map uses alpha-3 codes.
- Antarctica is dropped: not a market, and the approved design has no band
  across the bottom of the frame.

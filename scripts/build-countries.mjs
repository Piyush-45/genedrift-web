/**
 * Regenerates lib/map/land.ts and lib/map/countries.ts from Natural Earth.
 *
 * ## The source file, and why it must be this one
 *
 *   ne_10m_admin_0_countries_ind      <- the INDIA point-of-view edition
 *
 * Natural Earth's default edition draws *de facto* boundaries, "according to
 * who controls the territory". The POV editions draw *de jure* boundaries "as
 * prescribed by the home country's law". This site is published by an Indian
 * company, so the India POV edition is the one that may be used. Do not
 * substitute `ne_10m_admin_0_countries` — the filename difference is the whole
 * point.
 *
 * Download: naturalearthdata.com -> 1:10m Cultural -> Admin 0 - Countries
 * point-of-views -> India POV. Unzip anywhere and pass the path prefix:
 *
 *   npm i -D shapefile d3-geo topojson-server topojson-simplify topojson-client
 *   node scripts/build-countries.mjs ~/somewhere/ne_10m_admin_0_countries_ind
 *
 * The shapefile is ~9MB and is NOT committed. It is an input, not an asset.
 *
 * ## Why both files come out of one run
 *
 * `LAND_PATHS` is every country merged into one silhouette; `COUNTRY_SHAPES`
 * is the 46 markets individually. Generating them together from the same
 * simplified topology means a market's shape sits exactly on the coastline
 * beneath it. Generated separately they drift, and the seam shows as a
 * hairline crack between neighbours.
 *
 * ## The projection is fitted, not guessed
 *
 * The approved design's map is Equal Earth pre-projected into a 1160x491 box,
 * and the parameters were never recorded. They were recovered by optimising
 * scale and translate against the coastline of the previous `land.ts`: median
 * error 4px over 43,000 sample points. That is why the new map lands where the
 * old one did rather than somewhere near it.
 *
 * The coastline is NOT pixel-identical to the artwork the client signed off —
 * a different dataset at a different simplification cannot be. It is close,
 * and the client was told.
 */
import * as shapefile from "shapefile";
import { geoEqualEarth, geoPath } from "d3-geo";
import { topology } from "topojson-server";
import { presimplify, simplify, quantile } from "topojson-simplify";
import { feature, merge } from "topojson-client";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** Recovered from the approved artwork. See the header. */
const PROJECTION = { scale: 223.1571, translate: [578.145, 309.38] };

/**
 * Fraction of vertices RETAINED by the simplifier. 0.02 of 455,000 source
 * points gives ~115KB across both files — roughly 2.5x the previous map, all
 * of it streamed as HTML rather than parsed as JavaScript. Raising it sharpens
 * coastlines and costs payload in a straight line.
 */
const RETAIN = 0.02;

/** Smallest polygon kept, in square pixels of the final map. Below this a
 *  shape is a speck that reads as a rendering artefact. */
const MIN_AREA = 3;

/** market slug -> ISO 3166-1 alpha-3. Alpha-2 is not usable here: in the India
 *  POV edition Taiwan carries `CN-TW` rather than `TW`. */
const SLUG_ISO3 = {
  benin: "BEN", "burkina-faso": "BFA", cameroon: "CMR", chad: "TCD",
  "cote-divoire": "CIV", "dr-congo": "COD", ethiopia: "ETH", ghana: "GHA",
  kenya: "KEN", madagascar: "MDG", nigeria: "NGA", senegal: "SEN",
  "south-africa": "ZAF", tanzania: "TZA", togo: "TGO", uganda: "UGA",
  zimbabwe: "ZWE", brunei: "BRN", cambodia: "KHM", "hong-kong": "HKG",
  india: "IND", indonesia: "IDN", laos: "LAO", malaysia: "MYS",
  myanmar: "MMR", pakistan: "PAK", philippines: "PHL", singapore: "SGP",
  "sri-lanka": "LKA", taiwan: "TWN", thailand: "THA", vietnam: "VNM",
  azerbaijan: "AZE", kazakhstan: "KAZ", kyrgyzstan: "KGZ", uzbekistan: "UZB",
  russia: "RUS", ukraine: "UKR", chile: "CHL", "el-salvador": "SLV",
  guatemala: "GTM", honduras: "HND", nicaragua: "NIC", peru: "PER",
  "saudi-arabia": "SAU", "united-arab-emirates": "ARE",
};


/**
 * A point guaranteed to sit INSIDE a country, for its map marker.
 *
 * Why this is generated rather than taken from the design: the 46 marker
 * positions in the market data came from the approved artwork and were laid
 * out against a different projection from the landmass. Measured against real
 * geometry, 25 of the 46 sat outside their own country — equatorial markers
 * consistently too far north, far-northern ones too far south, which is the
 * signature of a different latitude mapping. Invisible while a marker was just
 * a dot near a country; obvious the moment the country lights up around it.
 *
 * A centroid is not enough: Indonesia's centroid is in the Java Sea and
 * Chile's is in Argentina. This is the standard pole-of-inaccessibility
 * search — the interior point furthest from any edge — run on the country's
 * largest polygon.
 */
function poleOfInaccessibility(ring, holes = []) {
  const xs = ring.map((p) => p[0]);
  const ys = ring.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);

  const pointInRing = (x, y, r) => {
    let inside = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  const edgeDistance = (x, y, r) => {
    let best = Infinity;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
      const [xi, yi] = r[i], [xj, yj] = r[j];
      const dx = xj - xi, dy = yj - yi;
      const len = dx * dx + dy * dy;
      let t = len ? ((x - xi) * dx + (y - yi) * dy) / len : 0;
      t = Math.max(0, Math.min(1, t));
      best = Math.min(best, Math.hypot(x - (xi + t * dx), y - (yi + t * dy)));
    }
    return best;
  };
  const score = (x, y) => {
    if (!pointInRing(x, y, ring)) return -1;
    for (const h of holes) if (pointInRing(x, y, h)) return -1;
    let d = edgeDistance(x, y, ring);
    for (const h of holes) d = Math.min(d, edgeDistance(x, y, h));
    return d;
  };

  // Coarse grid, then refine around the winner. Cheap and deterministic.
  let best = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, d: -1 };
  const scan = (x0, x1, y0, y1, steps) => {
    const sx = (x1 - x0) / steps, sy = (y1 - y0) / steps;
    for (let i = 0; i <= steps; i += 1) {
      for (let j = 0; j <= steps; j += 1) {
        const x = x0 + i * sx, y = y0 + j * sy;
        const d = score(x, y);
        if (d > best.d) best = { x, y, d };
      }
    }
  };
  scan(minX, maxX, minY, maxY, 40);
  for (let pass = 0; pass < 4; pass += 1) {
    const w = (maxX - minX) / 40 / 2 ** pass, h = (maxY - minY) / 40 / 2 ** pass;
    scan(best.x - w, best.x + w, best.y - h, best.y + h, 10);
  }
  return best.d > 0 ? [Math.round(best.x * 10) / 10, Math.round(best.y * 10) / 10] : null;
}

const prefix = process.argv[2];
if (!prefix) {
  console.error("usage: node scripts/build-countries.mjs <path/to/ne_10m_admin_0_countries_ind>");
  process.exit(1);
}

/** dBase pads strings with NULs. */
const clean = (s) => String(s ?? "").replace(/\0/g, "").trim();

const fc = await shapefile.read(`${prefix}.shp`, `${prefix}.dbf`);

/** Antarctica is dropped: it is not a market, and at this projection it is a
 *  band across the bottom of the frame that the approved design does not have. */
const features = fc.features
  .filter((f) => !/Antarctic/i.test(clean(f.properties.ADMIN)))
  .map((f) => ({
    type: "Feature",
    properties: { iso: clean(f.properties.ISO_A3) },
    geometry: f.geometry,
  }));

const isoToSlug = Object.fromEntries(Object.entries(SLUG_ISO3).map(([s, i]) => [i, s]));
const unmatched = Object.entries(SLUG_ISO3).filter(([, iso]) => !features.some((f) => f.properties.iso === iso));
if (unmatched.length) {
  // A market with no shape would silently lose its highlight, so this is fatal.
  console.error("No geometry for:", unmatched.map((u) => u.join("=")).join(", "));
  process.exit(1);
}

/** Topology first: shared borders become shared arcs, so simplification moves
 *  both sides of a border identically and neighbours keep touching. */
let topo = presimplify(topology({ countries: { type: "FeatureCollection", features } }));
topo = simplify(topo, quantile(topo, RETAIN));

const projection = geoEqualEarth().scale(PROJECTION.scale).translate(PROJECTION.translate);
const path = geoPath(projection);
const round = (d) => d.replace(/(\d+\.\d+)/g, (m) => String(Math.round(parseFloat(m) * 10) / 10));
const areaOf = (poly) => Math.abs(path.area({ type: "Polygon", coordinates: poly }));

const landPaths = merge(topo, topo.objects.countries.geometries)
  .coordinates.filter((poly) => areaOf(poly) >= MIN_AREA)
  .sort((a, b) => areaOf(b) - areaOf(a))
  .map((poly) => round(path({ type: "Polygon", coordinates: poly })));

const countries = {};
const markers = {};
for (const f of feature(topo, topo.objects.countries).features) {
  const slug = isoToSlug[f.properties.iso];
  if (!slug) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const kept = polys.filter((p) => areaOf(p) >= MIN_AREA);
  // Singapore, Hong Kong and Brunei are all below MIN_AREA. Keep their largest
  // polygon anyway: a market with no shape at all is worse than a small one.
  const use = kept.length ? kept : [polys.sort((a, b) => areaOf(b) - areaOf(a))[0]];
  countries[slug] = round(path({ type: "MultiPolygon", coordinates: use }));

  const largest = [...use].sort((a, b) => areaOf(b) - areaOf(a))[0];
  const projected = largest.map((ring) => ring.map((c) => projection(c)).filter(Boolean));
  const marker = projected[0] && projected[0].length > 3
    ? poleOfInaccessibility(projected[0], projected.slice(1))
    : null;
  // Singapore and Hong Kong have no usable interior at this scale; their
  // existing marker is the only position they have, so leave them alone.
  if (marker) markers[slug] = marker;
}

const header = (what) => `/**
 * ${what}
 *
 * GENERATED by scripts/build-countries.mjs from Natural Earth
 * ne_10m_admin_0_countries_ind (the India point-of-view edition — read that
 * script's header before regenerating with anything else).
 *
 * Equal Earth, pre-projected into the 1160x491 viewBox.
 * Do not hand-edit.
 */`;

const out = join(process.cwd(), "lib", "map");

writeFileSync(
  join(out, "land.ts"),
  `${header("The world landmass, as one silhouette.\n *\n * Every country merged. No international boundaries are drawn — a deliberate\n * client requirement, not an omission. Per-market shapes live in countries.ts\n * and are generated in the same run so they sit exactly on this coastline.")}
export const MAP_VIEWBOX = "0 0 1160 491";

export const LAND_PATHS: readonly string[] = [
${landPaths.map((d) => `  "${d}",`).join("\n")}
];
`,
  "utf8",
);

writeFileSync(
  join(out, "countries.ts"),
  `${header("One filled shape per market, keyed by market slug.\n *\n * Rendered into <defs> by the hero and referenced with <use>, so the path data\n * is streamed once as HTML and never enters the JavaScript bundle. See\n * components/sections/hero-map/world-map.tsx.")}
export const COUNTRY_SHAPES: Readonly<Record<string, string>> = {
${Object.keys(countries).sort().map((s) => `  "${s}": "${countries[s]}",`).join("\n")}
};

/**
 * Where each market's marker belongs: the interior point furthest from any
 * coastline, in the same projected space as the shapes above.
 *
 * This OVERRIDES the x/y held in the market record. Those came from the
 * approved artwork, were laid out against a different projection, and put 25
 * of the 46 markers outside their own country. A market with no entry here
 * keeps whatever position its record carries.
 */
export const COUNTRY_MARKERS: Readonly<Record<string, readonly [number, number]>> = {
${Object.keys(markers).sort().map((s) => `  "${s}": [${markers[s][0]}, ${markers[s][1]}],`).join("\n")}
};
`,
  "utf8",
);

const kb = (s) => (s / 1024).toFixed(0);
console.log(
  `[build-countries] land ${landPaths.length} paths ${kb(landPaths.join("").length)}KB · ` +
    `countries ${Object.keys(countries).length} ${kb(Object.values(countries).join("").length)}KB`,
);

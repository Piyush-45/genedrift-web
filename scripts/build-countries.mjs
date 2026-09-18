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
for (const f of feature(topo, topo.objects.countries).features) {
  const slug = isoToSlug[f.properties.iso];
  if (!slug) continue;
  const polys = f.geometry.type === "Polygon" ? [f.geometry.coordinates] : f.geometry.coordinates;
  const kept = polys.filter((p) => areaOf(p) >= MIN_AREA);
  // Singapore, Hong Kong and Brunei are all below MIN_AREA. Keep their largest
  // polygon anyway: a market with no shape at all is worse than a small one.
  const use = kept.length ? kept : [polys.sort((a, b) => areaOf(b) - areaOf(a))[0]];
  countries[slug] = round(path({ type: "MultiPolygon", coordinates: use }));
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
`,
  "utf8",
);

const kb = (s) => (s / 1024).toFixed(0);
console.log(
  `[build-countries] land ${landPaths.length} paths ${kb(landPaths.join("").length)}KB · ` +
    `countries ${Object.keys(countries).length} ${kb(Object.values(countries).join("").length)}KB`,
);

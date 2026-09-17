# Decision log

Append-only. Newest at the bottom of each section. If you are about to make a
choice, check here first — it may already be made, or already rejected.

---

## Design decisions (locked with the client)

**Meridian is the base design.** The client reviewed two directions and chose
Meridian, with selected elements merged in from Atrium. He sent 22 sections of
written comments; all 22 were addressed in the version at `context/design/`.

**The hero is locked.** 1440×780 — a real laptop fold, not 900. White ground,
`#5B3FD2` accent. The market status card sits under the CTA in the left column.
It was previously bottom-right; that got clipped on short viewports and covered
southern Africa's hover targets.

**The whole hero is never in the brand colour.** The client said this explicitly.
A concept that ignored it was built and rejected.

**The map has no borders at all.** Every country polygon is dissolved into a
single landmass; markets are points on it, and a highlighted market is a soft
radial glow sized from that country's real bounding box — a glow, not a shape and
not an outline.

Why: Natural Earth ships the de-facto/LoC map of India. This was verified
programmatically, not assumed — Aksai Chin, northern Gilgit-Baltistan and
Arunachal (Tawang) all fall outside its India polygon. That is the version that
causes legal problems for a site published in India. Hand-drawing the correct
boundary from memory was refused: an approximated national boundary published
under the client's name is worse than no boundary at all. Dissolving also removes
Taiwan, Crimea, Western Sahara, Palestine and Kosovo as questions in one move.

If borders ever become mandatory, the fix is to swap the basemap for a
Survey-of-India-compliant source (e.g. Mappls/MapmyIndia). That is a data-source
swap, not a purchase and not a design decision. **Not legal advice.**

**No market comparison table** anywhere. The "Compare Markets" footer link went
with it. Client's call.

**Homepage search stays.** Piyush's call, against an earlier recommendation to cut
it. Can be removed later if the client objects.

**Local time per market** in the hover card. This is what makes the day/night
shading mean something rather than being decoration. The standalone UTC clock chip
was cut; a two-word legend remains.

**Global Presence does not repeat the map** — the hero carries it. That section is
six region cards plus a dark summary bar.

**No icons where the client banned them.** Their review is explicit about this.
Check `reference/` before adding any.

---

## Technical decisions

**Fresh app, not a fork of the old `frontend/`.** Everything that encodes *what
the site looks like* is thrown away. Everything that encodes *how content gets
published safely* — Catalyst — is kept. See `integration.md`.

**Catalyst is extended, not rebuilt.** It takes approved JSON, writes an immutable
version, advances a pointer, serves it, and fires revalidation. A new design
invalidates none of that. Rebuilding means re-solving signed publish, versioning,
media and rollback to arrive exactly where we already are. It needs one new
content type, `website_page` — a day or two.

**Creator gets a new application** for website content. Website pages are a
different content model from articles: `Website_Pages`, `Website_Page_Revisions`,
`Website_Sections`, plus reusable collections. The existing article app is left
alone.

**npm, not pnpm.** See `architecture.md` for the reason.

**Fonts self-hosted via `next/font/local`.** Not a preference — the Google Fonts
host is blocked from this machine's build shell. It is also the better answer: a
pharma client's site makes no third-party font request.

**Equal Earth, not Robinson**, for the map projection. Equal-area, so no territory
is visually exaggerated — a better posture for a client who is nervous about maps.

**Schemas run at build time, not in the request path.** Zod converts the section
schemas to JSON Schema once, during `npm run build`, into
`public/section-schemas.json`. Nothing in the request path imports a validation
library. At runtime `lib/content/guard.ts` asks only two questions — is the
record shaped right at the top level, and is every section type one we have a
component for. Deep per-field validation belongs at *publish* time in Catalyst,
where a bad save can still be rejected and the editor told why; re-parsing 26
shapes on every request spends time discovering a problem far too late to fix.
Rule, and it is lintable: `zod` may be imported only by
`components/sections/*/schema.ts` and `scripts/`. Components import types only.

**Market capabilities are an array, not three fields.** `[{ name, status }]`,
not `ra` / `mah` / `pv`. The client has not said whether a market always has
exactly three capabilities (blocker 1), and modelling it as an array means the
answer stops mattering to the frontend — three renders as three, five renders as
five. It reduces that blocker from "migrate 46 records" to a Creator subform
decision.

**Fluid tokens, not breakpoint steps.** `--spacing-gutter`, `--spacing-section`,
`--spacing-band`, `--text-display`, `--text-h1` and `--text-h2` are `clamp()`.
The max of each clamp is the approved desktop value, so the design is reproduced
exactly at the 1440 canvas and degrades on a curve below it. A fixed 96px gutter
left 208px of content on a 400px screen — fixing one token fixed all ten places
it is used.

**Industries: concept A, the accordion register.** Piyush's call, 2026-09-13. B's
panel is a fixed height with internal scroll and C truncates to five product
types plus a count — both break when the client adds a thirtieth product type
through the CMS, which is the entire point of the build. A grows a longer drawer.
It is also the best touch pattern (no scroll trapping), Radix Accordion gives
keyboard and ARIA for free, and a grouping level between category and product
type slots in without a redesign — which closes blocker 2 as well.

**Jobs live in a Creator collection, not Zoho Recruit.** Piyush's call,
2026-09-13. One system, one publish path, the same review and rollback as every
other collection.

**Superseded the same day: the Jobs collection already exists.**
genedrift.com/openings embeds a public Creator report from an app named
`proton` (`report-embed/OpeningsReport`). So do not create a Jobs form —
extend `proton`'s existing Openings form, which the client's team already
keeps current. `lib/jobs.ts` holds a guessed shape and must be reconciled
against the real form.

**Creator `.ds` files CANNOT be imported. Do not try again.** Tested to
destruction 2026-09-14, three attempts:

| Attempt | Reports syntax | Section block | Result |
|---|---|---|---|
| Generated, v1 | wrong | none | generic failure |
| Generated, v2 | correct | yes | *"No components were found within the 'section' block"* |
| **One form copied VERBATIM from the working Editorial Platform export** | correct | yes | **same error** |
| Generated, minimal | correct | none | same error |

The third row is the proof: a form lifted word-for-word out of an app that
Zoho itself exported, and Zoho refused to import it. **The `.ds` export is
readable but not round-trippable** — it is for reading and support, not for
recreating an app.

Earlier I recorded the opposite, on the strength of the format being clean and
legible. Readable is not importable. Forms are built by hand from
`context/website-forms-spec.md`; the generator has been deleted so nobody
revives it.

**Two Zoho applications, always separate.** Piyush's call, 2026-09-14.

- **Editorial / blog** — already built, already working. The website build reads
  its articles through the Catalyst public API and touches nothing else in it.
- **Website content** — a new, separate Creator application.

The reason is handover, not architecture: when this is transferred to the
client's own Zoho account, they get two independent applications that can be
handed over, permissioned and supported separately.

This **supersedes** an earlier suggestion of mine to put the website forms
inside the editorial app so they could share `Media_Assets` and
`Demo_Employees`. That was an optimisation nobody asked for, and it traded away
the separation that actually matters. Separate apps also mean a `.ds` import
works, since importing a `.ds` creates a new application.

**The website Creator app needs no media system.** Checked 2026-09-14: the site
contains **zero image files** and exactly **one `<img>` tag** — the optional
Knowledge Hub featured card, which currently renders a flat tint. The map,
industry icons, arrows and status marks are all SVG drawn in code. The design
is typographic.

Every image that will appear on the site comes from an article, and those flow
through the editorial app and Catalyst already. So: no `Media_Assets` in the
website app, no media pipeline to build. Revisit only if leadership headshots
or office photography are actually supplied.

---

## Menu, footer and certifications — decided 2026-09-17

Setup and field lists: `context/site-chrome-cms.md`.

- **Menu links are NOT editable.** Rename, reorder and hide only. A menu that
  cannot point anywhere new cannot point at a page that does not exist;
  validating typed paths would mean Catalyst knowing every generated route,
  including 46 country pages and every article, and being quietly wrong.
- **Footer link columns are DERIVED from the menu**, never stored separately.
  Two lists that must agree will eventually disagree.
- **Certifications carry an expiry and expired ones are hidden.** These are
  compliance assertions on a pharma site; the safe failure is to stop making
  the claim. An empty expiry still displays.
- **`ISO 9001:2000` is still not corrected.** Reproduced verbatim from the
  client's material. Quietly editing a certification claim is worse than
  showing a stale one, and now it expires on its own once they supply a date.
- **The whole chrome publishes as one collection.** Header, footer and legal
  row appear on every page and the footer derives from the menu; publishing
  separately lets them disagree for as long as it takes to press button two.
- **An entirely hidden menu is refused.** A site with no navigation is broken
  on every page at once — almost certainly a mistake, never an instruction.
- **One level of sub-navigation**, though the schema could express more. A
  self-nesting menu is how a client builds a five-level dropdown nobody can
  use on a phone.

---

## Markets as a CMS collection — decided 2026-09-16

Setup and field lists: `context/markets-cms.md`.

- **Markets are a COLLECTION, not 46 pages.** One record is rendered by the
  homepage map, `/global-presence`, its region page and its own page. As pages,
  "Kenya now offers Pharmacovigilance" would be four edits in four places,
  three of which someone would forget.
- **The collection publishes WHOLE, never row by row.** Those four renderings
  would otherwise disagree with each other for as long as a publish took, and
  removal has no other expression: a market absent from the payload is a market
  removed from the site. Row-by-row would need a tombstone per market.
- **Capabilities are a LIST on the market, never three named fields.** Three
  columns called `Capability_1_Status` would make a fourth capability a change
  in React, in Catalyst and in Creator — for exactly the thing the client was
  promised they could do themselves. The Global Presence table already derives
  its columns from the data.
- **The region slug is derived from the region name, never typed.** A typed
  slug that disagrees with its region is a 404 with no error anywhere.
- **An unrecognised capability status is REFUSED, not defaulted to "none".**
  Mapping an unknown word to "not available" quietly publishes a commercial
  claim — that Genedrift does not serve a country — which nobody authorised.
- **An empty collection is treated as no collection.** Publishing zero markets
  is far more likely to be an accident than an instruction to empty the world
  map, so the site keeps its built-in copy.
- **The website falls back to the built-in 46 whenever the CMS is silent** —
  unreachable, never published, or every row unusable. A map with no countries
  on it is a worse failure than a map showing last week's truth.
- **Both market routes are `dynamicParams = true`.** Reverses the original
  closed-param-set decision, for the same reason the pillar routes were
  reversed: a CMS record added after the build has no prerendered route, and an
  invalidated page in a closed set has no fallback to render.

Not done, deliberately, and listed at the end of `context/markets-cms.md`:
no preview, no rollback button, regions still six fixed slugs, map position
still two raw numbers, and markets are not in the editor widget.

---

## Explicitly rejected — do not re-propose without a reason

- **Any component library with its own design opinions** — MUI, Chakra, wholesale
  shadcn. They fight a design system the client already paid for.
- **CSS-in-JS.** No.
- **A state manager.** Server components plus URL state covers this site.
- **GSAP, Lottie, `motion`/Framer.** Every transition in the approved design is a
  CSS transition with a `prefers-reduced-motion` escape. Moving them to JS adds
  weight and breaks reduced-motion for no visual gain.
- **Astro.** Ships less JS, orphans the working Catalyst revalidation hooks.
- **Hand-drawn national boundaries.** See above.
- **Runtime schema parsing on every request.** See the build-time decision above.
- **Designing every page at every breakpoint as static artefacts first.** The
  responsive gap was three tokens plus about five genuine design calls, not
  thirty mockups. `/dev/sections` at 400px is the review.

---

## Client feedback round, 2026-09-15 — decisions taken 2026-09-16

- **Map: real country geometry (option b).** Load actual country shapes, render
  them with no stroke, fill only the hovered/active country. No boundary lines
  are ever drawn, but the shapes themselves encode borders — the client was told
  this and chose it anyway, wanting a "clear map". Piyush's call.
  **India must use the Survey-of-India point of view** (Natural Earth ships
  `ne_10m_admin_0_countries_ind`, the India-POV variant — use that file, not the
  default one). Every other country comes from the same verified dataset so the
  POV is consistent.
  This supersedes "Hand-drawn national boundaries — rejected": we are not hand
  drawing anything, we are using a verified published dataset.

- **Industries: Concept B, the two-panel index layout.** Overrides the 2026-09-13
  decision for Concept A (the accordion register). Client preference wins.
  Concept A is built and will be replaced.

- **Careers reads from a Zoho Creator app, not from the editorial app.** Openings
  and the CV/application form live in Creator. The site fetches openings only.
  Interview scheduling and the video walkthrough are out of scope for the website.

- **Rolling Health Authority Bulletin is website content, not editorial.** It is
  edited in the website Creator app and published through Catalyst like any other
  website section. No link to the blog/editorial platform.

- **Global Presence page reuses the existing per-market capability model.** It is
  a search-and-filter view over data we already have, not a new content type.

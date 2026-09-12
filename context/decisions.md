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

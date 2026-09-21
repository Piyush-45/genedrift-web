# Handover

**21 September 2026.** For whoever picks this up next — a new developer, or a
new session with none of the conversation that built it. Read this, then
`00-start-here.md`.

---

## Where the project actually is

The site is **live at www.genedrift.site** and the client is reviewing it.
Everything in the agreed scope is built and working, and the content is editable
through Zoho Creator without a developer.

It is **not indexable**, on purpose. One environment variable flips that when
the content is real.

| Piece | Where |
|---|---|
| Website | Vercel, project `genedrift-web`, deploys on push to `main` |
| Repo | `Piyush-45/genedrift-web`, private |
| Publishing API | Zoho Catalyst AppSail, project `gd-genedrift-website-dev` |
| CMS | Zoho Creator app **Genedrift Website** |
| Domain | genedrift.site, registrar GoDaddy, DNS pointed at Vercel |

---

## How content actually flows

```
Creator (edit + publish)  →  Catalyst (validate, freeze, serve)  →  Next.js (render)
```

Four things follow from this and all four have cost time already:

**A published page is immutable.** Publishing writes a frozen document. If you
change the Catalyst service afterwards, the already-published document does not
gain the new field — you must publish again. This is why the order for any new
field is: Creator field → Deluge → **deploy Catalyst** → publish.

**The CMS beats the code.** `getPage` asks Catalyst first and falls back to the
built-in content only if there is nothing published. So for a page that has been
published, editing the fixture in code does nothing. Structure and behaviour
live in components; content lives in the CMS.

**Zod runs at build time only.** At runtime `guardPage` fills a record's missing
keys from `lib/schema/section-defaults.generated.ts`, which is produced by
`npm run emit:schemas`. That step runs as part of `npm run build` — so **always
`npm run build`, never `npx next build`**. Skipping it ships stale defaults and
a CMS page reaches a component with `undefined` where a default should be.

**A change takes about a minute and two refreshes** to appear, because pages
revalidate after 60 seconds and regenerate on the *next* request. The Creator
publish buttons call `/api/revalidate` directly, which is why an editor sees
their change immediately and a code deploy does not work that way.

---

## Adding a field to a collection, end to end

This is the path that took two false starts. Follow it in order.

1. **Creator** — add the field to the form. Check its **link name** in field
   properties; Creator silently appends a number if the name was ever used.
2. **Deluge** — add one `marketItem.put("yourField", …)` line to the publish
   function. The repo copy under `creator/` is the source of truth.
3. **Catalyst schema** — add it to the schema in `services/catalyst-website/src/`.
4. **Catalyst mapper** — *and* to the object `service.ts` builds. The mapping is
   field by field on purpose, so a spread cannot leak whatever Creator sends
   into the public API. Miss this and validation accepts the field, the mapper
   drops it one line later, the publish returns a clean 200, and the only
   symptom is a key missing from the JSON. This happened with `authority`.
5. **Deploy Catalyst**, then **publish again**.
6. **Reader** — parse it in `lib/content/*-source.ts`.
7. **Component** — render it.

Verify at `<appsail-url>/v1/public/markets` and search for the key. That is the
ground truth; if it is not there, nothing on the front end will help.

---

## Things that look like bugs and are not

- The **Regulatory authorities** strip is invisible until the client fills
  `Health_Authority` on some markets. Empty renders nothing, by design.
- The **health authority bulletin** band is hidden when the homepage record has
  no entries.
- **Map X / Map Y in Creator have no visible effect.** Marker positions are
  derived from the country geometry — see `map-geometry.md`.
- The **footer legal links are hidden** in Creator because the pages do not
  exist. The client owes the policy text.
- The **contact form delivers nowhere**. No `CREATOR_CONTACT_ENDPOINT` is set.
- The **adverse-event route is deliberately disabled** until the client names
  mandatory fields, routing and an accountable owner. Do not enable it to make
  the page look finished — it is a regulatory obligation, not a form.
- **Singapore, Hong Kong and Brunei** show no country shape. Too small at this
  map scale.

---

## What is NOT built, and why

The client's own sitemap contains page families that were never designed and
never built. Full comparison in `sitemap-gap-analysis.md`. The short list:

- **Case studies** under Client Success — a whole content type, absent from the
  site and the CMS. The largest gap.
- **Ten Company pages** — Our Story, Why Genedrift, Corporate Values,
  Governance, Technology Platform, Partners, Awards, News, CSR, Media Kit.
- **Careers programme content** — Life at Genedrift, Culture, Benefits,
  Graduate Programme, Recruitment Process, Talent Community.
- **Regional regulatory guides** (`/markets/guides/…`).
- **Three contact routes** — Schedule Consultation, Media Enquiries, Location.

None of these can be built without content and structure decisions from the
client. Their own open question — *"which exact pages are required for the first
launch versus future phases?"* — has never been answered and governs all of it.

`/markets/compare` is in their baseline and was **cancelled by them** on 15
September. Correctly absent.

---

## Content on the site that nobody has verified

Flagged to the client, in writing, and still outstanding. Treat all of it as
unconfirmed:

- Which services are available in which market, across all 46.
- **`ISO 9001:2000`** in the footer — a withdrawn version, almost certainly
  meant to be 9001:2015. **Deliberately not corrected.** Quietly amending a
  certification claim on a pharmaceutical consultancy's site is worse than
  displaying a stale one.
- Certificate numbers and expiry dates for every certification.
- The registered address in the footer.
- 46 markets in the hero versus "30+" in other client material.
- Their Middle East list names Qatar, Oman, Kuwait and Bahrain; the site carries
  Saudi Arabia and UAE.
- All careers content was written by us as placeholder. It must not go live.

**The rule that governs all of the above: never invent client content and
present it as real.** Placeholder is fine and expected — but say so.

---

## Housekeeping still owed

- Rotate both signing secrets before handover. The editorial one is in plaintext
  in every `.ds` export.
- The platform repo (Catalyst, Creator, the editor widget) still has **no git
  remote**. The website repo does.
- `SITE_INDEXABLE` is off. Only the exact string `"true"` makes the site
  crawlable, and both halves — `app/robots.ts` and the `X-Robots-Tag` header in
  `next.config.ts` — are driven by it.
- Several pages are still Draft in Creator; publishing them doubles as a
  regression check, since they should render identically.

---

## Documents in this folder, and when to read them

| File | Read it when |
|---|---|
| `00-start-here.md` | Always, straight after this |
| `progress.md` | You want the history, newest first |
| `decisions.md` | Before making a choice — it may be made, or rejected |
| `map-geometry.md` | Anything touching `lib/map/` or marker positions |
| `markets-cms.md` · `site-chrome-cms.md` | Changing what an editor can edit |
| `integration.md` · `cms-architecture.md` | Anything CMS or API shaped |
| `article-contract.md` | Insights — the real Creator model and payload |
| `blocked-on-client.md` | Wondering why something is unfinished |
| `client-feedback-2026-09-15.md` | Anything the client said in the September review |
| `sitemap-gap-analysis.md` | Scope questions: what is and is not built |
| `map-highlight-options-note.md` | The boundary decision, as put to the client |
| `uat-checklist.md` | What the client was asked to test |
| `reference/` | The client's own words — baseline, sitemap, URL architecture |
| `design/` | The approved HTML. **That is the spec** |

---

## The one thing to get right

This is a **regulatory and pharmacovigilance** consultancy. Two consequences
that are not design preferences:

Anything that looks like it accepts a safety report but does not route one is a
compliance failure, not a UX problem. That is why the adverse-event route is
switched off and why a general chatbot was rejected.

And every factual claim on the site — a market's capabilities, a regulator's
name, a certification — is a professional claim their own customers will check.
When in doubt, leave it out and ask.

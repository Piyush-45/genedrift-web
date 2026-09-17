# Build guide — connecting Creator → Catalyst → the website

Written 2026-09-14, for building the website CMS by hand. Follow it top to
bottom. Every phase ends with a **CHECK** you can run yourself, so you always
know whether to move on or stop.

---

## 0. The mental model

Three boxes. Content flows one way.

```
   CREATOR                    CATALYST                   NEXT.JS SITE
   (private)                  (the publisher)            (public)

   Someone edits    ──POST──▶ Validates, stores an  ──GET──▶ Fetches and
   a page and                 immutable version,              renders
   clicks Publish             moves the "live" pointer
```

- **Creator** is where editing happens. Nobody outside the company sees it.
- **Catalyst** is the gatekeeper. It checks the content, saves a frozen copy,
  and points "live" at that copy. Rollback = move the pointer back.
- **The site** only ever reads. It cannot write anything.

You already have this exact chain working for blog articles. **We are adding a
second content type — website pages — to the same machinery.** Nothing about
the blog changes.

---

## PHASE 1 — Three forms in Creator  *(you, ~1 hour)*

Create a **new Creator application** called `GeneDrift Website`. Not inside the
editorial app — separate, so the client can be handed each independently.

Build these three forms. Full field list with types, lengths and dropdown
values is in **`context/website-forms-spec.md`** — that is the sheet to work
from; this is just the shape.

| # | Form | Holds | Rough field count |
|---|---|---|---|
| 1 | `Website_Pages` | One row per URL. Never deleted. | 13 |
| 2 | `Website_Page_Revisions` | Draft / approved / published versions of a page | 12 |
| 3 | `Website_Sections` | The ordered blocks that make up one revision | 8 |

**Why three forms and not one.** A page has an identity (`/expertise`) that
never changes, many versions over time, and each version is a list of blocks.
Three tables. Exactly how your `Articles` / `Article_Revisions` pair already
works — you are copying your own pattern.

**The one field that matters most:** `Website_Sections.Section_Data`, a plain
multi-line text field holding JSON. All 24 block types share it. That is why
adding a 25th block to the website later needs **zero** Creator work.

> ✅ **CHECK 1** — Add one row to `Website_Pages` by hand: path `/test`,
> internal title "Test", family `Hub`, state `Draft`. If it saves, Phase 1 is
> done.

---

## PHASE 2 — Creator sends to Catalyst  *(you, with code I provide)*

This is a Deluge function on a button. **You already have a working one** —
`handoff_publication_to_catalyst` in the editorial app. We copy its shape.

What it does, in plain steps:

1. Read the approved revision and its sections
2. Build a JSON package
3. Sign it (proves it really came from Creator)
4. `invokeUrl` POST to Catalyst
5. Store whatever Catalyst replies

The current Deluge syntax — and what your editorial app already uses:

```
response = invokeurl
[
    url    : baseUrl + "/v1/website/publications"
    type   : POST
    parameters: bodyText
    headers: headerMap
]
```

Two application variables, same as the editorial app:

| Variable | Value |
|---|---|
| `Catalyst_Base_URL` | the AppSail URL — **dev and prod are different** |
| `Signing_Secret` | shared secret. **Generate a NEW one.** Do not reuse the editorial app's |

> ⚠️ The editorial secret is in plaintext in its `.ds` export and has left the
> system. Rotate that one, and give this app its own.

I will write the full Deluge for you to paste once Phase 3 exists.

> ✅ **CHECK 2** — Press the button. Catalyst should reply. Even a rejection is
> a pass here: it means the two systems are talking.

---

## PHASE 3 — Catalyst accepts website pages  *(me — code)*

In the `catalyst/` repo. Roughly 300 lines, mirroring what articles do.

| File | What is added |
|---|---|
| `src/domain.ts` | A validator for the incoming website-page package |
| `src/service.ts` | Accept, freeze a version, move the pointer |
| `src/publicContent.ts` | Shape the public response |
| `src/server.ts` | `POST /v1/website/publications`, `GET /v1/public/pages/:path` |

**It rejects anything it does not recognise.** If a section type is not one of
the 24, publication fails and the live site is untouched. A bad save can never
white-screen the website — that is the whole point of Catalyst sitting in the
middle.

> ✅ **CHECK 3** — `curl <base>/v1/public/pages/test` returns JSON, not an error.

---

## PHASE 4 — The website reads it  *(me — code)*

One function changes: `getPage()` in `lib/content/pages.ts`. Today it returns
built-in placeholder content. It will fetch from Catalyst instead.

Everything else — all 91 pages, all 24 block types — is already written and
already works. This is genuinely a one-function swap; that is what the last two
weeks of structure bought.

One environment variable, which you set in Vercel:

```
CATALYST_API_BASE_URL=https://…   # different for preview and production
```

> ✅ **CHECK 4** — Change a heading in Creator, publish, reload the site. The
> heading changes.

**Check 4 passing is the moment the CMS exists.** Everything after it is
repetition.

---

## PHASE 5 — Fill it in  *(both)*

Only now. Add the other 16 collections, load the placeholder content, connect
the remaining pages. Safe, because the chain is proven.

---

## Order, and who does what

| Step | Who | Time | Blocked by |
|---|---|---|---|
| 1. Three forms | **you** | ~1 hr | nothing — start now |
| 2. Deluge publish button | you, code from me | ~1 hr | Phase 3 |
| 3. Catalyst website pages | **me** | 2–3 days | Zoho deploy access |
| 4. Frontend swap | **me** | ~1 day | Phase 3 |
| 5. Everything else | both | ~1 wk | Check 4 |

**Do Phase 1 now.** It is the only thing on the list that nothing else is
waiting on, and Phase 3 needs its field names to exist before I can write
against them.

---

## What NOT to do

| Don't | Why |
|---|---|
| Import a `.ds` file | Tested three times, including a form copied verbatim from a working export. Exports do not re-import. See `decisions.md` |
| Put website forms in the editorial app | Two apps, always — the client gets each independently |
| Add a field per section type | All 24 share `Section_Data`. One field per type is how a CMS becomes unmaintainable |
| Build all 19 forms before Check 4 | If the chain has a flaw you want to find it with 3 forms built, not 19 |
| Reuse the editorial signing secret | It has been exposed. New app, new secret |
| Let the website write to Creator | The site only ever reads. One direction |

---

## If something breaks

| Symptom | Most likely |
|---|---|
| Deluge button does nothing | `Catalyst_Base_URL` empty, or pointing at the wrong environment |
| Catalyst replies 401 / signature invalid | The two secrets do not match |
| Catalyst replies "unknown section type" | A `Section_Type` value differs from the 24 — they must match character for character |
| Site shows old content | Caching. Check the revalidation hook fired |
| Site shows nothing | `CATALYST_API_BASE_URL` not set in Vercel |

Send me the exact error text. "It failed" costs a round trip; the error message
usually names the cause.

# genedrift-website-publishing

The publishing boundary between the **GeneDrift Website** Creator app and the
public website. Deployed as a Zoho Catalyst AppSail service in the project
`gd-genedrift-website-dev`.

Completely separate from the editorial publishing service. They share no
storage, no secret and no project — by design, so each can be handed to the
client independently.

## What it does

```
Creator  ──signed POST──▶  this service  ──GET──▶  the website
```

1. Verifies the request really came from Creator (HMAC, same scheme as the
   editorial service).
2. Validates the page. **An unknown section type is refused and the live site
   is untouched** — that is the whole reason this sits in the middle.
3. Freezes the page as an immutable object.
4. Points the path at that object.

## Endpoints

| Method | Path | Signed | Purpose |
|---|---|---|---|
| GET | `/health` | no | Liveness |
| POST | `/v1/website/publications` | **yes** | Publish a page |
| POST | `/v1/website/unpublish` | **yes** | Withdraw a page (serves 410 afterwards) |
| POST | `/v1/website/rollback` | **yes** | Point a path back at an earlier publication |
| GET | `/v1/public/pages` | no | Every live path, for sitemaps |
| GET | `/v1/public/pages/<path>` | no | The live page |

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `WEBSITE_HMAC_SECRET` | **yes** | 32+ characters. Must match the Creator application variable. **Generate a new one — do not reuse the editorial secret, which has been exposed in a `.ds` export.** |
| `CATALYST_STRATUS_PRIVATE_BUCKET` | **yes** | e.g. `gd-genedrift-website-private` |
| `REQUEST_CLOCK_SKEW_SECONDS` | no | Default 300 |
| `MAX_PAYLOAD_BYTES` | no | Default 1 MB |
| `PORT` | no | Default 9000 |

The service refuses to start if the secret or bucket is missing. A publisher
that boots with an empty signing secret and accepts unsigned writes is worse
than one that will not boot.

## Storage

One private Stratus bucket. No Data Store tables.

```
publications/<publicationId>.json   immutable, never overwritten
live/<path>.json                    the currently live document for a path
index/live.json                     every live path
```

`publicationId` is derived from the content, so publishing identical content
twice is the same version published twice — not two versions. See the comment
in `src/service.ts`.

The trade-off, stated plainly: pointer updates are last-write-wins rather than
compare-and-swap. With one or two editors that is not a realistic failure. If a
team ever edits this, move the pointers into Data Store and add a CAS; nothing
else changes. See the comment at the top of `src/store.ts`.

## Running it locally

No Catalyst needed — `LOCAL_STORE_DIR` swaps Stratus for the filesystem.

```bash
npm install
npm run build

WEBSITE_HMAC_SECRET="any-32-character-string-for-local-use" \
CATALYST_STRATUS_PRIVATE_BUCKET="local" \
LOCAL_STORE_DIR=/tmp/gdstore \
PORT=9113 node dist/src/server.js

# in another shell
WEBSITE_HMAC_SECRET="any-32-character-string-for-local-use" \
node test/smoke.mjs http://localhost:9113
```

The smoke test covers 18 cases including signature rejection, idempotent
republish, unknown section types, hidden sections, 404 vs 410, and rollback.
**Run it before every deploy.** It caught a real immutability bug that reading
the code did not.

## Section types

`src/section-types.ts` is GENERATED. Regenerate it from the website repo root
whenever a section is added or renamed:

```bash
npm run sync:catalyst-types
```

It derives from `public/section-schemas.json`, which the website build emits.
Two hand-maintained lists is how "unknown section type" appears weeks after the
rename that caused it.

## Known limitation

Section **type** is validated strictly. Section **data** is checked only for
"valid JSON object" — not field by field against each section's schema. That is
deliberate for now: an unknown type breaks a page, a missing field degrades
gracefully because the website's schemas carry defaults. Full per-type
validation means running the emitted JSON Schema here, and is worth doing once
the chain is proven end to end.

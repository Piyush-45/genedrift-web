# The article platform — what it actually publishes

Written 2026-09-13 from `GeneDrift Editorial Platform.ds`, the Creator app
Piyush built for Phase 1. This is the contract templates E and F must be built
against. Read it before designing the Insights listing or the article page.

---

## 1. The `.ds` question is settled: the format is authorable

The export is a clean declarative DSL — one `form` block per record type, one
parenthesised block per field with `type`, `displayname`, `maxchar`, picklist
`values`, and relationship fields as `values = Other_Form.ID`. It is readable
and writable by hand.

**So the Phase 4 spike is answered without doing it.** The remaining website
collections can be generated from the Zod schemas as `.ds` and imported,
instead of being hand-built form by form. Governance forms still want doing by
hand (subforms, workflow, Deluge), but that is three forms, not twenty.

The file also contains `reports`, `pages` and the whole Deluge layer, so an
export is a complete, readable description of an app. Treat it as the reference
whenever a question about Creator's shape comes up.

## 2. The record model

Seventeen forms. The ones that matter for the public site:

| Form | Holds |
|---|---|
| `Articles` | Identity and workflow. `Article_UUID`, `Working_Title`, `Owner`, `Primary_Author`, `Primary_Category`, `Tags`, `Workflow_State`, and three revision pointers — `Active_Draft_Revision_ID`, `Approved_Revision_ID`, `Published_Revision_ID` |
| `Article_Revisions` | The content. `Title`, `Slug`, `Excerpt`, `Editor_Document` (an uploaded file), `Plain_Text_Extract`, `Featured_Media`, `Social_Media`, full SEO block, `Word_Count`, `Reading_Time_Minutes` |
| `Categories` | `Name`, `Slug`, `Description`, `Display_Order`, `Active` |
| `Tags` | `Name`, `Slug`, `Description`, `Active` |
| `Media_Assets` | `Published_URL`, `Alt_Text`, `Caption`, `Credit`, `Width_Pixels`, `Height_Pixels`, `MIME_Type`, `Checksum` |
| `Site_Settings` | `Insights_Base_Path`, default SEO patterns, `RSS_Enabled`, `Search_Enabled`, `Related_Articles_Enabled` |
| `Redirects` | `Source_Path`, `Destination_Path`, `Redirect_Type`, `Active` |

Note the shape: **article identity is separate from article content, and a
pointer says which revision is public.** That is the same immutable-version +
pointer model Catalyst uses, and it is exactly what `Website_Pages` /
`Website_Page_Revisions` should copy. It is already proven here.

## 3. The publish payload — Creator → Catalyst

`handoff_publication_to_catalyst` POSTs `schemaVersion: 2`:

```jsonc
{
  "schemaVersion": 2,
  "action": "publish" | "schedule" | "retract",
  "job":      { "creatorJobId", "idempotencyKey", "requestedAt",
                "scheduledAt", "requestedByEmployeeId" },
  "article":  { "creatorRecordId", "uuid", "workflowState",
                "approvedRevisionId", "primaryCategory", "tags": [] },
  "revision": { "creatorRecordId", "uuid", "number", "state",
                "title", "slug", "excerpt",
                "editorDocument", "documentChecksum",
                "seoTitle", "seoDescription", "canonicalUrlOverride",
                "robotsDirective", "wordCount", "readingTimeMinutes",
                "featuredMediaId", "socialMediaId", "approvedAt" },
  "media":    [ { "mediaUuid", "publishedUrl", "mimeType", "fileSizeBytes",
                  "widthPixels", "heightPixels", "checksum",
                  "altText", "caption", "credit" } ],
  "retraction": { "reason", "replacementPath" }   // retract only
}
```

Good news for template F: `readingTimeMinutes` and `wordCount` are already
computed, media carries real dimensions and alt text (so `next/image` can be
used without layout shift), and the SEO block is complete.

---

## 4. Two gaps to resolve before building templates E and F

### 4.1 No author reaches the public site

The platform models authorship carefully — `Articles.Primary_Author`, plus an
`Article_Contributors` form with `Contribution_Type` (Co-author / Contributor /
Subject Expert), `Display_Order` and a `Show_Publicly` checkbox.

**None of it is in the payload.** `articlePayload` carries only
`creatorRecordId`, `uuid`, `workflowState`, `approvedRevisionId`,
`primaryCategory` and `tags`.

So as things stand a published article has no byline, and Catalyst cannot
invent one. For a regulatory consultancy, the author's name and credentials are
a large part of why a reader trusts a piece on, say, a CDSCO timeline change.
The `Show_Publicly` flag shows the intent was always to publish contributors.

**Fix: add an `authors` array to `articlePayload`** — display name, job title,
avatar URL, contribution type — resolved from `Primary_Author` and the
`Show_Publicly` contributors. It is a change to one Deluge function.

### 4.2 There is no content type, only a category

The client's baseline asks for `/insights/{content-type}/{content-slug}` and
names the ecosystem: Featured Insights, Regulatory Updates, Country
Intelligence, Authority News, Whitepapers, Regulatory Roadmaps, Market Entry
Guides, Webinars, Videos, Downloads, Regulatory Calendar, Expert Opinions.

The platform has `Primary_Category` (one picklist into `Categories`) and
`Tags`. There is no separate content-type field.

Two ways to read that, and they lead to different URLs:

- **Categories *are* the content types** — then `/insights/{category-slug}/{slug}`
  works today and nothing changes.
- **Categories are subjects** (Pharmacovigilance, Medical Devices) **and content
  type is missing** — then a field is needed, and every existing article needs
  one set.

**This must be answered before the Insights routes are built**, because it
decides the URL shape, and URLs are the one thing that is expensive to change
after launch. Check what is actually in `Categories` today — that answers it.

---

## 5. The read API — ANSWERED 2026-09-13

```
GET /v1/public/articles?page=&limit=&q=&category=&tag=
GET /v1/public/articles/:slug
```

`CATALYST_API_BASE_URL` holds the **origin only**; the `/v1/public` prefix
lives in `lib/content/catalyst.ts` so the version can be changed in one place.

| Thing | Answer | What it changed here |
|---|---|---|
| Pagination | Page-based. `limit`, not `perPage`. Default 20, max 50 | `API_MAX_LIMIT` clamps requests; asking for more is rejected, not truncated |
| Envelope | `{ ok, articles, pagination: {page, limit, total, totalPages}, facets: {categories, tags} }` | Filter chips now come from **API facets**, not derived locally — deriving would only ever show categories present on page 1 |
| Filters | `category`, `tag`, `q`. **Matched by displayed NAME, not slug.** No content-type filter yet | `?kind=` became `?category=`, values are names, URL-encoded |
| Body | Catalyst converts TipTap JSON to **sanitised HTML** at publish and serves `article.html` | HTML is the live path; we sanitise again on our side |
| Unknown slug | `404` + `{ok:false, code:"PUBLIC_ARTICLE_NOT_FOUND"}` | `notFound()` |
| **Retracted** | **`410`, not 404** | Modelled separately — a withdrawn article says so rather than appearing never to have existed |
| Dates | `publishedAt` is publication time; `revision.approvedAt` is review time | Article pages use `publishedAt` |
| Auth | Open GET-only | Optional token header kept so adding auth is config, not code |
| Media | Stratus public host, stable unsigned URLs; production host pending | Plain `<img>` for now, so `images.remotePatterns` is not yet blocking |

### Two sanitisers, on purpose

Catalyst sanitises at publish. We sanitise again in `lib/content/sanitize.ts`
before rendering, agreed with the platform developer. On a pharmaceutical site
one sanitiser between an editor's document and a public page is a single point
of failure; the second is owned by the team that renders the output.

`dangerouslySetInnerHTML` appears exactly once in the codebase, and only on
output that has passed through that function. The allowlist mirrors what
Catalyst says it emits — anything outside it is dropped, not escaped, so a tag
that starts appearing without warning simply does not render.

Verified against hostile input: `<script>`, `<iframe>`, `<style>` and `<svg>`
are dropped with their contents; inline handlers stripped; `javascript:` hrefs
and `data:`/`http:` image sources removed; external links get
`rel="noopener noreferrer"`.

### The API shape is NOT our shape — read this before touching the fetchers

Confirmed by reading `catalyst/src/publicContent.ts` in the platform repo, not
from a summary. The differences typecheck fine and fail at runtime, which is
why `lib/content/map-article.ts` exists:

| Catalyst returns | Our `Article` expects |
|---|---|
| `primaryCategory: string` | `category: { name, slug }` |
| `tags: string[]` | `tags: { name, slug }[]` |
| detail nested under `article` / `revision` | flat |
| list is flat, detail is nested — **same article, two shapes** | one shape |
| body as top-level `html` | `body: { format, html }` |
| detail gives `featuredMediaId` + `media[]` to resolve from; list gives `featuredMedia` resolved | `featuredMedia` |
| `facets: { categories: string[], tags: string[] }` — no counts | `{ name, count? }[]` |

All of it is absorbed in the mapper. Components never learn any of it, and when
`authors` or `contentType` appear, that one file changes.

Taxonomy **slugs are derived by us**, used only for React keys and hrefs.
Filtering sends the NAME, because Catalyst lower-cases and trims both sides
before comparing (`normalized(article.primaryCategory) !== category`).

### Endpoints that already exist and we should use

- `GET /v1/public/taxonomy` — categories and tags without fetching a page of
  articles
- `GET /v1/public/sitemap.xml` and `/v1/public/rss.xml` — **already built.**
  Do not write our own; point at these or proxy them
- CORS is `Access-Control-Allow-Origin: *`, GET/OPTIONS only, with ETag support
  via `sendCacheableJson`

### The 410 carries more than a status

`{ code, message, articleUuid, retractedAt, reason, replacementPath }`. The
withdrawn-article page now shows the real reason and links to the replacement
when one exists — on a regulatory site that is the difference between "we
withdrew this, here is the current position" and a dead end.

### Still open

- **Redirects have no public endpoint yet.** Creator has the `Redirects` form
  (source, destination, 301/302). **Do not build a second redirect model** —
  it must be exposed through Catalyst before launch.
- **Production Catalyst URL** — pending, blocks nothing.
- **Production media host** — needed in `images.remotePatterns` only if we move
  to `next/image`.
- **Content type** is still not a public filter. `contentType` stays optional
  in the contract and everything falls back to `category`.

## 6. Superseded — the original unknowns

This file gives the **write** path (Creator → Catalyst) in full. It does not
show the **read** path — what Catalyst serves to the site, at which URL, in
what shape. `lib/api.ts` in the old `frontend/` repo has it.

Needed before template E or F can be wired:

- the listing endpoint, and whether it filters by category/tag and paginates
- the single-article endpoint
- whether `editorDocument` is converted to HTML by Catalyst, and what that HTML
  looks like — this decides how the article body is rendered and sanitised
- the revalidation hook shape

Until then, build E and F against fixtures shaped like section 3 above.

# Note to the editorial-platform / Catalyst developer

2026-09-13. Frontend side of the Insights integration. Written to be forwarded.

---

## What the frontend already does

- **Base URL is configurable, never hardcoded.** `CATALYST_API_BASE_URL` and
  optional `CATALYST_API_TOKEN`. The same build runs against UAT or production;
  no development host can ship to production. In production a missing value
  **fails the build** rather than silently serving fixtures as real regulatory
  notices.
- **Server-side only, deliberately not `NEXT_PUBLIC_`.** Every article fetch
  happens in a server component, so the API host never reaches the browser
  bundle.
- **The contract already has room for what you are finalising.** `authors` is
  optional, and `contentType` and `category` are both present and optional. So
  when authors and the content-type decision land, the frontend needs no
  change — the byline simply starts rendering and filters start using the new
  field.
- Reads are tagged (`articles`, `article:<slug>`) so your existing revalidation
  hooks can invalidate exactly the affected pages.

## What I am coding against

`lib/content/article.ts` is the single source of truth on our side. The shape:

```ts
Article {
  uuid, slug, title
  excerpt?
  body?: { format: "blocks"; blocks: Block[] } | { format: "html"; html: string }
  contentType?: { name, slug }
  category?:    { name, slug }
  tags: { name, slug }[]
  featuredMedia?: { url, alt, caption?, credit?, width?, height? }
  seoTitle?, seoDescription?
  publishedAt?            // ISO date
  readingTimeMinutes?, wordCount?
  authors?: { name, jobTitle?, avatarUrl?, contribution? }[]
}
```

Happy to change any of these names to match what you already emit — tell me
yours and I will adopt them rather than making you translate.

## Questions, roughly in the order they block me

**Endpoints.** I have guessed `GET /articles?kind=&tag=&page=&perPage=` and
`GET /articles/{slug}`. What are the real paths? What does an unknown slug
return — 404, or 200 with a null body?

**Pagination.** Page/perPage as above, or cursor-based? What does the response
envelope look like (I assumed `{ articles, total, page, pages }`)?

**Filtering.** Which query parameter filters by content type or category, and
does it take the slug or the name?

**The article body — the one I most need.** `Editor_Document` is structured
JSON (the publish code greps it for `"mediaId":"`). Does Catalyst convert that
to HTML, or serve the JSON through? Either is workable, but they are different
builds:
- If **JSON**, please send the block schema — node types and their fields. We
  render a closed set as React elements, which is the safer option.
- If **HTML**, we add a sanitiser before rendering any of it. We will not
  inject unsanitised HTML into a pharmaceutical client's site, so this path
  costs an extra step and needs to be known early.

**Dates.** The publish payload carries `approvedAt` but no `publishedAt`, and
`First_Published_At` / `Last_Published_At` live on the Creator article record.
Does the read API return a `publishedAt`? An article page needs a publication
date, and approval time is not the same thing.

**Auth.** Is the public read API open, or does it want a token? I have an
optional `Authorization` header ready either way.

**Media.** `Published_URL` — what host do images come from? I need it in
`next.config.ts` `images.remotePatterns` before any image will render, and it
would be good to know whether the URLs are stable or signed.

**Redirects.** You already have a `Redirects` form with source, destination and
301/302. Is it served anywhere? The website build needs exactly this, and I
would rather consume yours than build a second one.

**Production URL.** Whenever it exists — no rush, nothing is blocked on it.

## Things I can hand you

- The full TypeScript interface above, as a file, if it helps you shape the
  response.
- `public/section-schemas.json` — JSON Schema generated from the website's
  section definitions. When `website_page` is added to Catalyst, that file is
  the validation contract, so Catalyst and the editor can both build against it
  without waiting on us.
- A `.ds`-shaped draft of the website collections. Reading your Editorial
  Platform export showed the format is authorable, so those forms can be
  generated rather than hand-built.

## One thing from our side worth flagging

The review findings have been shared separately. The one that should not wait
is the **signing secret in `thisapp.variables.Publishing.Signing_Secret`**: it
is plaintext, it authenticates both directions, and it is included in every
`.ds` export — so it has already left the system at least once. Rotate it and
move it out of app variables.

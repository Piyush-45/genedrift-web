# Website Workspace — the Creator editor widget

A page inside the **GeneDrift Website** Creator application where someone edits
website content in labelled form fields and presses Publish. No JSON, no
`Display_Order`, no section type names.

It reads and writes the same two forms as the reports — `Website_Pages` and
`Website_Sections`. It is a friendlier face over the same records, not a
second source of truth.

## What it deliberately does not do

**It is a CMS, not a page builder.** The page structure is the approved design
and is locked:

| The editor can | The editor cannot |
|---|---|
| Change any wording | Reorder sections |
| Add / remove rows inside a section — buttons, panels, FAQ entries | Delete a section |
| Edit the search-engine title and description | Change layout, colours or type |

If page structure ever needs to change, that is a developer editing records
directly, which is the right amount of friction for something that changes the
approved design.

## The form fields are generated, never hand-written

`public/section-fields.json` is emitted by `scripts/emit-fields.ts` from the
same Zod schemas the section components are typed from, then copied into this
widget's bundle by `scripts/sync-fields.mjs` at build time.

So a 26th section type gets a working form with **no change to this widget** —
and a renamed field cannot leave the form showing the old one.

Bundled rather than fetched at runtime because a Creator widget runs on a Zoho
origin and the website may not be deployed at all. The trade: **rebuild and
re-upload the zip whenever a section's fields change.** A stale bundled spec
shows the wrong form; a failed fetch would show nothing.

## Build

```bash
# in the website repo root first — this regenerates the field spec
npm run build

# then
cd widget
npm install
npm run build          # outputs app/
```

Package for Creator:

```bash
cd widget
zip -r ../genedrift-website-widget-v0.1.0.zip app plugin-manifest.json
```

Same layout the editorial widget uses: `app/` plus `plugin-manifest.json` at
the root.

## Install in Creator

1. **Settings → Widgets → Create Widget**, name `Website Workspace`, hosting
   **Zoho**, upload the zip, index page `app/index.html`
2. **Design → Pages → New Page**, name `Website_Workspace`, drop the widget on
   it, full width
3. Open the page from the live application, not the builder

## Publishing needs one more step

A widget cannot call a Deluge function directly — it has to go through a
Creator **Custom API**.

**Setup → Custom API → New**, pointing at the `publish_website_page` function,
with the API link name **`publish_website_page`** and one parameter `pageId`.

Until that exists, Save works and Publish shows a message saying exactly what
to configure, rather than a raw Zoho error code.

## Reviewing it without Zoho

`preview/` holds a mock of the Creator SDK so the widget can be opened in a
plain browser:

```bash
cd widget && npm run build
cp app/assets/* preview/assets/
# preview/index.html loads mock.js before the bundle
python3 -m http.server 9500 --directory preview
```

`flow.mjs` drives that preview with Playwright and asserts the editing flow —
dirty tracking, list add/remove, max-items guards, save, publish, page
switching. **Run it after any change to the widget.**

## Two safety behaviours worth keeping

1. **Unreadable content is never overwritten.** If a `Section_Data` value is
   not valid JSON, that section is shown read-only with an explanation. The
   widget will not save over content it could not parse.
2. **Publish saves first.** Publishing what is on screen while Creator still
   holds the old text is the most confusing thing a CMS can do.

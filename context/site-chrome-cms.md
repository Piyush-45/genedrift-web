# Menu, footer and certifications in the CMS

**17 September 2026.** The last of the "still code" content moves into Creator:
the top menu, the footer, the legal links and the compliance row.

Markets are covered separately in `context/markets-cms.md`. Same shape, same
publish model, same signing secret.

---

## What an editor can and cannot do

This is the decision that shapes everything else, taken 17 Sept:

| | Editable |
|---|---|
| Menu item **label** | yes — rename "Expertise" to "What we do" |
| Menu **order** | yes |
| **Hide** an item | yes — it stays in Creator, it leaves the site |
| Menu item **link** | **no** — system field, seeded once, hidden on the form |
| **Add** a new menu item | no |

**Why the link is not editable.** A menu that cannot point anywhere new cannot
point at a page that does not exist. The alternative — letting someone type a
path and validating it afterwards — means Catalyst having to know every route
the site generates, including 46 country pages and every article, and being
quietly wrong about it. Structural beats validated.

Adding a genuinely new top-level section means building the page it leads to,
which is a deploy either way.

---

## Three forms

### `Website_Nav_Items` — the menu and the legal links

| Field | Type | Notes |
|---|---|---|
| Key | Single Line — **mandatory, unique** | Identity. System field — **hide it** |
| Label | Single Line — mandatory | What visitors read |
| Link | Single Line | System field — **hide it** |
| Parent Key | Single Line | Empty = top level. System field — **hide it** |
| Display Order | Number | Use 10, 20, 30 |
| Visible | Checkbox, **ticked by default** | Unticking removes it from the site |
| Nav Group | Dropdown: `menu` · `legal` | `menu` = header + footer columns. `legal` = the small print row |

Hiding a parent hides its children too — otherwise hiding "Expertise" would
leave six orphaned links in a footer column whose heading no longer exists.

### `Website_Footer` — exactly one record

| Field | Type |
|---|---|
| Tagline | Single Line |
| Description | Single Line |
| Site | Single Line |
| Email | Email |
| Address | Multi Line |
| CTA Label | Single Line — the header button |
| CTA Link | Single Line — system field, **hide it** |

If a second record exists, the first is used. Don't add one.

### `Website_Certifications` — the compliance row

| Field | Type | Notes |
|---|---|---|
| Certification Name | Single Line — mandatory | `ISO 27001:2022` |
| Expires On | Date | **Empty = shown indefinitely. A past date = hidden automatically** |
| Certificate Number | Single Line | For the client's records |
| Display Order | Number | |

**Why expiry exists.** The footer currently claims `ISO 9001:2000` — a standard
withdrawn years ago, almost certainly meant to be 9001:2015. It survived this
long precisely because a plain text list has nothing in it that goes stale on
its own. On a pharmaceutical consultancy's site these are compliance
assertions, so the safe failure is to stop making the claim rather than to keep
making an expired one.

Every entry still needs a certificate number and a real expiry from the client
before launch. **Do not correct 9001:2000 yourself** — quietly editing a
certification claim is worse than displaying a stale one.

---

## Setting it up, in order

| # | Step | Where |
|---|---|---|
| 1 | Create the three forms above | Creator → Design |
| 2 | Import `creator-seed/website-nav-items.tsv` | 37 rows |
| 3 | Import `creator-seed/website-certifications.tsv` | 5 rows |
| 4 | Import `creator-seed/website-footer.tsv` | 1 row |
| 5 | Hide the system fields on the forms: Key, Link, Parent Key, CTA Link | |
| 6 | Add the function `publish_site` | Settings → Functions |
| 7 | Add a **Publish menu & footer** button on the Nav Items report **and** the Certifications report | Design → report → Actions |
| 8 | Click it | |

Nothing new in Catalyst beyond deploying the build that carries the endpoints.
Same base URL, same signing secret, same application variables.

---

## What the footer derives rather than stores

**The link columns are the menu.** Any menu item with children becomes a footer
column. Rename a menu item and its footer column follows.

That was a deliberate choice over a separately editable footer: two lists that
must agree will eventually disagree, and nobody notices until a client does.

---

## What Catalyst refuses

Whole publish refused, live site untouched, reason named.

| Refused | Why |
|---|---|
| Two items with the same Key | One silently wins and the other vanishes |
| Every item hidden | A site with no menu is broken on every page at once |
| A link that is not a path, `https://` or `mailto:` | `javascript:` in a menu is an attack, not a typo |
| An expiry that is not `YYYY-MM-DD` | An unparseable expiry means a lapsed claim displaying forever |

---

## If Catalyst is unreachable

The site renders the built-in menu and footer from `lib/nav.ts`. A page with no
header is worse than a header showing last week's labels — and unlike a single
page, this one fails everywhere at once.

---

## Where each piece lives

| Piece | File |
|---|---|
| Publish function | `creator/publish_site.deluge` |
| Report button | `creator/publish_site_button_action.deluge` |
| Seed generator | `scripts/export-site-seed.ts` |
| Catalyst contract | `services/catalyst-website/src/site.ts` |
| Catalyst publish/rollback | `SiteService` in `services/catalyst-website/src/service.ts` |
| Endpoints | `POST /v1/website/site`, `/site/rollback`, `GET /v1/public/site` |
| Website reader | `lib/content/site-source.ts` |
| Header / footer | `components/layout/site-header.tsx`, `site-footer.tsx` |
| Cache refresh | `POST /api/revalidate` with `{"collection":"site"}` |

---

## Known limits

- **No add or delete from the CMS.** By design, per above. A new section is a
  build.
- **Sub-navigation is one level deep.** The schema allows a parent key on any
  item, but the header renders one level. A self-nesting menu is how a client
  builds a five-level dropdown nobody can use on a phone.
- **The footer address is still `[REGISTERED ADDRESS]`** — placeholder, and
  now editable, but it must be real before launch.
- **No preview.** Publish is live. Rollback exists over the API with a
  publication ID; nothing calls it yet.

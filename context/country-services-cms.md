# Country service pages

> **ON HOLD, 30 Sept evening.** Piyush withdrew the free goodwill offer after
> the call with Ashish. Do not mention this build to the client or set it up
> in Creator until there is a written, agreed requirement (SOW 09). The code
> is in the repo and harmless: with no `Website_Country_Services` form and
> nothing published, the country pages show no services list and every
> service address is a 404. v0.2.1 zip contains it; v0.2.0 does not.

**30 September 2026.** Pages such as *Drug Registration, Philippines*, at
`/markets/{region}/{country}/{service}`. Asked for by Ashish on 29 Sept. Not in
the Work Order, the SOW or the sitemap: new scope under SOW section 09. Piyush
is doing it as a goodwill change at no charge. Say so in writing, with the
boundaries: the page template, the Creator form and the publish button. Writing
the content for each country is theirs.

Old genedrift.com has 24 country pages (`drug-registration-*`,
`regulatory-resources-*`, `market-knowledge-*`). Redirects from those are in
scope (SOW section 07) and **not done yet**.

---

## How it works

One new Creator form, `Website_Country_Services`, one row per service per
country. Each row links to a market in `Website_Markets`, so the country name
and the region part of the address come from the market, never typed twice.
A **Publish service pages** button on its report sends every *Active* row to
Catalyst in one go (whole collection, like case studies).

- The country page shows a "Services in {country}" list after the capability
  panel. With no services for that country, the list is not shown.
- Each service page shows only the blocks that have content. A row with just
  a name and summary shows a "details being prepared" note, not empty headings.
- There is **no built-in fallback**. No invented regulatory content, ever.
- A service whose market is missing or inactive is a 404.
- Wrong region in the address is a 404.

| Piece | File |
|---|---|
| Catalyst schema | `services/catalyst-website/src/country-services.ts` |
| Catalyst service | `CountryServicesService` in `service.ts`, field by field |
| Endpoints | `POST /v1/website/country-services`, `/rollback`, `GET /v1/public/country-services` |
| Smoke tests | cases 39 to 43, 90/90 passing |
| Deluge | `creator/publish_country_services.deluge` + `_button_action.deluge` |
| Website reader | `lib/content/country-services-source.ts` |
| Components | `components/country-service/service-list.tsx`, `service-page.tsx` |
| Route | `app/markets/[region]/[country]/[service]/page.tsx` |
| Catalyst package | `genedrift-website-appsail-dev-v0.2.1.zip` (includes offices too) |

## The Creator form: `Website_Country_Services`

**Check every link name in field properties after creating it.** Creator
silently appends a number if a name was used before, and the Deluge reads
these exactly.

| Field label | Link name | Type | Notes |
|---|---|---|---|
| Market | `Market` | Lookup → Website_Markets, show Market_Name. Mandatory | The country |
| Service Name | `Service_Name` | Single Line. Mandatory | `Drug Registration` |
| Service Slug | `Service_Slug` | Single Line. Mandatory | Lower case, hyphens: `drug-registration`. This is the URL. Must be unique within a country |
| Summary | `Summary` | Multi Line | One or two sentences. Shows under the title and on the card |
| Regulator | `Regulator` | Single Line | `FDA Philippines` |
| Covers | `Covers` | Single Line | `Generics, innovator medicines, OTC` |
| Typical Timeline | `Typical_Timeline` | Single Line | `12 to 18 months` |
| Validity | `Validity` | Single Line | `5 years` |
| Process | `Process` | Multi Line | "How it works". Leave a blank line between paragraphs |
| Documents | `Documents` | Multi Line | "Documents you will need". One document per line |
| Download Link | `Download_Link` | **Single Line** (not URL) | Must start with `https://`, or be empty |
| Download Label | `Download_Label` | Single Line | Button text. Empty = "Download the checklist" |
| SEO Title | `SEO_Title` | Single Line | Empty = "{Service} in {Country} — Genedrift" |
| SEO Description | `SEO_Description` | Multi Line | Empty = the summary |
| Display Order | `Display_Order` | Number | 10, 20, 30 |
| Active | `Active` | Checkbox, ticked by default | Unticked rows are not published |

## Setup steps (on their Creator and their Catalyst)

| # | Step | Where |
|---|---|---|
| 1 | Deploy `genedrift-website-appsail-dev-v0.2.1.zip` | Their Catalyst → AppSail |
| 2 | Create the form above, check link names | Creator → Design → New Form |
| 3 | New function, paste `publish_country_services.deluge` from `map publish_country_services()` down | Creator → Workflow → Functions |
| 4 | Report button "Publish service pages", Deluge from `_button_action.deluge`, run **once for the report** | Website_Country_Services report → Actions |
| 5 | Add one real row, publish, open the page | Site |

No new application variables. It uses the existing `Publishing` section
(Catalyst_Base_URL, Signing_Secret, optional Website_Base_URL and
Revalidate_Secret).

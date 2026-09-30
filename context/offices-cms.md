# Offices on the Contact page

**30 September 2026.** Work Order 1(i): "a dynamic Contact Us/location
capability, allowing the COMPANY to add, amend, publish, unpublish and reorder
current and future office/contact addresses through Zoho Creator without a
source-code change." Also named in payment milestone (b). It was not built
until now; the site had one footer address line.

---

## How it works

One new Creator form, `Website_Offices`. Its rows travel with the **site
bundle** (menu, footer, certifications), so the existing **Publish menu &
footer** / **Publish certifications** buttons publish offices too. No new
Catalyst endpoint, no new application variable.

The Contact page (`/contact`) shows a "Where to find us" list of published
offices, in Display Order. With no published offices the section is not
shown at all, and there are **no built-in offices**: inventing addresses for
a regulated business is the one thing the fallback must never do.

| Piece | File |
|---|---|
| Catalyst schema | `services/catalyst-website/src/site.ts` (`officeSchema`) |
| Catalyst mapper | `SiteService.publish` in `service.ts`, field by field |
| Smoke tests | cases 32a, 32b, 77/77 passing |
| Deluge | `creator/publish_site.deluge`, the offices block before `bodyText` |
| Website reader | `lib/content/site-source.ts` (`toOffice`, `offices`) |
| Component | `components/contact/office-list.tsx` |
| Page | `app/contact/page.tsx` |

## The Creator form: `Website_Offices`

**Check every link name in field properties after creating it.** Creator
silently appends a number if a name was used before, and the Deluge reads
these exactly.

| Field label | Link name | Type | Notes |
|---|---|---|---|
| Office Name | `Office_Name` | Single Line, mandatory | "Genedrift India (Head office)" |
| Address | `Address` | Multi Line | Street lines. Line breaks are kept |
| City | `City` | Single Line | |
| Country | `Country` | Single Line | |
| Postal Code | `Postal_Code` | Single Line | Text, not number: some codes have letters |
| Phone | `Phone` | Single Line | Shown as typed, dialled without spaces |
| Email | `Email` | Email | |
| Map Link | `Map_Link` | Single Line | Must start with `https://`, or the publish is refused |
| Office Hours | `Office_Hours` | Single Line | "Mon to Fri, 9:30 to 18:30 IST" |
| Display Order | `Display_Order` | Number | 10, 20, 30 |
| Published | `Published` | Decision box, **ticked by default** | Untick to take it off the site |

Report: add an action item **Publish menu & footer** running workflow type
function, calling `thisapp.publish_site()`, same as the certifications report.
Set it to run once for the report.

## Setting it up, in order

1. Create the form above. Check the link names.
2. In the `publish_site` function, paste the offices block from
   `creator/publish_site.deluge` just before `bodyText = payload.toString();`.
   Paste only that block. Leave the rest of the function as Creator has it.
3. Deploy Catalyst **v0.2.0** (`genedrift-website-appsail-dev-v0.2.0.zip`).
   **Before** publishing: publications are immutable, and a publish to the old
   build is refused (unknown key) or loses the field.
4. Add the report button.
5. Add one test office, press Publish, check `/contact`.

## Content

Real office details come from the client. Do not seed invented addresses.
For a demo, add a row clearly named "[SAMPLE] Office" and untick Published
before launch.

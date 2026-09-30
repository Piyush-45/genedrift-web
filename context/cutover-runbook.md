# Cutover runbook — moving the website onto Genedrift's own systems

> **Updated 30 September.** Our Catalyst trial has expired: Phase 3 (their Catalyst) is now first, and deploys **v0.2.0** (offices). Add `CREATOR_CONTACT_ENDPOINT` to the production environment in Phase 5. Hostinger plan recommended: Cloud Startup.
>
> **Updated 29 September.** Two answers change this plan. (1) Production
> hosting is the client's **Hostinger** (a plan that runs Node.js apps), not a
> Vercel Pro account. Phase 5 becomes "deploy to Hostinger and verify on its
> temporary address". (2) We offered to add the website forms into their
> **existing Creator app** (`proton`, US data centre) instead of importing ours.
> Confirm which before Phase 2. DNS call: Fri 2 Oct after lunch. Rotate the
> signing secret: it was exposed in a chat on 29 Sept.

**27 September 2026.** This is Milestone 3: *"Website deployed on
Genedrift-controlled production setup/domain and remains live/functioning for
7 consecutive calendar days."* Milestone 4 is day 31 after go-live.

Follow it in order. Each step says **who does it**, **how to check it worked**,
and **how to undo it**. Do not skip the checks — each one is cheap, and finding a
problem three steps later is not.

---

## ⚠️ The deadline that is not in the contract

**Piyush's Zoho Creator app is on a trial**, which expires around **7 October
2026** (the banner read "15 days" on 22 September — check it for the exact
date). When it lapses the CMS stops: nobody can edit or publish. The Creator
app has to be running on Genedrift's own account before then.

---

## What runs where today

| Piece | Today — on Piyush's accounts | After — on Genedrift's |
|---|---|---|
| Code | GitHub `Piyush-45/genedrift-web` (private) | Transferred to them, or them added as owners |
| Website hosting | Vercel project `genedrift-web`, **Hobby plan** | Their Vercel account, **Pro plan** |
| CMS | Zoho Creator app **Genedrift Website**, account `piyugene02`, **India** data centre | Their Zoho account |
| Publishing API | Zoho Catalyst `gd-genedrift-website-dev`, AppSail, **India** data centre | Catalyst project on their Zoho account |
| Insights (articles) | Separate Catalyst + Creator — `CATALYST_API_BASE_URL` | Same move, same way |
| Careers | **Already theirs** — reads `proton` on their account (**US** data centre) | No change |
| Domain | `genedrift.com` — registrar BigRock, **DNS on Cloudflare**, site on Zoho Sites | DNS points `@` and `www` at Vercel |
| Preview domain | `genedrift.site` — Piyush's, GoDaddy | Retired, or kept as a redirect |

**Two things in that table need raising with the client:**

- **Vercel's Hobby plan is for non-commercial use only.** A client's business
  website has to run on Pro (about $20/month per member). That is a cost they
  carry, and it should be on their card, not Piyush's.
- **Their Zoho account is US; the CMS is currently India.** Their `proton` app
  sits on `zoho.com`. Moving Creator and Catalyst to their account means moving
  data centre too. Confirm which Zoho account and data centre *before* the
  call — it decides every Zoho step below.

---

## Phase 0 — Before the call: decisions and access (client)

Nothing is touched until all of these are answered.

- [ ] **Which Zoho account** the CMS and publishing service will live on, and its
      data centre (`zoho.com` or `zoho.in`)
- [ ] **Zoho plan** — Creator and Catalyst on a paid plan that covers the app.
      A trial on their side just moves the deadline
- [ ] **Vercel** — their account on the Pro plan, with Piyush invited as a
      member for the migration
- [ ] **GitHub** — their organisation or account to receive the repo
- [ ] **Cloudflare** — access for Piyush, or their IT person on the call
- [ ] **Content sign-off** — ISO version, registered address, FAQ answers (see
      Phase 7)
- [ ] **Pending inputs** — contact form destination, application form link

---

## Phase 1 — Backups (Piyush, before anything changes)

| Backup | How | Check |
|---|---|---|
| Cloudflare DNS zone | Cloudflare → genedrift.com → DNS → **Export** | The file lists MX and TXT records as well as A records |
| Creator app | Creator → Settings → export the application (`.ds`) | File downloads and is not empty |
| Creator data | Export every form's report to CSV — pages, sections, markets, capabilities, nav, footer, certifications, case studies, metrics | One CSV per form, row counts match the reports |
| Code | `git push` — confirm GitHub matches local | `git status` clean, `main` up to date with `origin` |
| Env vars | Copy Vercel's variable **names** into a checklist (not the values into chat) | List matches the site's inventory below |

**Rollback for everything after this point starts here.**

---

## Phase 2 — The CMS: Creator app to their account

1. Import the `.ds` export into their Zoho account.
2. Import each form's CSV.
3. Re-link lookups (capabilities → markets, metrics → case studies). The
   linking functions in `creator/` exist for exactly this:
   `link_capabilities_to_markets`, `link_metrics_to_case_studies`.
4. Check every function saved without errors — the publish functions in
   `creator/` are the source of truth; `publish_case_studies.deluge` must be
   pasted **verbatim**, the editor rejected other shapes.

**Check:** record counts match the backup. Open three records at random and
compare them field by field.

**Rollback:** nothing on the live site has changed yet. Delete the imported app.

> The exact Creator menu names for a cross-data-centre import will be confirmed
> on the day against Zoho's current documentation — do not follow a guessed
> path.

---

## Phase 3 — Publishing API: Catalyst to their account

1. Create a Catalyst project on their account, same data centre as Creator.
2. Create a **private Stratus bucket**.
3. Deploy the latest AppSail bundle (`genedrift-website-appsail-dev-v0.1.9.zip`
   or newer) — same upload as before.
4. Set environment variables:
   - `WEBSITE_HMAC_SECRET` — **generate a new one**, 32+ characters. Do not reuse
     the current secret; it has lived on Piyush's account.
   - `CATALYST_STRATUS_PRIVATE_BUCKET` — the new bucket's name

**Check:** `<new-appsail-url>/health` returns `{"ok":true,...}`, and
`/v1/public/markets` returns `MARKETS_NOT_PUBLISHED` (correct — nothing
published yet).

**Rollback:** delete the project. Nothing points at it.

---

## Phase 4 — Connect Creator to the new Catalyst, then republish

1. In the new Creator app, application variables (`Publishing` namespace):
   - `Catalyst_Base_URL` → the new AppSail URL
   - `Signing_Secret` → the new secret from Phase 3
   - `Website_Base_URL` / `Revalidate_Secret` — leave until Phase 5
2. **Republish everything**, in this order: site chrome (nav, footer,
   certifications), markets, case studies, then every page.

Published content is frozen in the **old** Catalyst's storage and does not move
with the app. Republishing from Creator is how it reaches the new one.

**Check:** each public endpoint returns content —
`/v1/public/site`, `/v1/public/markets`, `/v1/public/case-studies`,
`/v1/public/pages/`.

**Rollback:** the live site still reads the old Catalyst. Nothing is broken.

---

## Phase 5 — Website hosting: Vercel to their account

1. In **their** Vercel account, import the GitHub repo as a new project.
2. Set environment variables for **Production**:

| Variable | Value |
|---|---|
| `CATALYST_WEBSITE_API_BASE_URL` | **new** AppSail URL (Phase 3) |
| `CATALYST_API_BASE_URL` | Insights publishing service — new one if moved |
| `CATALYST_API_TOKEN` | if the Insights service needs it |
| `ZOHO_OPENINGS_URL` | unchanged — already reads their `proton` app, must end `&field_config=all` |
| `ZOHO_APPLY_URL` / `ZOHO_APPLY_REF_FIELD` | once the client sends them |
| `CREATOR_CONTACT_ENDPOINT` / `CREATOR_CONTACT_TOKEN` | once the client names the destination |
| `REVALIDATE_SECRET` | **new**, 32+ characters |
| `NEXT_PUBLIC_SITE_URL` | `https://www.genedrift.com` |
| `SITE_INDEXABLE` | **leave unset** until Phase 9 |

3. Deploy.
4. Back in Creator: `Website_Base_URL` → the new site's URL,
   `Revalidate_Secret` → the value above.

**Check, on the new `*.vercel.app` address, before any domain moves:** home,
a market page, a case study, `/careers` with real openings, a job page, Insights.
Edit one field in Creator, publish, confirm it appears within a minute.

**Rollback:** the old deployment on Piyush's Vercel is untouched and still
serving `genedrift.site`.

---

## Phase 6 — Redirects for their old Zoho Sites URLs

Switching the domain retires their current pages. Links to them elsewhere —
emails, LinkedIn, Google — will 404 without redirects. **Add these before
cutover.** Known old URLs:

| Old (Zoho Sites) | New |
|---|---|
| `/case-studies` | `/client-success/case-studies` |
| `/capa-system-redesigned` | `/client-success/case-studies/capa-system-redesigned` |
| `/label-management` | `/client-success/case-studies/label-artwork-management` |
| `/life-cycle-management` | `/client-success/case-studies/life-cycle-management` |
| `/new-chemical-entity` | `/client-success/case-studies/new-chemical-entity-asean` |
| `/sla-based-closures` | `/client-success/case-studies/sla-based-closure` |
| `/Regulatory-Filing-Strategy` | `/client-success/case-studies/regulatory-filing-strategy` |
| `/openings`, `/careers` | `/careers` |

**Ask the client for a full list** of their current pages — their blueprint
asks for exactly this: *"Existing URL inventory for redirects."* The table
above is only what we happened to see.

---

## Phase 7 — Content sign-off (client)

On `genedrift.com` this becomes their public website. Before cutover they
confirm or correct:

- [ ] `ISO 9001:2000` in the footer — a withdrawn version, almost certainly
      meant to be 9001:2015. **Their decision; do not correct it for them**
- [ ] `[REGISTERED ADDRESS]` placeholder in the footer
- [ ] FAQ answers — written by us as placeholders; several touch regulatory
      obligations
- [ ] 46 markets vs "30+" in their other material
- [ ] The eight case studies — transcribed from their current site, not
      re-approved
- [ ] Careers: does the Openings report hold only open roles?

Get the sign-off **in writing**.

---

## Phase 8 — DNS cutover in Cloudflare

**Only the website records change.** Their email runs through records in the
same zone.

1. In their Vercel project → Domains → add `genedrift.com` and
   `www.genedrift.com`. Vercel shows the exact records it needs.
2. In Cloudflare, change **only** the `@` and `www` records to what Vercel
   shows.
3. Set those two records to **DNS only** (grey cloud), not proxied — unless
   deliberately configured otherwise. Proxying in front of Vercel causes
   certificate and caching problems.

🚫 **Do not touch** anything labelled **MX, SPF, DKIM, DMARC**, or any `TXT`
record mentioning Zoho, Google or Microsoft verification. If one of those
changes, company email goes down.

**Check:**
- `www.genedrift.com` loads the new site, with a valid padlock
- `genedrift.com` redirects to `www`
- **Send an email to a Genedrift address and receive a reply.** Email is the
  thing that must not break
- The old URLs in Phase 6 redirect correctly

**Rollback:** restore the two records from the Phase 1 export. The old Zoho
Sites site is still there and comes straight back.

---

## Phase 9 — Let search engines in

Only after Phase 7 sign-off: set `SITE_INDEXABLE` to exactly `true` in Vercel
and redeploy.

**Check:** `https://www.genedrift.com/robots.txt` allows crawling, and a page's
response headers no longer carry `X-Robots-Tag: noindex`.

Consider submitting the sitemap in Google Search Console — their account, their
property.

---

## Phase 10 — Close down the old setup

Only once the new setup has run cleanly for a few days:

- [ ] Rotate anything still valid from the old setup; delete the old Catalyst
      project's secrets
- [ ] Remove Piyush's old Vercel project, or leave `genedrift.site` redirecting
      to `genedrift.com`
- [ ] Decide on OAuth for careers — the `proton` privatelink works, but anyone
      holding it can read the Openings report. On their own account, OAuth is
      tidier. A change in `lib/content/jobs-source.ts` only
- [ ] Remove Piyush's access where no longer needed — or agree the support
      arrangement for the M4 month
- [ ] Hand over: this repo's `context/` folder is the documentation. Start with
      `handover.md`

---

## The milestone clock

| | Starts | Condition |
|---|---|---|
| **M3** | Phase 8 cutover | Live and functioning on their setup for **7 consecutive calendar days** — invoice on day 8 |
| **M4** | Go-live | **Day 31**, after first-month fixes — invoice then |

Write the go-live date down in an email to the client on the day. Both
milestones count from it.

---

## Site environment variables — full inventory

Read by the website: `CATALYST_API_BASE_URL`, `CATALYST_API_TOKEN`,
`CATALYST_WEBSITE_API_BASE_URL`, `CREATOR_CONTACT_ENDPOINT`,
`CREATOR_CONTACT_TOKEN`, `NEXT_PUBLIC_SITE_URL`, `REVALIDATE_SECRET`,
`SITE_INDEXABLE`, `ZOHO_APPLY_REF_FIELD`, `ZOHO_APPLY_URL`, `ZOHO_OPENINGS_URL`.

Read by the publishing service: `WEBSITE_HMAC_SECRET`,
`CATALYST_STRATUS_PRIVATE_BUCKET`, optionally `REQUEST_CLOCK_SKEW_SECONDS`,
`MAX_PAYLOAD_BYTES`.

Values never go in chat, email or git.

# Contract terms that matter day to day

**Read 30 September 2026** from the signed MSA PDF (Work Order + Annexure A,
Scope of Work Rev 2.0, 10 Aug 2026, GD-SOW-2026-08). Quotes are the
documents' own words. Not legal advice.

**Which document wins:** the Work Order prevails on legal, ownership,
security, payment and handover. The SOW prevails on detailed functional scope
and acceptance.

## Payment milestones (Work Order clause 3, these are the binding ones)

| | Amount | Trigger |
|---|---|---|
| (a) Project confirmation | ₹28,000 (20%) | Sitemap, images, hosting app confirmed |
| (b) Successful live demo | ₹42,000 (30%) | "working end-to-end core solution, including Zoho Creator-to-database-to-website content update flow and representative Blog, Careers and **Contact Us/location** functionality" |
| (c) Website live 7 days | ₹35,000 (25%) | Production site live on www.genedrift.com for seven consecutive days |
| (d) Post-go-live stability | ₹35,000 (25%) | Day 31 after go-live, in-scope glitches from the first 30 days resolved |

⚠️ **Correction.** Earlier we argued M2 was met on the end-to-end flow alone.
The Work Order's M2 also names representative Careers and Contact
Us/location. The client's objection had a basis. M2 appears paid (payment
notice 25 Sept). Do not reuse that argument.

The SOW has a different milestone table (30/30/20/20). For payment, the Work
Order wins.

## Scope points that have come up

- **Work Order 1(i), Contact Us/location:** office list managed in Creator
  (name, address, city, country, postal code, phone, email, map, hours, order,
  publish). Built 30 Sept, see `offices-cms.md`.
- **Hosting:** "The COMPANY shall provide hosting on Hostinger and required
  access to Cloudflare." Third-party costs are theirs; get written approval
  before incurring any charge on their behalf.
- **Scale (clause 2):** ~1,800 posts year 1, ~3,600 year 2, at least 200
  website pages, extensible beyond 20,000 without redesign; "up to 100,000
  website views per day"; the consultant must name infrastructure needs
  before launch.
- **No per-request Creator reads:** "The public website shall not directly
  pull data from Zoho Creator every time a website page is loaded." Careers
  reads the Openings report with a 5-minute cache, within "database and/or an
  appropriate cache layer".
- **Out of scope (SOW section 09):** "New page types, section types,
  integrations or workflows introduced after scope approval". Change control:
  "adds a new page/template/section type ... discussed before the additional
  work begins." Used for the country service pages request (30 Sept).
- **AMC (SOW section 10):** one year after final acceptance; defect fixes and
  reasonable support; excludes new features, new page types, content,
  third-party costs.
- **Training:** "reasonable operating/training guidance" is in scope; the
  editor's guide covers it.
- **Final sitemap brief:** markets end at `/markets/{region}/{country-slug}`,
  "Canonical country page". No per-country service pages. Contact lists
  Request Proposal, Schedule Consultation, Partnership Enquiry, Location,
  Media Enquiries, General Contact (superseded by the 24 Sept "one form"
  instruction for the form itself).

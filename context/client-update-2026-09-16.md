# Genedrift website — progress update

**16 September 2026**

Thank you for the detailed feedback of 15 September. We have worked through it
and the following is now built and ready for you to look at. A few points need
your input before we can close them out — those are listed at the end.

---

## 1 · Completed

### World map

- **The black box on clicking a country dot has been removed.**
- **Clicking a country now opens that country's page.** While implementing this
  we found that several countries could not be selected at all — the markers for
  closely spaced markets were overlapping one another, so clicking India, Ghana,
  Benin, Cambodia, Malaysia, Guatemala, Honduras or El Salvador was selecting a
  neighbour instead. All 46 markets have been checked individually and each one
  now opens its own page.

### Industries page

Rebuilt using **Concept B, the two-panel index layout**, as preferred. Selecting
an industry on the left shows its product types on the right. The previous
accordion version has been removed.

### Explore section

- More left padding, and rounded corners on the highlight.
- **Nothing is highlighted when the page loads** — the highlight now appears only
  on hover, as requested.

### Contact section

A fourth card, **"Submit your CV"**, has been added, linking through to Careers.

### New: Global Presence page

A new page with a **country search bar** and a **table of every market and the
services offered there** — Regulatory Affairs, MAH & Local Representation and
Pharmacovigilance, each shown as Available, Upcoming or Not available. Typing a
country or region filters the table immediately.

There is **no compare-markets feature**, per your instruction.

The service columns are generated from the market data itself, so if a market
gains an additional service in future it appears automatically — no development
work is needed to add, remove or reorder the services offered in a market.

---

## 2 · In progress

### Country-level highlighting on the map

We are replacing the current map with one built on verified country geometry, so
that hovering or selecting highlights **the whole country rather than just the
dot**.

To address your concern about geographical and political boundaries: **no border
lines are drawn anywhere on the map.** Countries are shown as soft filled shapes
only, and only the selected one is picked out. We are also using the
Survey of India-aligned dataset, so India is represented correctly.

### Hero country selection

The country shown in the headline will be chosen so that it is **not** the
visitor's own country, with a different market shown on each visit. Your own
country may still appear later in the rotation.

### Rolling Health Authority Bulletin

The rotating bulletin strip between the Market Status card and the Latest
Updates ticker, beginning with FDA. This will be editable by your team through
the content management system.

### Pharmacovigilance page

A dedicated page listing the safety contact for each country — country, email
and telephone where available. It is being built now with placeholder entries so
your team can enter the real details directly.

### Careers

The openings list will be pulled from your existing Zoho Creator report rather
than embedded as a frame, so it matches the rest of the site's design while your
team continues to maintain the roles exactly as they do today.

---

## 3 · Where we need your input

| # | What we need | Why |
|---|---|---|
| 1 | **Pharmacovigilance contacts** — country, email and telephone for each market. Telephone is optional where it does not exist. | To populate the PV page. We can launch with placeholders, but the real details are yours to supply. |
| 2 | **Adverse Event form** — who is building it, which fields are mandatory, where submissions should be routed, and who owns the process. | Adverse-event reporting is a regulatory obligation with a named accountable owner. We will not put a live form on the site until its destination is confirmed. Until then the page points to an email address rather than showing a form. |
| 3 | **Rolling bulletin** — should this show authority names only, or actual bulletin headlines? If headlines, who will keep them current? | It changes nothing structurally; we are asking so your team is not surprised by the ongoing maintenance. |
| 4 | **Careers openings report** — the report URL, and confirmation of whether it is published publicly or private. If private, we will need API credentials from your Zoho account. | The site cannot read a private report without them. |
| 5 | **Hosting** — which Zoho account the site should sit under, and whether a Catalyst subscription is already in place on it. | We will advise on the plan and on whether Zoho Support needs to be involved once we know the account. |
| 6 | **Global Presence** — should this sit alongside the existing Markets section, or replace it? | It currently sits alongside, as the first item in the Markets menu. |

---

## 4 · One point to flag

Your feedback asks for the entire country to be highlighted, and separately for
geographical and political boundaries not to be prominent. These pull slightly
against each other: highlighting a country requires that country's shape, and a
shape implies a boundary even when no line is drawn.

We are proceeding as described above — verified geometry, no border lines drawn,
India represented per the Survey of India — which we believe gives you the
clarity you are asking for with the least exposure. Please let us know if you
would prefer a softer approach instead.

---

## 5 · Also noted

Two items in your existing material that we have deliberately **not** changed,
as they are yours to confirm:

- The certification row lists **ISO 9001:2000**. That version was superseded and
  has been withdrawn; we suspect 9001:2015 is intended. We have not amended a
  certification claim without your confirmation.
- The homepage refers to **46 markets** while the metrics row says **30+**. Both
  figures came from your material.

---

Happy to walk through any of the above on a call.

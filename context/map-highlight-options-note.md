# World map: highlighting markets — options and recommendation

**17 September 2026 · Genedrift website · for review**

---

## What was requested

From the 15 September review, section 1:

| Ref | Request |
|---|---|
| 1.3 | Highlight the entire country, not just the dot |
| 1.5 | Highlight on hover and on select |
| 1.4 | No prominent geographical or political boundaries, to limit exposure to boundary disputes |

Items 1.1 and 1.2 from the same section — removing the black box on click, and clicking through to the country page — are complete and live.

## Where this stands technically

The map currently on the site is a single continuous landmass: coastlines only, with no country data behind it. Nothing in it knows where one country ends and the next begins, which is why the present highlight is a soft circular glow around the marker rather than a country.

Delivering 1.3 therefore means introducing country geometry — a dataset that defines each country's shape. This is a data change rather than a styling change, and it is the reason this item has run longer than the rest of section 1.

## The point that needs your decision

**1.3 and 1.4 pull against each other, and the tension cannot be designed away.**

Showing a country's extent means drawing its outline. Filling the shape rather than stroking its edge changes how emphatically the boundary is presented; it does not remove the boundary. The edge of a filled shape follows exactly the line a border would.

This matters more here than it would on most sites, because of which markets are on the map. The current market list includes **India and Pakistan**, **Russia and Ukraine**, and **Taiwan and Hong Kong**.

As the map stands today, it is a continuous landmass and makes no statement about any border anywhere. The moment countries are given individual shapes, the map necessarily depicts a boundary between India and Pakistan, a boundary between Russia and Ukraine, and a position on Taiwan — on the website of a firm that holds commercial relationships in all of those markets. Every available dataset takes a position on these; there is no neutral edition. Where India is concerned we would use the Survey of India point-of-view dataset, which addresses India's depiction specifically, but that does not make the other depictions neutral.

I raise this as a commercial and reputational consideration rather than a design one, and I would suggest your own legal or compliance view before it is settled. It is precisely the exposure that 1.4 was written to avoid, and it is created by 1.3.

## Three routes

| | What visitors see | Boundary exposure | Time |
|---|---|---|---|
| **A · Region highlight** | Hovering or selecting a market highlights its whole region — Africa, Asia Pacific, and so on — and the status card names the country. | None. Regions are our own grouping, not international borders. | Within the current sprint |
| **B · Named marker** | The marker grows on hover and the country's name appears on the map beside it, with its service availability shown alongside. | None. The country is identified in words rather than in geometry. | A few days |
| **C · Full country geometry** | Exactly as requested in 1.3: the country's own shape fills on hover and select, filled and never outlined, per 1.4. | Present, as described above. | Roughly one week, plus licensing and review of the dataset |

A and B are not compromises on the underlying objective. The objective, as I read it, is for the map to communicate that Genedrift covers whole regulatory jurisdictions rather than individual offices — which is a fair point, since the unit of your work is the market, not the city. Both A and B carry that message. They differ from C only in whether the message is carried by geometry or by grouping and language.

## Recommendation

**Option B, with A available as an extension.** It answers 1.3's intent and 1.5 in full, satisfies 1.4 without qualification, is the quickest of the three, and puts each market's service availability directly on the map, which the current design only reveals in the side panel.

If you would prefer C, I am content to build it. I would ask only that the choice is recorded, along with the datasets used, so that the position the map takes is a documented decision rather than a by-product of a styling request.

## What I need from you

1. A decision between A, B and C.
2. If C: written confirmation, and your legal or compliance sign-off on the depiction of the three pairs named above.

Nothing else in the project is waiting on this. The remaining open items are unchanged: the hosting decision, the adverse-event form specification, the pharmacovigilance contact list, and the careers feed credentials.

Happy to walk through the three on a call if that is easier than reading them.

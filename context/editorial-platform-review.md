# Editorial platform — review and questions

From reading `GeneDrift Editorial Platform.ds` in full, 2026-09-13.
Questions to put to whoever built it, ordered by how much they cost to fix later.

**First, the honest headline: the design is good.** Article identity is split
from revision content with an explicit published pointer; publication is an
idempotent job with retries and an audit trail; both directions of the Catalyst
handoff are HMAC-signed; callbacks dedupe on event id. That is a more careful
publishing pipeline than most agencies ship. The issues below are real, but
they sit on top of a sound model — which is why `Website_Pages` /
`Website_Page_Revisions` should copy this shape rather than invent another.

---

## 1. CRITICAL — the signing secret is in plaintext, and in every export

```
thisapp.variables.Publishing.Signing_Secret = "1b45596e…e12e7"
thisapp.variables.Publishing.Catalyst_Base_URL = "https://…development.catalystappsail.in"
```

This one secret authenticates **both directions**: Creator signs its publish
handoff with it, and `record_catalyst_publication_result` verifies Catalyst's
callback against it. Anyone holding it can forge a publication callback and
mark arbitrary revisions published.

It is stored as an application variable in clear text, so **it is included in
every `.ds` export** — which means it travels in any file shared for review,
support or backup.

- Rotate it. Treat the current value as compromised: it has left the system at
  least once.
- Move it to a secrets store rather than an app variable, or at minimum
  confirm that `.ds` exports are never shared without scrubbing.
- The base URL points at **`.development.`** — what switches this to
  production, and is there a separate secret per environment?

## 2. HIGH — an article slug is not unique, so two articles can own one URL

`Categories.Slug` and `Tags.Slug` are declared `must have unique`.
`Article_Revisions.Slug` is only `must have`.

Nothing stops two different articles publishing at the same slug, and the
second one silently takes the URL.

Note *why* a plain unique constraint is wrong here: successive revisions of the
same article legitimately share a slug, so Creator's field-level uniqueness
cannot express it. The rule is "no **other article's** published revision uses
this slug", which needs a Deluge check at approval or publish time.

**Question:** is that check somewhere I did not find, and if not, what happens
today when an editor reuses a slug?

## 3. HIGH — no author reaches the published article

`Articles.Primary_Author` exists, and `Article_Contributors` carries
`Contribution_Type`, `Display_Order` and a `Show_Publicly` checkbox — clearly
built to be published. But `articlePayload` sends only `creatorRecordId`,
`uuid`, `workflowState`, `approvedRevisionId`, `primaryCategory` and `tags`.

So a live article has no byline, and Catalyst cannot invent one. The
`Show_Publicly` flag is currently decorative.

**Question:** was the byline deliberately out of scope for Phase 1, or is this
an oversight? Adding an `authors` array to the payload is one function.

## 4. HIGH — content type versus category (decides the URL shape)

The client baseline asks for `/insights/{content-type}/{content-slug}` and
names twelve types. The model has one `Primary_Category` and `Tags`.

**Question:** what is actually in `Categories` today — content types
("Regulatory Update", "Whitepaper") or subjects ("Pharmacovigilance", "Medical
Devices")? If subjects, a content-type field is missing and every existing
article needs one set. URLs are the most expensive thing to change after
launch, so this is blocking for the Insights routes.

---

## 5. MEDIUM

**`Demo_` prefixes on the real people model.** `Demo_Employees`, `Demo_Teams`,
`Demo_Team_Memberships` are picklisted from almost every other form — authors,
reviewers, publishers, audit actors. Are these throwaway stand-ins that became
production? If they are staying, rename them before more references accumulate;
if they are placeholders, what replaces them?

**Replay protection on the callback.** The callback verifies an HMAC over
timestamp + nonce + payload, and dedupes on `Audit_Events[Event_UUID ==
eventId]`, which gives idempotency. **Question:** is the `callbackTimestamp`
freshness window actually enforced, and is the nonce checked against anything?
Without a time window, a captured valid callback replays forever under a new
event id.

**GDPR marking.** `personal data = true` is set on `Work_Email` only.
`Display_Name`, `Job_Title` and `Avatar` are personal data too, and the site
footer claims GDPR compliance.

**`Referenced_Media_UUIDs` is a hand-maintained textarea.** Publishing refuses
if the document mentions `"mediaId":"` but that field is empty, telling the
editor to "re-save the draft before approval". **Question:** what normalises
it, and can an editor get stuck in that state? It reads like a coupling between
the widget and publish validation that an editor can break by accident.

**Form layout collision.** In `Publication_Jobs`, `Next_Retry_At`,
`Retraction_Reason` and `Replacement_Path` are all `row = 15`. Cosmetic, but it
suggests the form was not opened after the last edit.

---

## 6. Questions I need answered to build templates E and F

1. **What is `Editor_Document` actually?** `documentText =
   revision.Editor_Document.content` and the code greps it for `"mediaId":"`,
   so it is structured JSON, not HTML or a .docx. What is its schema, and is it
   the editor-widget's own format?
2. **Who converts it to HTML — Catalyst or the frontend?** This decides how the
   article body is rendered and sanitised. On a pharma site I do not want to
   guess at that.
3. **What does the public read API look like?** Listing endpoint, filtering by
   category/tag, pagination, single-article endpoint, and the revalidation hook
   shape. `frontend/lib/api.ts` presumably has all of it.
4. **Are `Site_Settings` honoured?** `Insights_Base_Path`, `RSS_Enabled`,
   `Search_Enabled`, `Related_Articles_Enabled` — does the frontend read these,
   or are they aspirational?
5. **Is `Redirects` wired to anything?** It is a good model and the website
   build needs exactly this. Is it served, or just stored?

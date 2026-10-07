# Reply to Akshay, 7 October 2026

Status: **drafted, not confirmed as sent.** Placeholders: [NEW EMAIL] (never
used with Zoho), [HOSTINGER EMAIL]. Attach: blog review workflow diagram,
3 testing screenshots, Editor's Guide (Word, v1), Hostinger plan screenshot.
Checklists go in the separate move email, not this one.

## Akshay's email (summary)

- No dispute on scope; start implementation ASAP.
- Pages and Market Capabilities explanation accepted; questions were to avoid
  rework within contract; genuinely additional work separately.
- Workspace scroll: proceed.
- Contact and Careers clear; short video if feasible, OK to skip while the
  deployment is down.
- Reviewer workflow for blog, website pages, markets, case studies; Team
  module as reviewer directory. If website review takes time: name the forms
  and where template/subform connect; they configure (15–30 min), we integrate
  with publishing. Explain order, statuses, notifications, publish
  permissions, override record. "Kindly do not rework on any activity."
- Catalyst invite to tyagipiyush2233@gmail.com fails: "User exists in another
  data center."
- Want: Creator/IDE route and safe import; GitHub (purpose, WorkDrive?); URLs
  and redirects; Editor's Guide in Word/Writer; confirm Hostinger Cloud
  Startup + screenshot; Catalyst email; Hostinger/GitHub account details.

## Reply (final draft)

Dear Akshay Sir,

Thank you for your detailed reply, and for confirming we can proceed. Please find my responses below, in the order of your email.

1. Pages and scope
Thank you. I fully understand the intention behind your questions. Once the agreed implementation is live, I will be happy to go through any such items with you.

2. Website Workspace scroll
Noted. I will include the independently scrollable page list with the move.

3. Contact and Careers video
The preview deployment is currently paused, so I will record a short video of a Contact Us submission reaching your Website_Contact form, and of the Careers application flow, as soon as the site is running on your Hostinger.

4. Reviewer workflow: what is ready
For blog articles, the reviewer workflow is built and was tested end to end on my setup before the trial ended. No rework is needed on your side.
- Ways to send an article for review: a review template (a named group of reviewers), choosing reviewers for one article, or the shared queue (any reviewer can pick it up).
- Order: a template runs either at the same time (parallel) or in order (sequential, step 1 then step 2). In sequential review, the next step is asked only after the previous step approves.
- Approvals: with a template, or with reviewers chosen by hand, everyone named must approve. For the shared queue, an admin sets the number of approvals.
- Article statuses: Draft, In Review, Changes Requested, Approved, Rejected, Scheduled, Published, Unpublished, Archived.
- Review statuses: Assigned, Waiting (in sequential review), Claimed (from the queue), Approved, Changes Requested, Rejected, Cancelled (when the review ends early), Overridden.
- Rejection and changes: if any reviewer asks for changes or rejects, the article goes back to the writer and the other open reviews are cancelled.
- Notifications: emails are sent when an article is sent for review, when it is a reviewer's turn, on each decision, on an override, and when an article is ready to publish.
- Publishing permissions: only users with the Publisher or Editorial Admin role can publish, schedule or unpublish, and only after approval. A writer can never review their own article.
- Master Approver override: approves on behalf of an unavailable reviewer, only with a written reason. Who did it, when and why are recorded on the review and in the article history, and the writer and that reviewer are notified. It cannot be used on their own article, or where they are themselves a reviewer.
A one-page diagram of this flow and screenshots from testing are attached. Reviewers will be taken from your Team module; I will confirm the exact connection with Vikas once I see the Team form's fields.

Website content review: as requested, the forms where this content is maintained, in the Website application:
- Website pages: Website_Pages, with page content in Website_Sections
- Markets: Website_Markets, with capabilities in Website_Market_Capabilities
- Case studies: Website_Case_Studies, with figures in Website_Case_Study_Metrics
- Reviewer template: Review_Templates (Template Name, Review Order, Active) with the Reviewers subform (Reviewer, Step)
Adding a template field to these forms is quick, as you mentioned. The main part is the link with publishing: today these forms publish straight to the website, so a change would need to wait for approval without affecting the live page, and markets and case studies are published as one full list, so we would need to agree whether approval is per change or per publish. As you suggested, I propose we discuss this once the agreed implementation is complete.

5. Catalyst access
Thank you for trying. The invitation fails because tyagipiyush2233@gmail.com already has a Zoho account in the India data centre, while your Zoho account is in the US data centre, and one Zoho login can belong to only one data centre. Either option below will work:
- (Recommended) Create a user on your own domain, for example piyush@genedrift.com, and invite it with "Admin for the whole account". You keep full control and can remove it after handover.
- Invite [NEW EMAIL]. This address has never been used with Zoho, so it will be created in your data centre when I accept the invitation.

6. Creator setup
My preferred approach is to import the Website and Editorial applications into your Creator account from their application files (.ds), which I have exported. The import creates two new, separate applications, so your existing application is not touched and keeps working as it does today. The IDE route (pasting the forms into your existing application's code) also works, but it means editing your live operational application, so I would keep it as a fallback.
After import, I will set up the API connections, upload the two widgets, add users and roles, and link the reviewers to your Team module. Website content (pages, markets, case studies, menu and footer) will be imported into the new reports and then published once to your Catalyst. Test articles will not be carried over. Contact and Careers stay in your existing application exactly as they are now. I can do this together with Vikas on a short call.

7. GitHub
GitHub is needed for all three: source-code ownership in Genedrift's name, full version history, and automatic deployment, since Hostinger deploys the website directly from GitHub. WorkDrive is a good place for the documents (guides, checklists, application files and a code archive at handover), but it cannot provide version history or deployment.
Please create a free GitHub organisation for Genedrift and invite me (username: Piyush-45) as Owner for the implementation. I will transfer both repositories (website and editorial) with their full history. After handover, my access can be reduced to collaborator for the support period.

8. Existing URLs and SEO
All current genedrift.com addresses will be redirected to their matching new pages, so existing links and search rankings carry over. I will share the full redirect list for your confirmation before the switch. Search engines will be allowed on the new site only from switch day, and the new sitemap will be submitted in your Google Search Console.

9. Editor's Guide
The Editor's Guide is attached in Word format, so you can edit it. I will send a final updated version at handover, with the offices and contact details added.

10. Hostinger
Yes, Hostinger Cloud Startup is the exact plan, on your existing Hostinger account. A screenshot is attached. After purchase, please share access with me from hPanel at [HOSTINGER EMAIL], with access to the website and hosting. Billing access is not needed.

11. Milestone 2
The Milestone 2 invoice was shared on 22 September, when Careers and Contact were still pending. Both have been live since 30 September, so the blog, Careers and Contact are now all in place, as per Milestone 2 of the Work Order. Kindly confirm whether Milestone 2 can now be marked as complete and the invoice processed. Once it is confirmed, I will begin the move straight away, starting with Catalyst and Creator. Meanwhile, the access above can be arranged so everything is ready.

I will send the detailed move and content checklists in a separate email, as mentioned.

Thank you for your support.

Warm regards,
Piyush Tyagi

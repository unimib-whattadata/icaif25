# Website consistency review — 24 October 2026

## Scope and verification

Read all 20 canonical HTML page bodies and compared their dates, application status, speaker names/roles, programme entries, registration information, contacts and metadata. Inspected the 20 local clean routes in the browser. Reviewed the existing programme JSON and tutorial source. This is a content-consistency review of the current local website, including the pending Student Volunteer closure changes.

`npm run check` passed: 36 existing tests, JavaScript syntax checks, HTML validation, clean-route parity, programme rendering parity for 85 sessions, tutorial parity for four tutorials and site checks for 20 pages. The browser found one H1 and one main landmark on each route, no duplicate IDs, no horizontal document overflow at the current desktop viewport and no broken images among those loaded. Browser observations are saved locally in `/private/tmp/icaif-audit-20261024/browser-results.json`; test output is `/private/tmp/icaif-audit-checks.log`.

This review does not assert full accessibility conformance, a new mobile visual audit, current correctness of every third-party website, PDF content verification, or successful delivery to any published email address. No public website content was changed during this review.

## Findings

### C1 — P1: News still invites applications after the volunteer form closed

- Location: `news.html:508–521`; corresponding generated route; News structured data at `news.html:146`.
- Evidence: the October 19 entry says “Student volunteer applications are open”, asks visitors to apply by October 21 and retains a direct “Apply as a student volunteer” link. The October 17 entry also uses a live invitation. The dedicated volunteer page now says applications are closed, and the Google Form was closed on October 24.
- Impact: readers follow an apparently active application action to a closed form.
- Recommendation: preserve the historical announcement dates but add a dated closure update, change the action to the archived call and align the News structured item name with the visible heading if changed. The existing travel-grant announcements demonstrate the intended archive treatment.

### C2 — P2: Workshop submission instructions remain active after October 12

- Location: `workshop.html:459–462`, nine submission links across the workshop cards, including `workshop.html:1677`.
- Evidence: the page still instructs authors to choose “Create new submission”; nine visible actions say “Submit via CMT”, “Submit via OpenReview” or “Submit paper”. The page's own deadline and Home say workshop paper submission closed on October 12.
- Impact: readers may mistake portal access for an open submission call.
- Recommendation: mark workshop submissions closed and relabel retained destinations as portal/venue access, keeping existing workshop website links. Do not infer a new submission extension.

### C3 — P1: Michael Barr has no named programme entry

- Location: `index.html:599–604`; `data/programme.json`.
- Evidence: Home advertises Michael Barr as a keynote speaker on November 16. None of the 85 programme titles or details names him, and the Home programme action opens the generic programme.
- Impact: visitors cannot find his session or time, or add a named Barr session to their agenda.
- Recommendation: obtain the confirmed session/time or panel assignment from the organizers, then reconcile Home and programme. The current unnamed November 16 afternoon panel is not evidence of his assignment; do not invent a slot.

### C4 — P2: Pasquali's afternoon keynote is not enriched like the morning session

- Location: `programme.html:1995`, `data/programme.json:921–925`.
- Evidence: the November 17, 09:00 fireside chat uses Stefano Pasquali's full name and Domyn role, while the same day's 14:00–14:30 keynote remains “Keynote Pasquali”, with an empty detail.
- Impact: searching the full name “Stefano Pasquali” finds the morning session but misses his afternoon keynote.
- Recommendation: if this keynote is confirmed, add the full name and role consistently. His participation in both a fireside chat and a separate keynote is possible; the two entries alone do not prove a duplicate event and neither should be deleted without confirmation.

### C5 — P2: Privacy content does not describe volunteer application collection

- Location: `privacy-policy.html:455–465`, `privacy-policy.html:588–594`, `privacy-policy.html:643–718`.
- Evidence: the notice explicitly describes the Travel Grant Google Form and its data; it does not mention the Student Volunteer application, whose actual form collected CVs, proof of student status, a motivation statement, availability and an optional self-identified gender field.
- Impact: application-data documentation is incomplete relative to the forms used for this conference. Closing the form does not remove the existing responses.
- Recommendation: have the responsible organizers reconcile the notice with the volunteer collection and its handling/retention, and link the appropriate information from the volunteer call. This is an observed content gap, not a legal compliance determination.

### C6 — P3: Volunteer selection copy still points forward to October 23

- Location: `call-for-student-volunteers.html:440–447` and the application dates card at lines 379–380.
- Evidence: on October 24 the page still says “We will select 30 Student Volunteers” and “Selected volunteers will be notified by October 23”. Its introduction now says the conference “invited 30 motivated students”, which can suggest individual invitations rather than a call for up to 30 volunteers.
- Impact: the closure state is clear, but the selection stage is ambiguous.
- Recommendation: confirm whether notifications were actually sent before stating completion. If their status is unknown, describe October 23 as the announced notification date and retain neutral wording about the original call for 30 volunteers.

### C7 — P3: Programme metadata date predates its visible update date

- Location: `programme.html:118`, `programme.html:456`, `sitemap.xml:56–57`.
- Evidence: visible copy and `data/programme.json` say the programme was updated October 23, while the page's JSON-LD `dateModified` and sitemap `lastmod` remain October 17.
- Impact: machine-readable publication metadata does not reflect the latest speaker update.
- Recommendation: regenerate SEO metadata with an explicit October 23 update for the programme page, then regenerate its clean route.

## Items requiring confirmation rather than automatic correction

1. **Volunteer contact domain:** `call-for-student-volunteers.html:448` uses `info@icaif26.org`; the website uses `icaif2026.org`. The shorter domain was supplied in Andrea Maurino's original call and also used in the form. Confirm the mailbox with the organizers; a different domain is not proof that it is invalid.
2. **Svitlana's contact:** her committee affiliation is now Millennium (`organisation.html:465`), while Home and the paper call still link to `svitlana@outsampler.com` (`index.html:1130`, `call-for-papers.html:1022`). Confirm whether the existing address remains her preferred contact; do not fabricate a Millennium address.
3. **Oral Session numbering:** labels 5–8 appear on November 16 at 15:00 and November 17 at 10:00. This is inherited from the source workbook and already documented in `docs/programme-source.md`. Confirm the intended final numbering before renaming.
4. **Speaker title variants:** Home follows the approved brochure and the morning programme follows Andrea Maurino's October 21 email. Examples include “Chief AI Officer” / “Group Chief AI Officer” for Magazzeni, “Chief of IMI Corporate & Investment Banking Division” / “Head of Corporate & Investment Banking at Intesa Sanpaolo” for Micillo, and long/short titles for Savi and Pasquali. These are copy variants, not established factual errors. Choose a canonical public wording if uniformity is desired.

## Timing and publication cautions

- At the check time (October 24, 09:10 UTC / 11:10 in Milan), the October 23, 23:59 AoE workshop-author registration deadline had not yet expired. It expires October 24 at 13:59 Milan time. Home displaying this as the next milestone was therefore correct during this review.
- General registration is open; Early Bird through October 25 is consistent across Home, Important Dates and Registration.
- Student Volunteer closure HTML, SEO source and sitemap are still local uncommitted changes at review time. The live Google Form has been closed, but this review does not establish that the site's closure copy has been deployed.
- DXC, Domyn and LinqAlpha sponsorship discussions are not treated as confirmed omissions: prior email review did not establish final publication approval.

## Page coverage

| Page | Outcome |
| --- | --- |
| Home | Barr programme mapping; speaker-title variants. Main dates and milestones consistent. |
| Important Dates | Main/workshop author deadlines, registration periods and volunteer dates consistent. |
| Organization | Committee content internally consistent; Svitlana contact elsewhere to confirm. |
| Registration | Fee periods and main/workshop author requirements consistent with the other current pages. |
| Venue | Conference address and dates consistent; social-event locations are supplied separately in the programme. |
| Programme | C3, C4, C7; final oral-session numbering to confirm. |
| Workshops | C2; ten accepted workshop groups match the programme's linked workshop identities. |
| Competitions | Three accepted competitions; no internal timetable contradiction found. External timeline freshness not revalidated. |
| Call for Papers | Closed status and submission/notification dates consistent. Retained original requirements treated as archive content. |
| Call for Workshop Proposals | Closed status and workshop dates consistent. |
| Call for Tutorials | Closed status and tutorial dates consistent. |
| Call for Competitions | Closed status and proposal dates consistent. |
| Sponsors & Supporters | Sponsor tiers internally consistent with Home; pending commercial discussions excluded. |
| Become a Sponsor | No contradiction found with the existing sponsorship source record. PDF not re-audited. |
| QRT Student Travel Awards | Application closure agrees with Registration and current News grant updates. |
| Media Kit | Photography time bands agree with the homepage runtime and its existing tests. |
| Privacy Policy | C5. |
| Tutorials | All four dates, times, rooms and presenter metadata match the programme. |
| News | C1; historical dates distinguished from current calls. |
| Student Volunteers | Closure correct; C6 and contact-domain confirmation remain. |

## Suggested order

Fix C1 and C2 first because they expose obsolete application/submission actions. Confirm Barr's session before changing the schedule. Complete Pasquali's afternoon entry if confirmed, reconcile volunteer/selection documentation, and align programme metadata. No schedule, mailbox or sponsor facts should be inferred from these findings.

## Follow-up implementation — October 24, 2026

The user authorized changes after this review. C1 now has a new closure announcement and updated historical volunteer posts; a second new announcement introduces the five approved keynote speakers. C2's nine submit links are replaced by genuinely disabled “Submissions closed” buttons, with the workshop deadline and closed state visible. C3 is addressed by an explicitly unscheduled Barr announcement in the programme header; an actual time/room still requires organizer confirmation. C4 now names Stefano Pasquali and his Domyn role in the afternoon keynote as well as the morning fireside chat. C5 now documents the volunteer form's data, purpose, authorized access, optional gender field, closure and retention/contact information. C6 uses the announced notification date in the past tense without claiming notifications have been sent, and accurately describes a call for 30 volunteer places. C7's programme data, visible update date, metadata and sitemap are aligned to October 24.

Contact-domain, Svitlana-email and final oral-session-numbering questions remain as recorded above; no unverified contact or schedule facts were changed. The initial findings remain historical evidence of the reviewed state.

### Follow-up verification

`npm run build` passed all 36 tests, syntax checks, HTML validation, 20-page site checks and generated route/source parity after the authorized changes. Additional checks confirmed the 85 scheduled slots retain their dates/times/rooms/types, the two Pasquali sessions are findable by full name and export with role details, all nine workshop submit controls are native disabled buttons, the old direct volunteer form action is absent from News, and all five affected WebPage metadata dates are October 24. Browser checks at 1280px and 390px found no horizontal overflow on News, Workshops, Programme, Privacy Policy or Student Volunteers. Live programme search returned both Pasquali sessions. Screenshots and browser observations are in `/private/tmp/icaif-content-update-20261024/`.

The factual privacy additions use the observed volunteer application fields and the existing policy structure. General transparency categories were cross-checked against the European Commission's [official guidance](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/obligations_en). No fixed retention duration or notification-completion claim was invented.

## Second independent review — October 24, 2026

Repeated the 36-test suite and all generated-page/source parity checks after the latest copy correction. All passed. Browser traversal of all 20 canonical routes found no document overflow at the current desktop viewport, duplicate IDs or missing H1s; checking runtime internal link fragments against the target DOMs found no missing targets. All nine workshop submission buttons remain natively disabled. Independent read-only content and programme reviews identified two residual issues:

1. **Volunteer paper-coverage wording (P2):** `call-for-student-volunteers.html:413` says every accepted paper requires a “regular full registration”. This is too broad relative to `registration.html:548–551` and `workshop.html:480–482`, which allow Workshop Days or One Day registration for a workshop paper. Preserve the ban on using free volunteer registration to cover a paper, but state the separate main/workshop requirements or link to them without saying every paper needs a full registration.
2. **Saved-agenda compatibility after a title correction (P2):** the existing title-hashed identity rule changes Pasquali's afternoon keynote ID from `session-2026-11-17-1400-005044df` to `session-2026-11-17-1400-230e8289`. The rule is documented and was not newly introduced, but its effect is observable: the old saved selection is discarded by `parseSavedIds` (`js/programme.js:274–278`), the old hash does not resolve in `resolveHashFilters`, and the calendar UID changes. A direct execution of the current helper logic confirmed the first two effects. Add alias migration/compatibility for renamed public sessions, or adopt a stable identity scheme; do not silently alter the existing identity rule without reconciling the importer.

Barr remains an intentional unplaced announcement: current timed-session search, calendar export and print do not include him. No new time or room is inferred. The previously recorded contact-domain, Svitlana-address and oral-session-numbering questions remain unconfirmed. No website files were modified in this second review.

### Volunteer registration wording corrected

At the user's subsequent instruction to correct only Student Volunteers, the paper-coverage paragraph now distinguishes in-person Main Conference/Passport registration at ACM member/non-member rates for main conference papers from Workshop Days/One Day registration for workshop papers. The free volunteer registration still cannot cover a paper. Only the volunteer source page and its generated clean route changed in that correction; HTML validation and 20-page site checks passed. Saved-agenda compatibility remains unchanged.

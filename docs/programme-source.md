# Programme data

## Critique fixes — October 30, 2026

The user authorized the three critique priorities and related microcopy/typography refinements. Paper searches now isolate matching contributions inside the session, with a Show all control, match count and session context. Matches appear first when the full list is requested; clearing search restores the supplied order. All query terms must describe one paper plus its session context, preventing terms from unrelated papers from producing a false result. Topic/session queries retain the complete session without automatically opening every paper list. Calendar exports still include each selected session's complete paper list.

The compact entry shows the first session in the initial viewport. Mobile type/room filters are expandable, selected filters remain named in the status, and secondary actions/storage help are grouped under Tools. The mobile navigator stays on one 62px row, with return-to-position available in the time picker. Native disclosures now label their View/Hide action, the empty agenda offers Browse programme, and authors use 14px text with 72ch measure.

Verification: all 52 tests, HTML validation and source/route checks for 21 pages passed. Browser checks at 320–1440px found no overflow. Paper 1044 appears as the single matching contribution in its 38-paper session; Show all, order restoration, filters, agenda, Tools keyboard dismissal, mobile time selection and exact scroll-position return were verified. The first session begins around 525px desktop and 531px mobile; the dock remains 62px after a jump. Evidence is under `.codex-artifacts/programme-polish-20261030/`.

## Compact layout refinement — October 30, 2026

The user selected a compact programme with expandable details. Each time group now presents flat rows aligned by room/category, session title/time and agenda action. Opening a paper list expands its own row, leaving neighboring sessions compact. Counts remain visible in each disclosure without repeating the same presentation total above it. Paper IDs occupy a narrow gutter on desktop; full titles and authors use an open reading layout.

The desktop navigator uses a quieter 62px white toolbar with the existing controls. On mobile, the timeline rail is omitted to recover reading width, metadata and actions stack, and the bottom navigator keeps the existing day/time/agenda behavior. Focus clearance now covers paper links and disclosure summaries. The static fallback removes the unused agenda column, and print flattens the new overview wrappers into the existing print composition.

Verification: all 24 programme tests, HTML validation, programme/clean-route checks and the 21-page site check passed. Browser checks at 390, 880, 1280 and 1600px found no horizontal overflow; actions retain at least 44px targets. At 1280px the four initial oral rows are 129px each, and expanding one does not stretch its neighbor. At 390px the author reading width is 324px. Search, empty recovery, save/remove and the mobile time picker were exercised; no console errors or warnings were reported. Final layout detection returned no findings. Evidence is under `.codex-artifacts/programme-layout-20261030/` and the surface brief is `.impeccable/surfaces/programme-html.md`.

## Paper assignments and timetable update — October 30, 2026

The user requested the calendar update from the Gmail conversation “paper accettati” and the latest [accepted-paper workbook](https://docs.google.com/spreadsheets/d/1eaf-WIvny0VXIeZrYAlUmVMcyHbpdbmIriB0rINRp08/edit). Marcello Restelli supplied oral/poster assignments on October 29 at 23:10 CET; Andrea Maurino added session titles and requested calendar population on October 30 at 09:31/09:36 CET. The `Sessioni`, `oral presentation`, and `poster` tabs were read on October 30. Only public titles, paper IDs and author/affiliation fields were used.

The new `data/programme-papers.json` records 16 oral themes covering all 52 oral papers and three poster themes covering all 114 poster papers, 38 in each group. IDs reconcile against the existing publication list in `data/accepted-papers.json`; proceedings-only papers have no presentation assignment. Programme entries reference the assigned `paperIds`, resolved by the builder into titles, authors and links to `/accepted-papers/#paper-ID`. Native disclosure controls keep the lists available without JavaScript. Programme search includes paper IDs, titles and authors; calendar descriptions include the papers of the selected sessions. Print shows the overview and any paper lists the visitor has expanded.

The [timetable workbook](https://docs.google.com/spreadsheets/d/1Of-L2sAzCzUeFET04vbvnbRgRBaNiTuk/edit), last modified `2026-10-29T21:28:34.285Z`, supplies Michael Barr’s November 16 **11:00–11:30, Main Hall** slot and the first four oral sessions at **11:40–13:00**. These exact 80-minute slots supersede the earlier email’s approximate 90-minute description. Barr’s former untimed announcement becomes a timed session using the same `keynote-michael-barr` anchor.

The timetable still repeats oral numbers 5–8 on Tuesday and ends at 12, while the authoritative assignment workbook defines 16 distinct groups. The calendar reconciles the groups in chronological block order: Monday 1–4 and 5–8; Tuesday 9–12 and 13–16. Within each block, the existing numbered room order is retained, including the final block’s Main Hall / Room 2 / Room 3 / Room 1 sequence. Existing oral IDs remain stable so saved agendas and inbound links continue to refer to the same events. This numbering reconciliation is inferred from the 16 supplied groups and the 16 existing timetable slots; no individual paper times are inferred.

The three numbered coffee-break poster entries receive the corresponding titles, lists and corrected counts. The separate unnumbered poster placeholders retain their supplied times/rooms and pending status; no additional paper assignments or room allocations were inferred. The third numbered poster session’s room remains to be confirmed. Previous organizer copy corrections, tutorial times, Women in AI timing and the confirmed 14:15 central-banking panel remain in effect.

The programme now contains 84 timed events (19/20/22/23 by day) and no untimed keynote announcements. Earlier pending notes below describe the previous version and are superseded where this update supplies confirmed detail.

Refresh the assignments from an Excel export kept outside the repository with `python3 scripts/import-programme-papers.py /path/to/accepted-papers.xlsx --updated YYYY-MM-DD`, then rebuild the programme, CSS and clean routes. The importer checks every oral/poster ID, title and author against the published list and rejects duplicate, missing or mismatched assignments before writing. It removes only Barr’s former announcement and preserves unrelated announcements. The general timetable importer also reapplies the reviewed assignments and timetable corrections when `data/programme-papers.json` exists. A changed slot layout requires explicit reconciliation; it is not silently remapped.

Validation on October 30: all 47 existing and new JavaScript tests passed, together with HTML validation and source/route checks for 21 canonical pages. Browser checks confirmed paper search, linked titles/authors, agenda selection and a downloaded `.ics` containing the four selected papers with correct CET conversion. The expanded list has no horizontal overflow at 390px or the default desktop viewport. Screenshots are kept under `.codex-artifacts/programme-20261030/`.

## Current organizer corrections — October 27, 2026

Marco authorized the website changes in Andrea Prampolini's and Edoardo Vittori's October 27 emails, subject “ICAIF '26: block of 100 registrations for the AI4F workshop (14 November)”. These corrections supersede the earlier provisional copy below. The requested pull first brought in the October 26 Capponi and central-banking panel updates; those additions are retained.

- November 15, 08:30: “Industry day: AI Governance & DXC spotlight”. The existing interval and room remain unchanged.
- November 15, 11:00: “Agostino Capponi Keynote & Perpetual Alpha Competition awards”, in the existing 11:00–13:00 Main Hall block. This is the combined block, not a claim that the keynote itself lasts two hours. Capponi's separate provisional announcement is removed, and his homepage date links to this scheduled block.
- The undefined November 15, 11:00–13:00 Room 3 placeholder is omitted until its content is defined, leaving three parallel sessions. There are now **83 timed sessions**, with daily counts **19/20/21/23**.
- November 15, 16:30: “QRT Startup Pitch Session”.
- November 16, 09:40: the full “From AI Scientific Discovery to Profitable Trading Strategies: What works, what transfers and what Falls Short?” title and all four supplied names/affiliations, with Georgios Papaioannou (QRT) as moderator. Both Monday panels show participants and moderator in separate paragraphs. The confirmed 14:15 central-banking panel and its participants are retained from the pulled version.
- November 17, 09:00: the generic “Fireside chat” title above Raffaele Savi (BlackRock Systematic), Mauro Micillo (Intesa Sanpaolo), and Stefano Pasquali (Domyn). A thematic title was not supplied.

The title corrections preserve existing session IDs so agenda selections and inbound links remain valid. The importer uses explicit identity-title aliases for these same events and applies the copy corrections and placeholder removal on refresh; future date/room/time changes still need schedule reconciliation. Details remain plain text in JSON, with newline-separated paragraphs rendered safely by the builder and retained in calendar descriptions.

Pending: thematic oral/poster session labels and paper-to-session assignments; Barr's duration/end time, room and replacement oral-session times for the requested Monday 11:00 move; an optional thematic title for the fireside chat; and content/format for the removed Sunday Room 3 session. Barr remains a separate untimed announcement until the full schedule can be reconciled. No oral-session times or presentation counts were inferred.

Verification: the full build passed 41 existing tests, JavaScript and HTML validation, and source/route checks for all 20 canonical pages. A temporary workbook with the legacy titles and removed placeholder was imported successfully: the five corrected events retained their IDs and copy, and the undefined Sunday slot stayed omitted. All remaining dates, times and rooms match the pulled programme. Browser checks at 1280px and 390px found no horizontal overflow on the edited surfaces; all twelve portraits and the LinqAlpha logo loaded. Evidence is under `.codex-artifacts/updates-20261027/`. These checks cover the source build and local preview; hosting deployment is a separate step.

## Programme usability update — October 27, 2026

The programme builder now labels the generic numbered oral sessions with “Session themes, papers and authors to be announced.” This describes the missing scientific detail; it does not change the supplied timetable, presentation counts, stable IDs or pending flags. Poster entries whose detail already says “to be confirmed” no longer repeat a second generic pending sentence.

The desktop timeline navigator is integrated as a sticky horizontal bar, recovering the former side gutter for session comparison. Four parallel sessions reflow to one, two or four columns according to available space. On mobile the dock appears only after the timeline is reached and provides direct day and My agenda controls; returning to the opening tools hides it. Day changes retain the other filters, while My agenda opens saved choices across all days. Confirming a mobile time jump focuses its time heading; dismissing returns focus to the opener. The intro and filter defaults use shorter interface copy without changing programme facts.


The preliminary programme is imported from the organizers' [Google Sheets workbook](https://docs.google.com/spreadsheets/d/1Of-L2sAzCzUeFET04vbvnbRgRBaNiTuk/edit?gid=1954323401#gid=1954323401). The source has four tabs, covering November 14–17, 2026. The initial export was read on October 8, 2026; the source modification timestamp was `2026-10-08T07:16:30Z`.

`data/programme.json` is the public source used by the programme page. Its timezone is `Europe/Rome`; November conference times are CET (UTC+1). Each source row with a valid date, start, and end becomes one session. Repeated workshop blocks and simultaneous room sessions remain separate entries. Session IDs combine the date/start with a hash of date, start, room, and public title, so row reordering does not associate saved-session references with a different event. Changes to a session's title, room, date, or start time give it a new ID.

## Refresh

Export the workbook as Excel (`.xlsx`) to a location outside the repository. The importer requires Python 3.9+ and `openpyxl`.

```sh
python3 scripts/import-programme.py /path/to/programme.xlsx --updated 2026-10-08
```

The default output is `data/programme.json`. Pass `--output /path/to/programme.json` to inspect an import without replacing the public file. The default update date is today in `Europe/Rome`. The importer reads the workbook without modifying it, checks every scheduled row, and fails before writing if a dated row has malformed times, an unknown session type, an unexpected conference date, or duplicate IDs. Refresh the bundled page's static fallback after changing the data, using the page build workflow.

Keep the raw workbook outside the repository. The public JSON excludes notes, totals, and organizational statistics. Workshop links are matched against titles and anchor IDs already present in `workshop.html`; an unmatched title is displayed without a detail link.

## Tutorial publication source

The tutorial content supplied by the user for publication on 8 October 2026 is stored separately in `data/tutorials.json`: four full English titles/abstracts, eleven presenter names and affiliations, and the supplied dates/times. Presentation-only wrapped author lines were joined; the Bayesian calibration abstract retains its two paragraphs. Dates and Room 3 assignments agree with the existing workbook-derived programme for all four tutorials. The JSON's `source` note describes this separate publication source; it supplies presenter metadata and reading copy, which are not attributed to the original Excel cells.

The accepted slots are Saturday 14 November 08:30–10:30, 11:00–13:00 and 14:00–16:00, then Sunday 15 November 08:30–10:30, all in Room 3 and all CET (UTC+1). The Tutorials builder requires exactly one programme tutorial matching each title, date, start, end and room. It preserves complete supplied copy, synchronizes that matched session's presenter `detail` and article `href`, and derives its return link from the stable session ID. Its `--check` mode rejects stale page copy or programme presenter metadata without writing.

On reimport, `scripts/import-programme.py` loads the same tutorial JSON. For a matching tutorial title, it compares date, start, end and room before adding presenter names to `detail` and the article anchor to `href`; a mismatch fails before output is written. The October 8 publication extension changes only eight session fields: four `detail` values and four `href` values. All 85 session IDs, dates, start/end times, rooms, public titles, types and pending flags remain exactly as previously imported. The source workbook is read-only and is never rewritten for this enrichment. Search can now find each of the eleven tutorial presenters through the corresponding programme detail.

For a presenter or abstract update, edit `data/tutorials.json` and run `npm run build`; no Excel reimport is needed. `build:tutorials` synchronizes the page and matching programme metadata before programme rendering, SEO, CSS and clean-route generation. Confirmed title/date/time/room changes still require reconciling the schedule source and publication data before building. Do not hand-edit generated main content in `tutorials.html` or `programme.html`. Presenter images, institutional links and material URLs were not supplied; none are inferred from names or abstract claims.

## Organizer correction — October 9, 2026

At the organizers’ request, the Sunday November 15 session at 14:00–16:00 in Main Hall is titled “ADIA Lab”. The importer maps the previous workbook title to this corrected public title so future imports retain the change. Its session ID is recomputed using the existing title-based identity rule.

## Organizer correction — October 21, 2026 (published October 23)

Andrea Maurino's email “programma confrenza”, sent October 21 at 17:06, supplies the full names and roles for the Monday November 16, 09:00 keynote and Tuesday November 17, 09:00 fireside chat. The keynote now names Daniele Magazzeni, with “Group Chief AI Officer at UBS” in its detail. The fireside chat names Raffaele Savi, Mauro Micillo and Stefano Pasquali, with their supplied BlackRock Systematic, Intesa Sanpaolo and Domyn roles in its detail. Spelling and capitalization are normalized for publication. The importer retains these corrections on future workbook imports; session IDs are recomputed using the existing title-based rule. The public update date is October 23. Dates, start/end times, rooms and session types retain their existing values. The email anticipates later changes to the central-bank panels but supplies no details, so those panels retain their existing copy.

## Source decisions and anomalies

The October 8 import contains **85 sessions**: 20 on Saturday, 21 on Sunday, 21 on Monday, and 23 on Tuesday. All start/end times and room assignments are preserved exactly, including Saturday registration ending at 17:00, Sunday's early registration slot, Tuesday lunch starting at 13:10, and Tuesday sessions ending at 17:40.

- Twelve poster rows have no title and a zero in the source's Subsessions column. They remain on the programme as “Poster session”, with title/presentation details pending. Zero is not interpreted as cancellation or as a public poster count.
- Sunday 11:00–13:00, Room 3 is TBD. It is shown as “Session to be confirmed” and marked pending.
- Tuesday 15:30–16:00 has no room or type. The title explicitly identifies a poster session, so it uses `poster-session`; its room is “To be confirmed” and it is marked pending.
- Tuesday 11:00–11:30 identifies a poster session in its title but has source type BREAK. Its public type is normalized to `poster-session` so poster filtering includes it. The title, time, room, and “40 posters” count are preserved.
- Tuesday 14:00–14:30 is titled “Keynote Pasquali” but has source type ORAL SESSION. Its public type is normalized to `keynote` to agree with that explicit title; the title, time, room, and stable session ID are preserved. These display corrections do not modify the workbook.
- Oral Session 5–8 labels appear on both Monday and Tuesday; the importer preserves both sets with distinct session IDs.
- Sunday's FINOS title includes a one-hour annotation, but its scheduled interval is 08:30–10:30. The public title is “FINOS demo & panel”; the importer preserves the scheduled two-hour interval.
- The Monday afternoon panel contains draft organizational details. Its public title is “Panel discussion”, with participants and moderator to be confirmed. Those draft details are not published.
- The Monday morning panel is presented as “Panel discussion: Intesa, Domyn, Bloomberg & CFM”, with “Moderator: QRT.” as its detail. The banquet is “Banquet dinner & awards”, with “Speech by Marc Mézard.” as its detail, using the spelling already published on the organizing committee page. Organizational annotations are removed from public titles.
- The workshop ordinal typo is corrected from “3nd” to “3rd”; the abbreviated security workshop title's trailing colon is removed. Other titles, including “QubeRT Startup Pitch Session”, are retained without adding names or claims.
- Positive Subsessions values appear publicly only as presentation/poster counts. Totals and other non-session rows are excluded.

The schedule remains preliminary. No missing speaker names, venues, talk titles, or durations are invented.

## Programme consistency update — October 24, 2026

The November 17, 14:00–14:30 Main Hall keynote now names Stefano Pasquali in full, with “Executive VP at Domyn” in its detail, matching the role supplied for the morning fireside chat. Its session ID is recomputed using the existing title-based rule, and the importer retains the correction on future imports. All 85 session dates, times, rooms and types are preserved. The data update date is October 24, aligned with the programme WebPage metadata and sitemap date.

The programme builder also shows the approved announcement of Michael Barr, Governor of the Federal Reserve, for Monday November 16. This is a page-header note, explicitly awaiting session time and room, not an invented timed session or calendar event. The targeted Gmail search for ICAIF/Barr on October 24 found the already-known brochure/website thread and no additional confirmed schedule. The existing afternoon panel is not assumed to be his slot. The Home brochure source remains recorded in `docs/speakers-source.md`.

## Women in AI and Finance schedule correction — October 24, 2026

Rachel Chung's reply to “ICAIF 2026 Workshops: Newsletter #4” on October 17 explicitly requests 16:30–18:00. Marco's reply assigns that interval, and Rachel confirms it on October 18. At the user's request, the Saturday November 14, 14:00–16:00 entry in Room 2 is removed, freeing the room for that interval. The existing 16:30–18:00 session and its stable ID are retained. The public programme now contains **84 sessions**, with daily counts **19/21/21/23**; every other session is unchanged. The workshop page's duration badge is updated to **1.5-hour event**.

The importer omits the obsolete 14:00–16:00 source row and requires exactly one Women in AI and Finance session at the confirmed November 14, 16:30–18:00 Room 2 interval before writing, so a refresh cannot silently restore the cancelled block or lose the confirmed session. The source workbook remains read-only.

## Organizer update — October 26, 2026

Claudio Tebaldi's October 25–26 emails confirm Agostino Capponi as a keynote on Sunday November 15 in the morning, and Michael Barr on Monday November 16. In the [Keynotes thread](https://mail.google.com/mail/u/?authuser=marco.cremaschi%40unimib.it#all/1a17400151e549fd), Andrea Prampolini proposes 11:00 for Capponi, subject to an agreement to move the DXC session before the coffee break. No final start, duration or room has been supplied. DXC and the competition awards retain their existing scheduled interval. Barr's start and room are also still unconfirmed.

`data/programme-announcements.json` holds these confirmed keynote announcements separately from the 84 timed sessions in `data/programme.json`. The programme builder merges both into the embedded public page data and places each announcement in its confirmed day. Announcements participate in day, type, room and text filtering, including speaker searches and direct links. They are not offered for My agenda or calendar export until a timed slot is confirmed. Capponi's affiliation comes from Claudio's [October 26 profile email](https://mail.google.com/mail/u/?authuser=marco.cremaschi%40unimib.it#all/1a17767776af4c7b). Barr's role retains the already-approved website copy. Future workbook imports preserve these announcements because the builder reads their separate publication source.

Claudio's [October 26 panel email](https://mail.google.com/mail/u/?authuser=marco.cremaschi%40unimib.it#all/1a177654405bdfde) confirms “AI, Systemic Risks and Central Banking”, Monday November 16 at **14:15** in Main Hall, Bocconi University. The former generic 14:00 panel is updated with Kartik Anand (Bundesbank), Celso Brunetti (Università di Roma Tor Vergata), Andrea Coletta (Bank of Italy) and Jonas Fisher (Federal Reserve Bank of Chicago), moderated by Elena Carletti (Università Bocconi, Dean for Research). The existing **15:00 end** is retained from the workbook; the email does not supply a new end time, and the following oral sessions are unchanged. The session ID is recomputed for its new start and title. The importer retains this correction for the known source row and rejects conflicting future date/time/room assignments for reconciliation.

The public update date is October 26, aligned with the Home and Programme metadata and sitemap.

# Programme data

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

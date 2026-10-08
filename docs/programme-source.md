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

## Source decisions and anomalies

The October 8 import contains **85 sessions**: 20 on Saturday, 21 on Sunday, 21 on Monday, and 23 on Tuesday. All start/end times and room assignments are preserved exactly, including Saturday registration ending at 17:00, Sunday's early registration slot, Tuesday lunch starting at 13:10, and Tuesday sessions ending at 17:40.

- Twelve poster rows have no title and a zero in the source's Subsessions column. They remain on the programme as “Poster session”, with title/presentation details pending. Zero is not interpreted as cancellation or as a public poster count.
- Sunday 11:00–13:00, Room 3 is TBD. It is shown as “Session to be confirmed” and marked pending.
- Tuesday 15:30–16:00 has no room or type. The title explicitly identifies a poster session, so it uses `poster-session`; its room is “To be confirmed” and it is marked pending.
- Tuesday 11:00–11:30 identifies a poster session in its title but has source type BREAK. Its type remains `break`. The source's positive poster count is retained as “40 posters”.
- Tuesday 14:00–14:30 is titled “Keynote Pasquali” but has source type ORAL SESSION. Its type remains `oral-session` until the organizers correct the workbook.
- Oral Session 5–8 labels appear on both Monday and Tuesday; the importer preserves both sets with distinct session IDs.
- Sunday's FINOS title includes a one-hour annotation, but its scheduled interval is 08:30–10:30. The public title is “FINOS demo & panel”; the importer preserves the scheduled two-hour interval.
- The Monday afternoon panel contains draft organizational details. Its public title is “Panel discussion”, with participants and moderator to be confirmed. Those draft details are not published.
- The Monday morning panel is presented as “Panel discussion: Intesa, Domyn, Bloomberg & CFM”, with “Moderator: QRT.” as its detail. The banquet is “Banquet dinner & awards”, with “Speech by Marc Mezard.” as its detail. Organizational annotations are removed from public titles.
- The workshop ordinal typo is corrected from “3nd” to “3rd”; the abbreviated security workshop title's trailing colon is removed. Other titles, including “QubeRT Startup Pitch Session”, are retained without adding names or claims.
- Positive Subsessions values appear publicly only as presentation/poster counts. Totals and other non-session rows are excluded.

The schedule remains preliminary. No missing speaker names, venues, talk titles, or durations are invented.

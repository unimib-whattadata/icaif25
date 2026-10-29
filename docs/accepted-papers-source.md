# Accepted papers publication source

The user requested publication from Andrea Maurino's emails “paper accettati” (29 October 2026, 09:10 CET) and “piccola variazione dei paper” (09:57 CET). The later attachment, `accepted papers and registered.xlsx`, is authoritative for the publication list.

The public page `/accepted-papers/` separates **52 oral presentations**, **114 poster presentations** and **49 proceedings-only papers**, for **215 unique papers**. Paper **136**, “FAAB: A Benchmark for Fault Detection and Responsibility Attribution in Financial Multi-Agent Workflows”, belongs to the poster group following the second email. The page includes the requested statement that authors will add a link to their presentation on Whova. No Whova destination was supplied, so none is invented.

`scripts/import-accepted-papers.py` reads the three categorized tabs (`oral presentation`, `poster`, `proccedings`), reconciles the complete ID set against `all accepted`, sorts papers by numeric ID within each group, and exports only paper IDs, titles and authors/affiliations to `data/accepted-papers.json`. It normalizes whitespace and removes the source's corresponding-author asterisk. Author order, names, affiliations and title wording are preserved. Organizer availability notes, contacts, reviews, registration details and the original workbook are not public assets. The workbook's summary tab is not used as a publication source.

Run `scripts/import-accepted-papers.py PATH --updated YYYY-MM-DD` with Python and openpyxl after reviewing a replacement workbook, then `npm run build`. `scripts/build-accepted-papers.js` renders the complete static list and supports `--check`. Search is a progressive enhancement; all papers are readable without JavaScript. Stable `#paper-ID` links identify individual papers.

The first email's oral-session scheduling discussion is addressed to Marcello. It does not supply a revised timetable or paper-to-session assignments, so the list adds no dates or slots and does not change the preliminary programme.

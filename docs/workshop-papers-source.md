# Workshop paper publication

## IAFM’26 and AI in Private Markets — November 15, 2026

The user authorizes the two remaining workshop updates identified in the Gmail review. [Alan Perotti's November 15 programme](https://mail.google.com/mail/u/?authuser=marco.cremaschi%40unimib.it#all/1a1dc9086a336cee) confirms **eight IAFM’26 oral presentations**, with **1159 and 1260 remote** and all others in person; there are no posters or closing panel. Add the complete supplied titles and author lists for **1270** and **1283**, without inventing affiliations. Normalize the email's misdecoded euro sign to **€** in 1283's title. Mark all eight papers oral. The parenthesized name lists identify authors, not a singled-out presenter, so no presenting-author annotations are inferred.

[Jasmine Lyu's November 15 final programme](https://mail.google.com/mail/u/?authuser=marco.cremaschi%40unimib.it#all/1a1deafb1c624310), attachment `Structuring the Unstructured_ AI in Private Markets 1 (1).xlsx`, supersedes the earlier November 13/14 agendas. Update the existing catalogue presenter fields for **1192 (Zihong Liu), 1235 (Yang Wang), 1296 (Durjoy Dey) and 1346 (Kelvin Koa)**, matching their existing author names and preserving all author order and affiliations.

The final Private Markets agenda schedules **1346, 1235 and 1296** as oral papers and **1192, 1331 and 1333** as posters. It omits the former scheduled items 1177, 1244, 1246 and 1286; the workshop timetable follows that replacement. Omission does not explicitly withdraw an accepted contribution, so existing catalogue entries **1244 and 1246** are retained. Papers **1331 and 1333** retain their supplied titles and presenter Dhagash Mehta in the detailed agenda; their full author lists are still unavailable, so complete catalogue entries are not invented. The earlier missing metadata for Private Markets 1177 and 1286 is no longer needed for the current timetable.

Current catalogue totals: **113 papers, 60 posters, 49 oral presentations and 4 unspecified**, with **85 presenting author names** underlined. Publish only participant-facing titles, names, presentation modes and timings. Contact addresses, telephone numbers, connection requests and operational attachments remain private. The detailed agendas and conference-block timing are recorded in `docs/programme-source.md`. The publication update date and affected metadata are **November 15, 2026**.

## November 13 corrections

The November 13 organiser corrections supersede the historical snapshot below: **111 papers**, including **60 posters**, **41 oral presentations**, **10 unspecified**, with **81 presenting authors** underlined. See [the Gmail review](email-review-2026-11-13.md) for confirmed withdrawals, formats, presenters, source links and remaining metadata discrepancies.

The November 2, 2026 user request selects workshop contributions from the shared
`WORKSHOP accepted_papers` workbook. Include a paper when its contribution-level
status starts with `PAID`, or records a confirmed complimentary pass. The user
explicitly confirmed all accreditations on November 2. A registration alone or
`PAYMENT PENDING` alone is insufficient. Keynote talks and withdrawn contributions
are not workshop papers.

The resulting public snapshot contains 120 papers in nine workshops. The original
author/title wording is retained, with whitespace and corresponding-author stars
normalized as on Accepted Papers. The 18 Financial AI Security papers have no
submission IDs in the source: do not invent IDs. Their title-derived links are
stable, and numeric IDs are scoped to their workshop to avoid collisions.

`data/workshop-papers.json` contains only workshop labels and public paper fields:
ID (nullable), title, authors/affiliations, explicitly named presenting authors,
and presentation type (`oral`, `poster`, or null when not specified).
No registration records, payment evidence, source notes, email addresses, or
contact fields are exported. The selection snapshot stays outside the repository.

Presenting authors come from the workbook's `Presenting author` column. Underline
their existing names in the author string; do not underline affiliations, replace
the supplied author spelling, or infer a presenter from the corresponding-author
star. Match unique name variants across punctuation, accents, reversed name order,
or an additional family name. Multiple explicitly named presenters are supported.
Leave `TBD`, `to be confirmed` and unspecified presenters unmarked. The current
snapshot identifies presenters for 65 papers, with 68 individual names underlined.

Poster labels were added on November 2, 2026, using the `Presentation type`
column of the same [shared workbook](https://docs.google.com/spreadsheets/d/1eTh1aHoY_xNFNki4K86dOZlnvvPagLgj4oa0yd6xHIE/edit).
Match the existing public entries by workshop and paper ID, or by title for
Financial AI Security entries without IDs. The 120 published entries contain
69 posters, 31 oral presentations and 20 with no specified presentation type.
The poster counts are MFMB 5, LLMs & Generative AI 40, AI in Private Markets 2,
Financial AI Security 18, and Market Microstructure 4. Show a `Poster` badge only
for an explicit poster classification; unspecified formats remain unlabelled.
The existing text search also matches the visible poster labels. This change
does not alter the paper selection, author text, presenter annotations or anchors.

Run `npm run build` after updating the public snapshot. The workshop catalogue
shares the existing Accepted Papers layout and search runtime, with a native
workshop selector and full static lists as the no-JavaScript fallback. Programme
navigation and footer links expose `/workshop-papers/` on every canonical page.
This change is prepared and previewed locally; no production deployment was requested.

On November 12, 2026, the user requested an author correction for Market
Microstructure paper 1266. Its public author list now contains only Yichong Bai
(PolyU HK); the paper and its stable link remain in the catalogue.

# Workshop paper publication

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

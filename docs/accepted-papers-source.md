# Accepted papers publication source

## Poster removal — November 1, 2026

Andrea Maurino's email “paper da rimuovere dalla lista”, sent November 1 at 09:42 CET, requests removing paper 742, “ThemeFlow: From News Headlines to Investable Theme Signals with Contrastive Narrative Geometry”, from the poster list. The user explicitly authorized removal from the public poster list and programme. Paper 742 is removed from the poster publication group and its Poster Session 2 assignment; it is not reassigned to proceedings only. The public list now contains 214 papers: 52 oral, 113 poster and 49 proceedings-only. This instruction supersedes the older workbook entry and does not establish a change to ACM publication status. Preserve this removal when reconciling future workbook imports.

## Author correction — November 1, 2026

Andrea Maurino's November 1 email asks to verify the authors of paper 428, “FairCreditLens: Consumption-Aware Fair Credit Risk Modeling for Default Prediction”, following corresponding author Yanting Zhang's October 31 request. The complete supplied author order is Lei Zhu, Shuaishuai Gong and Yanting Zhang. The existing University of Macau affiliation for Lei Zhu is retained; Yanting Zhang identifies their institution as Hong Kong University of Science and Technology. No affiliation was supplied for Shuaishuai Gong, so none is inferred. The corrected public author string is shared by the accepted-paper list and programme. This correction supersedes the incomplete workbook author field and does not establish TAPS or DOI publication status.

The user requested publication from Andrea Maurino's emails “paper accettati” (29 October 2026, 09:10 CET) and “piccola variazione dei paper” (09:57 CET). The later attachment, `accepted papers and registered.xlsx`, is authoritative for the publication list.

The initial public page `/accepted-papers/` separated **52 oral presentations**, **114 poster presentations** and **49 proceedings-only papers**, for **215 unique papers**, before the November 1 removal above. Paper **136**, “FAAB: A Benchmark for Fault Detection and Responsibility Attribution in Financial Multi-Agent Workflows”, belongs to the poster group following the second email. The initial page included the requested Whova presentation-link note. The user subsequently requested removal of that supporting block, including its visible update line.

`scripts/import-accepted-papers.py` reads the three categorized tabs (`oral presentation`, `poster`, `proccedings`), reconciles the complete ID set against `all accepted`, sorts papers by numeric ID within each group, and exports only paper IDs, titles and authors/affiliations to `data/accepted-papers.json`. It normalizes whitespace and removes the source's corresponding-author asterisk. Author order, names, affiliations and title wording are preserved. Organizer availability notes, contacts, reviews, registration details and the original workbook are not public assets. The workbook's summary tab is not used as a publication source.

Run `scripts/import-accepted-papers.py PATH --updated YYYY-MM-DD` with Python and openpyxl after reviewing a replacement workbook, then `npm run build`. `scripts/build-accepted-papers.js` renders the complete static list and supports `--check`. Search is a progressive enhancement; all papers are readable without JavaScript. Stable `#paper-ID` links identify individual papers.

The first email's oral-session scheduling discussion is addressed to Marcello. It does not supply a revised timetable or paper-to-session assignments, so the list adds no dates or slots and does not change the preliminary programme.

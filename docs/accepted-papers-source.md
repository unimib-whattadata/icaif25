# Accepted papers publication source

## Email decisions and shared Google Sheet — November 2, 2026

The user corrected the source policy: **decisions discussed in email take precedence over the spreadsheet**. The editable [shared Google Sheet](https://docs.google.com/spreadsheets/d/15Tzag9s0ami_aYx9tWdSVojb7uQPa13c61Il2yiXJqE/edit) has been updated in place for the already-processed requests. Its request-date, message-link, change and sent-confirmation columns and change register remain private to Drive. Existing colors were preserved; only empty rows and columns were trimmed.

This supersedes the file-first reconciliation below. Paper **961** is proceedings-only, per Junyi Ye's explicit November 2 follow-up. Paper **428** lists **Lei Zhu, Shuaishuai Gong and Yanting Zhang**. Paper **1067** uses **Junyu Chen, Franklin Liu, Moshu Xu and Lijian Yang**, and remains in Oral Session 1. The public catalogue still contains **211 papers: 51 oral, 106 poster and 54 proceedings-only**. Other reviewed moves and removals are retained. Preserve these email decisions in future imports rather than restoring stale workbook fields.

## Shared workbook reconciliation — November 2, 2026

The user authorized applying the newly reviewed organizer changes and committing/pushing the website, then explicitly instructed that **the file takes precedence over the emails**. The authoritative shared workbook is [accepted papers and registered (ultimo).xlsx](https://docs.google.com/spreadsheets/d/1VS05PAAh1aVzbSpaNu29cMvcmaI-eCCK/edit), last modified November 2 at 11:58:26.900 UTC and read through Google Drive. Its categorized public tabs are now authoritative for the complete paper set, publication category, title, author string and presentation-session assignment. The public catalogue contains **211 papers: 51 oral, 107 poster and 53 proceedings-only**. Papers 244, 607 and 1007 no longer appear; 820 belongs to proceedings only, 405 is oral, and 523 and 961 are posters. This source policy supersedes the earlier email overrides documented below. Removing public entries does not establish a separate ACM publication decision.

The title and authors in the shared file resolve the Benhamou email's “73” reference to public paper ID **523**, “Can We Stop the Backtest Yet? Anytime-Valid Promotion Tests for Adaptive Financial Research Agents”. Author strings follow the file as instructed: paper 428 lists Lei Zhu, and paper 1067 lists Moshu Xu, Junyu Chen, Lijian Yang and Franklin Liu, with the supplied affiliations. Whitespace and corresponding-author markers are normalized by the existing publication convention; no authors or affiliations are inferred. Paper 742 remains absent from the source. The private workbook and its review, payment and contact fields are not stored in the website repository.

## Proceedings-only and author corrections — November 2, 2026

The user authorized website changes 1–5 from the reviewed Gmail requests. Andrea Maurino's November 2 messages move paper 397 from oral presentation and papers 669, 672 and 685 from poster presentation to proceedings only. Junyi Ye's follow-up explicitly includes paper 961, consistent with the four-paper proceedings-only agreement quoted in that conversation. All five remain in the accepted-paper catalogue, without presentation assignments. The 214-paper total is unchanged: **51 oral, 109 poster and 54 proceedings-only**.

Moshu Xu's reply, forwarded by Andrea on November 2, supplies the correct author order for paper 1067, “Probabilistic Limit Order Book Forecasting with Conditional Diffusion Models”: Junyu Chen, Franklin Liu, Moshu Xu, Lijian Yang. Existing individual affiliations are retained with their respective authors. This order is shared by Accepted Papers and the programme. The authors declined the proposed move to Session 15, so paper 1067 remains in Oral Session 1.

These corrections supersede the older workbook fields. Preserve them, the November 1 paper 428 author correction and the paper 742 removal when reconciling future imports. The ambiguous October 29 request referring to paper 513 is not applied.

## Poster removal — November 1, 2026

Andrea Maurino's email “paper da rimuovere dalla lista”, sent November 1 at 09:42 CET, requests removing paper 742, “ThemeFlow: From News Headlines to Investable Theme Signals with Contrastive Narrative Geometry”, from the poster list. The user explicitly authorized removal from the public poster list and programme. Paper 742 is removed from the poster publication group and its Poster Session 2 assignment; it is not reassigned to proceedings only. The public list now contains 214 papers: 52 oral, 113 poster and 49 proceedings-only. This instruction supersedes the older workbook entry and does not establish a change to ACM publication status. Preserve this removal when reconciling future workbook imports.

## Author correction — November 1, 2026

Andrea Maurino's November 1 email asks to verify the authors of paper 428, “FairCreditLens: Consumption-Aware Fair Credit Risk Modeling for Default Prediction”, following corresponding author Yanting Zhang's October 31 request. The complete supplied author order is Lei Zhu, Shuaishuai Gong and Yanting Zhang. The existing University of Macau affiliation for Lei Zhu is retained; Yanting Zhang identifies their institution as Hong Kong University of Science and Technology. No affiliation was supplied for Shuaishuai Gong, so none is inferred. The corrected public author string is shared by the accepted-paper list and programme. This correction supersedes the incomplete workbook author field and does not establish TAPS or DOI publication status.

The user requested publication from Andrea Maurino's emails “paper accettati” (29 October 2026, 09:10 CET) and “piccola variazione dei paper” (09:57 CET). The later attachment, `accepted papers and registered.xlsx`, is authoritative for the publication list.

The initial public page `/accepted-papers/` separated **52 oral presentations**, **114 poster presentations** and **49 proceedings-only papers**, for **215 unique papers**, before the November 1 removal above. Paper **136**, “FAAB: A Benchmark for Fault Detection and Responsibility Attribution in Financial Multi-Agent Workflows”, belongs to the poster group following the second email. The initial page included the requested Whova presentation-link note. The user subsequently requested removal of that supporting block, including its visible update line.

`scripts/import-accepted-papers.py` reads the three categorized tabs (`oral presentation`, `poster`, `proccedings`), reconciles the complete ID set against `all accepted`, sorts papers by numeric ID within each group, and exports only paper IDs, titles and authors/affiliations to `data/accepted-papers.json`. It normalizes whitespace and removes the source's corresponding-author asterisk. Author order, names, affiliations and title wording are preserved. Organizer availability notes, contacts, reviews, registration details and the original workbook are not public assets. The workbook's summary tab is not used as a publication source.

Run `scripts/import-accepted-papers.py PATH --updated YYYY-MM-DD` with Python and openpyxl after reviewing a replacement workbook, then `npm run build`. `scripts/build-accepted-papers.js` renders the complete static list and supports `--check`. Search is a progressive enhancement; all papers are readable without JavaScript. Stable `#paper-ID` links identify individual papers.

The first email's oral-session scheduling discussion is addressed to Marcello. It does not supply a revised timetable or paper-to-session assignments, so the list adds no dates or slots and does not change the preliminary programme.

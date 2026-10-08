# ICAIF interface conventions

The site uses the existing `icaif` daisyUI theme in `css/tailwind.input.css`: navy navigation and page headers, white/slate content surfaces, copper for the primary action, Inter for interface text and Merriweather for the home introduction. Use semantic theme colors and native daisyUI components.

## Shared styles

| Class | Use |
| --- | --- |
| `site-nav` | Primary navigation on every page; light dropdowns explicitly use `text-base-content`. |
| `site-container` | Content width of 80rem, centered, with 16/24/32px responsive gutters. |
| `section-space` | Main content section padding: 40px on mobile, 56px from 640px, 64px from 1024px. |
| `page-header-content` | Internal page header layout, used with `hero-content`. |
| `page-title` | Internal H1: 30/36/48px, tight leading, balanced wrapping. |
| `page-lead` | Header introduction: 16/18/20px, relaxed leading. |
| `section-title` | Main H2: 24/30/36px. Use `mb-4 sm:mb-6` before adjacent content. |
| `subsection-title` | Secondary headings: 20/24px. Card titles retain the native `card-title` role. |
| `document-sections` | Long reading pages: 40/56px between sections. |

The home hero keeps its larger display typography. Its university, statistics and sponsor bands stay compact; their order is universities, dates/statistics, sponsors. These are intentional exceptions to `section-space`.

The home hero action is “Explore the program” and links to `/programme/`. The yellow workshop-paper deadline alert has been removed; the next-milestone summary/stat and AoE deadline behavior remain.

Align reading columns with the page heading and limit their width with `max-w-3xl`. Keep tables, programme lists, sponsor tiers and committee portraits in their appropriate layouts. Do not force different content types into identical cards. Sponsor logos retain their colors and intrinsic proportions, with visible Platinum/Silver grouping.

## Interaction

Use `btn` for actions and `link` for text links. A page's priority action uses `data-priority-action` and `btn btn-accent btn-lg`. Buttons wrap long labels and have at least 44px height. Navigation, section-index controls, mobile footer links and hotel popup controls follow the same height convention. Keep visible keyboard focus and offset link underlines.

The main-content skip link targets `main#main-content` with `tabindex="-1"`. Accessible names retain visible wording, adding context to repeated downloads, save/remove actions and hotel links. Symbolic zoom buttons use “Zoom in” and “Zoom out”. Keep `[hidden]` authoritative so hidden panels cannot remain displayed or reachable.

`js/site-layout.js` shares navigation, section indexes, programme disclosures, sponsor disclosures and responsive fee tables. Section indexes use `data-index-label` when a full heading would be too long; the heading and target remain intact. Tutorials indexes Accepted Tutorials and its four labeled H3 card titles, with a page-scoped 44px minimum for mobile topic links. The shared workshop/competition card enhancement also covers Tutorials: below 768px, a native button toggles content after the H3 while preserving its title and preceding metadata. Navigation closes with Escape or an outside click; Escape returns focus to the matching summary, including nested mobile disclosures. Footer disclosures and programme details use the same 768px breakpoint as their CSS. Footer sections are open on desktop and individually expandable on mobile.

Update dots and priority-action accents remain static. Reduced motion disables smooth scrolling and disclosure rotation while preserving useful color/opacity feedback. Venue camera/route motion uses a static presentation under reduced motion, with a pause control for ordinary motion. On map redraw, zoom and popup closure, focus stays on a visible hotel marker or returns to a visible map control. Failed map data reveals the static map and directions; failed route data leaves the map usable and announces the route limitation.

## Tables and factual content

Retain row/column relationships when reading tables stack below 768px. Enhancement supplies explicit table roles; meaningful first cells use row headers. Registration fees use three `tbody` row groups for Early Bird, Standard and Late / Onsite. Traverse every body when generating the nine mobile fee cards, and preserve all 45 amounts. Without JavaScript, the source table remains visible.

Keep expired and superseded dates legible. Use strike-through and a status cue rather than reduced opacity. Closed calls retain their requirements with a clear closed status and supporting portal link. When changing dates or policy, reconcile the home fallback, runtime milestones, important dates, relevant calls and registration copy against the same confirmed source. Main conference author registration and Workshop Days registration for workshop papers are distinct policies; do not broaden one to cover the other.

## Validation

Run `npm run build` after source changes. It runs `build:tutorials` before `build:programme`, then rebuilds SEO metadata, shared CSS and clean-URL copies, and runs JavaScript tests/syntax, HTML validation and site checks. The current site has 18 canonical pages and 35 physical HTML files. The agenda/home clarification passed 31 tests after removal of the obsolete banner-expiry test; the Tutorials extension's earlier 32-test result remains historical evidence. Keep CSS/JS cache versions aligned across all HTML files. Check desktop and mobile, plus the 768px disclosure and 1024px navigation boundaries when changing shared navigation. Dense tables, programme, venue, tutorial titles and download labels also need a 320px spot check.

Use one batched desktop/mobile inspection and one confirmation round for an audit; confirm additional changes with targeted evidence. The static Impeccable detector can misread inherited colors, image overlays, responsive padding and padding on child containers. Verify findings against computed styles and visible states, and document genuine corrections separately from false positives. Existing broad detector ignores limit detector coverage; a quiet detector is not a contrast verdict. The incumbent fonts, official workshop titles, factual copy, sponsor brands and functional table labels are intentional; do not rewrite them solely to silence a heuristic.

The October 8 audit and its limits are recorded in [site-audit.md](site-audit.md). These checks support maintenance; they do not establish full WCAG conformance or guarantee search presentation.

## Search metadata

Root HTML files supply the page shells; programme and Tutorials main content is generated by their builders. `scripts/build-seo.js` aligns each page's search/social metadata, shared structured-data graph and canonical sitemap; `scripts/build-clean-urls.js` produces the clean-URL copies. Keep titles and descriptions unique across the 18 canonical pages. Canonical, Open Graph URL, WebPage URL and sitemap URL must agree; `.html` aliases and programme query variants use the canonical route.

Use the same factual Event identity across pages, including known conference dates, mixed attendance and the Bocconi street address. Internal pages use Home/current-page breadcrumbs; home has no one-item breadcrumb. JSON-LD uses decoded text, stable IDs and resolved references. Preserve photography provenance and do not invent virtual delivery URLs, pending programme facts or expired submission claims.

The builder's stored update date is October 8, 2026. For a later significant content update, pass its actual date with `node scripts/build-seo.js --updated YYYY-MM-DD` and keep that date in the builder for subsequent builds. Merely rebuilding assets does not justify a fresh `dateModified` or sitemap `lastmod`.

## Programme

`programme.html` extends the shared identity with four daily ordered timelines, 40 date/time groups, a connected rail and flat adjacent session cells. Date buttons and My agenda use navy for selection; selected agenda buttons and the current timeline point/heading use copper. Use the existing room/type labels and explicit pending details. Search, day/type/location filters, saved-session overlap markers, stable session anchors, calendar export and print supplement the complete static schedule. Saved choices stay in the visitor's browser, or in memory for the current visit when storage is unavailable.

Agenda buttons use the full available action width and a 44px minimum. The blue outline/calendar state says “Add to My agenda”; copper/check selection says “Remove from agenda”. Update `aria-pressed`, icon, title and visible/contextual accessible wording from the same membership; accessible names retain the action prefix and full title/day/time/room. Switch state colors immediately. Use the same vocabulary in storage instructions, empty states and announcements. Removing a session in My agenda returns focus to the visible agenda control. Preserve the existing storage key/schema and stable session IDs. The repeated visible “Session link” was removed, while article IDs, tutorial return anchors and calendar URLs remain.

Programme type badges use local fixed text/fill/border roles in `css/programme.css`, recorded as `programme-type-*` in `DESIGN.md`. Workshop is blue, Tutorial teal, Competition purple, Industry orange, Keynote amber, Panel magenta, Oral session green, Poster session indigo and Social event/Banquet rose. Registration/Opening/Closing share neutral slate, Break uses lighter slate and To be confirmed has a dashed neutral border. All 15 written labels remain visible and non-interactive; colors supplement them. Preserve the global semantic theme and do not reuse category colors as global status/action colors.

Keep native input/select controls, visible labels and 16px field text below 640px. Maintain readable placeholder contrast and leave space for native select chevrons when checking labels at narrow widths. Programme cells stack below 640px; the selected day, action row and parallel time groups retain their local responsive rules in `css/programme.css`.

The persistent bottom-right timeline navigator uses a named native day select and range, with 44px controls. Its range moves within a day; previous/next moves across all visible stops. Filters and My agenda determine its stops and day options. Jumps preserve filters, URL state and widget focus; manual scrolling updates the current stop. Batch scroll synchronization with `requestAnimationFrame`, hold intentional jumps for up to 900ms and use immediate scrolling under reduced motion. Empty results show disabled controls, `0 / 0` and the filter helper. The widget stays hidden without JavaScript and in print; the static 85-session schedule remains readable.

Keep the desktop navigator 240px wide at every desktop height. Reserve its right gutter in the content, datebar and filter containers from 1024–1799px; wider layouts place it outside the centered container. Compact layout begins below 640px, with a 9.25rem minimum time column for 320px. Preserve the footer clearance and reset body padding in print. Check short desktop heights when changing fixed controls.

`data/programme.json` is the public schedule source. Follow `docs/programme-source.md` to import an updated external workbook with `scripts/import-programme.py`, then run `npm run build`. Generated `programme.html` content belongs in `scripts/build-programme.js`; preserve pending fields, stable IDs and source times rather than filling gaps. Keep the visible preliminary status in search/social descriptions. The root `DESIGN.md` records the sampled incumbent system; detailed programme decisions live in `.impeccable/surfaces/programme-html.md`.

## Tutorials

`/tutorials/` is the reading page for the four accepted tutorials on 14–15 November 2026. Shared header/footer navigation includes Tutorials across all 18 canonical pages and their generated copies. The archived call retains its requirements and closed status, linking both to the detailed Tutorials page and separately to the tutorial-filtered preliminary programme.

`data/tutorials.json` owns the titles, presenter names/affiliations, complete English abstracts and slots supplied by the user for publication. Keep supplied text verbatim; join presentation-only line wraps without rewriting copy, and retain the Bayesian calibration abstract's two paragraphs. Rooms were checked against the programme. No presenter portraits, institutional destinations or material URLs were supplied, so the page adds none.

Edit `data/tutorials.json` for publication copy, then run `npm run build`; presenter updates do not require an Excel reimport. `scripts/build-tutorials.js` generates the main markup, requires one tutorial session matching each title, date, start, end and room in `data/programme.json`, and synchronizes that session's presenter `detail` and article `href` before programme rendering. It derives each precise programme return link from the unchanged stable session ID. Its `--check` mode rejects page or programme presenter-metadata drift without writing. On an actual workbook refresh, the importer reapplies details and tutorial anchors from the same JSON for matching titles and rejects changed slot/room values. Reconcile confirmed schedule changes before building; never adjust the raw workbook to fit page copy. Presenter names in the programme detail make all eleven presenters searchable.

The user requested the same style as Workshops, superseding the original dated-section layout. Keep the navy hero and existing lead, shared index, one pale-slate Accepted Tutorials section with a `max-w-3xl` introduction, date/room/CET summary and all-tutorials programme link. Four white native cards retain the workshop's 16px radius and `card-body`/`card-title` styling. Visible date/time/room badges precede the H3. Abstracts use a 72ch maximum; from 1024px they sit beside a 22rem pale-slate Presenters card, stacked below that width. Names and affiliations use the same `list-row`, semibold name and smaller supporting text as workshop organizers. Each card retains its precise “View in programme” action. CET text and `+01:00` machine-readable endpoints remain intact.

Below 768px, reuse the workshop's shared native button disclosure and mobile card CSS. Collapse only the abstract/presenters/action; keep the full title and date/time/room visible. Contextual “Show details”/“Hide details” names, `aria-expanded` and `aria-controls` update with the state, and targets remain at least 44px. Every paragraph remains in static HTML, so all content is visible without JavaScript. Do not add a bespoke tutorial runtime, new tokens or author assets for this pattern. Detailed surface choices, source provenance and bounded evidence are recorded in `.impeccable/surfaces/tutorials-html.md` and `docs/site-audit.md`.

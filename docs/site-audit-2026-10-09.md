# ICAIF 2026 site verification

Verified on **9 October 2026**, Europe/Rome, against the current local working copy. All **18 canonical pages** passed the technical and responsive checks. The daisyUI implementation is consistent with the established ICAIF theme and component conventions. The dependency installation and generated CSS were reconciled with the lockfile, and all stylesheet references were refreshed to prevent the browser using an older build.

The current website pages are the authoritative publication copy. **PDF contents are excluded**, as instructed by the user; their dates are not reported as website errors.

## Assessment

Implementation integrity passes at the checked scope: native daisyUI controls, semantic colors, shared page structure and progressive enhancement form a coherent conference interface. There are no blocking runtime or layout findings. The remaining items concern build dependencies, map payload and publication metadata.

| Dimension | Score | Evidence or remaining limit |
| --- | --- | --- |
| Accessibility | 3/4 | Labels, references, keyboard and focus checks pass; no screen-reader certification |
| Performance | 3/4 | Local fonts and optimized images; the map dataset is approximately 1.5 MB |
| Responsive design | 3/4 | Six widths, short landscape view and expanded content pass; physical devices and browser zoom are outside the checks |
| Theming | 4/4 | Complete ICAIF semantic theme; deliberate chart/category and print colors |
| Implementation integrity | 3/4 | Components and generated files agree; dependency and metadata follow-up remains |
| **Total** | **16/20** | **Good at this bounded scope** |

Remaining findings: **0 P0, 0 P1, 2 P2, 1 P3**. The numeric score is a review rubric, not a WCAG or performance certification.

## Coverage

All 18 pages were checked at **320×740, 390×844, 768×1024, 1024×900, 1440×1000 and 2061×1221**: **108 route/viewport combinations** after the CSS cache correction. Home, Programme, Registration, Venue and Tutorials also passed **740×390** landscape checks. The programme time picker stays inside that short viewport.

| Pages | Content checked |
| --- | --- |
| Home, Important Dates | Conference dates, milestone, expired calls, universities, sponsor groups and navigation |
| Organization | Committee hierarchy, names/affiliations as published, portraits and section index |
| Registration, QRT Student Travel Awards | Periods, author policy, 45 fee values, entitlements, application criteria and links |
| Programme, Workshops, Tutorials, Competitions | Sessions, links, presenter search, abstracts, dates, filtering and disclosures |
| Four proposal/paper calls | Closed status, retained requirements, dates, contact blocks and portal links |
| Sponsors and Supporters, Become a Sponsor | Brand names, tier hierarchy, published benefits, amounts and contacts |
| Media Kit, Privacy Policy | Download labels, attribution, local assets, external services and agenda storage |

The final matrix found **zero document-level horizontal overflows, broken visible images, duplicate IDs, dangling ARIA references, unlabelled visible fields or JavaScript console errors**. All 33 referenced raster assets decoded successfully. Lazy-loaded images were distinguished from broken images; the home campus image was confirmed after entering its viewport.

## daisyUI verification

The installed version is **daisyUI 5.7.22**, matching `package-lock.json`; Tailwind and its CLI are **4.3.3**. The custom `icaif` theme supplies the required semantic colors, sizing, radii, border and depth variables. The compiled stylesheet includes the components used by the site and excludes unused modules.

Reviewed structures include Navbar/Menu/Dropdown, Hero, Button/Link, Badge, Card/List, Stat, Steps, Table, Input/Select/Range, Timeline, Footer and native-dialog Modal. Component parts and modifiers match the local daisyUI guides. The programme uses Timeline and filters for an agenda rather than a date-picker component. Specialized map geometry, programme layout and print styles extend native components where the library alone does not supply the required behavior.

Dates, status and session types remain textual; color is supplementary. Category colors and map-route colors are intentional domain roles. The fixed light ICAIF theme is deliberate; dark-mode switching is not a promised feature.

A raw detector scan produced **224 advisories**: 51 contrast inferences, 127 padding reports, 18 Inter reports, 18 native-select gradient reports, two copy reports, two uppercase-label reports, five category-palette reports and one border/shadow report. These are not 224 verified defects. Rendered checks and source roles distinguish compact controls from page padding, established fonts/copy from generic detector preferences, native arrows from decorative gradients, and user-requested category colors from theme drift.

The HTML text contrast sampler covered **2,595 text-bearing elements**. Its remaining low-contrast flag belongs to the disabled map zoom-out control, which is excluded from the active-control contrast requirement. Image overlays, SVG backgrounds and placeholder opacity require separate interpretation; the detector and sampler are not substitutes for a complete accessibility assessment. Closed-menu rectangles and small map symbols were not treated as active touch targets; hotel markers have an explicit 44 px hit circle.

## Information and source consistency

The organizer workbook retains its **8 October 2026** modification timestamp. Comparing its dated rows through the existing, reviewed public-title normalization produced **85 matching published sessions**, with no missing or extra date/start/end/room/title tuples. Daily counts remain **20, 21, 21 and 23**. The authorized **ADIA Lab** correction is included. The workbook was read only; organizational notes and totals are not published in this report.

Four tutorials retain the supplied abstracts, eleven presenters, matching Room 3 assignments and precise programme links. The **15 pending sessions** remain explicitly provisional rather than receiving invented details. Repeated oral-session labels remain separate dated events, as supplied.

The main workshop deadlines agree across the current pages: submission **12 October**, notification **16 October**, author registration **18 October**, early registration **25 October**. Conference days remain **14–17 November**, with workshops/tutorials on 14–15 and the main conference on 16–17. Conference times use CET, while competition-specific deadlines preserve the stated US Eastern Time.

Published competition periods agree with the [Perpetual Alpha schedule](https://perpetual-alpha26.github.io/schedule) and the [Trading Agent organizer starter kit](https://github.com/DeepIntoStreams/2026ICAIF_Trading_Agent_Competition/blob/main/starter-kit/README.md). Transport descriptions and building information agree with [Bocconi’s travel guide](https://www.unibocconi.it/en/campus/buildings-and-classrooms/how-reach-bocconi-campus) and [Röntgen building history](https://virtualexhibitions.unibocconi.it/campus/en/77/rontgen-1). Hotel walking estimates remain expressly approximate.

The public [registration portal](https://register.consultaumbria.com/2940) confirms the institutional-card/bank-transfer conditions for non-Italian institutional VAT exemption. The travel-grant form’s introduction and first-page eligibility agree with the website. No profile was created, form submitted or payment performed; checkout prices and later application pages were not independently validated.

Of **71 distinct HTTPS anchors**, 58 public destinations were tested: **53 returned 200**, five returned **403**, and none returned 404/410. The 403 responses are access restrictions, not established broken links. Thirteen account/form/LinkedIn destinations were excluded from automated HTTP requests; registration and the grant-form introduction were inspected separately in the browser.

## Behavior and fallback checks

- Mobile navigation opens with the keyboard. Escape closes the nested menu and then the outer menu, returning focus to the correct summary. The skip link focuses `main-content`.
- ADIA search returns the Sunday session; Space saves it, a reload preserves it, and Enter removes it. The original empty saved set was restored.
- Calendar export announces a download. UTC conversion, escaping, line folding and export of all scheduled events pass the existing tests. The embedded browser did not expose the download event, so downloaded bytes were not compared.
- The time picker previews ADIA at Sunday 14:00, confirms the jump, closes with Escape and restores control focus. Its landscape box remains within the 390 px viewport height.
- All four tutorial disclosures expand on mobile without document overflow. Registration produces nine mobile cards with exactly the same **45 amounts** as the table.
- Map pause, Centrale route selection, hotel keyboard activation and popup-close focus work. Hotels are intentionally absent while a selected route is being displayed and return in exploration mode.
- Five QA snapshots with site script tags removed preserve readable Programme, Registration, Venue, Workshops and Tutorials content at 390 px. They retain all **85 sessions** and **45 table prices**, with no document overflow. These are static-fallback snapshots, not a browser-wide JavaScript-disable certification.

## Corrections made

1. Reinstalled dependencies from the existing lockfile without changing package declarations or the lockfile, restoring daisyUI 5.7.22 instead of the locally resolved 5.7.47.
2. Rebuilt the current CSS and generated programme/tutorial/clean-route artifacts.
3. Refreshed the shared stylesheet reference to **2026100905** on all canonical and clean-route pages. Browser inspection then confirmed four desktop university columns, including La Statale, using the actual rebuilt stylesheet.
4. At the user's confirmation that the Programme is correct, updated the Women in AI and Finance badge from two hours to **3.5-hour event**. It now matches the Saturday 14:00–16:00 and 16:30–18:00 blocks. All programme times and source rows remain unchanged.

Existing user edits and source facts were preserved. No deployment was performed.

## Remaining findings

### P2 Build dependency advisories

`package-lock.json` contains **seven packages flagged high by npm audit**, all marked development dependencies: `@parcel/watcher`, `@tailwindcss/cli`, `brace-expansion`, `braces`, `fast-uri`, `micromatch` and `source-map-js`. Several flags represent the same transitive chain. These packages are build/validation tooling, not browser script dependencies; this does not establish seven exploitable vulnerabilities in the static site.

The advisory database confirms issues in [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [fast-uri](https://github.com/advisories/GHSA-5jgf-p345-68v8) and [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q). Evaluate compatible updates and run the full build before accepting dependency changes. No automatic major-version change or forced downgrade was applied. Suggested follow-up: **`$impeccable harden`** for the build pipeline.

### P2 Map data payload

`assets/venue/milan.geojson` is approximately **1.5 MB** before transport compression. It can add initial download and parsing cost on constrained devices. The local audit does not measure mobile-network latency.

Consider simplifying nonessential geometry and verifying response compression while preserving venue, hotel and route accuracy. Compare the rendered map after any change. Suggested follow-up: **`$impeccable optimize`**.

### P3 Publication update metadata

`scripts/build-seo.js:9` defaults to **8 October 2026** for every page. Programme content reports an authorized update on **9 October**, but its WebPage/sitemap dates remain October 8; repeated default builds can also overwrite later dates.

Track significant update dates per page or preserve existing dates unless an explicit update is supplied. This concerns crawler metadata rather than the visible schedule. Suggested follow-up: **`$impeccable harden`** for metadata generation.

After any accepted follow-up changes, finish with **`$impeccable polish`** and repeat the affected checks. The findings can be addressed individually or together.

## Evidence and practical limits

The final build passed **31 tests**, JavaScript syntax checks, HTML validation for **35 physical files**, tutorial/programme parity, clean-route parity, the 18-page site checker and whitespace checks. Evidence is saved in `.impeccable/review/site-audit-2026-10-09/`: browser/landscape matrices, screenshots, behavior results, contrast output and static-fallback fixtures.

The audit uses Chromium in the in-app browser. It does not certify native Safari/Firefox behavior, physical-device interactions, 200% browser zoom, screen-reader conformance, authenticated checkout/form flows, legal/privacy compliance or complete repository security. Information is assessed against the current website and specifically checked sources, not obsolete PDFs or independently researched biographies.

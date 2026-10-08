# ICAIF '26 whole-site audit

Audit date: **8 October 2026**, Europe/Rome. This audit covers the 17 canonical pages, their 16 generated clean-URL copies, shared components, programme data/runtime, venue map, metadata, sitemap and links. It preserves the incumbent design, fees, source schedule times and pending details.

## Coverage and evidence

All 17 source page bodies and common navigation/footer were reviewed. The route matrix used 1440px desktop and 390px mobile viewports, with an initial and confirmation capture for each route: **68 captures**. Additional targeted final captures confirmed the last corrections and viewport-specific image checks. Development evidence is in `.impeccable/review/site-audit/phase-1/`, `phase-2/`, `final/` and `browser-results.json`; these are local review artifacts, not public content.

| Canonical page | Surface reviewed |
| --- | --- |
| `/` | Hero, milestones, announcements, sponsors, registration CTA and campus band |
| `/important-dates/` | Conference dates, extended deadlines and expired-date treatment |
| `/organisation/` | Chair groups, portraits and committee hierarchy |
| `/registration/` | Author policy, entitlements, fee table/cards, grants and support |
| `/venue/` | Address, travel, hotel list, interactive map, keyboard/motion and fallback states |
| `/programme/` | 85 static sessions, filters, agenda, overlaps, links, calendar export and print |
| `/workshop/` | Ten workshops, paper dates, organizers and disclosures |
| `/competitions/` | Three competitions, organizers, dates and schedule links |
| `/call-for-papers/` | Closed status, dates, topics, templates and policies |
| `/call-for-workshop-proposals/` | Closed proposals, paper dates, accepted-workshop links and requirements |
| `/call-for-tutorials/` | Closed status, dates, requirements and preliminary programme link |
| `/call-for-competitions/` | Closed status, requirements and preliminary schedule link |
| `/sponsors-and-supporters/` | Platinum/Silver groups, brand names, logo alternatives and destinations |
| `/become-a-sponsor/` | Prospectus, tier benefits, prices and contact links |
| `/qrt-student-travel-awards/` | Eligibility, application link, sponsor identity and unpublished dates |
| `/media-kit/` | Assets, download names, image alternatives, credits and licenses |
| `/privacy-policy/` | Reading table, registration service and optional agenda storage disclosures |

The second round's 34 route/viewport DOM checks found **no horizontal overflow, broken visible images, invalid ARIA references, duplicate IDs or console errors**. Each page has one H1. Registration, programme, venue and media kit also passed 320px overflow spot checks.

Keyboard checks confirmed the skip link focuses main content and Escape returns focus from nested navigation to its summary. Mobile footer targets measured at least 44px. Registration retained all nine mobile cards, three period row groups and all 45 desktop/mobile fee values. A venue behavior fixture using the shipped D3 renderer passed clipped-marker tab order, focus after redraw, reduced-motion changes and data/route fallback checks; it is supplemental test evidence, not a screen-reader certification.

## Corrections and preserved facts

- Shared accessibility corrections keep expired dates readable, retain table relationships across mobile presentation, align visible words with accessible names, remove perpetual decorative pings, preserve targeted reduced-motion feedback and make main skip targets focusable. Repeated media downloads include asset context; editable fields have visible boundaries.
- Registration distinguishes main conference author registration from workshop papers. The organizer confirmed that an in-person Workshop Days registration is sufficient for an accepted workshop paper. Fees and category entitlements remain intact; the banquet wording now agrees with the included benefits.
- Dates agree on workshop papers October 12, notification October 16, author registration October 18, early registration October 25, workshops/tutorials November 14–15 and main conference November 16–17. Static home copy and runtime milestones use the same dates, including AoE expiration.
- Four expired calls show closed submission status while retaining the archived requirements. Programme links replace obsolete future-schedule promises. Supporting CMT links say “Open CMT portal” beside the closed status.
- Programme import preserves **85 sessions**, daily counts **20/21/21/23**, all source dates/times/rooms, existing public titles, stable IDs and pending flags. Two display types follow explicit source titles: Tuesday's named keynote and coffee/poster session. Marc Mézard's spelling agrees with the committee. Reimport matched the public JSON; the source workbook was not changed. [Source decisions](programme-source.md) remain authoritative.
- SEO generation gives all 17 pages coherent unique search/social metadata and a shared WebSite/Organization/Event/ImageObject/WebPage graph. Known Bocconi address and mixed attendance are preserved; internal breadcrumbs have two items. The sitemap contains only canonical URLs, with October 8 update dates. Descriptions retain the preliminary programme context, and JSON names use real `&` characters.
- The shared ICAIF '20 footer now links to the verified [official 2020 archive](https://ai-finance.org/2020home/). Privacy copy records technical registration and optional local agenda storage behavior; it is not a legal review.

The final review found a home CTA paragraph at 4.4:1, a mobile campus-image gap and prominent submission buttons on closed calls. Fixes raise the CTA text to 90% white, position the campus image within its band and use neutral portal actions with closed status. Targeted desktop/mobile confirmation passed: CTA contrast cleared the threshold, the mobile campus image filled its 300px band, all four closed calls used neutral portal actions, and sponsor/media images were drawn when their sections entered the viewport. A fresh finish reviewer inspected 17 selected final captures and returned **ship**, with no material finding remaining at this scope.

## Source checks

| Source | Facts checked |
| --- | --- |
| [Perpetual Alpha](https://perpetual-alpha26.github.io/) and [schedule](https://perpetual-alpha26.github.io/schedule) | September 20 registration close, October 5–18 practice, October 19–November 6 trading and November 6 report deadline |
| [Trading Agent organizer starter kit](https://github.com/DeepIntoStreams/2026ICAIF_Trading_Agent_Competition/blob/main/starter-kit/README.md) | October 8–9 validation, October 12–30 competition, October 11 at 11:59 PM ET registration close and explicit US Eastern Time |
| [QRT](https://www.qube-rt.com/) | Qube Research & Technologies brand expansion |
| [Bocconi travel guide](https://www.unibocconi.it/en/campus/buildings-and-classrooms/how-reach-bocconi-campus) and [building history](https://virtualexhibitions.unibocconi.it/campus/en/77/rontgen-1) | Published transport connections, building opening, architects and award; hotel walks remain approximate |
| Bundled `ICAIF sponsor Booklet.pptx.pdf`, pages 9–10 | Sponsor tiers, prices, registrations and à la carte terms |
| Organizer workbook and confirmed registration instruction | Programme source preservation and workshop-paper registration policy |

Of 69 distinct external anchors, a bounded HTTPS reachability check tested **56 public URLs**: **50 successes, six 403 responses, zero 404/410 responses**. Thirteen registration, form, CMT and LinkedIn destinations were excluded from the automated request check. A bot-blocked 403 does not establish a broken link; a successful response does not establish third-party content quality. QRT competition and form details unavailable to the audit retain their established copy without inferred deadlines.

Metadata rules follow Google's guidance on [canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemap update dates](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [breadcrumbs](https://developers.google.com/search/docs/appearance/structured-data/breadcrumb) and [event data](https://developers.google.com/search/docs/appearance/structured-data/event). Structured-data validity does not guarantee rich results or rankings.

## Detector triage and limits

The phase-2 browser sampler reports image-backed hero text against white because it cannot resolve the photo overlay. The rendered black overlay at 60% bounds the lightest background at `#666`; the 90% light text clears 4.5:1 and the large copper-tinted heading clears 3:1. The CTA's separate 4.4:1 report was genuine and received the source correction above. Symbolic `+`/`−` controls intentionally use “Zoom in”/“Zoom out”, consistent with W3C's [symbolic-label guidance](https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html).

A raw Impeccable scan run once with `--no-config` produced **308 warnings**: 143 contrast, 126 padding, 18 Inter, 17 native select gradients, two domain-copy terms and two uppercase labels. These were triaged against source/rendered evidence as static inference errors or established font, native-component and factual-copy choices. This is a triaged scan, not a claim that the detector is clean.

Pre-existing broad `ignoreValues` in the gitignored `.impeccable/config.json` already suppress some contrast/padding rules for home, registration and programme. The audit preserved the existing uppercase-label exception and persisted additional file-scoped false-positive exceptions for contrast, padding, Inter, native select chevrons and domain copy. Several use wildcard values within their named files, which can mask later defects. Future changes still require rendered checks; a quiet configured detector is not evidence of contrast or layout quality. Impeccable configuration/build-path drift was outside scope.

The later timeline extension's single raw scan reported **97 findings**: 93 contrast pairings inferred against black, one datebar-padding warning, one incumbent Inter warning, one native select-gradient warning and one border/shadow association. The first four groups retain their evidence-backed programme exceptions. The normal navigator's computed border is 0px; its 1px border exists only in forced colors for accessibility. A fresh reviewer confirmed the border/shadow report as a false positive, and `gpt-thin-border-wide-shadow` now ignores `*` only in `programme.html`. That file-scoped wildcard can mask future border/shadow mistakes; it does not replace rendered checks.

The programme remains preliminary with **15 pending sessions**: twelve unnamed poster blocks, one Sunday TBD session, one panel awaiting participants/moderator and one Tuesday poster room. Duplicate source Oral Session 5–8 labels and the FINOS duration annotation remain documented source uncertainties. Unpublished travel-award dates are not invented.

This bounded review does not establish full WCAG conformance, native Safari/VoiceOver table behavior, every 200% zoom state, all browser/device combinations, authenticated registration/form flows or third-party accessibility. Preserve these limits when reporting the audit.

## Repeatable verification

The whole-site audit's final `npm run build` checks passed after its last source fixes: **26/26 tests** (six hero-time, twelve programme, six site-audit and two home-milestone), **20 JavaScript syntax checks**, HTML validation for all **33 physical HTML files**, 85-session programme parity, clean-route parity, the 17-page site checker and `git diff --check`. Native mobile fields were confirmed at 16px with the intended visible boundary.

The later programme timeline build passed **29/29 tests** (six hero-time, fifteen programme, six site-audit and two home-milestone), JavaScript syntax checks, all 33 HTML files, 17-page schema/site checks, clean-route parity and parity for the same 85 source sessions and IDs. It adds four ordered daily timelines with 40 stable date/time groups; public schedule data and local agenda storage remain unchanged.

Timeline evidence is in `.impeccable/review/programme-timeline/`: phase-2 viewports at 2137, 1440, 1280, 1024, 390 and 320px, full-page desktop/mobile captures, scrolled desktop/mobile states, empty results and My agenda. These checks found no horizontal/time-label overflow or JavaScript errors and confirmed aligned rail/point centers. Native keyboard Home/End/ArrowRight, pointer drag, cross-day previous/next and manual-wheel synchronization passed while preserving filters, URL and widget focus. Keynote filtering exposed three sessions and two day options; empty intersections and a single saved stop behaved correctly. Accessibility snapshots exposed four ordered lists and named native day/range controls. No-JavaScript reading and print checks passed.

The fresh finish reviewer found only overlap at desktop heights of 600px or less. Removing the height-based compact layout and extending the reserved right gutter to the tools resolved it; targeted 1280×500 and 1024×500 evidence confirmed 32px clearance from date buttons, timezone and filter labels. The final verdict is **resolved / ship at the scored correction scope**, with no further correction owed there. This extends the bounded programme review and retains the accessibility/browser limits above.

Run `npm run build` after future edits. Its checks cover local resources/fragments, generated-route parity, programme fallback/data and metadata/schema/sitemap consistency alongside syntax, tests and HTML validation.

For future audits, inspect all canonical routes in one desktop/mobile batch, fix the verified findings together and use one confirmation round. Add targeted keyboard, narrow-width, table-value and motion/fallback checks when those components change. Keep dates, source decisions and audit evidence current. Preserve the incumbent palette and document detector exceptions only with current source/rendered evidence.

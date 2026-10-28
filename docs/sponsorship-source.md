# Sponsorship content sources

## Home sponsor layout and links — October 28, 2026

The user approved all three findings from the Home sponsor critique: compact tablet/mobile layout, optical logo balance and consistent sponsor links. The change is scoped to the Home sponsor band. Desktop retains the three tier columns; at 640–1023px the three Platinum marks share a centered row, and Gold/Silver use two-logo rows below 1024px. Below 640px LinqAlpha is 176px wide and Standard Chartered is 112px wide. Sponsor tiers and supplied artwork are preserved.

All seven Home logos are native external links with a contextual accessible name, a new-tab notice, `noopener noreferrer`, a minimum 44px target height and the site's existing focus treatment. Official destinations checked on October 28:

| Sponsor | Destination |
|---|---|
| Intesa Sanpaolo IMI CIB | https://imi.intesasanpaolo.com/en/ |
| QRT | https://www.qube-rt.com/ |
| LinqAlpha | https://linqalpha.com |
| Domyn | https://www.domyn.com/ |
| DXC Technology | https://dxc.com/ |
| Bloomberg Engineering | https://www.bloomberg.com/company/values/tech-at-bloomberg/ |
| Standard Chartered | https://www.sc.com/en/ |

The public web reader retrieved the six other destinations. Bloomberg's official Tech at Bloomberg page was confirmed through the official indexed page and by clicking the Home logo in the native browser: it opened the expected page title in a new tab. The web reader's direct fetch returned an automated-access error; this was not treated as a broken destination.

Native IAB checks at 320, 390, 640, 768, 1024, 1280 and 1440px found all seven logos loaded, intact proportions, correct tier order, no horizontal overflow and target heights of at least 44px. The narrowest DXC mark remains approximately 116px wide, above its 100px digital minimum. Section height decreased from 887px to about 602px at 768px, from 823px to 643px at 390px and from 859px to 679px at 320px; desktop is 369px. Keyboard traversal follows the seven logos in DOM order, with a visible 2px outline on each. Tests use browser viewports, not physical-device touch testing. Screenshots are under `.codex-artifacts/home-sponsors-20261028/`.

The independent design reviewer returned **SHIP** after reviewing desktop, tablet, mobile and narrow screenshots and the source, confirming all three critique priorities were addressed. Final `npm run build` passed 41 tests, JavaScript syntax, HTML validation and site/source checks for all 20 canonical pages. The shared CSS cache version is consistently `2026102801`, including the programme builder and generated clean routes. No new CSS tokens, JavaScript, animation or artwork were added; no detector exclusions changed. Existing out-of-scope detector advisories remain outside this local layout refinement.

## DXC Technology — October 28, 2026

The user's October 28 instruction authorizes adding DXC Technology as a Gold Sponsor using the supplied `transfer-01a16862` folder. Its logo appears alongside Domyn in the Gold groups on Home and Sponsors & Supporters.

The supplied RGB SVG, `DXC Logo/Brand Mark/Full Color/RGB/DXC-Full-Color.svg`, is copied unchanged to `img/loghi/dxc/dxc-full-color.svg` (860 × 240; SHA-256 `fe78f845587bad242cda0e7d093a709474cf2aadd8fb0e656e4b6fb5a90438d7`). The supplied visual identity guidelines inform the artwork selection: the full-color mark appears on white, the compact placements use the version without tagline, and the original clear space, colors and proportions are retained. Both placements keep the visible mark wider than the 100px digital minimum and use descriptive alternative text.

Verification: `npm run check` passed (41 existing tests, JavaScript syntax, HTML validation, source synchronization and checks for all 20 canonical pages). The clean Sponsors route was regenerated. Chromium inspection at 1280px, 390px and 320px confirmed both DXC placements load, retain their aspect ratio and introduce no horizontal overflow. The visible mark remains at least 123px wide. Screenshots are saved in `.codex-artifacts/sponsorship-dxc-20261028/`. Static Impeccable warnings were verified against rendered colors and spacing; the CTA contrast is 4.93:1, tier bottom padding is 32px, Inter is the documented site font, the page background is white and no repeating-gradient decoration renders. File-scoped exceptions record those false positives without changing the UI.

## LinqAlpha — October 27, 2026

Marco authorized Andrea Prampolini's October 27 request to list LinqAlpha as a Platinum Sponsor. Its logo appears in the Platinum groups on Home and Sponsors & Supporters, linking to `https://linqalpha.com`. The October 26 Domyn Gold sponsorship from the requested pull is retained, along with existing sponsor tiers.

The supplied, unmodified black PNG from the email is `img/loghi/linqalpha/linqalpha-black.png` (2839 × 660 pixels). The Gmail attachment reader could not retrieve the SVG despite initially advertising support, so the supplied PNG was used. No logo was redrawn. Both links have meaningful accessible names, a new-tab notice, preserved image proportions and a 44px minimum target.

The separate conference poster/rollup request is outside this website edit; its final sponsor roster and print dimensions/artwork are still needed. Existing website sponsor listings remain in place.

## Needlestack Technologies

The user's October 16, 2026 instruction authorizes the website changes requested in the email “Fw: Sponsorship inquiry” received that morning: add Needlestack Technologies to a dedicated à la carte sponsors section and link its logo to `https://www.needlestacktech.com/`. The HTTPS destination was successfully retrieved on October 16. Existing Platinum and Silver groups retain priority; the new category follows them on the Sponsors page, using a smaller logo. The user's subsequent instruction removes Needlestack and the à la carte group from Home while retaining the Sponsors listing and News announcement.

The supplied artwork is `Marketing - Logos/Needlestack logo white background (Large).svg` from the message's `Marketing - Logos.zip` attachment. The original SVG SHA-256 is `0c3c916a9436a0e565cefc9e191c6e835c5973861a1d207d86bd6e8b9030f8f5`. The shipping asset is `img/loghi/needlestack/needlestack-technologies.svg`. Its viewBox and intrinsic dimensions remove the large blank artboard margins, preserving the vector paths, original colors and proportions. No logo was generated or redrawn.

The linked logo has a contextual accessible name, a new-tab notice, intrinsic dimensions and a link target at least 44px high. The News announcement is dated October 16, 2026 and links directly to the new Sponsors section. Only the public brand and sponsorship information is included in the site; the correspondence and commercial terms are not stored here.

## Verification — October 16, 2026

The complete `package.json` build pipeline passed through the bundled Node runtime (shell npm is unavailable): 31 existing tests, JavaScript syntax, HTML validation, all 19 canonical pages, 18 generated clean routes, and tutorial/programme source checks. Shared stylesheet cache version is `2026101601`; SEO metadata and sitemap use the significant-update date October 16.

Browser inspection covered desktop at 1280/1440px, mobile at 390px and narrow layouts at 320px. Before the subsequent Home removal, the new logo loaded on both sponsor surfaces, retained its proportions, and the new link targets measured 44px on Home and 47.7px on Sponsors. No horizontal document overflow was observed. The News archive contains seventeen entries in descending date order, and its new link opens the correct Sponsors section. Local screenshots are saved under `.codex-artifacts/sponsorship/`.

The single scoped Impeccable detector run reported six advisories about existing/inferred colors and a shared native stylesheet gradient; no new component defect was identified. No design-system tokens or detector ignores changed. These checks establish the local content/layout update, not live deployment or full accessibility certification.

# Sponsorship content sources

## ADIA Lab — October 30, 2026

The user's instruction refers to the email “Fw: ICAIF - sessione ADIA domenica” received on October 30, explicitly requesting another Bronze sponsor. The inline `image.png` supplied in that message identifies ADIA Lab. Its original PNG is copied unchanged to `img/loghi/adia-lab/adia-lab.png` (456 × 70 pixels; 10,090 bytes; SHA-256 `7fb85643af26c8cf832fec453f256a428c35d8790ca57e0f7432b108a27f0dbc`). The logo appears alongside Vedrai in the Bronze groups on Home and Sponsors & Supporters and links to `https://www.adialab.ae/`, the official site verified on October 30.

ADIA Lab's much wider aspect ratio requires 80/88/100px responsive image bounds to match Vedrai's 64/72/80px visual weight. Their nominal contrast-area ratios remain within approximately 3%. A 4px optical lift aligns ADIA Lab's lettering with Vedrai's main wordmark above its tagline. Home uses a 1:1.25 Bronze gallery and gives that tier additional room in the shared lower row, allowing both marks to stay alongside each other from tablet widths while preserving the larger Platinum, Gold and Silver tiers. Both links retain descriptive accessible names, a new-tab notice, `noopener noreferrer` and a 44px minimum target height. The source image's colors and proportions remain intact. Only the public brand, logo, sponsorship tier and website are published; the correspondence and preliminary session discussions are excluded from the site. The separate print rollup is outside this website repository update.

Verification: the full build passed all 43 existing tests, HTML validation and source/site checks for all 21 canonical pages. Native browser inspection covered Home at 320, 390, 768, 1024 and 1280px and Sponsors at 320, 768 and 1280px, followed by four targeted confirmations of the optical alignment. All nine Home logos and ten Sponsors logos loaded, no horizontal overflow was observed, both Bronze links measured at least 44px high, and keyboard focus showed the existing 2px outline. Screenshots and measurements are under `.codex-artifacts/sponsorship-adia-20261030/`. Shared CSS cache version is `2026103006`.

## Optical balance of individual logos — October 30, 2026

Before the authorized commit and push, the user requested an individual analysis of every logo so that marks within each sponsorship tier look more alike. Both Home and Sponsors & Supporters now compensate for each supplied asset's clear space, aspect ratio and visual weight. The two-band Home composition and decreasing Platinum → Gold → Silver → Bronze hierarchy are preserved.

The analysis uses the original local assets, with SVGs rasterized for measurement only. Images are composited over white; the visible bounding box excludes pixels whose maximum RGB-channel difference from white is at most 16/255. A second diagnostic sums luminance contrast against white, distinguishing fine colored lettering from dense black lettering. These measurements support optical judgment rather than defining a universal measure of perceived size. No shipping artwork is cropped, recolored, redrawn or otherwise modified.

| Logo | Finding | Previous → calibrated Home desktop bound | Calibrated visible artwork, approximately |
|---|---|---|---|
| Intesa Sanpaolo IMI CIB | Fine colored lettering has less visual weight than the other Platinum marks. | 320 → 352px wide | 352 × 111px |
| QRT | The portrait cube/wordmark occupies more height and contrast than its width suggests. | 160 → 144px high | 124 × 142px |
| LinqAlpha | Dense black lettering dominated the Platinum row at its previous width. | 288 → 248px wide | 248 × 58px |
| Domyn | A dense wordmark with virtually no blank artboard margin; previously dominated DXC. | 176 → 160px wide | 160 × 39px |
| DXC Technology | The artwork's bounding box occupies only 43% of its SVG artboard area; its strokes are also lighter. | 176 → 256px wide | 219 × 36px |
| Bloomberg Engineering | Little blank margin and dense black lettering provide the Silver reference. | 112 → 112px wide | 112 × 45px |
| Standard Chartered | The artwork's bounding box occupies 46% of the SVG artboard; gray lettering is lighter than Bloomberg. | 96 → 160px wide | 125 × 49px |
| Vedrai | The only Bronze sponsor; retains the smaller tier size and its supplied tagline. | 80 → 80px wide | 80 × 24px |
| Needlestack Technologies | The only À la carte sponsor; its already fitted SVG needs no within-tier correction. | Not on Home; Sponsors remains 96/128px wide | 124 × 28px at the 128px bound |

Gold grid columns use a 1:1.6 ratio and Silver a 1:1.4 ratio so that clear-space compensation survives narrower containers. The Platinum gallery gives additional width to Intesa's fine lettering; QRT increases from 84px high on mobile to 112/128/144px as space permits. Sponsors defers QRT's final height until 1280px because its separate tier-label column leaves less gallery space. All images preserve their intrinsic proportions, all existing logo links retain 44px minimum targets, and the original DXC clear space remains intact. Responsive image bounds may be constrained by the available column width.

At the nominal desktop sizes above, the maximum/minimum contrast-area ratio among Platinum marks decreases from 1.64 to 1.03; Domyn/DXC decreases from 4.10 to 1.60; Bloomberg/Standard Chartered decreases from 3.77 to 1.36. Local measurements and analytical comparison figures are under `.codex-artifacts/logo-balance-20261030/`; they show the original artwork at the configured nominal sizes, not a browser screenshot. Browser access to the existing preview tab was rejected by its access policy, so final rendered viewport behavior remains unverified in this pass. The full build and existing tests provide source validation. Shared CSS cache version is `2026103004`.

## Home sponsor hierarchy refinement — October 30, 2026

The user's browser comment requests more prominent Platinum logos and a shared row for Gold, Silver and Bronze, with each successive tier smaller. This supersedes the initial four-column Vedrai layout below. The Home sponsor band now has a full-width Platinum gallery with three marks from 640px, followed by Gold, Silver and Bronze sibling groups on one row from 768px. Narrower screens stack the lower groups; Gold and Silver retain paired logos, and LinqAlpha spans the second Platinum row below 640px. DOM order, official artwork and destinations are preserved.

Desktop logo bounds are 320px for Intesa, 160px high for QRT and 288px for LinqAlpha; Gold uses 176px-wide marks; Silver uses 112px for Bloomberg and 96px for Standard Chartered; Bronze uses 80px. Smaller breakpoints scale these bounds down, and available grid space may constrain them further. All links retain at least 44px target height. Light shared rules separate the tiers; no cards or new theme tokens are introduced.

Verification: the full build passed all 43 existing tests, HTML validation and source/site checks for all 21 canonical pages. Both new grid templates are present in the compiled CSS; the shared cache version is `2026103003`. The layout detector reported no findings. The final detector's four advisories concern pre-existing page colors and circular speaker images outside the sponsor band. Browser access was rejected by the browser security policy, so this refinement has source and build verification only; the earlier screenshots do not validate this layout. The requested browser review remains unavailable in this session.

## Vedrai — October 30, 2026

The user's instruction authorizes the website update requested in the email “Fw: ICAIF Bronze Sponsorship - Vedrai” received on October 30: add the supplied Vedrai logo as a Bronze Sponsor. Vedrai appears in a new Bronze group after Silver on Home and Sponsors & Supporters, before the Sponsors page's À la carte group. Home uses four desktop columns with additional room for Platinum and stacks the tiers below 1024px.

The supplied positive PNG, `Vedrai-NEWpayoff_Logo_Pos (31).png`, is copied unchanged to `img/loghi/vedrai/vedrai-positive.png` (2497 × 737 pixels; 52,325 bytes; SHA-256 `2d202fbfbe436e9ef04c2bb87d5cdc8228bc6cf8086e50b6a50bef2aee7efa99`). The original colors, tagline, transparency and proportions are retained. Both logos link to `https://www.vedrai.com/`, the official destination in the email, retrieved successfully on October 30. Links have descriptive accessible names, a new-tab notice, `noopener noreferrer` and a minimum 44px target height. Only the public logo, company name, sponsorship tier and website are published.

Verification: the full `package.json` build pipeline passed through the bundled Node runtime, including existing tests, HTML validation, generated-route synchronization and site checks for all 21 canonical pages. Native browser inspection covered Home at 1280, 1024, 768, 390 and 320px and Sponsors at 1280, 390 and 320px. All eight Home logos loaded with intact proportions, no horizontal overflow was observed, and Vedrai's link targets measured 44px. At 1024px the DXC logo remains approximately 132px wide. Screenshots and responsive measurements are under `.codex-artifacts/sponsorship-vedrai-20261030/`. Shared CSS cache version is `2026103002`; Home and Sponsors metadata and sitemap use the significant-update date October 30. This records the local website change; the separate print rollup is not part of this repository update.

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

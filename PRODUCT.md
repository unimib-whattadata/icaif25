# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

The existing ICAIF '26 website presents the International Conference on Artificial Intelligence in Finance in Milan, November 14–17, 2026, and provides information for participants.

## Capabilities and Constraints

The implementation is a static HTML website, with shared Tailwind CSS 4 / daisyUI 5 styling and local JavaScript. Existing navigation, page headers, footer, English content, and accessibility conventions are preserved.

The user confirmed the Venue page location as Bocconi University, Via Röntgen 1, Milan. The page must include an attractive stylized map using the same libraries as the Viterie Orobiche project: D3 Array and D3 Geo, with OpenStreetMap geographical data. The user additionally requested English map labels, an inline dynamic SVG, animated camera transitions and an animated pin. Selectable illustrated routes from stations and Duomo must be checked against Google Maps and link to its current directions. Metro routes use their line colours (M2 green, M3 yellow), and walking segments use animated SVG footprints.

## Brand Commitments

The Venue page also includes a concise English introduction to the Röntgen building, based on the Bocconi campus exhibition, a colour-adapted official building photograph, and links to the exhibition and Bocconi virtual tour.

Preserve the existing ICAIF colors and site identity. The reference map is the Viterie Orobiche contact page in /Users/marco/Sites/viterieorobiche.

## Evidence on Hand

Existing conference content and dates are in index.html. Brand tokens are in css/tailwind.input.css. The map implementation reference is assets/js/contatti.js in the Viterie Orobiche project. The venue address was explicitly confirmed by the user.

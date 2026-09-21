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

Align reading columns with the page heading and limit their width with `max-w-3xl`. Keep tables, programme lists, sponsor tiers and committee portraits in their appropriate layouts. Do not force different content types into identical cards. Sponsor logos retain their colors and intrinsic proportions, with visible Platinum/Silver grouping.

## Interaction

Use `btn` for actions and `link` for text links. A page's priority action uses `data-priority-action` and `btn btn-accent btn-lg`. Buttons wrap long labels and have at least 44px height. Keep visible keyboard focus and offset link underlines.

`js/site-layout.js` shares navigation, section indexes, programme disclosures, sponsor disclosures and responsive fee tables. Section indexes use `data-index-label` when a full heading would be too long; the heading and target remain intact. Navigation closes with Escape or an outside click. Footer disclosures and programme details use the same 768px breakpoint as their CSS. Footer sections are open on desktop and individually expandable on mobile.

## Validation

Rebuild `css/tailwind.min.css` after changes and keep the CSS/JS cache versions aligned across all HTML files. Run the package's HTML, JavaScript and site checks. Check desktop and mobile, plus the 640–768px footer breakpoint when changing shared navigation.

The static Impeccable detector can misread inherited colors, responsive padding and padding on child containers. Verify these findings against computed browser styles. The incumbent fonts, official workshop titles, factual copy, sponsor brands and functional table labels are intentional; do not rewrite them solely to silence a heuristic.

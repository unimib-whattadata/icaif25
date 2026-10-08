---
name: "ICAIF '26"
description: "The existing ICAIF conference website identity."
colors:
  base-100: "#ffffff"
  base-200: "#f8fafc"
  base-300: "#e2e8f0"
  base-content: "#1e293b"
  primary: "#0369a1"
  primary-content: "#ffffff"
  accent: "#bf4c16"
  accent-content: "#ffffff"
  neutral: "#0f172a"
  neutral-content: "#f8fafc"
  error: "#dc2626"
  programme-type-neutral-text: "#334155"
  programme-type-neutral-bg: "#e2e8f0"
  programme-type-neutral-border: "#cbd5e1"
  programme-type-workshop-text: "#075985"
  programme-type-workshop-bg: "#e0f2fe"
  programme-type-workshop-border: "#7dd3fc"
  programme-type-tutorial-text: "#115e59"
  programme-type-tutorial-bg: "#ccfbf1"
  programme-type-tutorial-border: "#5eead4"
  programme-type-competition-text: "#6b21a8"
  programme-type-competition-bg: "#f3e8ff"
  programme-type-competition-border: "#d8b4fe"
  programme-type-industry-text: "#9a3412"
  programme-type-industry-bg: "#ffedd5"
  programme-type-industry-border: "#fdba74"
  programme-type-keynote-text: "#854d0e"
  programme-type-keynote-bg: "#fef9c3"
  programme-type-keynote-border: "#facc15"
  programme-type-panel-text: "#86198f"
  programme-type-panel-bg: "#fae8ff"
  programme-type-panel-border: "#e879f9"
  programme-type-oral-text: "#166534"
  programme-type-oral-bg: "#dcfce7"
  programme-type-oral-border: "#86efac"
  programme-type-poster-text: "#3730a3"
  programme-type-poster-bg: "#e0e7ff"
  programme-type-poster-border: "#a5b4fc"
  programme-type-social-text: "#9f1239"
  programme-type-social-bg: "#ffe4e6"
  programme-type-social-border: "#fda4af"
  programme-type-break-text: "#475569"
  programme-type-break-bg: "#f1f5f9"
  programme-type-break-border: "#cbd5e1"
  programme-type-tbc-text: "#52525b"
  programme-type-tbc-bg: "#fafafa"
  programme-type-tbc-border: "#a1a1aa"
typography:
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  page-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  page-lead:
    fontFamily: "Inter, sans-serif"
    fontSize: "1rem"
    lineHeight: 1.625
  section-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  subsection-title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.375
    letterSpacing: "-0.025em"
  home-introduction:
    fontFamily: "Merriweather, serif"
    fontSize: "1rem"
    lineHeight: 1.625
rounded:
  selector: "0.5rem"
  field: "0.5rem"
  box: "1rem"
spacing:
  container-gutter: "1rem"
  container-gutter-sm: "1.5rem"
  container-gutter-lg: "2rem"
  section-space: "2.5rem"
  section-space-sm: "3.5rem"
  section-space-lg: "4rem"
  document-gap: "2.5rem"
  document-gap-sm: "3.5rem"
components:
  button-accent:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-content}"
    rounded: "{rounded.field}"
    padding: "0.75rem 1.25rem"
  button-default:
    backgroundColor: "{colors.base-200}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.field}"
    padding: "0.75rem 1rem"
  input:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.field}"
    padding: "0 0.75rem"
  badge:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.base-content}"
    rounded: "{rounded.selector}"
  card:
    backgroundColor: "{colors.base-100}"
    rounded: "{rounded.box}"
    padding: "1.5rem"
  navigation:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.neutral-content}"
  button-programme-agenda-add:
    backgroundColor: "{colors.base-100}"
    textColor: "{colors.primary}"
    rounded: "{rounded.field}"
    padding: "0.5rem 0.75rem"
    height: "auto"
    width: "100%"
  button-programme-agenda-remove:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.accent-content}"
    rounded: "{rounded.field}"
    padding: "0.5rem 0.75rem"
    height: "auto"
    width: "100%"
  badge-programme-type-workshop:
    backgroundColor: "{colors.programme-type-workshop-bg}"
    textColor: "{colors.programme-type-workshop-text}"
    rounded: "{rounded.selector}"
    padding: "0.2rem 0.5rem"
---

# Design System: ICAIF '26

## Overview

This record preserves the identity already implemented in the ICAIF website. Navy navigation and internal page headers frame white and slate content surfaces; Inter supplies the interface hierarchy, and copper identifies a priority action or a saved programme choice. Merriweather remains the home introduction's established exception.

The shared styles define the reusable system. Individual surfaces retain the layout their content needs: reading columns, tables, sponsor groups, committee portraits and the programme's chronological timeline with parallel session cells. The programme and Tutorials reading page extend this system, with their detailed usage recorded in `.impeccable/surfaces/programme-html.md` and `.impeccable/surfaces/tutorials-html.md`.

The October 8 whole-site audit and later programme/Tutorials extensions preserve this identity. The agenda clarification adds local categorical badge colors at the user's request. The user's later Tutorials refinement adopts the existing workshop card and nested organizer/presenter pattern within the same visual world. Coverage, content sources and verification limits are recorded in `docs/site-audit.md`; shared implementation rules remain in `docs/ui-conventions.md`.

**Key Characteristics:**

- Navy framing with white and slate content surfaces.
- Inter interface typography and the existing Merriweather home introduction.
- Native daisyUI controls using the `icaif` semantic theme.
- Shared alignment and responsive gutters, with content-specific layouts.

Recorded from `css/tailwind.input.css`, `css/fonts.css`, `css/tailwind.min.css`, `docs/ui-conventions.md`, `index.html`, `workshop.html`, `programme.html`, `css/programme.css`, `tutorials.html` and the programme/Tutorials builders. Incumbent theme colors, radii, typography and spacing retain their existing values. The `programme-type-*` additions record the fixed foreground, fill and border roles implemented locally in `css/programme.css`; they do not replace global theme tokens. Only the used palette sampled here is listed; the source theme also defines other semantic status colors.

## Colors

The palette combines cool navy and slate with a warm copper action accent. Frontmatter owns the recorded values; `css/tailwind.input.css` remains the global implementation source, with programme category roles in `css/programme.css`.

### Primary

- **Conference blue** (`primary`, `primary-content`): the existing semantic primary color, used by links, interface emphasis and the internal header overlay.
- **Copper** (`accent`, `accent-content`): the established priority-action color. The programme also uses it for saved-session buttons, targeted-session outlines and the current timeline point/heading.

### Neutral

- **Navy** (`neutral`, `neutral-content`): navigation and page-header framing. The programme reuses the pair for the selected day and My agenda state.
- **White** (`base-100`): reading surfaces, fields and programme session cells.
- **Pale slate** (`base-200`): quieter content bands and the programme's break and registration cells.
- **Slate rule** (`base-300`): dividers and boundaries between adjacent programme sessions.
- **Dark slate** (`base-content`): text on white and pale slate.

The existing **error red** (`error`) identifies saved-session overlaps in the programme. It remains a status color.

**The Existing Identity Rule.** Extend the `icaif` semantic palette and established font assignments when adding a surface.

The programme's local `programme-type-*` roles pair dark text with a pale fill and matching border. Workshop uses blue, Tutorial teal, Competition purple, Industry orange, Keynote amber, Panel magenta, Oral session green, Poster session indigo, and Social event/Banquet rose. Registration, Opening and Closing share the neutral default; Break uses lighter slate, and To be confirmed uses a neutral dashed border. These colors support the written type labels, which remain the primary identifier. The recorded text/fill pairs clear 6.38:1; they are category cues rather than global status or action colors.

## Typography

**Interface font:** Inter (sans-serif fallback), locally supplied as a variable font with weights 300–800.

**Home introduction font:** Merriweather (serif fallback), locally supplied with weights 300–700 and an italic face.

The hierarchy uses bold, tightly tracked headings and relaxed introductory text. There is no separate programme font or display-face substitution.

### Hierarchy

- **Internal page title:** the `page-title` token is the mobile default; the shared utility increases to 36px at 640px and 48px at 1024px. Headings use balanced wrapping.
- **Header lead:** the `page-lead` token increases to 18px at 640px and 20px at 1024px, within a 48rem reading measure.
- **Section heading:** the `section-title` token increases to 30px at 640px and 36px at 1024px.
- **Subsection heading:** the `subsection-title` token increases to 24px at 640px. Native card titles retain their component role.
- **Body:** the `body` token records the shared base text. Existing pages select smaller native control and supporting-text sizes where needed.

The home hero has its existing larger headline scale. The programme's compact header and time/session hierarchy are local surface rules, described in its surface record.

Tutorial titles now retain the workshop's native card-title hierarchy: 18px at weight 600, with the shared 16.8px/1.4 mobile treatment below 768px. Presenter names use semibold list text with smaller affiliations beneath them, matching workshop organizers. Full abstracts use relaxed leading and a local 72ch maximum reading measure; these are reading-surface choices rather than new typography tokens.

## Layout

The shared content container is centered with an 80rem maximum width. Gutters use `container-gutter`, `container-gutter-sm` from 640px, and `container-gutter-lg` from 1024px. Reading columns align with the page heading and use a 48rem maximum width.

Main section padding uses the `section-space` family. Long reading pages use the `document-gap` family, increasing at 640px. The shared footer and programme disclosures switch at 768px; the navigation's desktop arrangement begins at 1024px. The home university, statistics and sponsor bands retain their compact spacing.

The programme's persistent navigator is a local layout extension: 240px wide on desktop, with reserved space in its content and tools from 1024–1799px, and compact below 640px. Its detailed stop, focus and responsive behavior belongs in the programme surface record.

Tutorials follows the workshop page composition: the navy header and shared index precede one pale-slate Accepted Tutorials section, a 48rem introduction and four white native cards. Date, time/CET and room badges precede each full title. From 1024px, the abstract's flexible 72ch reading column sits beside a 22rem pale-slate Presenters card; below that breakpoint the columns stack. The shared mobile card disclosure below 768px preserves the title and metadata while toggling the abstract, presenters and programme action. Every paragraph remains in static HTML and is visible without JavaScript.

**The Content Layout Rule.** Keep tables, programme sessions, sponsor tiers and portraits in the layouts suited to their content, while preserving the shared alignment.

## Elevation & Depth

The site combines tonal surfaces with restrained native component depth. Light navigation dropdowns use the existing small shadow; native buttons and fields retain daisyUI depth where their surface does not override it. The programme deliberately removes button shadows and separates flat session cells with slate rules. This local treatment does not prohibit shadows elsewhere in the incumbent site.

The sidecar records the sampled dropdown shadow and native state motion. Update dots and priority-action accents remain static. Reduced-motion rules remove smooth scrolling and disclosure rotation; the venue map uses a static camera/route while short color and opacity feedback remains available.

## Shapes

Fields and buttons use the `field` radius, badges use `selector`, and native cards and light dropdown containers use `box`. The theme's border width is 1px. Programme session cells form a square-edged grid with 1px separation; they retain a content-specific silhouette within the existing rounded control system.

## Components

### Buttons

Native daisyUI actions use the field radius and semantic color pairs. Main-content buttons have at least 44px height, automatic height, 12px vertical padding and wrapping labels. A page's priority action uses `btn btn-accent btn-lg` and `data-priority-action`; supporting actions use native `btn` variants. Native hover, active and focus rules remain in effect unless a surface supplies an explicit override.

Accessible names retain visible words, adding context for repeated downloads and hotel links. Symbolic map zoom controls use the functional names “Zoom in” and “Zoom out”. Closed calls show their status beside neutral portal links; a past submission action does not remain a priority action.

Programme agenda actions span their cell action area and retain the 44px minimum. “Add to My agenda” uses conference-blue text/border on white with a calendar icon; the selected state uses a copper fill, white check icon and “Remove from agenda”. Visible words, title, contextual accessible name and `aria-pressed` update together. Color changes are immediate to avoid an intermediate low-contrast blend. Both labels wrap where needed.

### Badges

Badges carry short metadata or status labels. Programme session-type badges use the local category text/fill/border pairs described in Colors, while the preliminary badge retains its outlined light treatment on the navy header. All 15 type labels remain visible and non-interactive; color does not carry the category alone.

### Cards / Containers

Native cards use the box radius and a body padding default of 24px; existing mobile workshop, tutorial and committee layouts provide their own overrides. Workshop/tutorial cards use the same nested pale-slate organizer/presenter card and list rows. Cards do not replace every content format. Programme sessions use flat adjacent cells, preserving parallel choices within a time group.

### Inputs / Fields

The programme uses native daisyUI `input` and `select` controls with visible labels. Fields are 46px high; their text is 14px on larger screens and 16px below 640px. The venue select also uses 16px text below 640px. Editable fields have a visible boundary mixed from `base-content` and `base-100`; placeholder text uses `base-content` at 75% opacity. Inputs retain native focus treatment; labels and placeholder text serve different roles.

### Navigation

The existing navy navigation includes light dropdown menus with explicit dark text. The current page's desktop navigation state uses a light tonal fill over navy. Navigation and desktop section-index controls have at least 44px height. Mobile navigation closes with Escape or an outside click through the shared script; Escape returns focus to the relevant disclosure summary. Mobile footer links and disclosure summaries retain the 44px height convention.

Shared keyboard focus CSS uses an offset outline, and native controls also supply their component focus rules. Text links retain offset underlines. The skip link targets a focusable main region. Hidden content is removed from layout and keyboard interaction.

### Reading Tables

Keep column and row headers meaningful when tables stack on mobile. Registration periods use three separate row groups, and their mobile cards retain every category and amount. Expired and superseded dates stay at readable contrast, with textual or strike-through status rather than reduced opacity.

### Workshop / Tutorial Cards

White cards on a pale-slate section use the existing box radius, full native card titles and visible metadata badges. The flexible text column and 22rem organizer/presenter card sit side by side from 1024px; names and affiliations use native list rows. Tutorials retains the complete abstract paragraphs and a supporting button to each precise programme session, with the all-tutorials programme link in the Accepted Tutorials introduction. The shared index includes that section and four short topic labels while preserving full headings and target IDs.

Below 768px, the existing native button enhancement collapses only content after each title. The title and date/time/room badges remain visible; contextual “Show details”/“Hide details” names, `aria-expanded` and `aria-controls` follow the disclosure state. Buttons and Tutorials mobile index links retain the 44px minimum. Without JavaScript all static card content stays visible. This refinement adds no palette, font, global component token, custom runtime, animation or raster asset.

### Programme Timeline

Ordered daily timelines connect the time headings and parallel session cells with a slate rail. Copper marks the current point and heading. From 768px, a navy navigator combines named native day/range controls and previous/next actions, all at least 44px high. Below 768px, its compact “Choose time” button opens a native daisyUI dialog with day/time buttons and session previews. Choosing or dismissing preserves the page position; confirmation makes the jump. A mobile return action restores the previous reading position. The dialog keeps its confirmation visible, contains scrolling and returns focus on closure. The navigator follows visible filtered stops and manual scrolling, preserves control focus through jumps and uses immediate scrolling under reduced motion. The static schedule remains readable without JavaScript; print hides the navigator and picker.

The session action row now contains the agenda button without a repeated “Session link”. Stable article IDs, precise tutorial return paths and calendar URLs continue to support direct navigation. Removing a visible saved session from My agenda returns focus to its visible agenda control.

### Interactive Venue Map

The map retains a textual hotel list and a static image fallback. Hotel markers outside the painted viewport leave the tab order; redraws and popup closure preserve focus on a visible marker or map control. Camera and route motion respects the visitor's motion preference and the explicit pause control.

## Do's and Don'ts

### Do:

- **Do** use the existing `icaif` semantic colors and font assignments.
- **Do** align new content with the shared container and responsive gutters.
- **Do** keep visible keyboard focus, wrapping button labels and the established 44px action minimum.
- **Do** retain content-specific layouts and the incumbent home-page exceptions.
- **Do** preserve readable dates, meaningful table relationships and focus through dynamic updates.

### Don't:

- **Don't** replace the established navy, white, slate, copper or Inter identity when extending the site.
- **Don't** force tables, programme sessions, sponsor groups and portraits into identical cards.
- **Don't** rewrite factual titles, sponsor brands or functional labels solely to satisfy a static design heuristic.
- **Don't** erase useful state feedback when reducing motion or infer a contrast verdict without the rendered background and state.

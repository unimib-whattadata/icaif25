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
---

# Design System: ICAIF '26

## Overview

This record preserves the identity already implemented in the ICAIF website. Navy navigation and internal page headers frame white and slate content surfaces; Inter supplies the interface hierarchy, and copper identifies a priority action or a saved programme choice. Merriweather remains the home introduction's established exception.

The shared styles define the reusable system. Individual surfaces retain the layout their content needs: reading columns, tables, sponsor groups, committee portraits and the programme's chronological session cells. The programme is an extension of this system, with its detailed usage recorded in `.impeccable/surfaces/programme-html.md`.

**Key Characteristics:**

- Navy framing with white and slate content surfaces.
- Inter interface typography and the existing Merriweather home introduction.
- Native daisyUI controls using the `icaif` semantic theme.
- Shared alignment and responsive gutters, with content-specific layouts.

Recorded from `css/tailwind.input.css`, `css/fonts.css`, `css/tailwind.min.css`, `docs/ui-conventions.md`, `index.html`, `workshop.html`, `programme.html` and `css/programme.css`. Frontmatter colors and radii retain the theme's existing names and values; typography and spacing entries describe the shared utilities' mobile defaults. This documentation does not change the runtime tokens. Only the used palette sampled here is listed; the source theme also defines other semantic status colors.

## Colors

The palette combines cool navy and slate with a warm copper action accent. Frontmatter owns the recorded values; `css/tailwind.input.css` remains the implementation source.

### Primary

- **Conference blue** (`primary`, `primary-content`): the existing semantic primary color, used by links, interface emphasis and the internal header overlay.
- **Copper** (`accent`, `accent-content`): the established priority-action color. The programme also uses it for saved-session buttons and targeted-session outlines.

### Neutral

- **Navy** (`neutral`, `neutral-content`): navigation and page-header framing. The programme reuses the pair for the selected day and My agenda state.
- **White** (`base-100`): reading surfaces, fields and programme session cells.
- **Pale slate** (`base-200`): quieter content bands and the programme's break and registration cells.
- **Slate rule** (`base-300`): dividers and boundaries between adjacent programme sessions.
- **Dark slate** (`base-content`): text on white and pale slate.

The existing **error red** (`error`) identifies saved-session overlaps in the programme. It remains a status color.

**The Existing Identity Rule.** Extend the `icaif` semantic palette and established font assignments when adding a surface.

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

## Layout

The shared content container is centered with an 80rem maximum width. Gutters use `container-gutter`, `container-gutter-sm` from 640px, and `container-gutter-lg` from 1024px. Reading columns align with the page heading and use a 48rem maximum width.

Main section padding uses the `section-space` family. Long reading pages use the `document-gap` family, increasing at 640px. The shared footer and programme disclosures switch at 768px; the navigation's desktop arrangement begins at 1024px. The home university, statistics and sponsor bands retain their compact spacing.

**The Content Layout Rule.** Keep tables, programme sessions, sponsor tiers and portraits in the layouts suited to their content, while preserving the shared alignment.

## Elevation & Depth

The site combines tonal surfaces with restrained native component depth. Light navigation dropdowns use the existing small shadow; native buttons and fields retain daisyUI depth where their surface does not override it. The programme deliberately removes button shadows and separates flat session cells with slate rules. This local treatment does not prohibit shadows elsewhere in the incumbent site.

The sidecar records the sampled dropdown shadow and native state motion. Shared reduced-motion CSS disables prolonged transitions and animations when the visitor requests reduced motion.

## Shapes

Fields and buttons use the `field` radius, badges use `selector`, and native cards and light dropdown containers use `box`. The theme's border width is 1px. Programme session cells form a square-edged grid with 1px separation; they retain a content-specific silhouette within the existing rounded control system.

## Components

### Buttons

Native daisyUI actions use the field radius and semantic color pairs. Main-content buttons have at least 44px height, automatic height, 12px vertical padding and wrapping labels. A page's priority action uses `btn btn-accent btn-lg` and `data-priority-action`; supporting actions use native `btn` variants. Native hover, active and focus rules remain in effect unless a surface supplies an explicit override.

### Badges

Badges carry short metadata or status labels. The programme uses a white badge with a slate border for session type and an outlined light badge for its preliminary status on the navy header. These labels have no invented interactive behavior.

### Cards / Containers

Native cards use the box radius and a body padding default of 24px; existing mobile workshop and committee layouts provide their own overrides. Cards do not replace every content format. Programme sessions use flat adjacent cells, preserving parallel choices within a time group.

### Inputs / Fields

The programme uses native daisyUI `input` and `select` controls with visible labels. Fields are 46px high; their text is 14px on larger screens and 16px below 640px. Placeholder text uses `base-content` at 75% opacity. Inputs retain native focus treatment; labels and placeholder text serve different roles.

### Navigation

The existing navy navigation includes light dropdown menus with explicit dark text. The current page's desktop navigation state uses a light tonal fill over navy. Mobile navigation keeps reachable controls with at least 44px height and closes with Escape or an outside click through the shared script.

Shared keyboard focus CSS uses an offset outline, and native controls also supply their component focus rules. Text links retain offset underlines.

## Do's and Don'ts

### Do:

- **Do** use the existing `icaif` semantic colors and font assignments.
- **Do** align new content with the shared container and responsive gutters.
- **Do** keep visible keyboard focus, wrapping button labels and the established 44px action minimum.
- **Do** retain content-specific layouts and the incumbent home-page exceptions.

### Don't:

- **Don't** replace the established navy, white, slate, copper or Inter identity when extending the site.
- **Don't** force tables, programme sessions, sponsor groups and portraits into identical cards.
- **Don't** rewrite factual titles, sponsor brands or functional labels solely to satisfy a static design heuristic.

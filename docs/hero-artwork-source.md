# ICAIF wave hero — 17 November 2026

The user requested a new background coordinated with the conference graphics made in Figma, using the imagegen skill. The selected artwork was generated with **built-in image_gen**, rather than the CLI, and applied to the home hero.

## Visual source and prompt

The [ICAIF Figma certificate master](https://www.figma.com/design/gVxYd7064IxKLVYlDIaeDW?node-id=526-36) was visually inspected. Its fine white/icy-blue wave meshes, dotted contours, sparse connected points and thin orange orbit informed the written style specification. This was a new generation, not an image edit; no Figma file was modified.

The composition reserves a quiet navy area for the live HTML heading and copy, concentrating the wave structure on the right and along the bottom. The palette follows the existing navy, petrol blue and copper identity. No text, logos or interface controls are baked into the image.

The exact final prompt is saved in [`assets/hero/icaif-waves-hero-v1.prompt.txt`](../assets/hero/icaif-waves-hero-v1.prompt.txt). Each image has a `.json` sidecar recording the prompt, tool, source, dimensions and master hash.

## Saved assets

| File | Dimensions | Bytes | Purpose |
| --- | --- | ---: | --- |
| `assets/hero/icaif-waves-hero-v1.png` | 1774 × 887 | 2,079,345 | Generation master |
| `img/hero/icaif-waves-hero-v1-1774.webp` | 1774 × 887 | 180,768 | Large responsive source |
| `img/hero/icaif-waves-hero-v1-960.webp` | 960 × 480 | 47,902 | Small responsive source |
| `img/hero/icaif-waves-hero-v1.jpg` | 1774 × 887 | 385,636 | Browser fallback and social image |

The original generated file remains untouched. WebP and JPEG derivatives were encoded locally from the copied PNG master. The filename is versioned so a future revision can preserve this artwork.

## Integration

`index.html` uses a static decorative `picture`, responsive WebP sources, a JPEG fallback, intrinsic dimensions and high fetch priority. The image has an empty alternative inside an `aria-hidden` wrapper. A 20% navy overlay and left-aligned cover crop preserve the quiet area behind the copy, especially on phones. Existing text, dates, typography and actions remain live HTML.

The former home day-cycle runtime and its dedicated tests were retired. Its four city photographs were subsequently removed with the media kit at the user's request. Open Graph, Twitter and the shared structured-data image reference the new artwork with matching dimensions and an accurate generation credit. Shared CSS cache version: `2026111706`.

## Verification

- `npm run build` passed, including 65 automated tests, HTML validation, generated-route parity and local-link checks for 23 pages.
- Browser checks covered phone (390 × 844), tablet (768 × 1024), the normal desktop viewport (1055 × 860) and an earlier 1280 × 900 desktop check. The image loaded, text remained readable and there was no horizontal overflow. The temporary viewport override was reset and the home preview was left open.
- The programme's main content remains byte-for-byte identical to the saved pre-cleanup baseline.
- `git diff --check` passed.

The changes are in the local workspace and preview; no production deployment was performed.

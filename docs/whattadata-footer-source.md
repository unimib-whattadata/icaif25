# WHATTA DATA footer artwork

On October 31, 2026, the user requested a cube-based corner illustration using imagegen, then explicitly selected the first generated version for the website and requested that the image link to WHATTA DATA's site. The subsequent full-logo variants were not selected.

- Brand reference: https://www.figma.com/design/aKO3ZEpV9U53HPyvNSXBz4/LOGHI?node-id=164-2
- Reference screenshot: `assets/branding/whattadata-logo-reference.png`.
- Selected original: `assets/branding/whattadata-cubes-v1.png`, 1536 × 1024, RGBA, generated with the built-in imagegen tool and `transparent_background: true`. The generated artwork is a decorative interpretation of the supplied brand reference, rather than the official logo export.
- Exact generation prompt: `assets/branding/whattadata-cubes-v1.prompt.txt`.
- Served derivatives: `img/branding/whattadata-cubes-v1-384.webp` and `img/branding/whattadata-cubes-v1-768.webp`, converted with cwebp at quality 88 / alpha quality 100, with the original aspect ratio and alpha retained. The served files are approximately 12 KB and 32 KB.
- Destination: https://whattadata.it/, verified against the live company homepage and company LinkedIn profile on October 31, 2026.

The shared footer uses a native daisyUI link around the whole image, with a descriptive accessible name, a new-tab notice and `noopener noreferrer`. The artwork is at most 352 px wide; responsive sources, intrinsic dimensions and lazy loading keep it light. The footer does not depend on JavaScript for this link.

Following the user's annotated placement correction, Home's full Microsoft CMT acknowledgement sits higher in the footer's introductory `aside`, immediately below the conference description. The acknowledgement text is preserved and its former full-width padded band is removed. The artwork is bottom-aligned with copyright and Privacy Policy to its left at every breakpoint. From 768px it uses the existing whitespace below Previous Editions/Contact and alongside Quick Links; it no longer creates an additional full-width band. On phones the legal copy and image share two columns; a right-aligned 7:8 object-fit frame crops only unused transparent space from the source. The site keeps the existing navy theme and focus styles.

Verification: the full build passed all 57 existing tests, JavaScript syntax, HTML validation, route parity and the 21 canonical-page checks. Following the final placement correction, HTML and site checks were repeated. Browser inspection confirmed loaded images, keyboard focus and no horizontal overflow at 320/390/1280px. Clicking the image opened the live WHATTA DATA homepage in a new tab. Desktop evidence including the complete footer is `.codex-artifacts/whattadata-footer-20261031/footer-final.jpg`; this is a local preview change, not a publication.

## Final bottom alignment

The user's subsequent annotations clarified that the image must occupy the empty space alongside the footer links, remain aligned to the bottom of the footer and place Privacy Policy on its left. The final local layout implements these requests across all shared footers. Browser checks at 320, 390, 768, 887 and 1280px found no horizontal overflow or overlaps with the navigation or Privacy Policy. The artwork ends 24px above the footer edge, sharing the legal copy's bottom alignment. At 1280px the Home footer is approximately 868px tall, compared with 1072px before moving the artwork into the existing space. The native link destination and focus treatment are retained. Final evidence: `.codex-artifacts/whattadata-footer-20261031/footer-bottom-320.jpg` and `footer-bottom-aligned.jpg` in the same directory.

## Flush right edge and removal of glow

The user subsequently requested alignment with the actual right page edge, with some cubes cut at that edge, then requested removal of glow. The built-in imagegen tool edited the selected v1 composition in two stages. The current original is `assets/branding/whattadata-cubes-edge-v2.png` (1536 × 1024 RGBA), and the exact two prompts and input chain are `assets/branding/whattadata-cubes-edge-v2.prompts.json`. The initial image and prompt remain preserved. The intermediate edge edit is not shipped.

Current served assets are `img/branding/whattadata-cubes-edge-v2-384.webp` and `img/branding/whattadata-cubes-edge-v2-768.webp`, converted at quality 88 / alpha quality 100 without retouching or removing the generated alpha. The image cuts two cube faces at the right boundary while retaining the whole white wordmark. Rendered inspection on navy confirms no visible glow. The transparent regions retain hidden RGB information from generation; it is the alpha-composited result, rather than RGB alone, that defines the actual appearance.

The desktop anchor has `right: 0`, independent of the centered text container. On phones, its negative end margin and corresponding width extension consume the footer gutter to meet the page edge. The existing bottom alignment, left-hand legal links, image link and new-tab notice remain. Footer overflow is clipped horizontally without introducing a horizontal scrollbar. Browser evidence is `.codex-artifacts/whattadata-footer-20261031/footer-edge-no-glow.jpg`; mobile evidence is `footer-edge-no-glow-320.jpg` in the same directory.

## Powered by credit

At the user's request, a live HTML “Powered by” span now precedes the visible WHATTA DATA wordmark on the same line. It inherits the site's Inter font (10px on phones, 12px from 768px), rather than being baked into the image. Its position uses the selected source wordmark's measured left edge (783 / 1536) and baseline area, adjusted for the mobile object-fit crop. The native link's accessible name is “Powered by WHATTA DATA (opens in a new tab)”. Privacy Policy keeps a content-width hit area so it does not overlap the mobile credit. No raster or generation prompt changed for this text addition.

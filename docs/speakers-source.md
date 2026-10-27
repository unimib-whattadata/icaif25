# Home speaker portraits

## Our speakers — October 27, 2026

Marco authorized the changes requested in Andrea Prampolini's October 27 email. The homepage section is now “Our speakers”, covering all twelve named participants without classifying every person as a keynote. The six existing speakers, their approved studio portraits and dates are retained. Six additional participants have portraits and verified affiliations; no unconfirmed speaking dates are assigned.

| Addition | Affiliation and portrait evidence |
| --- | --- |
| Anastasia Borovykh | Executive Director, Capital Fund Management, from her [professional page](https://abrvkh.github.io/); `square_photo.png` converted proportionally to WebP. |
| Marc Mézard | Professor of Theoretical Physics, Bocconi University, from his [official faculty profile](https://cs.unibocconi.eu/faculty/marc-mezard). The existing committee studio portrait is reused. |
| Fabio Mercurio | Global Head of Quantitative Analytics, Bloomberg. His supplied LinkedIn profile was unavailable; the current [QuantMinds speaker profile](https://informaconnect.com/quantminds-international/speakers/fabio-mercurio/) supplies the role and original photograph recorded below. The LinkedIn URL supplied in the email is retained as source documentation. |
| Rama Cont | Professor of Mathematics, University of Oxford, with portrait from the [official Oxford profile](https://www.maths.ox.ac.uk/people/rama.cont). |
| Charles-Albert Lehalle | Professor, École Polytechnique, with photograph from his [official professional page](https://www.cmap.polytechnique.fr/~charles-albert.lehalle/). |
| Huyên Pham | Professor of Applied Mathematics, École Polytechnique. The supplied finance.math.upmc.fr page timed out; the [official applied mathematics faculty directory](https://www.polytechnique.edu/node/147) confirms the appointment and provides `photo_pham.jpg`. |

Five downloaded source photographs remain in `img/speakers/`, with source URLs in adjacent JSON sidecars. Their initial conversion only resized proportionally and encoded WebP. The subsequent studio background update below supplies the versions now served on Home. Circular cropping follows the existing homepage CSS. These instructions supersede the earlier keynotes-only preview scope below.

At Marco’s subsequent request, all six added speaker names are plain H3 text, matching the existing names. External profile URLs are retained only as source documentation.

## Uniform speaker backgrounds — October 27, 2026

Marco requested that the six additional portraits use the same background as the existing speaker photographs. The built-in image generator edited each target separately, using `assets/speakers/studio-backdrop-v1.png` as the approved backdrop and the existing Daniele Magazzeni studio portrait solely as a background/framing reference. The prompts request background replacement and uniform-scale square framing while preserving identity, facial geometry, expression, gaze, head turn, clothing and original facial illumination.

The six served assets are `img/speakers/studio/{anastasia-borovykh,marc-mezard,fabio-mercurio,rama-cont,charles-albert-lehalle,huyen-pham}-v1.webp`, each 640 × 640 pixels. The source photographs, existing keynote assets and committee copy of Mézard are preserved. Full-resolution outputs are copied into `output/keynote-studio/full-resolution/`; exact per-image prompts and source paths are recorded in `docs/keynote-studio-prompts.json` and adjacent JSON sidecars.

The portraits were visually compared with their sources and approved backdrop before replacing the Home references. The smaller Rama Cont and Huyên Pham originals limit fine-detail comparisons. No new speaker copy, dates, global styles or layout changes are part of this background update.

## Session-date context — October 27, 2026

At Marco's request to clarify what the dates refer to, each existing dated badge now combines the confirmed appearance format and day: Keynote for Capponi, Magazzeni, Barr and Pasquali; Fireside chat for Micillo and Savi. These formats follow the current programme or the confirmed Barr announcement. The dates retain their existing brochure/organizer sources and machine-readable datetime attributes. A badge highlights one confirmed appearance rather than enumerating every contribution by that person. No date is inferred for any additional participant. The native orange badge treatment remains, and Capponi's existing programme link now has a 58px touch target.

Requested by Marco on October 23, 2026, based on Andrea Prampolini's email “ICAIF web site”, received October 23, 18:53 Europe/Rome. The request names Mézard, Capponi, Mercurio, Borovykh, Rama Cont and Lehalle as additions to the brochure-style keynote section.

## Keynote group

The five names and portraits come from slide 4, embedded `ppt/media/image8.png`, of the attached `ICAIF2026_Join_Us (3).pptx`. Each circular portrait was cropped without retouching and saved as WebP: Michael Barr, Daniele Magazzeni, Mauro Micillo, Stefano Pasquali and Raffaele Savi. Their organizations are reproduced from the supplied brochure. Role titles and exact times are omitted: the brochure and current programme differ, and the brochure's Barr title is outdated. At Marco's request, the displayed calendar dates follow slide 4 of the supplied brochure: November 16, 2026 for Daniele Magazzeni and Michael Barr; November 17, 2026 for Mauro Micillo, Raffaele Savi and Stefano Pasquali. The existing programme remains the destination for session details.

## Additional participants — removed from this preview

This group has its own heading and makes no keynote classification.

| Person | Affiliation evidence and portrait origin |
| --- | --- |
| Marc Mézard | Existing `organisation.html`: Bocconi University; reused `img/committee/studio/marc-mezard-v1.webp`. |
| Agostino Capponi | [Columbia official profile](https://ieor.columbia.edu/content/agostino-capponi); image `https://ieor.columbia.edu/sites/ieor.columbia.edu/files/styles/custom_crop_directory/public/content/images/capponi-headshot.jpg.webp?itok=Yx8wrGuN`. |
| Fabio Mercurio | [QuantMinds speaker profile](https://informaconnect.com/quantminds-international/speakers/fabio-mercurio/); image `https://knect365.imgix.net/uploads/crop-33-Fabio-Mercurio--3eac5bd64c81e92e7a7391533dfc92ea-31429074a93cb8059bd6ec4a77930291.jpg?auto=format&fit=max`. |
| Anastasia Borovykh | [Personal professional page](https://abrvkh.github.io/) states Executive Director at Capital Fund Management; image `https://abrvkh.github.io/square_photo.png`. This is more current than the honorary Imperial profile. |
| Rama Cont | [Oxford official profile](https://www.maths.ox.ac.uk/people/rama.cont); image `https://www.maths.ox.ac.uk/system/files/styles/profile/private/users/photos/RamaCONT-HiResPortrait.jpg?h=3fe45f0e&itok=cWyOY9fQ`. |
| Charles-Albert Lehalle | [École Polytechnique official personal page](https://www.cmap.polytechnique.fr/~charles-albert.lehalle/) states Professor since September 2024; image `https://www.cmap.polytechnique.fr/~charles-albert.lehalle/assets/charles-ADRiO.jpg`. |

Public photographs are resized proportionally, saved locally as WebP and cropped into circles only through the HTML layout. No faces were generated or retouched. This is a local website preview; publication rights for externally sourced portraits have not been independently established.

## Current scope

Following Marco’s correction on October 23, the homepage displayed only the five keynote speakers from the brochure. The six additional participants were omitted and the five new external portrait files were removed. The table above records prior sourcing work. Agostino Capponi has since been added as a keynote speaker at Marco’s request on October 26; the other five additional participants remain omitted.

## Approved studio treatment — October 23, 2026

Marco approved the navy/slate photographic studio backdrop with a restrained copper accent, and then requested matching lighting and color across all five keynote portraits while preserving their facial features, expressions and clothing. The built-in image generator edited each original separately. The new opaque square images are locally saved in `img/speakers/studio/` as `*-v1.webp` (640px), while the original brochure crops remain unchanged. The website retains its existing circular CSS crop. The full-resolution edits are preserved in `output/keynote-studio/full-resolution/`, and the approved backdrop is `assets/speakers/studio-backdrop-v1.png`. Exact per-portrait prompts are in `docs/keynote-studio-prompts.json` and embedded provenance sidecars. The previous statement that no portraits were edited describes the earlier preview only. This remains an unpublished local preview.

## Speaker roles — October 23, 2026

At Marco’s request, speaker descriptions now include the roles from slide 4: Chief AI Officer at UBS (Magazzeni); Chief of IMI Corporate & Investment Banking Division (Micillo); Senior Managing Director and Global Head of BlackRock Systematic (Savi); Executive Vice President, Domyn SpA (Pasquali). Barr uses “Governor of the Federal Reserve” because the [official Federal Reserve biography](https://www.federalreserve.gov/aboutthefed/bios/board/barr.htm), checked October 23, 2026, states that his Vice Chair for Supervision role ended February 28, 2025. This supersedes the earlier omission of role titles.

## Agostino Capponi — October 26, 2026

Marco requested Capponi’s addition to the keynote speakers and completion of his profile based on Claudio Tebaldi’s emails. [Claudio’s email with Capponi’s details](https://mail.google.com/mail/u/?authuser=marco.cremaschi%40unimib.it#all/1a17767776af4c7b) supplies: Professor; Department of Industrial Engineering & Operations Research and Columbia Business School; Columbia University; personal website <https://www.columbia.edu/~ac3827/>. The homepage reproduces these details and links the November 15 date to his programme entry. The proposed 11:00 time remains subject to agreement with DXC, so the homepage gives only the confirmed date and does not invent a talk title or biography.

At Marco's request, the “Personal website” link and the department/business-school detail were removed from Capponi's homepage card on October 26. The card retains “Professor, Columbia University”; the full affiliation and URL above are retained as source documentation.

At Marco's request, the initials avatar was replaced on October 26 by the portrait from his [official Columbia IEOR profile](https://ieor.columbia.edu/content/agostino-capponi), using the [original image](https://ieor.columbia.edu/sites/ieor.columbia.edu/files/content/images/capponi-headshot.jpg). The original 300px JPEG is retained at `img/speakers/agostino-capponi-original.jpg`. The built-in image generator matched the approved navy/slate backdrop, restrained copper accent, lighting, color and head-and-shoulders framing of the other keynote portraits, with instructions to preserve Capponi's facial features, expression and head tilt. The generated square portrait is saved as a 640px WebP at `img/speakers/studio/agostino-capponi-v1.webp`, with the same circular crop, display size and loading behavior as the other five speakers. The exact prompt and source provenance are saved in its JSON sidecar and `docs/keynote-studio-prompts.json`.

The six keynote cards use a responsive grid with three columns from the small breakpoint and six from the extra-large breakpoint. The user's removals of the personal website link and department paragraph remain in place.

# Alessandro Provetti portrait

Mode: built-in imagegen, identity-preserving edit.

Source: `img/committee/alessandro-provetti.jpg`, the portrait attached to “Aggiornamento Alessandro”.
Style references: `img/committee/studio/carlo-ambrogio-favero.webp` and `img/committee/studio/claudio-tebaldi.webp`.
The second edit reduces the subject's scale to match the neighbouring portraits.
Final outputs: `img/committee/studio/alessandro-provetti-v2.png` (full-size 1448 × 1086 portrait) and `img/committee/studio/alessandro-provetti-v2.webp` (480 × 360 website asset).

## Initial studio treatment

```text
Use case: identity-preserve
Asset type: 4:3 landscape photographic portrait for the ICAIF conference organising committee website.
Primary request: Edit Alessandro Provetti's portrait (Image 1) to match the photographic studio style and framing of the other Local Chairs (Images 2 and 3).
Input images: Image 1 is the edit target and sole identity reference. Images 2 and 3 are style/composition references ONLY; do not copy their faces or clothing.
Scene/backdrop: Replace the white background with the SAME mottled blue photographic studio backdrop as Images 2 and 3: dark navy edges, subdued brighter medium blue behind the subject's head and shoulders, subtle photographic texture.
Subject: The exact man from Image 1. Preserve his recognisable facial structure, age, receding hairline, brown/grey hair, beard, black rectangular glasses, skin texture, eye colour and friendly subtle expression. Keep the same blue-and-white striped open-collar shirt.
Composition/framing: Output a single 4:3 landscape image, straight-on and centred, showing head and upper chest/shoulders as in the references. Scale his face to the same size in the frame as the reference portraits, with comfortable space above his head. Head top around 10% of image height, chin around 70%, shoulders fill the lower half; no tight passport crop. Preserve natural body proportions and direct gaze.
Lighting/mood: Match soft professional studio illumination and gentle shadows of the reference portraits while retaining realistic skin detail.
Constraints: Change only the background, lighting harmonisation and framing needed to match the references. Preserve identity and existing clothing. Output only the final photographic portrait, no collage, no UI card, no lettering, no border, no watermark. Avoid beautification, age changes, synthetic skin or facial feature changes.
```

## Final framing prompt

```text
Use case: identity-preserve
Asset type: ICAIF organising committee studio portrait, 4:3 landscape.
Primary request: Correct ONLY the framing of the portrait in Image 1. His head looks too large beside the two reference portraits; make the person approximately 15% smaller within the same 4:3 frame, showing more upper torso and blue background. This is a zoom-out/reframing edit, not a new face.
Input images: Image 1 is the current studio portrait and edit target. Image 2 is the original source photo, identity check ONLY. Images 3 and 4 are the other two Local Chairs, framing/style references ONLY; never copy their faces or clothing.
Composition target: Match the head size of Images 3 and 4. Center the man horizontally. The top of his scalp must be about 10% down from the top; the bottom of his chin around 63–65% of the total image height, so scalp-to-chin is about 54% of the frame height (currently about 64%). Reveal more of his striped shirt and upper torso at the bottom, with natural shoulders and some blue space at the sides. Maintain the existing head-to-body proportions. Keep the output canvas exactly 4:3 landscape.
Invariants: Preserve EXACT facial identity, facial geometry, age, glasses, receding hairline, beard, skin detail, gaze and subtle friendly expression from Image 1 and original Image 2. Keep the same blue-and-white striped open-collar shirt, the same mottled navy/medium-blue studio background and the same soft lighting. Change only camera distance/framing/scale of the entire subject, extending shirt/background naturally as needed. No beautification, facial reshaping, clothing changes, text, border, watermark or collage. Output ONE final photograph.
```

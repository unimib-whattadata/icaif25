# Conference room screensaver

Open `/screensaver/` on a desktop display. Move the mouse to reveal the controls; the menu recedes after 3.5 seconds away from the controls. Keyboard interaction also reveals it.

- **Display → Logo:** static ICAIF identity, moving orange orbit light and animated waves.
- **Display → Programme:** choose a conference day and the exact room. Full session titles and Milan-local times come from `data/programme.json`. More than five sessions use two chronological columns, read down the left column and then down the right.
- **Layout → Compact:** reduces the programme typography and spacing for a denser view.
- **Pause / Resume:** stops or restarts both waves and the orange light. Space provides the same action outside form controls.
- **Fullscreen:** requests browser fullscreen; F also toggles it outside form controls. If the browser blocks the request, use its own fullscreen command. Escape exits browser fullscreen.

The selected mode, day, room and layout are saved locally and included in the URL. Save or copy that URL for each room; explicit valid URL settings take precedence over locally saved settings. For example:

`/screensaver/?display=programme&day=2026-11-16&room=Main+Hall&density=comfortable`

On the current date in Milan, the programme automatically highlights the session in progress with an orange time, rule and **Now** label. Other sessions remain readable at reduced opacity, with no change in size or position. Between sessions (and before the first one), the next start receives the highlight and **Next** label. Concurrent sessions share the highlight. After the last session, or when viewing another date, all rows return to equal emphasis.

The clock updates at each minute boundary and immediately on returning to the tab, even when animation is paused. The selected day remains fixed until changed. Empty room/day combinations have an explicit message; a failed programme request offers Retry.

The 12 sponsor logos remain visible at rest in both modes. Reduced motion starts with a static frame. Without JavaScript the logo, sponsors and original wave artwork remain visible; programme selection requires JavaScript. Unavailable WebGL uses the same original artwork. Fullscreen wake lock is best effort and depends on the browser and operating system.

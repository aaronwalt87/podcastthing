# AW–01 — Personal information console

Active design direction: September 2026. Inspired by the physical design of
Teenage Engineering's EP–133: warm gray molded panels, black displays, orange
controls, printed labels and raised keys. AW–01 is Aaron's original identity.
No Teenage Engineering branding, product photography or product claims are used.

## Design system

`src/app/globals.css` owns the palette, typography, surfaces and control recipes.
Legacy `ink-*` names are light surfaces; `paper*` are text. `olive*` names remain
compatibility aliases for neutral charcoal and gray; no green theme remains.

- Ground: warm gray `#e5e3df`; panels: `#f1f0ed` and `#ddd9d3`.
- Text: `#22211f`, `#494641`, `#5b5751`.
- Display: `#181918` with warm white readouts and restrained blue/orange signals.
- Orange physical controls: `#ff5c24` with dark text. Orange text on light
  surfaces uses darker `--ember: #a93412` for readable contrast.
- Radii: 2–6px. Squared buttons, restrained bevels and 2–4px key shadows.
- Instrument Sans for titles and body; JetBrains Mono for data and labels.
- Compact titles, numbered channels, thin rules and clear data hierarchy.
- Literal palette values are allowed in global tokens and generated metadata
  images. Components use tokens.

## Hero console

`Console.tsx` is a real three-channel control surface. News shows feed/source
counts, Markets shows a real quote and its daily history, Podcasts shows the
latest/current episode. Channel buttons have persistent `aria-pressed` state.
Search opens the existing palette, the orange action follows the selected channel: Read news, Open markets, or
Play/Pause episode. Podcast volume and mute use a labeled native slider and
button beneath the channel controls; a secondary link opens the archive.
The selected channel uses a pressed light key as well as its status indicator. No audio starts automatically.
An empty archive disables playback; empty data is described truthfully.
The news bars are decorative channel artwork, not fabricated live telemetry.

Native scrolling drives `--scene-progress` through the bounded ScrollScene
controller. The chassis rotates into place with its printed nameplate and speaker grille
fixed to its surface. Only the display and key bank settle at different depths. Raised channel keys settle in sequence.
No wheel/touch interception or per-frame React state. The hero pins for 145svh
on desktop (>=1000px wide, >=900px high). Phones, tablets and short screens
use normal flow with the same assembly motion as the console enters view. Reduced motion removes pinning
and all assembly transforms and leaves every control accessible.
Without JavaScript the site remains readable and navigation still works.

## Rest of the site

Shared chrome uses an AW–01 nameplate, rectangular navigation keys and gray
surfaces. Page mastheads are inset panels with numbered channel labels. News
filters, market boards, podcast covers, player and admin use the same tokens.
Black chart displays draw only the actual market series; generated mountain
ridges and the old sculpture system have been retired. Existing APIs, storage,
authentication, caching, sorting, filtering and audio persistence remain intact.

## Accessibility and verification

- Native buttons/links/ranges, visible focus and keyboard controls.
- Readable semantic text colors verified against all normal light surfaces.
- Dark labels on bright orange keys; warm white on black displays.
- Signed market values, source labels, timestamps and transcript availability.
- Reduced-motion and increased-contrast preferences supported.
- Player clearance, skip link, hidden disclosure behavior and focus management
  remain in place. Engraved ornamental text may be small; action labels remain
  legible and have accessible names.
- Run `npm run lint`, `npm run build`, `node scripts/theme-check.mjs` and
  `node scripts/motion-check.mjs`; inspect the rendered console and routes.

Known limitation: third-party episodes may lack publisher transcripts. The
archive continues to disclose transcript availability and links to the source.

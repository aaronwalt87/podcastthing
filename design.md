# SIGNAL — Design System

**Status:** active. Oryzo-inspired editorial redesign, September 2026.
Supersedes the dark instrument-panel and Colorado-landscape presentations.

`src/app/globals.css` is the source of truth; `tailwind.config.ts` exposes those
tokens as utilities. Components use tokens, never raw hex colors. Metadata and
server-generated social images cannot inherit CSS and may mirror palette values.

## 1. North star

A personal technology publication with the confidence and tactility of a good
design studio. Oversized tight sans typography, warm paper, olive physical
objects, restrained orange interactions, and sections with room to breathe.
The influence is Oryzo's material realism, strong type, playful compositions,
and scroll storytelling—not its branding, assets, or commercial claims.

The content remains Aaron's: hands-on technology leadership, useful news,
market context, and a real podcast archive. Wit is understated and self-aware.
Wisconsin is home; Colorado was a visit, not a professional location.

Deliberately not: a dark terminal, a landscape-photography site, neon data glow,
glassmorphism everywhere, or a fake SaaS product with invented metrics.

## 2. Color and materials

Legacy `ink-*` names are **surface roles**, now light; `paper*` names are text
roles, now dark. This compatibility keeps data components consistent without
maintaining a second competing design system.

| Token | Value | Role |
|---|---|---|
| `--cream`, `--ink-950` | `#f2f1e9` | Page ground |
| `--ink-900` | `#faf9f3` | Raised paper panels |
| `--ink-850` | `#e9eade` | Muted surfaces |
| `--ink-800` | `#e1e3d6` | Artwork wells |
| `--olive-light`, `--ink-700` | `#d9dccb` | Pale olive material |
| `--ink-600` | `#b0b6a3` | Inactive tracks |
| `--charcoal`, `--paper` | `#252820` | Primary text |
| `--paper-2` | `#4b5146` | Body/secondary text |
| `--paper-3` | `#606657` | Metadata/placeholders |
| `--olive` | `#4b593c` | Sculptural objects and inverse feature areas |
| `--ember` | `#b34523` | CTA, links, focus, selection accent |
| `--ember-2` | `#963b20` | Accent hover |
| `--on-ember` | `#fff9ed` | Text on the accent |
| `--edge` | `#7b826e` | Interactive boundaries |

`--hair`/`--hair-2` are decorative lines, not sufficient boundaries for inputs.
`--chrome-bg`, `--overlay-bg`, `--scrim`, `--surface-hover`,
`--surface-active`, and `--highlight` describe material roles for shared chrome.
`--inverse-paper`, `--inverse-muted`, and `--inverse-hair` serve intentionally
dark material compositions.

`.inverse-band` scopes semantic surface/text/accent/data overrides to a dark
section. Its text remains warm cream, its accent is a readable light apricot,
and its controls and hairlines use local contrast values. Use this class when
shared components sit on charcoal; never patch inline styles by substring.

### Data semantics

| Token | Value | Role |
|---|---|---|
| `--pos` | `#267044` | Gains/live status |
| `--neg` | `#ad3345` | Losses/errors |
| `--warn` | `#85610d` | Warnings |
| `--cool` | `#365ea1` | Secondary data |

Gains are not the branding olive and losses are not the orange CTA. Every Delta
also has a signed number and direction glyph; heatmaps print percentages.
Alerts have dedicated text, border, and tinted-fill tokens.

## 3. Typography

Fonts are self-hosted through `next/font/google` in `src/app/layout.tsx`.

| Role | Family | Token |
|---|---|---|
| Display | Instrument Sans, 650 | `--font-display` |
| Body/UI | Instrument Sans | `--font-sans` |
| Data | JetBrains Mono, 400/500/700 | `--font-mono` |

`.display` uses `line-height: .96` and `letter-spacing: -.065em`. Hero/page
headlines scale fluidly with `clamp()`. Use generous composition around large
type, not extra ornament. Body is 15px/1.6; small labels remain at least 11px.
`.eyebrow` is 11px tracked uppercase mono. `.num` is tabular mono for prices,
dates, counts, durations, and percentages. Do not load Instrument Serif.

## 4. Geometry and motion

`--r-1: 6px`, `--r-2: 14px`, `--r-3: 24px`, `--r-4: 36px`.
Buttons and compact metadata chips are capsules. Panels are paper-like, softly
rounded objects with restrained shadows and a thin inset highlight. Main
surfaces must not become a stack of translucent glass cards.

`--ease-out` is `cubic-bezier(.22,1,.36,1)`; `--ease-spring` is reserved for
small press feedback. State changes take about 180ms, hover 300ms, and reveal
700ms. Scroll-linked ornament supports the hierarchy rather than blocking
reading. Do not hijack scrolling or make content depend on animation.

`.shell` is max 1320px with fluid 20–64px gutters. The fixed header reserves
80px. Player scroll clearance is 170px below 768px and 100px above it; actual
content must remain operable at 320px without hiding controls.

## 5. Shared recipes

`globals.css` owns `.shell`, `.panel`, `.panel-flat`, `.btn` variants,
`.field`, `.chip`, `.seg`, `.eyebrow`, `.display`, `.num`, `.rule`,
`.spotlight`, `.link-draw`, `.pulse`, and `.marquee`. Composition-specific
CSS modules may consume tokens, but must not create a competing global palette.

Keep existing behavior: sortable market tables, search/filter/pagination,
command palette, episode uploads/admin, audio transport and persistence.
No invented quotes, fake uptime, or fabricated live telemetry.

## 6. Interaction

- Spotlight writes `--mx`/`--my` to the DOM, never rerendering on pointer move.
- Reveal is visible before hydration, hides only mounted off-screen content,
  has a failsafe, and remains visible when IntersectionObserver is unavailable.
- Command palette uses Cmd/Ctrl-K; its opt-in single-key shortcut is suppressed
  while typing. It is a full combobox/listbox with focus return and a Tab trap.
- Player transport/queue state stays separate from frequently updating clock
  state. Keyboard shortcuts never steal input from focused controls.

## 7. Accessibility contract

Target: WCAG 2.2 AA; static checks complement rather than replace browser tests.

1. All controls retain a visible `:focus-visible` ring. On the standard light
   surfaces, ember is at least 4.55:1; cream button text exceeds 5:1 on ember.
2. Primary/secondary/tertiary ink are at least 12.32/6.74/4.89:1 on the three
   normal page/panel surfaces. Do not use tertiary ink on darker material wells
   without checking contrast. Check additional module-specific combinations.
3. `--edge` defines interactive boundaries; decorative hairlines do not. A
   selected segmented control retains its inset accent bar, not only a tint.
4. Color never stands alone: signed deltas, playing/paused labels, text alerts,
   and heatmap percentages remain. Every normal text label is at least 11px.
5. `prefers-reduced-motion` stops marquees, reveals, spinners, canvas animation,
   scroll-linked transforms and smooth scroll. Components subscribe to changes
   at runtime. Use CSS animations, never inaccessible SVG SMIL spinners.
6. `prefers-contrast: more` strengthens control edges, hairlines and both
   secondary ink levels in light and inverse materials.
7. The skip link precedes the header; `<main>` is focusable. Scroll padding
   keeps focused content clear of the fixed header and audio player.
8. Single-key shortcuts are off by default, opt-in per browser, and yield to
   focused controls via `FOCUSABLE_SELECTOR` (screen-reader quick navigation).
9. Filter/sort/pagination results use already-mounted polite live regions.
10. Decorative canvas/SVG is aria-hidden; meaningful data has text alternatives.
    Tables retain captions and aria-sort.
11. Palette options belong directly to their listbox; active descendant, scroll
    lock, focus trap and restored focus remain intact.
12. Reflow to 320px must not remove controls. Player rate and shortcuts remain
    behind an accessible disclosure at every viewport size.
13. `[hidden] { display: none !important }` deliberately beats display utilities;
    do not remove it when cleaning up override rules.

### Known audio limitation

Episodes are curated third-party audio. `transcriptUrl` links publisher-provided
transcripts; when absent, the UI links the episode page and discloses the gap.
A description is not a transcript. Episodes without publisher transcripts do
not conform to WCAG 1.2.1; the archive reports transcript availability.

## 8. Guardrails

- Run `node scripts/theme-check.mjs`, `npm run lint`, and `npm run build`.
- Never reintroduce retired neon palette values or dark terminal chrome.
- Never match serialized inline styles to apply a palette patch.
- Never use branding colors to replace signed data semantics.
- Never use a proportional font for changing numeric readouts.
- No chart-library dependency for simple sparklines or decorative hero objects.
- No API, authentication, storage, or data-contract changes for visual work.

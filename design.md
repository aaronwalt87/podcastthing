# SIGNAL — Design System

**Status:** active. Supersedes *Kernel Glass* (2026-04-19) and *The Analog Frontier*.

This document describes what is actually implemented. The tokens below live in
`src/app/globals.css` under `:root`, and `tailwind.config.ts` maps them to
utilities. **A component must never hard-code a hex value** — if a colour is
missing, add a token rather than a literal.

> Two previous systems were only ever half-applied, which left the site
> overriding one palette with another at runtime. That is the failure this
> document exists to prevent.

---

## 1. North star

An **instrument**, not a website.

Aviation panels, spectrum analysers, and well-made mechanical tools — things
built to be read at a glance and trusted. Dark surfaces so data can glow, one
warm accent so hierarchy is unambiguous, and typography with an editorial voice
so the page reads as a publication rather than a dashboard template.

Deliberately **not**: Matrix-green hacker cliché, glassmorphism-everywhere, or
a landscape-photography blog wrapped around tech content.

---

## 2. Colour

### Canvas

| Token | Value | Use |
|---|---|---|
| `--ink-950` | `#07080a` | Page ground |
| `--ink-900` | `#0b0d10` | Panel base (gradient bottom) |
| `--ink-850` | `#101318` | Panel top, flat surfaces |
| `--ink-800` | `#14181e` | Artwork wells, image backgrounds |
| `--ink-700` | `#1b2027` | Track backgrounds, inactive bars |
| `--ink-600` | `#262c35` | Scrollbar thumb, sparkline baselines |

### Ink

| Token | Value | Use |
|---|---|---|
| `--paper` | `#f2f0ec` | Primary text — a warm white, never pure `#fff` |
| `--paper-2` | `#9aa4ae` | Body copy, secondary labels |
| `--paper-3` | `#646d79` | Metadata, timestamps, placeholders |

### Lines

| Token | Value | Use |
|---|---|---|
| `--hair` | `rgba(255,255,255,0.07)` | Default 1px border |
| `--hair-2` | `rgba(255,255,255,0.13)` | Hover / emphasis border, dividers |

### Accent — one, and only one

| Token | Value | Use |
|---|---|---|
| `--ember` | `#ff6a2b` | CTAs, active nav, brand mark, focus ring, the hero series line |
| `--ember-2` | `#ffa877` | Hover state of the above, link hover |
| `--ember-ghost` | `rgba(255,106,43,0.13)` | Accent chip fill |

### Data semantics — never the accent

Keeping "up" out of the brand colour means a rising stock never reads as
"selected", and the accent never reads as "good news".

| Token | Value | Use |
|---|---|---|
| `--pos` | `#38c98e` | Gains, advancing, live indicator |
| `--neg` | `#f05a52` | Losses, declining, errors |
| `--warn` | `#f0b429` | Warnings |
| `--cool` | `#6fa8ff` | Reserved secondary data hue |

**Colour is never the only signal.** Every `Delta` pairs its hue with a ▲/▼
glyph and a signed number; the market heatmap prints the percentage inside each
tile.

---

## 3. Typography

Loaded and self-hosted by `next/font/google` in `src/app/layout.tsx` — no
third-party request, no layout shift.

| Role | Family | Token |
|---|---|---|
| Display | **Instrument Serif** 400 | `--font-display` |
| UI / body | **Instrument Sans** 400–700 | `--font-sans` |
| Data | **JetBrains Mono** 400/500/700 | `--font-mono` |

- `.display` — the serif. Headlines and pull quotes only. `line-height: 0.98`,
  `letter-spacing: -0.025em`.
- `.eyebrow` — 10px mono, `0.18em` tracking, uppercase. Section labels.
- `.num` — mono with `tabular-nums`. **Every number on the site**: prices,
  percentages, timestamps, counts, durations. Digits must not shift width as
  they tick.
- Body copy is sans at 15px / 1.6.

Headline sizes use `clamp()` rather than breakpoints, so type scales
continuously instead of stepping.

---

## 4. Radius, elevation, motion

| Token | Value | Use |
|---|---|---|
| `--r-1` | `2px` | Chips, segmented controls |
| `--r-2` | `6px` | Buttons, inputs, small cards |
| `--r-3` | `12px` | Panels |
| `--r-4` | `20px` | Reserved |

Elevation is a 1px inset highlight plus a long, soft shadow (`--shadow-lift`,
`--shadow-panel`) — light from above, the way a physical panel sits in a case.
No glow-as-elevation.

Motion uses `--ease-out` (`cubic-bezier(.22,1,.36,1)`) for entrances and
`--ease-spring` for press feedback. Durations: 180ms for state, 300ms for
hover reveals, 700ms for scroll entrances.

---

## 5. Component recipes

Defined once in `globals.css` under `@layer components`:

| Class | What it is |
|---|---|
| `.shell` | Page container — max 1320px, fluid gutters |
| `.panel` / `.panel-flat` | The one raised-surface recipe |
| `.btn`, `.btn-primary`, `.btn-ghost`, `.btn-sm`, `.btn-icon` | Buttons |
| `.field` | Text input, select, textarea |
| `.chip` / `.chip-accent` | Metadata tags |
| `.eyebrow`, `.display`, `.num` | Typographic roles |
| `.rule` | Section divider that fades at both ends |
| `.spotlight` | Cursor-tracked highlight (see below) |
| `.link-draw` | Underline that draws in from the left |
| `.pulse` | Live indicator with an expanding ring |
| `.marquee` | Market tape; pauses on hover and focus |

---

## 6. Interaction

- **Spotlight** (`Spotlight.tsx`) writes `--mx`/`--my` straight to the DOM node
  on pointer move — a cursor move never triggers a React render.
- **Reveal** (`Reveal.tsx`) renders content *visible* and only hides it after
  mount, and only when it sits below the fold. A failed hydration, a missing
  `IntersectionObserver`, or a dropped callback therefore leaves content
  showing rather than stranding a blank gap. A 2s failsafe backs that up.
- **Command palette** — `⌘K` / `Ctrl-K`, or `/` outside a text field. Full
  combobox semantics, roving `aria-activedescendant`, focus returned on close.
- **Player shortcuts** — space or `k` toggle, `j`/`←` back 15s, `l`/`→`
  forward 30s, `m` mute. Suppressed while typing.

---

## 7. Accessibility contract

Target: **WCAG 2.2 Level AA.** Checked every review round with computed ratios;
known gaps are named below rather than left implied.

1. Every interactive element takes a visible `:focus-visible` ring in `--ember`
   (7.0:1 on the page ground, 6.5:1 on a panel).
2. **Colour never carries meaning alone.** Every `Delta` pairs hue with a ▲/▼
   glyph and a signed number; heatmap tiles print the percentage; the playing
   episode carries a Playing/Paused chip, not just an ember row number;
   selected segmented controls carry a 2px inset `--ember` bar, because the
   background tint behind them is only 1.2:1.
3. Text contrast: `--paper` 17.6:1, `--paper-2` 7.9:1, `--paper-3` 5.1:1 on the
   page ground and 4.8:1 on a panel. **`--paper-3` must not be used on
   `--ink-700` or lighter** (4.2:1 there). Nothing renders text below 11px.
4. Control boundaries meet 1.4.11: `--edge` is 3.2:1 against a field's own fill
   and 3.3:1 against the page. `--hair` and `--hair-2` are decorative only and
   must never be the sole boundary of a control.
5. `prefers-reduced-motion: reduce` stops the marquee, the canvas rAF loop, the
   scroll reveals, the loading spinners and smooth scrolling. **No SMIL** — a
   CSS `.spin` class, so the media query actually reaches it. `SignalField` and
   `Reveal` re-evaluate the query at runtime, not only at mount.
6. `prefers-contrast: more` raises hairlines, control edges and both secondary
   ink levels, and widens the gap *between* them rather than narrowing it.
7. A skip link precedes the header; `<main>` is focusable; `scroll-padding-top`
   and `scroll-padding-bottom` keep focused elements clear of the fixed header
   and the fixed player bar (2.4.11).
8. **Single-key shortcuts are off by default** and opt-in per browser, because
   `j`/`k`/`l`/`m` collide with screen-reader quick-nav keys (2.1.4). The
   handler yields to whatever control has focus, via `FOCUSABLE_SELECTOR`.
9. Filter, sort and pagination results are announced with `aria-live="polite"`,
   into regions that are already mounted when their text changes.
10. Decorative canvas and SVG are `aria-hidden`; anything a hidden drawing
    captions carries its own text alternative. Data tables have a `<caption>`
    and `aria-sort`.
11. The command palette is a full combobox/listbox: roving
    `aria-activedescendant`, options owned directly by the listbox, Tab trapped
    inside the dialog, background scroll locked, focus returned on close.
12. Nothing is removed at a breakpoint to make a layout fit. The player's rate
    and shortcut controls sit behind a disclosure available at every width, so
    the bar reflows to 320px without losing functionality (1.4.10).
13. `[hidden]` is forced with `!important` in `globals.css`: a Tailwind display
    utility has the same specificity as the preflight rule and wins on cascade
    order, which silently leaves hidden elements on screen.

### Known limitation — audio-only content (1.2.1, Level A)

Episodes are **curated third-party audio**, not produced here, so the text
alternative is the publisher's own transcript, surfaced per episode through
`transcriptUrl`. Where a publisher provides none, the UI links the episode page
and says so to assistive technology rather than staying silent — a two-line
description is not an equivalent alternative and is never presented as one.

**Episodes without a publisher transcript do not conform to 1.2.1.** The archive
states how many of the listed episodes have one, so the gap is disclosed rather
than hidden. Adding a `transcriptUrl` in the admin form closes it per episode.

## 8. Don'ts

- **Don't** reintroduce `#00FF41`, `#FF3B3B`, `#67d7e1`, or the pine/sage
  palette. They belong to retired systems.
- **Don't** override one palette with another via attribute selectors on
  serialised inline styles. That is what the last redesign did, and it is the
  reason this rewrite exists.
- **Don't** use `--ember` for a data value, or `--pos`/`--neg` for branding.
- **Don't** ship a number in a proportional font.
- **Don't** add a chart library. Sparklines are server-rendered SVG; the hero
  is a hand-written canvas. Both stay that way.

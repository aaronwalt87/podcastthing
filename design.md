# Design System Document

## Active System: **Kernel Glass**
*(Supersedes "The Analog Frontier" — 2026-04-19)*

---

## 1. Overview & Creative North Star

### Creative North Star: "Kernel Glass"
A high-fidelity macOS Terminal aesthetic blending retro command-center authority with modern glassmorphism. The goal is a mission-control UI that feels like you're operating real infrastructure — not browsing a website. Dark surfaces, electric Matrix Green, and frosted-glass containers create an OS-level experience inside the browser.

The design references:
- **macOS terminal windows** — traffic light controls, sidebar navigation, status bars
- **Matrix-era hacker aesthetics** — monochrome green phosphor on black
- **Modern glassmorphism** — heavy backdrop blur on semi-transparent surfaces

---

## 2. Color Palette

### Core Tokens

| Token | Hex | Usage |
|---|---|---|
| `--bg` | `#131313` | Base void — all surfaces emerge from this |
| `--surface` | `#1a1a1a` | Glassmorphism container base (before blur) |
| `--surface-border` | `rgba(255,255,255,0.08)` | Subtle 1px borders on glass panels |
| `--accent` | `#00FF41` | Matrix Green — CTAs, active states, glows, cursors |
| `--accent-dim` | `#b9ccb2` | Muted green for metadata, secondary labels |
| `--amber` | `#fdbb2c` | System accent — warnings, traffic light (yellow) |
| `--red` | `#ff5f57` | System accent — errors, traffic light (red) |
| `--green-tl` | `#28c840` | Traffic light (green close/maximize) |
| `--text` | `#ffffff` | Primary headers and body text |
| `--text-muted` | `#b9ccb2` | Secondary text, timestamps, metadata |
| `--text-dim` | `rgba(255,255,255,0.35)` | Placeholder text, disabled states |

### Glass Surface Recipe
The signature container style — use on all major panels, cards, and the main terminal window:
```css
background: rgba(20, 20, 20, 0.80);
backdrop-filter: blur(24px) saturate(1.4);
-webkit-backdrop-filter: blur(24px) saturate(1.4);
border: 1px solid rgba(255, 255, 255, 0.08);
```

### Accent Glow Recipe
Applied to primary buttons, active nav items, and focused inputs:
```css
box-shadow: 0 0 12px rgba(0, 255, 65, 0.35), 0 0 24px rgba(0, 255, 65, 0.15);
```

### Scanline Texture
Every screen retains the 2px scanline overlay at 3% opacity — it grounds the glassmorphism in hardware reality:
```css
body::after {
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px
  );
}
```

---

## 3. Typography

| Role | Font | Weight | Style |
|---|---|---|---|
| Display / Headers | `Space Grotesk` | 700 | Uppercase, wide tracking |
| Navigation labels | `Space Grotesk` | 500 | Uppercase, `tracking-widest` |
| Body / Descriptions | `Space Grotesk` | 400 | Sentence case |
| Metadata / Timestamps | `IBM Plex Mono` | 400 | Uppercase, tabular nums |
| Terminal prompts | `IBM Plex Mono` | 400 | `>>>` prefix, accent color |

**Rule:** `Space Grotesk` replaces Manrope entirely. Use `IBM Plex Mono` only for machine-generated data (timestamps, EP numbers, latency readings, terminal prompts).

---

## 4. Border Radius

| Context | Value |
|---|---|
| Main terminal window / large panels | `8px` (`rounded-lg`) |
| Cards, chips, buttons, inputs | `4px` (`rounded-sm`) |
| Traffic light circles | `50%` (fully round) |
| Status badges, small chips | `4px` |
| Nav active indicator | `0px` (left-border, no radius) |

> **Shift from Analog Frontier:** Kernel Glass uses subtle rounding. The 0px constraint is retired — glassmorphism requires slight curves to read as "window glass."

---

## 5. Layout Architecture

### Main Shell
```
┌─────────────────────────────────────────────────────┐
│  TOP BAR: AARON_J_WALTERS ●  [TERMINAL] [EP] [ADM]  │  h-12, glass surface
├──────────┬──────────────────────────────────────────┤
│          │                                          │
│ SIDEBAR  │   MAIN CONTENT AREA                     │
│ 200px    │   (scrollable)                           │
│ fixed    │                                          │
│          │                                          │
├──────────┴──────────────────────────────────────────┤
│  STATUS BAR: STATUS:ONLINE  LATENCY:14MS  MEM:42%   │  h-8, glass surface
└─────────────────────────────────────────────────────┘
```

### Sidebar Specifications
- Width: `240px` fixed, `64px` collapsed on mobile
- Background: glass surface recipe
- Active item: `border-left: 2px solid #00FF41` + text in `#00FF41` + subtle green glow
- Inactive item: text in `#b9ccb2`, no border
- Bottom section: Settings + Logs links, separated by `rgba(255,255,255,0.06)` line
- CTA button: `INITIATE_SESSION` — solid `#00FF41` bg, `#131313` text, `rounded-sm`, full glow

### Top Bar
- Height: `48px`
- Left: username with two colored dots (`#ff5f57` and `#fdbb2c`) as status indicators
- Center: nav links — active in `#00FF41`, inactive in `#b9ccb2`
- Right: icon row (settings gear, notification bell)

### Status Bar Footer
- Height: `32px`
- Content: `STATUS: ONLINE` · `LATENCY: 14MS` · `MEMORY: 42%` (left) — `LINKEDIN · GITHUB · TWITTER` (right)
- Background: same glass surface, `border-top: 1px solid rgba(255,255,255,0.06)`
- Font: `IBM Plex Mono`, `10px`, `#b9ccb2`

### Main Terminal Window (hero content area)
- macOS window chrome: traffic light row (`#ff5f57` · `#fdbb2c` · `#28c840`) + `KERNEL_GLASS // ROOT@AARONJWALTERS` title bar text
- Outer: glass surface recipe, `rounded-lg`
- Inner content: grid split — text left (60%), image right (40%)

---

## 6. Component Specifications

### Buttons
- **Primary:** `bg-[#00FF41]` · `text-[#131313]` · `rounded-sm` · `font-bold uppercase tracking-widest` · full glow on hover · padding `px-4 py-2`
- **Secondary:** transparent · `border: 1px solid rgba(0,255,65,0.4)` · `text-[#00FF41]` · `rounded-sm` · hover: border opacity 100%
- **Tertiary (terminal link):** text only, `text-[#00FF41]` with `→` or `_` suffix

### Navigation Items
- Icon + label layout
- Active: `text-[#00FF41]` + `border-left: 2px solid #00FF41` + `background: rgba(0,255,65,0.06)`
- Inactive: `text-[#b9ccb2]` + no border + transparent bg
- Hover: `text-[#ffffff]` + `background: rgba(255,255,255,0.04)`

### Episode / Log Cards
- Background: glass surface at slightly higher opacity: `rgba(22,22,22,0.90)`
- Border: `1px solid rgba(255,255,255,0.07)`
- `rounded-sm` (4px)
- Episode number label: `EP_042` in `IBM Plex Mono`, `#b9ccb2`
- Icon: geometric, 1px stroke, `#00FF41`
- Title: `Space Grotesk` bold uppercase
- Duration: `IBM Plex Mono` small, `#b9ccb2` with green dot prefix `●`

### Featured Log Card
- Wider glass panel, `rounded-lg`
- Section label: `01 // FEATURED_LOG` in `IBM Plex Mono` `#00FF41`
- Large title: `Space Grotesk` display, uppercase, white
- Tag chips: `rounded-sm`, `background: rgba(0,255,65,0.12)`, `border: 1px solid rgba(0,255,65,0.3)`, `text-[#00FF41]` `text-xs`
- `READ_TIME: 12M →` link in `#00FF41`

### Traffic Light Controls
- Three circles, `w-3 h-3`, `rounded-full`
- Left to right: `#ff5f57` (close) · `#fdbb2c` (minimise) · `#28c840` (maximise)
- Spacing: `gap-2`
- Accompanied by title bar text in `IBM Plex Mono` `#b9ccb2`: `KERNEL_GLASS // ROOT@[USERNAME]`

### Terminal Prompt / Input
- Prefix: `>>>` in `#00FF41`
- Input: underline only (`border-bottom: 1px solid rgba(255,255,255,0.2)`), no box
- Focus: underline shifts to `#00FF41` with 4px glow beneath
- Placeholder: `#b9ccb2` or `rgba(255,255,255,0.35)`
- `IBM Plex Mono` font

### Status Chips
- `{SYSTEM_STATUS: ACTIVE}` style: `rounded-sm` · `border: 1px solid rgba(0,255,65,0.4)` · `text-[#00FF41]` · `text-xs uppercase` · `IBM Plex Mono`

---

## 7. Imagery Treatment
- **Style:** High-contrast, noir — near black-and-white with crushed blacks
- **Framing:** Images presented as "telemetry data" or "log attachments" — framed inside glass containers with a subtle vignette
- **Overlay:** Thin `rgba(0,255,65,0.05)` tint over images to unify with green palette

---

## 8. Do's and Don'ts

### Do:
- **Do** use `rounded-sm` (4px) on all interactive elements and cards.
- **Do** use `#00FF41` exclusively for the active/selected/CTA state — never for body text.
- **Do** apply the glass surface recipe to every major container (sidebar, panels, cards, terminal window).
- **Do** use `IBM Plex Mono` for all machine-generated data: timestamps, EP numbers, latency, memory readouts, terminal prompts.
- **Do** keep backgrounds deep black (`#131313`) so the glass blur has contrast to work against.
- **Do** retain the scanline overlay — it keeps glassmorphism grounded in hardware.

### Don't:
- **Don't** use `#00FF41` at full opacity for large text blocks — it causes eye strain. Use `#b9ccb2` for body copy.
- **Don't** stack glass panels on glass panels without a solid `#131313` layer between them — the blur needs contrast.
- **Don't** use rounded corners larger than `8px` — this is a terminal, not a consumer app.
- **Don't** remove the traffic light controls from the main terminal window — they are a core visual anchor.
- **Don't** use the old `#FF3B3B` red or `#67d7e1` cyan as accents — those belong to "Analog Frontier." Use `#ff5f57` and `#00FF41` instead.

---

## 9. Legacy System Reference

The previous system "The Analog Frontier" used:
- `#FF3B3B` red + `#67d7e1` cyan accents
- `0px` border radius across everything
- No glassmorphism
- `Manrope` body font

These tokens are **retired** in Kernel Glass. Do not mix systems.

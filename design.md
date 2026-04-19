# Design System Document
 
## 1. Overview & Creative North Star
 
### Creative North Star: "The Analog Frontier"
This design system is a high-end editorial interpretation of 1970s aerospace telemetry and early terminal interfaces. It rejects the softness of modern "friendly" web design in favor of a rigid, technical aesthetic that feels like a mission-critical readout from a deep-space vessel. 
 
We move beyond the "template" look by embracing a **0px radius constraint** and a harsh, intentional hierarchy. By combining the sharp, mechanical precision of `Space Grotesk` with the high-functionality of `Manrope`, we create a space where data feels like a narrative. The design breaks the grid through intentional asymmetry—utilizing wide margins and "floating" terminal modules that feel like they are being rendered in real-time on a cathode-ray tube.
 
---
 
## 2. Colors
 
The palette is anchored in absolute darkness, using light not as a decoration, but as a functional "phosphor glow."
 
### Color Roles & Tonal Logic
- **Background (`#131313`):** The void. All interfaces emerge from this deep charcoal base.
- **Primary / Error (`#ffb3ac` / `#FF3B3B`):** These represent "Critical Data" or "Alert States." Use these sparingly for high-intensity calls to action or breaking news alerts.
- **Tertiary (`#67d7e1`):** Use this "Cyan Phosphor" for secondary data visualizations or navigational links to provide a cool contrast to the aggressive reds.
- **On-Surface (`#e5e2e1`):** Our "Paper White" equivalent, used for maximum readability of terminal text.
 
### The "No-Line" Rule
Standard 1px borders for sectioning are strictly prohibited. Boundaries must be defined through **Background Color Shifts**. For example, use `surface-container-low` to define a sidebar against a `surface` background. A hard color transition is more sophisticated than a mechanical line.
 
### Surface Hierarchy & Nesting
Treat the UI as a series of physical "terminal modules." Use the container tiers to create logical nesting:
1. **Base:** `surface` (#131313)
2. **Nesting Level 1:** `surface-container-low` (#1c1b1b) for large content areas.
3. **Nesting Level 2:** `surface-container-highest` (#353534) for floating interaction modules or headers.
 
### The "Glass & Gradient" Rule
To add soul to the technical void, apply a 20% opacity gradient from `primary` to `primary-container` on interactive components. For floating "HUD" elements, use Glassmorphism by applying `surface-container` colors at 70% opacity with a heavy `backdrop-filter: blur(12px)`. This simulates the thick glass of a vintage monitor.
 
### Signature Textures
Every screen must include a subtle, fixed scanline overlay (a repeating 2px linear gradient) at 3% opacity. This "texture of the medium" ensures the site feels like hardware rather than a browser.
 
---
 
## 3. Typography
 
The typography hierarchy is designed to oscillate between "Machine Data" and "Human Narrative."
 
- **Display & Headlines (`Space Grotesk`):** This is your technical voice. Use `display-lg` for heroic, high-impact statements. The sharp, geometric construction of Space Grotesk should be used to command authority.
- **Body (`Manrope`):** For long-form editorial content, we shift to Manrope. It provides the necessary legibility that monospace cannot sustain for long reads.
- **Labels & Data (`Space Grotesk`):** All metadata (dates, timestamps, categories) must use `label-md` or `label-sm`. Treat labels like computer-generated timestamps.
 
---
 
## 4. Elevation & Depth
 
We do not use Material-style shadows. Depth is achieved through **Tonal Layering** and **Luminance**.
 
- **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-high` section to create a "cut-out" effect. This inverted depth feels more like an instrument panel.
- **Ambient Shadows:** When an element must float, use an extra-diffused shadow (e.g., `box-shadow: 0 20px 50px rgba(0,0,0, 0.5)`). The shadow should feel like a lack of light behind a hardware module, not a drop-shadow on a page.
- **The "Ghost Border" Fallback:** If a container requires more definition, use a "Ghost Border": `outline-variant` (#5d3f3c) at 15% opacity. This creates a subtle "trace" of a border without breaking the immersive darkness.
- **Phosphor Glow:** Primary buttons and critical status chips should use an outer `box-shadow` of 2px-4px with the `primary` color at 30% opacity to mimic the light bleed of an overdriven CRT monitor.
 
---
 
## 5. Components
 
### Buttons
- **Primary:** `0px` corners. Solid `primary` background. Text in `on-primary-fixed` (#410003). Use a subtle 2px glow on hover.
- **Secondary:** Transparent background with a `Ghost Border` (1px, 20% opacity). Text in `primary`.
- **Tertiary:** Text-only, uppercase, with a `>>` suffix to indicate a terminal command.
 
### Chips
- Use for categories or "data tags." Styled as `surface-container-highest` with a `1px` left-accent border in `tertiary`. No rounded corners.
 
### Input Fields
- Underlined only using `outline`. On focus, the underline shifts to `primary` with a 4px "light-leak" glow underneath. Helper text must be in `label-sm` to maintain the technical readout vibe.
 
### Lists & Cards
- **Forbid dividers.** Use `32px` or `48px` of vertical white space to separate news items. 
- **Cards:** Do not use backgrounds for every card. Only use a `surface-container` background for "Featured" items. Standard items should live directly on the surface, separated by intentional whitespace.
 
### Specialized Components
- **Terminal Readout:** A component for "live" data or breaking news ticker using `label-md` and a blinking cursor animation (`_`).
- **Power Switch:** Use a custom toggle component that resembles a physical toggle switch from a 1960s mainframe, utilizing `surface-bright` and `on-secondary-container`.
 
---
 
## 6. Do's and Don'ts
 
### Do:
- **Do** use uppercase for all `label` and `display` styles to reinforce the terminal aesthetic.
- **Do** allow content to overlap slightly (e.g., an image overlapping a background container) to create "Constructivist" layouts.
- **Do** use `0px` radius for everything. Sharpness is our primary brand signifier.
- **Do** lean into high-contrast "Breaking News" moments using the `error` (#ffb4ab) token.
 
### Don't:
- **Don't** use any rounded corners. Even a 2px radius breaks the immersion of the "terminal."
- **Don't** use generic icons. Icons must be lo-fi, 1px-stroke-weight, and strictly geometric.
- **Don't** use "Soft" colors. Avoid pastels or muted greys; stick to the high-luminance tokens provided.
- **Don't** use standard dividers. If the layout feels cluttered, add more spacing, don't add more lines.
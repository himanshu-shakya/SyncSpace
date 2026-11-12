---
name: Obsidian Kinetic
colors:
  surface: '#101418'
  surface-dim: '#101418'
  surface-bright: '#363a3e'
  surface-container-lowest: '#0b0f13'
  surface-container-low: '#181c20'
  surface-container: '#1c2024'
  surface-container-high: '#262a2f'
  surface-container-highest: '#31353a'
  on-surface: '#e0e3e8'
  on-surface-variant: '#b9cbbd'
  inverse-surface: '#e0e3e8'
  inverse-on-surface: '#2d3135'
  outline: '#849588'
  outline-variant: '#3b4a40'
  surface-tint: '#00e293'
  primary: '#cdffde'
  on-primary: '#003921'
  primary-container: '#00f5a0'
  on-primary-container: '#006b43'
  inverse-primary: '#006c44'
  secondary: '#9aecff'
  on-secondary: '#00363f'
  secondary-container: '#00d7f4'
  on-secondary-container: '#005966'
  tertiary: '#fff1e4'
  on-tertiary: '#472a00'
  tertiary-container: '#ffce95'
  on-tertiary-container: '#835200'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#50ffaf'
  primary-fixed-dim: '#00e293'
  on-primary-fixed: '#002111'
  on-primary-fixed-variant: '#005232'
  secondary-fixed: '#a5eeff'
  secondary-fixed-dim: '#0ad9f8'
  on-secondary-fixed: '#001f25'
  on-secondary-fixed-variant: '#004e5a'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#101418'
  on-background: '#e0e3e8'
  surface-variant: '#31353a'
typography:
  display-hero:
    fontFamily: Geist
    fontSize: 4rem
    fontWeight: '600'
    lineHeight: 4.5rem
    letterSpacing: -0.035em
  display-hero-mobile:
    fontFamily: Geist
    fontSize: 2.5rem
    fontWeight: '600'
    lineHeight: 3rem
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 2.25rem
    fontWeight: '600'
    lineHeight: 2.75rem
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 1.75rem
    fontWeight: '600'
    lineHeight: 2.25rem
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 1.5rem
    fontWeight: '500'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 1.125rem
    fontWeight: '500'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 1.0625rem
    fontWeight: '400'
    lineHeight: 1.75rem
    letterSpacing: -0.005em
  body-md:
    fontFamily: Geist
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.5rem
    letterSpacing: 0em
  body-sm:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.25rem
    letterSpacing: 0.005em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: -0.01em
  code-block:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.45rem
    letterSpacing: 0em
  label-mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.04em
  label-ui:
    fontFamily: Geist
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1.125rem
    letterSpacing: 0em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system embodies the ethos of a high-performance, precision workspace engineered for technical thinkers, writers, and knowledge architects. The visual language merges the focused rigor of developer-first tooling (Linear, Vercel) with the tactile elegance of bespoke publishing platforms.

The target audience consists of engineers, product strategists, and researchers who demand low visual latency, zero cognitive friction, and pixel-level refinement. The aesthetic is anchored in an uncompromising modern dark-mode luxury: pure obsidian substrates, razor-thin translucent structural borders, and electric emerald-cyan energy conduits that signal real-time synchronization and live multi-cursor presence. 

Key attributes:
- **Atmospheric Depth:** Deep slate and obsidian backgrounds punctuated by selective frosted-glass layering.
- **Architectural Precision:** Consistent 1px borders using low-opacity alpha values to construct planar clarity without heavy visual weight.
- **Technical Warmth:** Pristine modern grotesque letterforms paired with exact monospaced metrics for metadata and Markdown syntax.

## Colors

The palette is engineered specifically for prolonged, fatigue-free focus in a dark environment while preserving absolute legibility and tactile feedback.

- **Primary (`#00F5A0` - Electric Emerald):** Represents action, real-time parity, connected status, and high-priority primary triggers. Used with restraint to guide the eye through document hierarchy and active states.
- **Secondary (`#00D8F6` - Hyper Cyan):** Denotes secondary active states, collaborative presence cursors, inline search matching, and Markdown metadata tags.
- **Tertiary (`#F59E0B` - Amber Glow):** Reserved for document diff warnings, uncommitted branch states, sync latency, and attention-critical alerts.
- **Neutral (`#090D11` - Obsidian Slate):** Serves as the canvas core. Tonal variants range from void black (`#040709`) for primary canvas viewports to elevated structural tiers (`#11171E` through `#18222D`) for floating panels, inspector drawers, and navigation sidebars.

### Surface Color Mapping
- `surface-canvas`: `#090D11`
- `surface-panel`: `#0E141B`
- `surface-elevated`: `#151E28`
- `surface-overlay`: `rgba(21, 30, 40, 0.75)`
- `border-subtle`: `rgba(255, 255, 255, 0.07)`
- `border-focus`: `rgba(0, 245, 160, 0.4)`
- `text-primary`: `#F1F5F9`
- `text-muted`: `#94A3B8`
- `text-faint`: `#475569`

## Typography

The typographic hierarchy distinguishes between natural human articulation and structured computing metrics.

- **Primary Interface & Editorial Prose:** Set in **Geist**. Headings utilize tight negative letter-spacing and firm semi-bold weights to maintain visual compactness in multi-panel workspaces. Document prose runs with generous line heights (`1.75rem` for standard Markdown bodies) to optimize continuous reading during long-form composition.
- **Syntactic & Operational Metadata:** Set in **JetBrains Mono**. Applied strictly to frontmatter parameters, Markdown raw tokens, blockquote keys, collaborative cursor user badges, git revisions, and live synchronization latency counters.

## Layout & Spacing

The workspace leverages a hybrid grid architecture: a multi-tier persistent sidebar schema for navigation, tree hierarchies, and outline panels combined with a centered fluid-bounded reading and writing well for Markdown output.

### Grid & Breakpoints
- **Desktop (1280px+):** Tri-pane layout (Navigation Explorer 240px fixed, Markdown Document Editor centered fluid max-width 780px, Contextual Inspector 280px fixed). Gutter width is `1.5rem`, margin width is `2.5rem`.
- **Tablet (768px - 1279px):** Dual-pane collapsible mode. Document well maintains fluid scale; lateral inspector drops to an overlay sheet. Margin width transitions to `1.5rem`.
- **Mobile (<768px):** Single-pane full viewport focus. Sidebars collapse to zero-width off-canvas drawers; the active Markdown file occupies edge-to-edge layout with a fixed `1rem` margin.

### Spacing Scale Rules
- Component internals (buttons, input fields, badges) use strictly `space-xs` (4px) and `space-sm` (8px).
- Block-level grouping within document prose and card layouts leverages `space-md` (14px) and `space-lg` (24px).
- Structural section separations and major canvas divisions rely on `space-xl` (40px).

## Elevation & Depth

This system avoids blurred heavy drop shadows in favor of a layered dimensional matrix constructed via translucency, boundary definition, and calibrated dark-surface stepping.

### The Planar Hierarchy
1. **Bedrock Surface (`#040709`):** The global window container and canvas background beneath floating cards or editor viewports.
2. **Structural Panels (`#0E141B` with `1px border rgba(255, 255, 255, 0.05)`):** Persistent sidebars, file outlines, and table headers. No box shadows.
3. **Elevated Contexts (`#151E28` with `1px border rgba(255, 255, 255, 0.08)`):** Command palettes, autocomplete menus, and modal sheets.
4. **Frosted Glass Strips:** Applied to document breadcrumb headers and top toolbars:
   - `backdrop-filter: blur(12px) saturate(180%)`
   - `background-color: rgba(9, 13, 17, 0.72)`
   - `border-bottom: 1px solid rgba(255, 255, 255, 0.06)`

### Ambient Lighting & Glows
Depth during user interaction is achieved through luminous chromatic glows rather than directional drop shadows:
- Hovering interactive containers triggers an internal or peripheral rim glow: `0 0 0 1px rgba(0, 245, 160, 0.25), 0 4px 20px -2px rgba(0, 245, 160, 0.12)`.
- Modal backdrops leverage `backdrop-filter: blur(8px)` with an obsidian scrim: `rgba(4, 7, 9, 0.65)`.

## Shapes

The geometry reflects surgical precision through a soft radius system (`roundedness: 1`). Radii remain restrained to keep the interface structured, modern, and aligned with dense code editors.

- **Base Elements (Buttons, Inputs, Tags, Badges):** `0.25rem` (4px). Delivers a crisp, tactile outline without visual softness that degrades structural density.
- **Card Containers, Code Snippet Windows, Flyouts:** `0.5rem` (8px). Softens larger blocks while maintaining high boundary definition.
- **Modal Viewports & Command Center (Cmd+K):** `0.75rem` (12px). Emphasizes floating contextual prominence over the base document canvas.
- **Collaborative Presence Indicators & Toggle Knobs:** Full circular radius (`9999px`) to immediately denote human presence and state switches.

## Components

### Buttons
- **Primary:** Background in Electric Emerald (`#00F5A0`), text in Jet Black (`#040709`), weight `500`. Hover state triggers a shift to Hyper Cyan (`#00D8F6`) with a subtle teal bloom shadow: `0 0 16px rgba(0, 245, 160, 0.35)`.
- **Secondary / Ghost:** Transparent surface with `1px solid rgba(255, 255, 255, 0.08)`, text in `#F1F5F9`. Hover transitions surface to `rgba(255, 255, 255, 0.04)` and border to `rgba(255, 255, 255, 0.18)`.
- **Destructive:** Bordered by `rgba(239, 68, 68, 0.25)`, background `rgba(239, 68, 68, 0.06)`, text `#FCA5A5`.

### Input Fields & Search Bars
- Background set to `#0B1015`, border `1px solid rgba(255, 255, 255, 0.07)`, corner radius `0.25rem`.
- Focused state transitions border to `rgba(0, 245, 160, 0.6)` with a zero-offset ring: `box-shadow: 0 0 0 1px rgba(0, 245, 160, 0.6)`.
- Placeholder text in `#475569`, active text in `#F1F5F9`.
- Integrated shortcut accessories (e.g., `⌘K`) rendered in JetBrains Mono (`label-mono-sm`) with a faint border pill.

### Chips & Metadata Badges
- Height: `22px`. Text styled via `label-mono-sm`.
- Padding: `0 space-sm` (8px horizontal).
- Background: `rgba(255, 255, 255, 0.04)` with `1px solid rgba(255, 255, 255, 0.06)`.
- Synchronized status chips use a pulsating emerald dot (`6px` circular) followed by label text (`SYNCED`, `LIVE`, `EDITING`).

### Checkboxes & Radio Controls
- Base: `16px × 16px`, background `#0B1015`, border `1px solid rgba(255, 255, 255, 0.15)`.
- Checked state: Background `#00F5A0`, border `#00F5A0`. Check icon is rendered in dark slate (`#040709`) with a 2px stroke width.
- Checkbox radius: `2px`. Radio radius: `9999px`.

### Lists & Tree Views (File Explorer)
- Tree row item height: `28px`. Density is paramount.
- Hover state: Background `rgba(255, 255, 255, 0.03)`.
- Active / Selected item: Background `rgba(0, 245, 160, 0.08)`, text `#00F5A0`, left indicator border `2px solid #00F5A0`.
- Drag-and-drop indicator line: `1px solid #00D8F6` with a cyan circular endpoint.

### Cards & Knowledge Blocks
- Background `#0E141B`, border `1px solid rgba(255, 255, 255, 0.06)`, radius `0.5rem`.
- Internal padding: `space-lg` (24px).
- Interactive card hover: Border shifts smoothly to `rgba(0, 216, 246, 0.25)` accompanied by a subtle upward translation (`-1px`).

### Markdown Editor-Specific Components
- **Collaborative Remote Cursors:** Vertical bar (`2px width`) tinted to assigned collaborator hex, topped with a micro-badge (`JetBrains Mono`, `9px`) displaying the user's handle.
- **Code Blocks:** `#060A0D` background, `1px solid rgba(255, 255, 255, 0.05)`, top header bar featuring active syntax language label and one-click copy trigger.
- **Slash Command Menu:** Floating elevated list (`surface-elevated`) with frosted backing blur (`16px`), max height `280px`, keyboard-arrow highlight utilizing Electric Emerald tint.
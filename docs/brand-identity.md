# Biliq Brand Identity

## Product Identity
**Name:** Biliq
**Description:** A browser-based event photo booth system.
**Status:** Prototype identity for a prospective client.

## Design Philosophy
Premium, calm, and intentional. The interface is designed to get out of the way and let the photo experience shine.

### Core Principles
- **Material You Foundation:** We utilize tonal surfaces, soft elevation dropshadows, and rounded corners to establish visual hierarchy without relying on harsh strokes.
- **Borderless Components:** Decorative borders are avoided on ordinary UI components (Cards, Buttons, Inputs, Badges). Differentiation is achieved through contrast between surface containers (lowest, low, standard, high).
- **Subtle Motion:** Animations should feel responsive but not distracting. Avoid continuous "breathing" or infinitely pulsing elements (e.g., the Start button). Motion should only trigger upon state changes (enter, exit, focus, activate).

### Typography
The application uses system fonts via Next.js defaults to remain fast and native to the browser, with a focus on strong font weights for headings (`bold`, `semibold`) and readable sizes for paragraph text.

### Color Palette
- **Primary:** Soft Sage/Teal (`#4A7C73`). Evokes a calm, premium feeling. Used for key actions and branding highlights.
- **Secondary:** Warm Neutral (`#6A605C`). Used for secondary actions and subtle contrast.
- **Tertiary:** Soft Amber/Clay (`#785A46`). Used sparingly for warnings or specific accents.
- **Surfaces:** Warm, off-white neutrals (e.g., `#FDFBF8`, `#F6F3EF`). The background uses radial gradients to add depth without clutter.

### Component Styling
- **Buttons:** Rely on background fills, tonal contrast, and elevation shadows.
- **Cards:** Borderless, utilizing background color and slight drop shadows.
- **Inputs:** Clean, rounded rectangles with subtle focus rings.
- **Toasts:** Floating, global alerts that slide in from the viewport edges to provide non-blocking feedback.

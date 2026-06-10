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

## Logo Identity

Biliq comes from the Indonesian word `bilik`, meaning a small personal booth or room. The final `q` gives the name a more modern, digital, product-like character. Note that this identity is a prototype for a prospective client before formal agreements.

**Selected Direction:** Concept B (Biliq Q Capture) has been selected as the official prototype identity. It effectively plays on the unique letter 'q' in the product name while clearly communicating the camera lens/capture aspect in a clean, scalable, and modern geometric shape. It scales well down to 24px and fits the Material You design language seamlessly.

**Logo Assets:**
- `public/brand/biliq-mark.svg`: The primary full-color mark.
- `public/brand/biliq-mark-monochrome.svg`: The monochrome variant for high-contrast or print-safe environments.
- `public/brand/biliq-lockup.svg`: The logo combined with the "Biliq" wordmark.
- `public/favicon.svg`: The icon used for browser tabs and basic PWA icons.

**Shared Component:** A reusable React component `<BiliqLogo />` exists in `src/shared/components/brand/BiliqLogo.tsx` with support for sizes (`sm`, `md`, `lg`, `xl`) and variants (`mark`, `lockup`, `monochrome`).

**Usage Notes:**
- Use the lockup for top-level product branding (like the Event Console header).
- Use the small mark for subtle sub-page navigation (Setup, Designer, Gallery).
- Do NOT overlay the logo heavily on the capture viewfinder or print outputs; the product should remain content-first.
- The SVGs are built using basic shapes (`path`, `rect`, `circle`) ensuring editability and infinite scalability.

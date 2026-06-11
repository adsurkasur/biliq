# Agent 011 Designer Guide Report

## Summary

Agent 011 implemented a lightweight, polished, non-intrusive onboarding guide for the Biliq Designer page. The guide appears automatically on first open, explains all major Designer interactions across 8 focused steps, and can be reopened at any time from the Designer header. It is fully accessible, keyboard-navigable, and persists its seen/dismissed state in localStorage.

---

## Scope

### Included

- First-time prompt modal shown once on first visit to the Designer
- 8-step guide panel with step content, progress bar, step counter, and step-dot indicators
- Guide entry point button ("Guide") in the Designer page header
- localStorage persistence for guide seen/completed state
- Escape key to close the guide
- Keyboard accessibility for all guide controls
- Full Biliq Material You visual design (tonal surfaces, rounded shapes, soft elevation)
- No third-party guide/tour library dependencies

### Excluded

- DOM element spotlighting / canvas element highlighting (intentionally deferred — fragile if selectors change)
- Guide reset button in settings or elsewhere (deferred; manual reopening via Guide button covers this need)
- Per-step animated transitions between panels (deferred; current transitions use existing `motion-enter`)
- Onboarding for Booth, Gallery, Photo Detail, Print, or Setup (not in scope)
- Tooltip system changes, overlay tour frameworks, or product tour dependencies

---

## Guide Experience

### First-time prompt

When the Designer loads for the first time (no `biliq-designer-guide-seen` key in localStorage), a gentle modal appears after 800ms offering to start the guide. The delay ensures the designer canvas loads first. The user sees:
- A friendly heading: "New to the Designer?"
- Brief explanation of what the guide covers
- Two actions: **Start guide** and **Skip for now**

Both actions set `biliq-designer-guide-seen = "true"` in localStorage so the prompt never appears again automatically. The "Skip for now" action closes the guide immediately.

### Active guide panel

When the guide starts, a floating panel appears at the bottom of the viewport (mobile) or as a centered card (desktop). It shows:
- Step number, step title, and a matching icon
- A horizontal progress bar filling left to right
- The step body text with bullet points and `kbd` key labels
- Navigation: **Back**, step dots, and **Next** (or **Done** on the last step)
- An X button in the top-right corner

Escape key always closes the guide. The X button and Done both call the same close handler.

### Manual reopening

The **Guide** button with a `HelpCircle` icon appears in the Designer header at all times. Clicking it opens the guide from step 1 regardless of whether the guide was previously completed or skipped.

---

## Guide Content

| Step | Title | Key Topics |
|------|-------|------------|
| 1 | Welcome to the Designer | Overview, layout control, overlay layers, save→booth |
| 2 | Photo Slots | Photo 1/2/etc., where photos appear, preview-only outlines |
| 3 | Move Elements | Drag to reposition, Shift+drag for axis lock |
| 4 | Resize Elements | Corner handles, Shift=aspect ratio, Alt/Option=from center |
| 5 | Rotate Elements | Rotation handle above element, applies to overlays and photo slots |
| 6 | Snapping | Canvas edges/center/elements, blue guides, Ctrl/Cmd bypass |
| 7 | Property Panel | Numeric fields, scrubbable values, aspect ratio lock toggle |
| 8 | Save and Use in Booth | Save applies layout to booth, return to adjust anytime |

All copy avoids developer jargon. Terms used: Designer, Photo slot, Overlay, Drag, Resize, Rotate, Snap, Guide, Property Panel, Save.

---

## UI and Accessibility

### Visual Design

- Panel uses `var(--booth-surface-container-lowest)` background and `var(--booth-elevation-4)` shadow, consistent with the existing Modal component.
- Step icon uses the `var(--booth-primary-container)` tonal background.
- Progress bar uses `var(--booth-primary)` fill with smooth CSS transition.
- Step dot indicators use primary color for active, outline-variant for inactive.
- `kbd` elements use `var(--booth-surface-container-high)` as a subtle background to distinguish key labels.
- Buttons use existing `Button` component variants: `primary`, `tonal`, `ghost-surface`.
- The first-time prompt uses the existing `Modal` component directly.

### Keyboard Behavior

- Escape closes both the prompt and the active guide panel.
- All buttons are keyboard-focusable via `booth-focus-ring` classes.
- The close (×) button has `aria-label="Close guide"`.
- The Back/Next/Done buttons have `aria-label` attributes.
- The panel has `role="dialog"` and `aria-modal="true"`.
- The prompt modal inherits the existing Modal component's keyboard handling (Escape, focus management).

### Reduced Motion

- The guide uses existing `motion-enter` CSS class for panel entrance, which respects the project's `@media (prefers-reduced-motion)` rules.
- The progress bar transition duration uses the design system token `var(--booth-duration-medium)` — which may be overridden by reduced-motion preferences.
- No continuous animations, pulsing, or looping effects are used.

### Contrast

- Step body text uses `var(--booth-on-surface-variant)` (meets AA at typical surface values).
- Step title and strong text use `var(--booth-on-surface)` for maximum contrast.
- Primary-color highlights (step number, bullets) use `var(--booth-primary)` on the surface background.

---

## Files Created or Modified

### Created

| File | Purpose |
|------|---------|
| `src/features/designer/hooks/useDesignerGuide.ts` | React hook managing guide state, localStorage persistence, step navigation, and open/close logic |
| `src/features/designer/components/DesignerGuide.tsx` | Guide UI: first-time prompt and step panel components |

### Modified

| File | Change |
|------|--------|
| `src/features/designer/components/LayoutDesignerClient.tsx` | Added `useDesignerGuide` hook, **Guide** button in header, and `<DesignerGuide>` render |

---

## Architecture Notes

- `useDesignerGuide` is a pure client hook. All localStorage access is inside `useEffect` to maintain Next.js SSR compatibility.
- `DesignerGuide` uses `"use client"` directive and has no server-side dependencies.
- The guide is entirely scoped to `src/features/designer/`, respecting the feature boundary architecture.
- No shared components were created (the guide uses the existing `Modal`, `Button`, and `cn` utilities).
- No new npm dependencies were introduced.
- The `DesignerGuide` component accepts guide state and callbacks as props from `LayoutDesignerClient`, keeping the hook logic separate from the rendering.

---

## Validation Results

| Check | Result |
|-------|--------|
| `npm run typecheck` | ✅ Passed — no TypeScript errors |
| `npm run build` | ✅ Passed — production build successful |
| `npm run check` (typecheck + build combined) | ✅ Passed |
| Lint script | Not present in this project (`npm run lint` does not exist) |

Build output: Designer route (`/designer/[eventSlug]`) increased from 10.4 kB to 14.1 kB due to guide content and components (no external dependencies).

---

## Regression Notes

The following existing behaviors were preserved and not changed:

- Designer canvas drag, resize handles, rotation handles, snapping, and Shift/Alt/Ctrl modifier keys
- Photo slot outlines and selection state
- Scrubbable numeric field controls
- Layout saving and booth composition
- Booth capture flow
- Gallery, photo detail, QR, download, and print routes
- Toast system and global notification placement
- Modal exit animation system (guide uses same Modal component)
- Navigation behavior and `returnTo` slug handling
- `biliq-designer-guide-seen` localStorage key is project-prefixed and scoped; it does not conflict with any existing key
- The guide component renders `null` when `guideState.phase === "idle"`, so it has zero impact on DOM structure during normal use

---

## Known Limitations

- **No element spotlighting**: The guide does not highlight specific canvas areas when explaining each step. This was intentionally deferred because query-selector-based spotlight logic can become brittle when component structure changes.
- **No guide reset button**: Users can manually reopen the guide via the header button, but there is no explicit "Reset guide to beginning" in settings. The localStorage key can be cleared manually to restore the first-time prompt.
- **Step panel position**: The guide panel floats at the bottom of the viewport and does not scroll to or highlight specific UI regions. A future enhancement could add `data-guide-target` attributes to relevant elements.
- **No step-by-step interaction locking**: The guide is entirely informational. It does not disable or lock other interactions while open. This is intentional — a non-intrusive approach was preferred.

---

## Recommended Next Tasks

1. **Element spotlight / highlight**: Add optional `data-guide-step` attributes to canvas, layer list, and property panel regions. The guide panel can then softly highlight the relevant area using a CSS ring or subtle overlay per step.
2. **Guide reset control**: Add a "Restart guide" link in the Designer header (or Settings) that clears the localStorage key and reopens the prompt.
3. **Keyboard shortcut**: Add a `?` or `Ctrl+/` global shortcut to open the guide from anywhere in the Designer.
4. **Step deep-linking**: Allow specific guide steps to be opened from tooltips or info icons in the Property Panel (e.g., clicking an info icon near the snapping controls could jump directly to the Snapping step).
5. **Accessibility audit**: Run axe or Lighthouse accessibility scan against the guide components in a staging environment.

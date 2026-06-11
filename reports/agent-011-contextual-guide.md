# Agent 011 Contextual Guide Report

## Summary

Upgraded the Biliq Designer Guide from a static centered modal into a contextual guided walkthrough. Each guide step now highlights the relevant Designer component using an SVG spotlight overlay with a cutout mask. The guide panel adaptively positions itself near the highlighted target, and off-screen targets are scrolled into view automatically. All existing guide behaviors (first-time prompt, localStorage persistence, manual Guide button, keyboard navigation, skip/done) are preserved.

---

## Scope

### Included

- SVG spotlight overlay with a rounded cutout that reveals the active target area while dimming the rest of the page
- Highlight ring around the target element using `ring-2` with Biliq's primary color
- Adaptive panel positioning that chooses right, left, bottom, or top placement based on available viewport space
- `data-guide-target` attributes added to key Designer sections for stable element discovery
- `useGuideTargetRect` hook that tracks target bounding rects with resize/scroll re-measurement
- Graceful fallback to `designer-canvas` when a specific target element is not found in the DOM
- Auto-scroll to bring off-screen targets into view before highlighting
- Smooth CSS transitions on the highlight ring position changes
- All 8 guide steps now have explicit target identifiers

### Excluded

- Per-step animated visual demonstrations (e.g., ghost drag arrows, illustrative snapping lines) — deferred as a polish enhancement
- Auto-selecting elements when the guide reaches resize/rotate steps — the guide instructs users to select an element instead
- Interactive task mode (requiring the user to perform an action before proceeding to the next step)
- Guide reset button in settings
- Advanced Popper.js-style positioning with arrow connectors

---

## Contextual Highlighting

### Target markers

Key Designer sections are marked with stable `data-guide-target` attributes:

| Attribute value | Element | Component |
|---|---|---|
| `designer-canvas` | Left column wrapper containing canvas and layer list | `LayoutDesignerClient.tsx` |
| `property-panel` | Right column wrapper containing slot/layer editors | `LayoutDesignerClient.tsx` |
| `save-layout` | Save designer state card | `LayoutDesignerClient.tsx` |

### Measurement

The `useGuideTargetRect` hook:
1. Queries the DOM for `[data-guide-target="<id>"]` on each step change
2. Falls back to `designer-canvas` if the specific target is not found
3. Returns `null` if no target exists at all (graceful degradation)
4. Re-measures on `resize` and `scroll` events using `requestAnimationFrame` debouncing

### Highlight rendering

The `GuideSpotlight` component renders:
- A full-screen SVG with a white-filled rect and a black-filled rounded rect cutout positioned over the target
- The SVG uses an `<mask>` element to create the cutout; the masked area is filled with `rgba(0,0,0,0.45)` for a calm dimming effect
- A separate `<div>` renders a `ring-2` highlight border around the target with smooth CSS position transitions (300ms ease)
- The entire spotlight layer uses `pointer-events: none` so users can still interact with the target area

---

## Adaptive Panel Positioning

The `computePanelPlacement` function calculates the best position for the guide panel:

1. **Right of target** — preferred when ≥ 416px (panel + gaps) is available to the right
2. **Left of target** — used when right space is insufficient but left has room
3. **Below target** — fallback when neither side has enough horizontal space and ≥ 200px is available below
4. **Above target** — used when bottom space is also insufficient
5. **Bottom-center** — final fallback, centered horizontally at the viewport bottom

On mobile/narrow screens, the panel naturally falls back to bottom positioning with `width: calc(100% - 32px)`.

The panel's `top` is clamped to keep it within the viewport (minimum 16px from top, ensures at least 420px clearance from bottom).

---

## Step Demonstrations

Visual demonstrations are provided through the spotlight highlight itself — each step highlights the exact area being discussed:

| Step | Target | Visual behavior |
|---|---|---|
| 1. Welcome | `designer-canvas` | Canvas + layer list area highlighted |
| 2. Photo Slots | `designer-canvas` | Same area — Photo slots are visible in the canvas |
| 3. Move Elements | `designer-canvas` | Canvas highlighted; text explains drag + Shift |
| 4. Resize Elements | `designer-canvas` | Canvas highlighted; text instructs selecting an element to see handles |
| 5. Rotate Elements | `designer-canvas` | Canvas highlighted; text explains rotation handle |
| 6. Snapping | `designer-canvas` | Canvas highlighted; text explains snap behavior |
| 7. Property Panel | `property-panel` | Right column highlighted; text explains numeric controls |
| 8. Save & Booth | `save-layout` | Save card highlighted; text explains save behavior |

Per-step inline visual hints (ghost arrows, animated handles, illustrative snap lines) were not implemented in this patch to keep the guide lightweight and non-fragile.

---

## State and Persistence

All existing state and persistence behavior is preserved unchanged:

- `biliq-designer-guide-seen` localStorage key
- First-time prompt shown only once
- `Start guide` / `Skip for now` buttons
- Manual Guide button always opens guide from step 1
- Completing (Done) or skipping sets localStorage
- `useDesignerGuide` hook logic is completely unchanged

---

## Accessibility and Reduced Motion

### Keyboard behavior
- **Escape** closes the guide at any step (event listener on `document`)
- All buttons (Back, Next, Done, Close) are keyboard-focusable with `booth-focus-ring`
- Panel has `role="dialog"` and `aria-modal="true"`
- Close button has `aria-label="Close guide"`
- Back/Next/Done buttons have explicit `aria-label` attributes

### Contrast
- Panel background uses `var(--booth-surface-container-lowest)` — highest contrast surface
- Text colors use `var(--booth-on-surface)` and `var(--booth-on-surface-variant)` — both designed for AA compliance
- Spotlight overlay uses `rgba(0,0,0,0.45)` — enough dimming to distinguish the target without completely hiding the interface

### Reduced motion
- The `motion-enter` class on the panel respects the project's `@media (prefers-reduced-motion)` rules
- Highlight ring transitions use CSS `transition` which browsers automatically suppress under `prefers-reduced-motion: reduce`
- No continuous/looping animations exist

---

## Files Created or Modified

### Created

| File | Purpose |
|---|---|
| `src/features/designer/hooks/useGuideTargetRect.ts` | Hook that measures the bounding rect of a `data-guide-target` element, with resize/scroll tracking and graceful fallback |

### Modified

| File | Changes |
|---|---|
| `src/features/designer/components/DesignerGuide.tsx` | **Full rewrite**: Added `GuideSpotlight` component with SVG cutout overlay, `computePanelPlacement` positioning logic, target-based step definitions, scroll-into-view behavior, and backdrop click dismissal |
| `src/features/designer/components/LayoutDesignerClient.tsx` | Added `data-guide-target` attributes to canvas column (`designer-canvas`), property panel column (`property-panel`), and save card (`save-layout`) |

### Unchanged

| File | Note |
|---|---|
| `src/features/designer/hooks/useDesignerGuide.ts` | No changes — state logic and localStorage persistence remain identical |

---

## Architecture Notes

- All guide-specific code lives in `src/features/designer/` — no shared components were created
- `useGuideTargetRect` is a pure client hook with all DOM access inside `useEffect` — SSR-safe
- `data-guide-target` attributes are lightweight semantic markers added only to Designer components
- No third-party dependencies were added
- The SVG-based spotlight approach avoids fragile CSS clip-path or box-shadow workarounds
- The positioning helper is a simple pure function — no Popper.js or floating-ui dependency

---

## Validation Results

| Check | Result |
|---|---|
| `npm run typecheck` | ✅ Passed |
| `npm run build` | ✅ Passed |
| `npm run check` (typecheck + build) | ✅ Passed |
| Lint script | Not present in this project |

Build output: Designer route increased from 14.1 kB to 15.0 kB (spotlight SVG + positioning logic).

---

## Regression Notes

All existing Designer behaviors preserved:

- Canvas drag, resize handles, rotation handles, snapping, and all keyboard modifiers (Shift/Alt/Ctrl)
- Persistent Photo slot outlines and selection states
- Scrubbable numeric field controls
- Property panel editing
- Layout saving and Booth composition
- Layer list hierarchy and visibility/lock controls
- Navigation, toast system, and modal behavior
- No layout data mutations from the guide — the spotlight is purely visual and does not interact with layout state

---

## Known Limitations

1. **No per-step inline visual demonstrations**: Ghost drag arrows, animated handle indicators, and illustrative snapping lines were deferred. The spotlight highlight itself provides the visual context.

2. **Canvas is the target for interaction steps**: Steps 3-6 (Move, Resize, Rotate, Snapping) all target `designer-canvas` rather than individual handles or slots, because handles only appear when an element is selected and the guide does not auto-select elements. The guide copy instructs users to select an element to see handles.

3. **No auto-selection**: The guide does not automatically select a Photo slot or overlay when reaching resize/rotate steps. This avoids unexpected state mutations. Users are instructed to select an element manually.

4. **Panel positioning is viewport-based**: The positioning does not account for complex CSS transforms or nested scrollable containers. This works correctly for the current flat Designer layout.

5. **Single SVG mask ID**: The spotlight uses `id="guide-spotlight-mask"`. If multiple spotlights were ever rendered simultaneously, this would conflict. Only one guide instance exists, so this is safe.

---

## Recommended Next Tasks

1. **Per-step visual demonstrations**: Add subtle inline visual hints per step — e.g., a ghost arrow on the Move step, handle callout labels on the Resize step, and illustrative snap lines on the Snapping step.

2. **Fine-grained targets**: Add `data-guide-target` to individual Photo slot buttons and transform handle containers. The guide could then target specific slots for the Photo Slots step and specific handles for the Resize step when an element is selected.

3. **Interactive task mode**: Extend the guide to wait for the user to complete an action (e.g., "Try dragging a Photo slot now") before proceeding to the next step.

4. **Guide reset**: Add a "Restart guide" option in a settings or help menu that clears `biliq-designer-guide-seen` from localStorage.

5. **Arrow connector**: Add a small CSS arrow/pointer connecting the panel to the highlighted target for clearer visual association.

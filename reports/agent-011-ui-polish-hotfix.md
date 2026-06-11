# Agent 011 UI Polish Hotfix Report

## Summary

This hotfix addresses four critical UX issues found during runtime review of the newly added Agent 011 Guide and Tooltip system:
1. Tooltip visual readability was improved by applying a solid high-contrast background and standardizing paddings.
2. Tooltip placement logic was rewritten to dynamically position itself and avoid viewport collisions without adding heavy external dependencies.
3. Designer Guide animations for the spotlight and panel were smoothed out by leveraging transform-based CSS transitions.
4. A clear preparing/loading state was introduced for the Guide when targeting elements that take time to be resolved or scrolled into view.

## Tooltip Visual Fix

- **Background & Text:** Swapped the transparent/border-only appearance for a solid `bg-[var(--booth-on-surface)]` with `text-[var(--booth-surface)]` text. This provides excellent readability and sharp contrast against both the light UI surfaces and the designer canvas.
- **Elevation & Corners:** Kept the soft shadow (`--booth-elevation-2`) and standard Biliq border radius (`--booth-radius-md`) to ensure it still feels like a small Material You floating surface. 
- **Padding:** Normalized paddings (`px-3 py-2`) for comfortable text breathing room.

## Tooltip Positioning Fix

- **Algorithm:** Replaced static top-or-bottom positioning with an adaptive placement algorithm that computes candidate placements.
- **Priority:** It first attempts a `top` placement with safe margin and spacing. If that collides with the top viewport boundary, it falls back to `bottom`.
- **Viewport Clamping:** Added logic to clamp `left` coordinates to ensure the Tooltip never bleeds off the left or right edges of the screen.
- **Portal & Lifecycle:** Retained the `document.body` portal approach. Added immediate `requestAnimationFrame` evaluation on mount, alongside standard `scroll` (captured during bubble phase) and `resize` event bindings.

## Guide Animation Smoothing

- **Spotlight Ring:** Transitioned from animating layout properties (`top`, `left`) directly, to using hardware-accelerated `transform: translate3d(x, y, 0)` combined with `cubic-bezier` easings. This drastically reduces jank and layout trashing.
- **Spotlight Mask & Visual Hints:** Easing properties (`cubic-bezier(0.2, 0, 0, 1)`) were aligned globally, allowing the entire spotlight assembly to glide simultaneously when targeting a new element.
- **Panel Repositioning:** Added a global `transition` covering `top`, `left`, `bottom`, and `transform` to ensure the modal panel glides fluidly when jumping to new screen corners rather than instantly teleporting.

## Loading Feedback

- **Guide Preparing State:** A graceful loading state (`Loader2` spinner with "Preparing guide...") was introduced to the Guide Panel body. If the `useGuideTargetRect` takes a few milliseconds to track down its target, this ensures users see intentional feedback rather than a broken or empty jump state.
- **Designer/Event Loading:** Already correctly handled within `LayoutDesignerClient.tsx` using `Spinner` on initial mount.
- **Save Action Loading:** Since `saveLayout` triggers a fully synchronous `upsertEventConfig` update within localStorage, no artificial delays or async wait states were added, strictly adhering to the instruction not to invent fake long loading delays.

## Interaction and Accessibility

- Hover, focus, and touch (tap-to-open) behaviors all remain intact.
- The `Escape` key effectively dismisses the Tooltip, and outside-click/tap dismissals still accurately traverse the Portal hierarchy.
- The `aria-describedby` linkage stays completely robust, ensuring screen-readers are safely served without native browser `title` intrusions.

## Files Created or Modified

- **`src/shared/components/ui/Tooltip.tsx`** [MODIFIED]: Overhauled styles and positioning algorithms.
- **`src/features/designer/components/DesignerGuide.tsx`** [MODIFIED]: Upgraded with `transform` transitions and introduced the preparing spinner state (`Loader2`).
- **`src/features/designer/components/GuideVisualHint.tsx`** [MODIFIED]: Synchronized CSS transitions with the main Guide component and fixed transparent backgrounds to solid tokens.

## Architecture Notes

- Zero new third-party dependencies were introduced. The tooltip positioning relies purely on native `getBoundingClientRect` logic mapped to inline-styles within React component lifecycles.
- Separation of concerns remains intact: the shared UI Tooltip is entirely ignorant of the Designer feature module.

## Validation Results

- `npm run typecheck`: ✅ Passed
- `npm run build`: ✅ Passed
- `npm run check`: ✅ Passed
- **Manual Verification Notes**: The Tooltip behaves smoothly near viewport edges. Transitions across the Biliq Designer guide operate effortlessly without noticeable flicker.

## Regression Notes

- All Biliq Designer interaction features (move, resize, rotate, snap, layer sorting) perform exactly as they did before this Hotfix.
- First-time prompt logic and interactive checkpoints continue to track and dismiss natively.

## Known Limitations

- **Complex Viewport Collision:** While the fallback logic catches top and side collisions effectively, complex or abnormally rapid viewport resizes could temporarily misalign Tooltips for a single frame before the RAF catches up.
- **Arrow Pointer:** An explicit arrow pointing to the target was omitted, as dynamic clamping logic frequently disconnects static arrows, keeping the implementation simple and robust as requested.

## Recommended Next Tasks

Agent 012 direction:
1. **PWA & Offline Sync:** Now that the Designer polish is robust, move toward implementing local service worker architectures for Biliq Booth sessions to remain operational offline during events.

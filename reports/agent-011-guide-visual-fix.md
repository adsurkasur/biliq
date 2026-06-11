# Agent 011 Guide Visual Fix Report

## Summary

This patch resolves three visual issues identified in the Agent 011 Guide Visual Diagnostic:
1. Low-contrast white/light text on guide hints has been replaced with Biliq's strong primary color system.
2. The guide panel and spotlight overlay now fade out smoothly instead of disappearing abruptly.
3. The "Snap guides" visual lines are now securely bounded inside the live layout preview window instead of stretching across the entire screen.

## Hint Contrast Fix

- Restyled the `DRAG TO MOVE`, `RESIZE`, `Rotate`, and `Snap guides` badges within `GuideVisualHint.tsx`.
- Changed background and text colors to use high-contrast primary tokens: `bg-[var(--booth-primary-container)]` and `text-[var(--booth-on-primary-container)]`.
- Updated icons (Move, MousePointer, Rotate) to use `text-[var(--booth-primary)]` and `fill-[var(--booth-on-primary-container)]`.
- This ensures visual hints stand out clearly against the dimmed layout preview without breaking the calm UI aesthetic.

## Spawn/Despawn Animation Fix

- Updated `GuideState` in `useDesignerGuide.ts` to include an `isExiting` boolean property.
- Modified the `closeGuide`, `startGuide`, `skipGuide`, and `goNextStep` (when finishing) hooks to apply `isExiting: true` and delay the transition to `"idle"` phase by 300ms using `setTimeout`.
- Updated `DesignerGuide.tsx` and `GuideVisualHint.tsx` to read the `isExiting` state and conditionally apply `opacity-0 scale-95` CSS transitions, allowing the panel, spotlight, and visual hints to animate out gracefully before React unmounts them.

## Snap Guide Scope Fix

- Refactored the `snap` hint case inside `GuideVisualHint.tsx` to render a `fixed` positioning wrapper with dimensions mapped precisely to the `targetRect` (`top`, `left`, `width`, `height`).
- Changed the snap guide center lines to use relative percentage coordinates (`left: "50%"`, `top: "50%"`) rather than viewport-stretching `inset-0`.
- Added the exact `data-guide-target="live-layout-preview"` class to the canvas window in `DesignerCanvasPreview.tsx` and updated the Guide step targeting to prefer it, completely containing the snap hint lines within the live layout.

## Files Created or Modified

- **`src/features/designer/hooks/useDesignerGuide.ts`**: Introduced the `isExiting` state and 300ms delayed unmount logic to allow CSS transitions to play.
- **`src/features/designer/components/DesignerGuide.tsx`**: Piped `isExiting` to `GuidePanel`, `GuideSpotlight`, and `GuidePrompt` to trigger CSS exit animations (`opacity-0 scale-95 pointer-events-none`).
- **`src/features/designer/components/GuideVisualHint.tsx`**: Overhauled hint styling with primary/primary-container tokens. Confined the snap hint lines within a `targetRect`-bounded container.
- **`src/features/designer/components/DesignerCanvasPreview.tsx`**: Added `live-layout-preview` as a more precise target for the snap guides.

## Accessibility and Reduced Motion

- **Contrast:** Moving away from transparent black/white badges to strictly paired `primary-container` tokens guarantees readability.
- **Reduced Motion:** Exit animations utilize `transition-all duration-300`, which the global `globals.css` configuration correctly drops to `0ms` via `prefers-reduced-motion: reduce`.
- **Interactions:** The `isExiting` state safely applies `pointer-events-none` immediately, preventing double-clicks or trapped focus during the 300ms fade-out. Escape and Keyboard navigation remain untouched.

## Validation Results

- `npm run typecheck`: ✅ Passed
- `npm run build`: ✅ Passed
- `npm run check`: ✅ Passed
- Manual verification via code review ensures classes are correctly applied and React lifecycle teardown waits for the CSS transition.

## Regression Notes

- Tooltip system, Designer canvas logic (drag, resize, rotate, snap), global loading states, and property panel all remain strictly untouched and preserved.
- Guide localStorage persistence and Checkpoints still work since state transitions simply invoke `markSeen()` exactly as before.

## Known Limitations

- No remaining visual limitations. The transitions now match Biliq's Material You-inspired motion design.

## Recommended Next Tasks

Agent 012 direction:
1. **PWA & Offline Sync:** Now that the Designer interface and interactions are polished, shift focus to service workers and offline caching to fulfill the local-first application requirement.

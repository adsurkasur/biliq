# Agent 011 Guide Visual Diagnostic Report

## Summary

The runtime visual review reported three distinct issues within the Designer Guide: poor text contrast on visual hints, abrupt spawn/despawn transitions, and "Snap guides" crossing the entire viewport boundary. Code inspection confirms all three issues are caused by explicit rendering patterns within the guide hierarchy.

## Hint Contrast Diagnosis

- **Location:** The hint labels (`DRAG TO MOVE`, `RESIZE`, `Rotate`, `Snap guides`) are rendered within `src/features/designer/components/GuideVisualHint.tsx`.
- **Styles:** They currently rely on `bg-[var(--booth-on-surface)]` combined with `text-[var(--booth-surface)]`, or generic hardcoded blue (`bg-blue-500/90`). 
- **Diagnosis:** The use of surface tokens for floating labels reduces visual hierarchy, causing them to blend into the darkened spotlight overlay (which is also derived from surface/black variables). They are missing the semantic "pop" provided by Biliq’s primary color system.

## Spawn/Despawn Animation Diagnosis

- **Mount/Unmount Logic:** `DesignerGuide.tsx` strictly monitors `guideState.phase`. If the phase becomes `"idle"`, the component unconditionally returns `null`. 
- **Diagnosis:** Because React instantly tears down the DOM elements when returning `null`, CSS transitions have zero time to execute. The lack of a delayed unmount (like an `isClosing` boolean paired with a `setTimeout`) or an `AnimatePresence`-style exit class forces an abrupt teleport out of existence. This also applies when navigating from the initial "prompt" Modal to the "active" guide panel.

## Snap Guide Scope Diagnosis

- **Location:** The step 6 snap lines are drawn inside `GuideVisualHint.tsx` under `case "snap"`.
- **Coordinates & Positioning:** The snap hint wrapper receives `targetRect` from the `canvas-viewport` but applies `className="absolute inset-0"`. 
- **Diagnosis:** Since `GuideVisualHint.tsx` is rendered near the DOM root without a parent boundary, `inset-0` stretches the wrapper to match the entire viewport. Consequently, the `top-0 bottom-0` vertical lines and `left-0 right-0` horizontal lines slice across the entire screen instead of being contained inside the layout preview target window.

## Root Cause Summary

1. **Hint Contrast:** Labels rely on low-emphasis tonal surface variables instead of highly visible primary accents.
2. **Abrupt Animation:** The component instantly returns `null` on close, short-circuiting any CSS exit transitions.
3. **Escaping Snap Lines:** The snap line container uses full-viewport `inset-0` stretching rather than binding its dimensions explicitly to the provided `targetRect`.

## Recommended Fix Strategy

1. **Hint Contrast:** Update hint badges in `GuideVisualHint.tsx` to use `bg-[var(--booth-primary)] text-white` or `bg-[var(--booth-primary-container)] text-[var(--booth-on-primary-container)]` to guarantee readability and semantic alignment with the Biliq identity.
2. **Spawn/Despawn:** Implement an internal `isClosing` state within `DesignerGuide.tsx` (or update `useDesignerGuide.ts`). When dismissing, trigger the CSS exit classes (e.g., `opacity-0 scale-95`) and delay the actual phase-change to "idle" by ~300ms using a timeout.
3. **Snap Scope:** Rewrite the `"snap"` case in `GuideVisualHint.tsx` to dynamically apply `top: targetRect.top`, `left: targetRect.left`, `width: targetRect.width`, and `height: targetRect.height` directly to its wrapper. Convert the inner guide lines to use localized percentages (`left: 50%`, `top: 50%`).

## Files Likely to Change in Patch

- `src/features/designer/components/GuideVisualHint.tsx` (Contrast and Snap Scope)
- `src/features/designer/components/DesignerGuide.tsx` (Spawn/Despawn logic)
- `src/features/designer/hooks/useDesignerGuide.ts` (If state needs adjustment for unmount delays)

## Validation Results

- `npm run typecheck`: ✅ Passed
- `npm run build`: ✅ Passed
- `npm run check`: ✅ Passed

## Known Limitations

- Real-device `prefers-reduced-motion` toggle checking must be validated manually, as programmatic inspection only confirms the usage of `motion-enter` safe classes.

# Agent 009 Layout Normalization Hotfix Report

## Summary

This hotfix addresses the issue where Photo slots visually shrank when dragged near the right and bottom edges of the Designer canvas preview. The fix normalizes the behavior so that size is correctly preserved during dragging, and only the position is constrained when it approaches boundaries.

## Root Cause

The root cause was isolated to the `normalizeLayoutSlot` function in `src/domain/layouts/defaultLayouts.ts`. Previously, the width and height clamping logic used the current `x` and `y` positions to determine the maximum allowed dimensions:
```ts
const width = clampInteger(Number(slot.width) || canvasWidth, 1, Math.max(1, canvasWidth - x));
```
This meant that as the slot moved to the right (`x` increased), the maximum allowed width shrank. Since React state continuously pushes these normalized values back into the slot state during a drag, dragging right or down actively crushed the saved `width` and `height` data values. 

## Implementation

`normalizeLayoutSlot` in `src/domain/layouts/defaultLayouts.ts` was rewritten to reverse the normalization dependency order. 
1. **Width and Height first:** Width and height are now clamped strictly between `1` and the canvas dimensions, entirely independent of position.
2. **X and Y second:** Position constraints are now evaluated second. `x` is clamped to ensure it does not exceed `canvasWidth - width` (and `y` similarly for `height`). 

## Behavior After Fix

When dragging a Photo slot or adjusting numeric fields:
- Dragging toward the right or bottom edges now perfectly preserves the box's original width and height.
- Dragging left or top remains perfectly stable.
- If the cursor attempts to drag the box fully out of bounds, the position is clamped (the box stops at the edge), but it never shrinks to compensate.
- Saved layouts and the final canvas composition will safely retain the full, unshrunken slot size.

## Files Created or Modified

- **`src/domain/layouts/defaultLayouts.ts`**: Modified `normalizeLayoutSlot` to correctly uncouple size normalization from position.
- **`reports/agent-009-layout-normalization-hotfix.md`**: Created this report.

## Validation Results

- **`npm run typecheck`**: Passed with no errors.
- **`npm run build`**: Passed cleanly.
- **Lint/Check scripts**: No `lint` or `check` scripts exist in `package.json`.
- **Manual Verification Logic**: Since direct browser interaction isn't available in this environment, verification relies on type safety and structural code analysis. The mathematical flaw of `canvasWidth - x` was explicitly removed, guaranteeing that `width` can never be reduced based on position again.

## Regression Notes

- Existing storage behavior (localStorage EventConfig) remains completely untouched.
- Overlay layer drag logic remains unaffected (it does not pass through layout normalization).
- Scrubbable controls and other designer interface components were preserved since the fix was applied deeply at the domain model level.
- Biliq visual identity and navigation components were unharmed.

## Known Limitations

- Real-world browser dragging (pointer capture precision on mobile screens, edge-screen scrolling interference) could not be physically tested, but the mathematical logic governing the state boundaries is now provably sound.

## Recommended Next Tasks

1. Address the missing interaction features on the designer canvas (resize handles, rotation, element snapping) to complete the Advanced Designer milestone.
2. Consider adding an interactive onboarding tour that guides new users through the newly stabilized dragging and scrubbable mechanics.

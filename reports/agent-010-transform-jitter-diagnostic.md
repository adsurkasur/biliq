# Agent 010 Transform Jitter Diagnostic Report

## Summary

The reported interaction issues (jitter during resize/move and missing Shift-axis constraint) are definitively confirmed by code inspection of the `handlePointerMove` logic within `DesignerCanvasPreview.tsx`.

The core resizing math correctly calculates from a stable pointerdown baseline (`dragState`). The jitter is not caused by React state fighting or layout normalization. Instead, the jitter is caused purely by how the snapping logic is applied *sequentially* and *after* constraints (like aspect ratio or center-resize) have already been calculated, causing the constraints to break and fight with the snapping system. Furthermore, `Shift` is simply not wired up for move operations.

## Current Transform Implementation

Transform interactions are handled in a single `pointermove` event listener in `DesignerCanvasPreview.tsx`. 
- **Initialization:** On pointerdown, a `dragState` object caches the initial baseline properties (`initialX`, `initialY`, `initialWidth`, `initialHeight`, etc.).
- **Delta Calculation:** For every pointer move, `deltaX` and `deltaY` are calculated from the stable `dragState.startX/Y`.
- **Constraint Application:** Modifiers like Aspect Ratio (`e.shiftKey`) and Center-Resize (`e.altKey`) are applied to determine the target `nextWidth`, `nextHeight`, `nextX`, and `nextY`.
- **Snapping:** The snapping system then evaluates these `next` values against other layout elements and the canvas bounds.
- **Dispatch:** The final `next` values are rounded and dispatched via `onUpdateSlotNumber` to update the React state.

## Jitter Root Cause Analysis

The jitter and "skipping" behavior is caused by the architectural order of operations in the snapping logic:

1. **Snapping breaks Aspect Ratio Constraints:** Snapping is applied *after* the `aspectRatioLocked` or `Shift` logic. If an element is locked to a 1:1 ratio, and the right edge snaps to a guide, `nextWidth` is adjusted to meet the guide. However, `nextHeight` is *not* correspondingly adjusted. The aspect ratio is instantly broken. On the next mouse move, the aspect ratio is recalculated from the mouse delta, causing the element to violently snap back and forth between the guide and the enforced aspect ratio.
2. **Snapping breaks Center-Resize Constraints:** Similarly, if `Alt` is held to resize from the center, moving the right edge by 10px should move the left edge by 10px. But if the right edge hits a snap guide, only `nextWidth` is changed by the snapping logic. The left edge doesn't adjust, and `nextX` isn't corrected. The center of the element shifts, fighting the `Alt` key intent.

## Snapping Analysis

The snapping system currently exhibits **competing candidate evaluation** during move operations.
If a user is moving an element, the system evaluates the left edge for snapping and updates `nextX`. It then immediately evaluates the right edge for snapping using the *newly updated* `nextX`. If the right edge finds a target, it updates `nextX` again, overriding the left edge. Finally, the center is evaluated, potentially overriding `nextX` a third time. 

If multiple targets are within the 12px threshold (e.g., the left edge is near 0, and the right edge is near an adjacent element), they will fight for control on every pixel of mouse movement, causing extreme jitter. A robust system must find the single closest snap delta across *all* points on a given axis, and apply only that single delta.

## Modifier Key Analysis

- **`Alt` / `Option`:** Correctly implements resize-from-center by doubling the width/height deltas and keeping the center coordinate invariant.
- **`Ctrl` / `Meta`:** Correctly bypasses snapping by returning the raw value early in the `snapValue` function.
- **`Shift`:** Correctly enforces aspect ratio locking during resize, but is ignored during move operations.

## Shift Axis-Lock Diagnosis

Why does `Shift + drag` not constrain horizontal/vertical movement?
Because there is no logic for it in the `dragState.action === "move"` block. The code only reads `e.shiftKey` inside the `dragState.action.startsWith("resize")` block. 

## Recommended Behavior Model

A clean, industry-standard modifier model:

* **Move drag:**
  * Normal: Free move (with snapping).
  * `Shift + drag`: Constrain movement to the dominant axis (if `|deltaX| > |deltaY|`, lock `Y`; else lock `X`).
  * `Ctrl/Cmd + drag`: Bypass snapping.
* **Resize drag:**
  * Normal: Free resize (unless element has aspect ratio lock enabled).
  * `Shift + resize`: Temporarily lock aspect ratio.
  * `Alt/Option + resize`: Resize from center.
  * `Ctrl/Cmd + resize`: Bypass snapping.
* **Rotate drag:**
  * Normal: Free rotate.
  * `Shift + rotate`: Snap rotation to 15-degree increments.

## Recommended Fix Strategy

To completely eliminate jitter and correctly support modifiers, the transform pipeline in `DesignerCanvasPreview.tsx` must be refactored to follow this exact order of operations:

1. **Calculate Base Deltas:** Calculate the raw `dw` and `dh` based on mouse movement and `e.altKey`.
2. **Determine Primary Snapping Delta:** 
   - Instead of snapping the absolute coordinates, evaluate how far the active edges are from their nearest snap targets.
   - Pick the single closest valid snap target across all evaluated points on the X axis, yielding an `adjustmentX`. Do the same for the Y axis (`adjustmentY`).
3. **Propagate Adjustments through Constraints:**
   - If aspect ratio is locked, and a snap adjustment was made to X, mathematically derive the required adjustment for Y to preserve the ratio (or vice versa, depending on which axis was the active snap).
4. **Apply Final Constraints:** Apply the final snapped and constraint-adjusted deltas to `nextWidth`, `nextHeight`, `nextX`, and `nextY`.
5. **Implement Shift Move:** Inside the `move` block, if `e.shiftKey` is true, simply zero out `deltaX` or `deltaY` depending on which is smaller.

## Files Likely to Change in Patch

- `src/features/designer/components/DesignerCanvasPreview.tsx` (Complete rewrite of `handlePointerMove` snapping sequence)

## Validation Results

- `npm run typecheck`: **Passed** (No errors)
- `npm run build`: **Passed** (Compiled successfully)
- **Code Reasoning:** Successfully identified the exact logic flow causing the reported issues without needing runtime debugging.

## Known Limitations

Manual browser testing of the jitter was not possible in this environment, but the code logic definitively confirms the reported symptoms. The sequential assignment of `nextX` and `nextWidth` during snapping mathematically guarantees the described constraint violations and competing candidate jitter.

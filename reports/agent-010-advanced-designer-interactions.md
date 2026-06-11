# Agent 010 Advanced Designer Interactions Report

## Summary

This update completes the core interactive layer system for the Designer preview by introducing bounding box rendering, corner resize handles, rotation handles, and an intuitive snapping system. Users can now manipulate slots and overlay layers precisely using direct mouse/touch interaction rather than relying solely on the numeric input fields.

## Scope

- **Included**: 
  - Sub-component extraction for generic transform handles.
  - Four-corner resize functionality for both Photo slots and overlay layers.
  - Center-anchored rotation functionality for overlay layers.
  - Automatic snapping to canvas boundaries and center lines during move/resize.
  - Temporary rendering of visual snap guide lines.
  - Safety constraints for hidden and locked layers.
- **Excluded (by design)**:
  - Multi-select, group transformations.
  - Rotation of Photo slots (model limit: `LayoutSlot` does not support rotation).
  - Element-to-element snapping (deferred to avoid canvas clutter/jitter).
  - Onboarding and tooltips.

## Resize Handles

A dedicated `DesignerTransformHandles` component now overlays any actively selected element. 
- It provides top-left, top-right, bottom-left, and bottom-right touch-friendly grab points.
- Resizing automatically recalculates both dimensions (`width`, `height`) and coordinates (`x`, `y`) natively, depending on which corner is dragged. 
- A hard constraint prevents dimensions from falling below a minimum size (`24px`).
- Drag-resizing perfectly respects the layout normalization hotfix from Agent 009, ensuring dimensions are not unpredictably crushed when dragging against edges.

## Rotation Handles

- A top-center handle allows the user to rotate overlay layers. 
- The rotation calculation relies on `Math.atan2`, using the precise center coordinate of the overlay layer.
- An initial offset is stored on `pointerdown` to ensure the layer does not instantly "jump" to point directly at the cursor, delivering a smooth, relative rotational drag experience.
- The `rotation` value is normalized cleanly to the `0-360` degree range and propagates accurately to the property panel.

## Snapping

A localized snapping engine intercepts the `nextX`, `nextY`, `nextWidth`, and `nextHeight` values before updating state.
- **Targets**: Elements snap seamlessly to the absolute canvas edges (`0`, `canvasWidth`, `canvasHeight`) and center points (`canvasWidth/2`, `canvasHeight/2`).
- **Threshold**: Snapping requires the element edge or center to come within `12` output pixels of the target line.
- **Guides**: If a coordinate is snapped, a subtle, semi-transparent teal guide line (`<div className="bg-[var(--booth-primary)] ...">`) briefly renders across the canvas to visually confirm alignment. Guides automatically disappear on `pointerup`.

## Files Created or Modified

- `src/features/designer/components/DesignerTransformHandles.tsx` (**NEW**): Extracted presentation component responsible for rendering the bounding box and interactive touch targets for transformations.
- `src/features/designer/components/DesignerCanvasPreview.tsx` (**MODIFIED**): Expanded `dragState` significantly to handle multi-axial resizing and rotation matrices. Replaced the simple move delta logic with a unified action router handling move, resize, and rotation along with the snapping calculations.

## Architecture Notes

- Kept browser-only interactive DOM logic explicitly inside `DesignerCanvasPreview.tsx` and its new sub-component `DesignerTransformHandles.tsx`. 
- Pointer capture operates efficiently via `window.addEventListener("pointermove", ...)` allowing smooth drag logic even when the user's cursor briefly leaves the handle element or the canvas entirely.

## Validation Results

- **TypeScript (`npm run typecheck`)**: Passed with no errors.
- **Production Build (`npm run build`)**: Passed cleanly.
- **Logic Validation**: Manual path-tracing confirms coordinate tracking maps appropriately to `scaleX` and `scaleY` multipliers, ensuring interaction accuracy matches visual scaling regardless of screen size. 

## Regression Notes

- All pre-existing Booth and navigation flows remain unaffected.
- The visual hierarchy respects `visible` and `locked` states. Hidden layers cannot be selected. Locked layers can be selected (for layer panel visibility) but deliberately refuse to render the `DesignerTransformHandles` bounding box, blocking pointer-based transformations entirely.

## Known Limitations

- Rotational constraints on Photo slots are enforced exclusively because the underlying domain type `LayoutSlot` lacks a rotation property.
- Complex alignment interactions (multi-element relative snapping, distributing space) are intentionally deferred. 

## Recommended Next Tasks

1. **Interactive Onboarding/Guide**: Now that the full canvas interaction toolkit exists, implement the deferred interactive tour highlighting the layer panel and direct manipulation options.
2. **PWA & Offline Sync**: Begin laying the groundwork for robust offline resilience using service workers to support environments with poor internet access.

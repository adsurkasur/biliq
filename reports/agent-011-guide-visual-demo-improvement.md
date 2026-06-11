# Agent 011 Guide Visual Demo Improvement Report

## Summary

Upgraded the Biliq Designer Guide from highlighting broad UI sections to targeting specific, fine-grained UI elements (e.g., individual photo slots, resize/rotation handles) and added step-specific visual demonstrations. The guide now provides direct contextual hints like a ghost drag arrow for moving, callout badges for resizing, and illustrative lines for snapping.

## Scope

### Included

- Addition of fine-grained `data-guide-target` attributes in `DesignerCanvasPreview` and `DesignerLayerList`.
- Upgrade of `useGuideTargetRect` to support fallback arrays (e.g., `["rotation-handle", "resize-handles", "photo-slot", "designer-canvas"]`).
- Creation of `GuideVisualHint` component for rendering step-specific visual overlays without mutating user layout data.
- Safe, non-mutating visual explanations for drag, resize, rotate, and snap interactions.
- Preserved existing guide behaviors including `localStorage` persistence, navigation, positioning, and accessibility features.

### Excluded

- Interactive task mode requiring user input to advance.
- Auto-selection of canvas elements (to avoid mutating or risking layout state).
- Any modifications to the core Designer interaction layer (drag, resize, snapping logic remains untouched).
- Dependencies like Popper.js or Floating UI.

## Fine-Grained Targets

The guide now dynamically targets specific elements. `useGuideTargetRect` accepts an array of target IDs and searches them in order, returning the bounding box of the first matched element:

1. **Photo Slots**: `["photo-slot", "designer-canvas"]`
   - Highlights the first Photo Slot on the canvas if available.
2. **Move Elements**: `["photo-slot", "designer-canvas"]`
   - Targets a photo slot if available to provide a realistic drag hint.
3. **Resize Elements**: `["resize-handles", "photo-slot", "designer-canvas"]`
   - Targets active resize handles if an element is selected; falls back to a photo slot or canvas.
4. **Rotate Elements**: `["rotation-handle", "resize-handles", "photo-slot", "designer-canvas"]`
   - Targets the specific rotation handle above the selected element if available; falls back gracefully.
5. **Snapping**: `["canvas-viewport", "designer-canvas"]`
   - Targets the bounded canvas area directly.
6. **Property Panel** and **Save**: Remain targeted to `property-panel` and `save-layout`.

## Visual Demonstrations

Added the `GuideVisualHint` component to render step-specific overlays atop the spotlight cutout:

- **Move**: A static mouse pointer with a "Drag to move" badge placed centrally over the target.
- **Resize**: Small "RESIZE" badges placed at the top-left and bottom-right corners of the target.
- **Rotate**: A "Rotate" badge with a circular arrow icon placed above the target area (specifically near where the rotation handle would be).
- **Snapping**: Blue crosshair lines (horizontal and vertical center) drawn across the target area with a "Snap guides" badge to simulate snapping behavior.

*Note: All hints use static icons instead of looping animations to strictly respect Biliq's calm design philosophy and `prefers-reduced-motion` guidelines.*

## Selection Handling

- The guide does **not** auto-select elements. This guarantees that user layout state remains pristine and prevents accidental saves or history pollution.
- Instead, the guide uses fallback targeting: if handles aren't visible (because nothing is selected), the spotlight smoothly falls back to highlighting a Photo Slot or the whole canvas, while the accompanying visual hints and text explain how to interact.

## Adaptive Positioning

- Guide panel positioning remains fully adaptive based on the updated `useGuideTargetRect` logic.
- As the targets change in size and location (e.g., from the whole canvas down to a single photo slot), the guide panel intelligently recalculates the best side (right, left, bottom, top) to avoid obscuring the target.
- Off-screen targets are still scrolled into view gracefully.

## State and Persistence

- The first-time prompt logic (`biliq-designer-guide-seen`) is untouched.
- Manual re-opening via the Guide button starts the guide at step 1.
- "Skip for now", "Done", and "Escape" key behaviors remain intact and accurately update `localStorage`.

## Accessibility and Reduced Motion

- All visual hints avoid looping animations (e.g., bouncing or pulsing). They rely on clear, high-contrast badges and icons.
- `Pointer-events: none` is enforced strictly on all visual hint elements to ensure users can still interact with the canvas underneath.
- Text contrast passes AA standards using standard Biliq CSS variables.
- Dialog semantics and keyboard navigation are maintained perfectly.

## Files Created or Modified

- **`src/features/designer/components/GuideVisualHint.tsx`** [NEW]: Renders contextual, step-specific visual badges and lines over the guide target.
- **`src/features/designer/hooks/useGuideTargetRect.ts`** [MODIFIED]: Upgraded to accept an array of target IDs, implementing the graceful fallback targeting.
- **`src/features/designer/components/DesignerGuide.tsx`** [MODIFIED]: Updated step definitions to use target arrays, added `hintType` to steps, and integrated `GuideVisualHint`.
- **`src/features/designer/components/DesignerCanvasPreview.tsx`** [MODIFIED]: Injected specific `data-guide-target` attributes for `canvas-viewport`, `photo-slot`, and `transform-handles`.
- **`src/features/designer/components/DesignerTransformHandles.tsx`** [MODIFIED]: Added support for `guideTarget` prop to conditionally tag rotation and resize handles.
- **`src/features/designer/components/DesignerLayerList.tsx`** [MODIFIED]: Added `data-guide-target="layer-list"`.

## Architecture Notes

- Follows the existing architectural boundaries perfectly: all logic is encapsulated within `src/features/designer/`.
- `GuideVisualHint` is entirely decoupled from layout mutation logic, ensuring separation of concerns.
- No third-party dependencies were added.

## Validation Results

- `npm run typecheck`: ✅ Passed
- `npm run build`: ✅ Passed
- `npm run check`: ✅ Passed
- **Manual Verification Notes**: The spotlight correctly zooms into a photo slot on step 2, shows drag hints on step 3, targets handles correctly if an element is selected during steps 4 and 5, and shows snap lines on step 6.

## Regression Notes

All existing Designer behaviors are preserved:
- Canvas drag, resize, rotation, snapping, Shift/Alt/Ctrl modifier keys.
- Property panel editing and layer controls.
- Safe local persistence and Booth composition logic.

## Known Limitations

- **No Interactive Task Mode**: The guide does not block progress until a user successfully drags or rotates an element.
- **No Auto-Selection**: Users must manually click an element to see the actual handles, but the visual hints accurately demonstrate what to look for.
- **Single Spotlight**: The system currently supports highlighting one contiguous bounding box at a time.

## Recommended Next Tasks

1. **Interactive Checkpoints**: Implement logic to detect when a user has actually performed the instructed action (e.g., dragged a slot) and auto-advance the guide.
2. **Contextual Tooltips on Hover**: For returning users who skipped the guide, add small `title` tooltips or temporary toasts explaining keyboard modifiers when interacting with handles.

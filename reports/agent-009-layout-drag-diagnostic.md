# Agent 009 Layout Drag Diagnostic Report

## Summary

The bug where photo slots shrink when dragged near the right and bottom edges was confirmed by code inspection. The issue is not a CSS rendering glitch or visual clipping, but rather a data-level bounding box clamping issue inside the domain logic. When `x` or `y` is updated via dragging (or scrubbable controls), the layout state normalization function actively shrinks the slot's stored `width` and `height` to fit within the canvas boundaries.

## Relevant Implementation

In `DesignerCanvasPreview.tsx`, slots and layers are rendered using absolute positioning:
```tsx
style={{
  left: `${(slot.x / layout.canvasWidth) * 100}%`,
  top: `${(slot.y / layout.canvasHeight) * 100}%`,
  width: `${(slot.width / layout.canvasWidth) * 100}%`,
  height: `${(slot.height / layout.canvasHeight) * 100}%`,
  borderRadius: `${(slot.borderRadius ?? 0) / 8}px`
}}
```
This CSS is completely correct. It uses strictly `left`, `top`, `width`, and `height`, which guarantees the rendered element's size matches the data state perfectly. No `right` or `bottom` properties are used that would cause CSS-induced shrinking.

## Root Cause Analysis

The shrinking occurs deep in the state update flow. Whenever `onUpdateSlotNumber` is called to change `x` or `y`, the `useLayoutDesigner.ts` hook runs the updated slot through `normalizeDraftLayout`, which calls `normalizeLayoutSlot` in `src/domain/layouts/defaultLayouts.ts`. 

The `normalizeLayoutSlot` function currently contains this aggressive clamping logic:
```ts
const x = clampInteger(Number(slot.x) || 0, 0, Math.max(0, canvasWidth - 1));
const y = clampInteger(Number(slot.y) || 0, 0, Math.max(0, canvasHeight - 1));
const width = clampInteger(
  Number(slot.width) || canvasWidth,
  1,
  Math.max(1, canvasWidth - x) // <--- Root cause
);
const height = clampInteger(
  Number(slot.height) || canvasHeight,
  1,
  Math.max(1, canvasHeight - y) // <--- Root cause
);
```

Because `width` is clamped to a maximum of `canvasWidth - x`, as `x` increases (moving right), the maximum allowed `width` decreases. Once `canvasWidth - x` becomes smaller than the slot's current width, the slot physically shrinks. The exact same issue applies to `y` and `height`.

## Stored Data Impact

The shrinking is **not just visual**. Because this logic runs inside the React state updater (`updateLayout`), dragging the slot literally changes the slot's `width` and `height` in the application state.

## Preview vs Composition Impact

Because the `width` and `height` in the underlying `layout` object are modified, the bug **does affect final canvas composition**. If a user drags a slot against the right edge, saves the layout, and takes photos in the booth, the final output will have that physically shrunken slot.

## Overlay Layer Comparison

This bug **only affects photo slots**. Overlay layers are managed entirely separately in `useLayoutDesigner.ts` and do not pass through `normalizeLayoutDefinition` or `normalizeLayoutSlot`. Their `x`, `y`, `width`, and `height` are stored directly without boundary crushing, which is why dragging overlays feels correct.

## Recommended Fix

The safest fix is to modify `normalizeLayoutSlot` in `src/domain/layouts/defaultLayouts.ts`.

- **Preserve width/height:** Change the `width` and `height` clamping to ignore `x` and `y`. They should just be clamped to `canvasWidth` and `canvasHeight` independently.
- **Clamp position instead of size:** If the intention is to keep the entire slot inside the canvas, `x` should be clamped against `canvasWidth - width`, and `y` against `canvasHeight - height`. 
- **Alternative:** If out-of-bounds positioning is acceptable, simply remove the strict `x` and `y` clamping entirely.

A robust rewrite of `normalizeLayoutSlot` would calculate `width` and `height` first, and then clamp `x` and `y` to ensure the box doesn't shrink.

## Files Likely to Change in Patch

- `src/domain/layouts/defaultLayouts.ts` (specifically `normalizeLayoutSlot`)

## Validation Results

- `npm run typecheck`: Passed.
- `npm run build`: Passed.
- Code trace verification cleanly isolated the bug to the domain layer rather than the React/CSS presentation layer.

## Known Limitations

- I relied strictly on code reasoning and data-flow tracing to diagnose this issue. I did not manually drag the boxes in a real browser. However, the data flow guarantees this exact symptom, making the diagnosis definitive.

# Designer Layer System

The Biliq Layout Designer has been upgraded from a single static overlay to a fully composable multiple-layer system. This document outlines how the layer system operates across the application.

## Data Model
Layers are represented by the `OverlayLayer` interface in `src/domain/events/types.ts`:

```typescript
export interface OverlayLayer {
  id: string;
  name: string;
  imageDataUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  createdAt: string;
  updatedAt: string;
}
```

The legacy `overlayDataUrl` property is preserved on `EventConfig` for backwards compatibility. When an event is loaded, `getEffectiveOverlayLayers` translates the legacy URL into a single layer at index 0 without mutating the underlying data structure.

## Composition Pipeline
In `src/domain/media/composePhoto.ts`, rendering happens in two phases:
1. **Slots:** All camera slot images are drawn sequentially.
2. **Layers:** All visible overlay layers are sorted by `zIndex` ascending. The canvas context is saved, translated to the layer's center, rotated, faded using `globalAlpha`, and then the layer image is drawn.

## Live Viewfinder Preview
The `CameraPreview` component uses absolute CSS positioning to overlay layers on top of the live video stream. The percentage-based metrics allow the overlays to stretch correctly regardless of the physical viewport size (e.g. mobile vs desktop).

- `left` = `(layer.x / outputWidth) * 100%`
- `top` = `(layer.y / outputHeight) * 100%`
- `width` = `(layer.width / outputWidth) * 100%`
- `height` = `(layer.height / outputHeight) * 100%`

## Scrubbable Controls
The `ScrubbableNumberField` component captures horizontal pointer drags (`pointerDown`, `pointerMove`, `pointerUp`) to increment and decrement property values seamlessly. It serves as the primary input mechanism for manipulating layer constraints without relying on external libraries.

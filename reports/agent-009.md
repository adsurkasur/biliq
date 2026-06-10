# Agent 009 Report: Advanced Designer Foundation

## Objective
Implement an advanced designer foundation for Biliq, introducing multiple overlay layers, a layer panel, and scrubbable controls for precise manipulation, while maintaining full backwards compatibility and avoiding cloud dependencies.

## Implementation Details

### Domain & Storage Updates
- Introduced `OverlayLayer` interface containing positioning (`x`, `y`, `width`, `height`), rendering (`rotation`, `opacity`, `zIndex`), and state (`visible`, `locked`) properties.
- Expanded `EventConfig` to include `overlayLayers?: OverlayLayer[]`.
- Implemented `getEffectiveOverlayLayers` to coalesce the legacy `overlayDataUrl` into a dynamic layer array without performing destructive schema migrations on existing local-storage data.

### Composition Engine
- Upgraded `src/domain/media/composePhoto.ts`.
- The engine now loops over `visible` layers sorted by `zIndex`.
- Translates the canvas context to the center of each layer, rotates according to the layer's rotation parameter, sets `globalAlpha`, and draws the PNG.

### Booth Preview updates
- Upgraded `src/features/booth/components/CameraPreview.tsx` to handle an array of layers.
- Uses percentage-based absolute positioning and CSS transforms (`rotate()`, `opacity`) so the visual layout in the designer perfectly scales to the real viewfinder and physical prints regardless of the device resolution.

### Designer UI Upgrades
1. **`ScrubbableNumberField`**: Created a borderless, Material You inspired number field that can be clicked to type, or dragged horizontally to scrub values up and down. Automatically handles step scaling and min/max constraints.
2. **`useLayoutDesigner` Hook**: Converted to manage an array of overlay layers alongside the existing slots. Added state for `selectedLayerId` and `selectedSlotIndex`.
3. **`DesignerLayerList`**: Replaced the simple upload panel. Organizes layers hierarchically, displaying thumbnail previews, Lock toggles, and Visibility toggles.
4. **`OverlayLayerEditor`**: A dynamic properties panel built with `ScrubbableNumberField`s allowing X, Y, W, H, Rotation, and Opacity manipulation for the active layer.
5. **`SlotEditor`**: Migrated standard numeric inputs over to `ScrubbableNumberField` for a unified aesthetic and interaction model.

### Setup Compatibility
- Added a CTA to the Setup Page's Overlay panel directing power users to the Layout Designer for advanced controls, while keeping the simple 1-click fallback intact.

## Conclusion
The advanced designer foundation lays the groundwork for a fully capable browser-based editor. The implementation complies entirely with the local-first constraints, relies on CSS-only motion, and passes all build verifications.

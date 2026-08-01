import { ImagePlus, Camera, Layers, Lock, Unlock, Eye, EyeOff, GripVertical } from "lucide-react";
import type { LayoutDefinition } from "@/domain/layouts/types";
import type { OverlayLayer } from "@/domain/events/types";
import { Card } from "@/shared/components/ui/Card";
import { Tooltip } from "@/shared/components/ui/Tooltip";
import { cn } from "@/shared/lib/classNames";

interface DesignerLayerListProps {
  layout: LayoutDefinition;
  overlayLayers: OverlayLayer[];
  selectedSlotIndex: number | null;
  selectedLayerId: string | null;
  onSelectSlot: (index: number) => void;
  onSelectLayer: (id: string) => void;
  onToggleLayerVisibility: (id: string) => void;
  onToggleLayerLock: (id: string) => void;
  onUploadLayer: (file?: File) => void;
}

export function DesignerLayerList({
  layout,
  overlayLayers,
  selectedSlotIndex,
  selectedLayerId,
  onSelectSlot,
  onSelectLayer,
  onToggleLayerVisibility,
  onToggleLayerLock,
  onUploadLayer
}: DesignerLayerListProps) {
  // We'll render layers top to bottom, but zIndex implies rendering bottom to top.
  // We'll just display them sorted by zIndex descending to mimic a standard layer stack
  const reversedLayers = [...overlayLayers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <Card className="motion-card flex min-w-0 flex-col overflow-hidden" data-guide-target="layer-list">
      <div className="flex flex-col border-b border-[var(--booth-outline-variant)]/30 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
          Canvas elements
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
          What’s on the canvas
        </h2>
      </div>

      <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto p-4">
        <div className="grid min-w-0 gap-2">
          {reversedLayers.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                "flex min-w-0 items-center gap-2 overflow-hidden rounded-[var(--booth-radius-md)] border p-2 transition-all",
                selectedLayerId === layer.id
                  ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/15"
                  : "border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)] hover:border-[var(--booth-outline-variant)]"
              )}
            >
              <GripVertical className="h-4 w-4 flex-none text-[var(--booth-on-surface-variant)]/50" />
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
                onClick={() => onSelectLayer(layer.id)}
              >
                <div
                  className="h-8 w-8 flex-none overflow-hidden rounded bg-[var(--booth-surface-container-lowest)]"
                  style={{
                    backgroundImage: `url(${layer.imageDataUrl})`,
                    backgroundSize: "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat"
                  }}
                />
                <span className="min-w-0 truncate text-sm font-semibold text-[var(--booth-on-surface)]">
                  {layer.name}
                </span>
              </button>

              <div className="flex flex-none items-center gap-1">
                <Tooltip content="Prevent this layer from being moved, resized, or rotated.">
                  <button
                    type="button"
                    className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container-highest)] hover:text-[var(--booth-on-surface)]"
                    onClick={() => onToggleLayerLock(layer.id)}
                    aria-label={layer.locked ? `Unlock ${layer.name}` : `Lock ${layer.name}`}
                  >
                    {layer.locked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Unlock className="h-4 w-4 opacity-50" />
                    )}
                  </button>
                </Tooltip>
                <Tooltip content="Hide or show this layer in the layout.">
                  <button
                    type="button"
                    className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container-highest)] hover:text-[var(--booth-on-surface)]"
                    onClick={() => onToggleLayerVisibility(layer.id)}
                    aria-label={layer.visible ? `Hide ${layer.name}` : `Show ${layer.name}`}
                  >
                    {layer.visible ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4 opacity-50" />
                    )}
                  </button>
                </Tooltip>
              </div>
            </div>
          ))}

          {/* Group slots below the overlays conceptually */}
          <div className="my-2 border-t border-[var(--booth-outline-variant)]/30 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--booth-on-surface-variant)]">
              Photo areas
            </h3>
            {layout.slots.map((slot, index) => (
              <div
                key={`slot-${index}`}
                className={cn(
                  "mt-2 flex min-w-0 items-center gap-2 overflow-hidden rounded-[var(--booth-radius-md)] border p-2 transition-all",
                  selectedSlotIndex === index
                    ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/15"
                    : "border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)] hover:border-[var(--booth-outline-variant)]"
                )}
              >
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-3 pl-2 text-left"
                  onClick={() => onSelectSlot(index)}
                >
                  <Camera className="h-4 w-4 text-[var(--booth-on-surface-variant)]" />
                  <span className="text-sm font-semibold text-[var(--booth-on-surface)]">
                    Photo {index + 1}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--booth-outline-variant)]/30 p-4">
        <label className="booth-focus-ring flex cursor-pointer items-center justify-center gap-2 rounded-[var(--booth-radius-md)] bg-[var(--booth-primary-container)] px-4 py-2.5 text-sm font-semibold text-[var(--booth-on-primary-container)] transition-all hover:brightness-110 active:scale-95">
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Add image layer
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => onUploadLayer(event.target.files?.[0])}
          />
        </label>
      </div>
    </Card>
  );
}

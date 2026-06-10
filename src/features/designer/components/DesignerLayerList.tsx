import { ImagePlus, Camera, Layers, Lock, Unlock, Eye, EyeOff, GripVertical } from "lucide-react";
import type { LayoutDefinition } from "@/domain/layouts/types";
import type { OverlayLayer } from "@/domain/events/types";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
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
    <Card className="motion-card flex flex-col overflow-hidden">
      <div className="flex flex-col border-b border-[var(--booth-outline-variant)]/30 p-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--booth-primary)]">
          Layers
        </p>
        <h2 className="mt-1 text-xl font-bold text-[var(--booth-on-surface)]">
          Hierarchy
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-2">
          {reversedLayers.map((layer) => (
            <div
              key={layer.id}
              className={cn(
                "flex items-center gap-2 rounded-[var(--booth-radius-md)] border p-2 transition-all",
                selectedLayerId === layer.id
                  ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/15"
                  : "border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)] hover:border-[var(--booth-outline-variant)]"
              )}
            >
              <GripVertical className="h-4 w-4 text-[var(--booth-on-surface-variant)]/50" />
              <button
                type="button"
                className="flex flex-1 items-center gap-2 text-left"
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
                <span className="truncate text-sm font-semibold text-[var(--booth-on-surface)]">
                  {layer.name}
                </span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container-highest)] hover:text-[var(--booth-on-surface)]"
                  onClick={() => onToggleLayerLock(layer.id)}
                  title={layer.locked ? "Unlock" : "Lock"}
                >
                  {layer.locked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4 opacity-50" />
                  )}
                </button>
                <button
                  type="button"
                  className="booth-focus-ring rounded p-1.5 text-[var(--booth-on-surface-variant)] transition-colors hover:bg-[var(--booth-surface-container-highest)] hover:text-[var(--booth-on-surface)]"
                  onClick={() => onToggleLayerVisibility(layer.id)}
                  title={layer.visible ? "Hide" : "Show"}
                >
                  {layer.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4 opacity-50" />
                  )}
                </button>
              </div>
            </div>
          ))}

          {/* Group slots below the overlays conceptually */}
          <div className="my-2 border-t border-[var(--booth-outline-variant)]/30 pt-4">
            <h3 className="mb-2 text-xs font-semibold uppercase text-[var(--booth-on-surface-variant)]">
              Camera Slots
            </h3>
            {layout.slots.map((slot, index) => (
              <div
                key={`slot-${index}`}
                className={cn(
                  "mt-2 flex items-center gap-2 rounded-[var(--booth-radius-md)] border p-2 transition-all",
                  selectedSlotIndex === index
                    ? "border-[var(--booth-primary)] bg-[var(--booth-primary-container)]/15"
                    : "border-[var(--booth-outline-variant)]/30 bg-[var(--booth-surface-container)] hover:border-[var(--booth-outline-variant)]"
                )}
              >
                <button
                  type="button"
                  className="flex flex-1 items-center gap-3 pl-2 text-left"
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
          Add Overlay
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

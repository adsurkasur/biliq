export type SlotFit = "cover" | "contain";

export interface LayoutDefinition {
  id: string;
  name: string;
  canvasWidth: number;
  canvasHeight: number;
  slots: LayoutSlot[];
  backgroundColor?: string;
}

export interface LayoutSlot {
  x: number;
  y: number;
  width: number;
  height: number;
  fit: SlotFit;
  borderRadius?: number;
}

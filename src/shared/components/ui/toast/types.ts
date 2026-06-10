export type ToastTone = "success" | "info" | "error" | "warning";

export interface ToastMessage {
  id: string;
  title?: string;
  description?: string;
  tone?: ToastTone;
  duration?: number;
}

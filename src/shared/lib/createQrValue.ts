import { routes } from "@/shared/config/routes";

export function createQrValue(photoId: string, origin?: string): string {
  const resolvedOrigin =
    origin ??
    (typeof window === "undefined" ? "http://localhost:3000" : window.location.origin);

  // Local-first MVP note: this URL points to browser-local IndexedDB data.
  // Public cross-device QR sharing requires cloud upload in a later milestone.
  return `${resolvedOrigin}${routes.photo(photoId)}`;
}

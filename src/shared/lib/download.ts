export function downloadDataUrl(dataUrl: string, filename: string): void {
  const anchor = document.createElement("a");
  anchor.href = dataUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export function photoFilename(eventSlug: string, photoId: string): string {
  return `${eventSlug}-${photoId.slice(0, 8)}.jpg`;
}

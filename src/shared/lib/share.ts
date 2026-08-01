interface ShareCaptureInput {
  dataUrl: string;
  filename: string;
  title: string;
}

export async function shareCapture({
  dataUrl,
  filename,
  title
}: ShareCaptureInput): Promise<void> {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    throw new Error("Sharing is not available on this browser. Use Download instead.");
  }

  const file = dataUrlToFile(dataUrl, filename);
  const shareData: ShareData = {
    title,
    text: "Created with Biliq",
    files: [file]
  };

  if (typeof navigator.canShare === "function" && !navigator.canShare(shareData)) {
    throw new Error("This browser cannot share this file. Use Download instead.");
  }

  try {
    await navigator.share(shareData);
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;
    throw error;
  }
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [header, encoded] = dataUrl.split(",", 2);
  const mimeType = header.match(/^data:([^;]+)/)?.[1] ?? "application/octet-stream";
  const binary = window.atob(encoded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return new File([bytes], filename, { type: mimeType });
}

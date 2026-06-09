export type CameraErrorCode =
  | "unsupported"
  | "permission-denied"
  | "not-found"
  | "not-readable"
  | "unknown";

export class CameraAccessError extends Error {
  code: CameraErrorCode;

  constructor(code: CameraErrorCode, message: string) {
    super(message);
    this.name = "CameraAccessError";
    this.code = code;
  }
}

export async function getCameraStream(
  preferredFacingMode: "environment" | "user" = "environment"
): Promise<MediaStream> {
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    throw new CameraAccessError(
      "unsupported",
      "This browser does not support camera access."
    );
  }

  const preferredConstraints: MediaStreamConstraints = {
    audio: false,
    video: {
      facingMode: { ideal: preferredFacingMode },
      width: { ideal: 1920 },
      height: { ideal: 1080 }
    }
  };

  try {
    return await navigator.mediaDevices.getUserMedia(preferredConstraints);
  } catch (error) {
    if (isFallbackCandidate(error)) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: true
        });
      } catch (fallbackError) {
        throw mapCameraError(fallbackError);
      }
    }

    throw mapCameraError(error);
  }
}

export function stopCameraStream(stream?: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

function isFallbackCandidate(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === "OverconstrainedError" ||
      error.name === "ConstraintNotSatisfiedError")
  );
}

function mapCameraError(error: unknown): CameraAccessError {
  if (error instanceof CameraAccessError) {
    return error;
  }

  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError" || error.name === "SecurityError") {
      return new CameraAccessError(
        "permission-denied",
        "Camera permission was denied. Allow camera access in the browser and try again."
      );
    }

    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return new CameraAccessError(
        "not-found",
        "No camera was found on this device."
      );
    }

    if (error.name === "NotReadableError" || error.name === "TrackStartError") {
      return new CameraAccessError(
        "not-readable",
        "The camera is already in use or could not be started."
      );
    }
  }

  return new CameraAccessError(
    "unknown",
    "The camera could not be opened. Check browser and device permissions."
  );
}

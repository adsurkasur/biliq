import type { CloudEventFolder } from "@/domain/cloud/types";
import { publicEnv } from "@/shared/config/env";
import { toSlug } from "@/shared/lib/slug";

const DEFAULT_ROOT_FOLDER_NAME = "PhotoBooth Events";

export function createDriveEventFolderPlan(
  eventId: string,
  eventSlug: string,
  rootFolderName = publicEnv.googleDriveRootFolderName || DEFAULT_ROOT_FOLDER_NAME
): CloudEventFolder {
  const safeSlug = toSlug(eventSlug) || "event";
  const safeEventId = eventId.replace(/[^a-zA-Z0-9_-]+/g, "-");

  return {
    eventId,
    eventSlug: safeSlug,
    rootFolderName,
    eventFolderName: `${safeSlug}-${safeEventId}`,
    overlaysFolderName: "overlays",
    outputsFolderName: "outputs",
    thumbnailsFolderName: "thumbnails",
    metadataFolderName: "metadata"
  };
}

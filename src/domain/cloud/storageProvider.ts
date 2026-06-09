import { createDriveEventFolderPlan } from "@/domain/cloud/driveFolderStrategy";
import type {
  CloudAssetInput,
  CloudEventFolder,
  CloudMetadataInput,
  CloudStorageProvider,
  CloudUploadResult
} from "@/domain/cloud/types";

const CLOUD_NOT_IMPLEMENTED = "Cloud storage is not implemented yet.";

export const googleDriveStorageProviderPlaceholder: CloudStorageProvider = {
  async ensureEventFolder(
    eventId: string,
    eventSlug: string
  ): Promise<CloudEventFolder> {
    return createDriveEventFolderPlan(eventId, eventSlug);
  },
  async uploadOverlay(_input: CloudAssetInput): Promise<CloudUploadResult> {
    throw new Error(CLOUD_NOT_IMPLEMENTED);
  },
  async uploadPhotoOutput(_input: CloudAssetInput): Promise<CloudUploadResult> {
    throw new Error(CLOUD_NOT_IMPLEMENTED);
  },
  async uploadThumbnail(_input: CloudAssetInput): Promise<CloudUploadResult> {
    throw new Error(CLOUD_NOT_IMPLEMENTED);
  },
  async writeEventMetadata(_input: CloudMetadataInput): Promise<CloudUploadResult> {
    throw new Error(CLOUD_NOT_IMPLEMENTED);
  }
};

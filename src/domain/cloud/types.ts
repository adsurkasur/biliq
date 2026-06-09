export interface CloudEventFolder {
  eventId: string;
  eventSlug: string;
  rootFolderName: string;
  eventFolderName: string;
  overlaysFolderName: string;
  outputsFolderName: string;
  thumbnailsFolderName: string;
  metadataFolderName: string;
}

export interface CloudAssetInput {
  eventId: string;
  eventSlug: string;
  fileName: string;
  mimeType: string;
  dataUrl?: string;
  blob?: Blob;
}

export interface CloudMetadataInput {
  eventId: string;
  eventSlug: string;
  fileName: string;
  json: Record<string, unknown>;
}

export interface CloudUploadResult {
  id: string;
  name: string;
  webViewUrl?: string;
}

export interface CloudStorageProvider {
  ensureEventFolder(eventId: string, eventSlug: string): Promise<CloudEventFolder>;
  uploadOverlay(input: CloudAssetInput): Promise<CloudUploadResult>;
  uploadPhotoOutput(input: CloudAssetInput): Promise<CloudUploadResult>;
  uploadThumbnail(input: CloudAssetInput): Promise<CloudUploadResult>;
  writeEventMetadata(input: CloudMetadataInput): Promise<CloudUploadResult>;
}

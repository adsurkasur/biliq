# Cloud Integration Plan

## Current Status

Cloud auth and upload are intentionally not implemented yet. The app remains local-first: event config is stored in localStorage and photo outputs are stored in IndexedDB in the operator's browser.

This iteration only adds provider interfaces, environment placeholders, and a Drive folder naming strategy so future cloud work has a clean boundary.

## Planned Firebase Auth Role

Firebase Auth should provide the admin/operator identity. The likely first sign-in method is Google login. UI code should call an `AuthProvider` interface instead of importing Firebase directly into booth, setup, designer, gallery, photo, or print components.

The planned user shape is:

```ts
type AuthUser = {
  id: string;
  email: string | null;
  displayName: string | null;
  photoUrl?: string | null;
};
```

## Planned Google Drive Structure

Future Google Drive storage should keep event assets under one predictable root folder instead of scattering files in Drive root:

```text
PhotoBooth Events/
  {eventSlug}-{eventId}/
    overlays/
    outputs/
    thumbnails/
    metadata/
```

The helper in `src/domain/cloud/driveFolderStrategy.ts` returns this folder plan without calling Google APIs.

## OAuth Considerations

Google Drive upload will need Drive scopes that match the storage approach. The project should avoid broad Drive access unless the product decision requires it. A future implementation should document scopes, consent screen setup, token refresh behavior, and how operator access is revoked.

## Provider Boundary

Future cloud upload should live behind `CloudStorageProvider` in `src/domain/cloud`. UI components should request higher-level actions from feature hooks or domain services. Booth capture UI should not know Google Drive API details, folder ids, upload URLs, OAuth tokens, or retry rules.

Current placeholder providers throw clear errors for upload methods:

```ts
throw new Error("Cloud storage is not implemented yet.");
```

## Local To Cloud Migration Path

The first migration path should keep local capture working and add optional cloud-backed records:

1. Keep saving the final composed image to IndexedDB first.
2. Add cloud upload status fields to photo records.
3. Upload overlay, output, thumbnail, and metadata through the provider boundary.
4. Store returned cloud ids and share URLs on the photo record.
5. Update QR generation to prefer cloud public/share URLs when available, with local-only QR as fallback.
6. Add retry behavior for failed uploads without blocking booth capture.

## Out Of Scope For Now

Do not place Firebase initialization, Google OAuth, Google Drive API calls, upload retries, or cloud share URL logic directly in booth UI components. Those should be added behind provider and domain boundaries in a later milestone.

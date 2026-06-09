# Architecture Notes

## Local-First Boundary

The MVP runs entirely in the browser. Event configuration is stored in localStorage and photo records are stored in IndexedDB. Canvas composition creates one final image data URL that is reused for preview, download, gallery, QR detail, and print.

## Browser APIs

Browser-only APIs are isolated in client components, hooks, or domain modules called from client flows:

- Camera stream: `src/domain/media/camera.ts`
- Video frame capture: `src/domain/media/captureFrame.ts`
- Canvas composition: `src/domain/media/composePhoto.ts`
- localStorage events: `src/domain/events/storage.ts`
- IndexedDB photos: `src/domain/photos/storage.ts`
- Window print: `src/features/print/components/PrintClient.tsx`

Server-rendered route files should not call these browser APIs directly.

## Booth Flow

`useBoothSession` owns the capture state machine. It loads the event config, tracks camera/capture/review state, runs the configured countdown before each shot, captures frames, composes the final image, saves to IndexedDB, and exposes actions to UI components.

`BoothCaptureSurface` owns the fullscreen tablet-first capture surface. `BoothReviewPanel` owns final output review actions after composition.

## Layout And Composition

Layout definitions live in `src/domain/layouts/defaultLayouts.ts`. The composition engine accepts an array of captured frames and fills the active layout slots using cover-fit behavior, then draws the optional full-canvas overlay above all photo slots.

## Future Integration Points

Cloud upload should be added behind a media/photo persistence boundary rather than inside the booth UI. PWA/offline sync should build around IndexedDB photo records. Camera switching should extend the camera hook and media domain without changing composition or gallery behavior.

# Development Report: Agent 004

## Summary

Implemented the next product iteration while preserving the Agent 003 `src/` architecture. The app now supports deleting local events with associated photo cleanup, includes a dedicated `/designer/[eventSlug]` route for overlay and numeric slot layout editing, uses saved custom layouts in booth capture/composition, and sizes the booth viewfinder to fill the viewport while preserving the output aspect ratio.

The codebase is also prepared for future Firebase Auth and Google Drive cloud storage work through placeholder types, provider interfaces, folder planning helpers, environment placeholders, and documentation. No real auth or cloud upload was implemented.

## Scope

Included:

- Event deletion from the home event console.
- Confirmation UI before deleting an event.
- IndexedDB cleanup for saved photos associated with the deleted event.
- New `/designer/[eventSlug]` route.
- Overlay upload, replacement, removal, and dimension status in the designer.
- Numeric photo slot editing for `x`, `y`, `width`, `height`, `fit`, and `borderRadius`.
- Add/remove slot controls with a maximum of 4 slots.
- Reset controls for default 1, 2, 3, and 4-photo layouts.
- Custom layout persistence on the event config.
- Booth capture and final composition support for saved custom layouts.
- Viewfinder sizing update for larger desktop and tablet booth display.
- Firebase Auth and Google Drive preparation only.
- `.env.example` and `docs/cloud-integration-plan.md`.

Excluded:

- Real Firebase login.
- OAuth flow.
- Google Drive API upload.
- Supabase.
- WhatsApp, email, payment, AI background removal, beauty filters, sticker editing, native printer bridge, silent kiosk printing, and PWA/offline sync.

## Event Deletion

Events can be deleted from the home event console. Each event card now includes a `Delete` action that opens an in-page confirmation dialog. The dialog explains that the event and saved local photos for that event will be removed from this browser.

Deletion uses the event's stable `id` to remove associated photo records from IndexedDB through `deletePhotosByEventId(eventId)`, then removes the event config from localStorage through `deleteEventConfig(eventId)`. The event list refreshes after deletion, and failures are shown as status text without silently removing the event.

The project also includes `deletePhotosByEventSlug(eventSlug)` and `deleteEventBySlug(eventSlug)` helpers for future flows, but the home console uses event id because saved photo records already store `eventId` and it is more stable than slug if an event is renamed.

## Designer Page

Added a new route:

```text
/designer/[eventSlug]
```

The route stays thin and renders `LayoutDesignerClient` from the designer feature module. The designer loads the selected event by slug and shows:

- The event output size.
- A scaled 3:4 canvas preview for the current event.
- Visible placeholder rectangles for photo slots.
- The current overlay drawn above the slots.
- Overlay upload/replace control.
- Overlay remove control.
- Overlay dimension status and mismatch warning.
- Numeric controls for each slot.
- Add and remove slot controls.
- Reset buttons for the default 1, 2, 3, and 4-photo layouts.
- Navigation back to events, setup, booth, and gallery.

Saving the designer stores a normalized `customLayout` on the event config, sets `layoutId` to `custom-layout`, and syncs `captureCount` to the number of layout slots. Slot count is kept between 1 and 4 to match the current booth capture limits. The booth session now uses the custom layout slot count when a custom layout exists, and the composition engine receives the same resolved layout used by capture.

## Viewfinder Sizing

The booth capture viewfinder still uses the event output aspect ratio, but it now computes its size from the viewport:

```ts
width: min(100vw, calc(100dvh * outputWidth / outputHeight))
height: min(100dvh, calc(100vw * outputHeight / outputWidth))
```

For the default `1200 x 1600` output, this matches the requested 3:4 behavior. Portrait tablet screens fill width as much as possible, and landscape desktop screens fill height as much as possible. The booth capture surface remains `h-dvh` with `overflow-hidden`, so the active capture state should not require scrolling or overflow.

## Cloud Integration Preparation

Firebase Auth and Google Drive storage were prepared through architecture only:

- `src/domain/auth/types.ts` defines `AuthUser` and `AuthProvider`.
- `src/domain/auth/provider.ts` exports a placeholder Firebase Auth provider.
- `src/domain/cloud/types.ts` defines cloud folder, upload input, metadata input, upload result, and storage provider contracts.
- `src/domain/cloud/driveFolderStrategy.ts` creates a predictable folder plan.
- `src/domain/cloud/storageProvider.ts` exports a placeholder Google Drive provider.
- `src/shared/config/env.ts` centralizes public placeholder environment reads.
- `.env.example` lists placeholder Firebase and Google Drive variable names.
- `docs/cloud-integration-plan.md` documents the intended auth/cloud path.

The planned Google Drive hierarchy is:

```text
PhotoBooth Events/
  {eventSlug}-{eventId}/
    overlays/
    outputs/
    thumbnails/
    metadata/
```

Upload methods intentionally throw `Cloud storage is not implemented yet.` No Firebase or Google API packages were installed.

## Files Created or Modified

- `src/app/designer/[eventSlug]/page.tsx` - Thin App Router page for the designer route.
- `src/features/designer/components/LayoutDesignerClient.tsx` - Main designer client UI.
- `src/features/designer/components/DesignerCanvasPreview.tsx` - Scaled canvas preview with overlay and slot placeholders.
- `src/features/designer/components/DesignerOverlayPanel.tsx` - Overlay upload, removal, and dimension status UI.
- `src/features/designer/components/SlotEditor.tsx` - Numeric slot editing, add/remove, and reset controls.
- `src/features/designer/hooks/useLayoutDesigner.ts` - Designer state, overlay loading, slot editing, default resets, and save behavior.
- `src/domain/events/types.ts` - Added optional `customLayout` to event config.
- `src/domain/events/storage.ts` - Preserves custom layouts and adds delete-by-slug helper.
- `src/domain/layouts/defaultLayouts.ts` - Added custom layout id, capture count resolver, layout scaling, and layout normalization helpers.
- `src/domain/photos/storage.ts` - Added event-level photo deletion helpers.
- `src/features/events/components/EventConsole.tsx` - Added designer link and event deletion confirmation flow.
- `src/features/booth/hooks/useBoothSession.ts` - Uses resolved custom layout and custom slot count during capture/composition.
- `src/features/booth/components/BoothCaptureSurface.tsx` - Updated viewfinder sizing and added designer operator shortcut.
- `src/features/booth/components/CameraPreview.tsx` - Accepts sizing styles from the booth surface.
- `src/features/booth/components/BoothReviewPanel.tsx` - Shows custom slot count and links to designer.
- `src/features/setup/components/EventSetupForm.tsx` - Displays an existing custom layout option.
- `src/features/setup/hooks/useEventSetupForm.ts` - Preserves custom layout on save unless capture count or layout preset is changed.
- `src/app/gallery/[eventSlug]/page.tsx` - Adds designer navigation.
- `src/shared/config/routes.ts` - Adds designer route builder.
- `src/domain/auth/*` - Adds future auth contracts and placeholder provider.
- `src/domain/cloud/*` - Adds future cloud storage contracts, placeholder provider, and Drive folder strategy.
- `src/shared/config/env.ts` - Adds public env placeholder config.
- `.env.example` - Adds placeholder Firebase and Google Drive environment variables.
- `docs/cloud-integration-plan.md` - Documents the future auth/cloud plan.
- `README.md`, `docs/project-structure.md`, `docs/architecture-notes.md`, `src/shared/types/index.ts` - Updated documentation and shared type exports.

## Architecture Notes

The implementation keeps the Agent 003 boundaries:

- `src/app` contains thin route files.
- `src/features/designer` owns the new designer UI and state hook.
- `src/features/events` owns event console deletion UI.
- `src/domain/events` owns event persistence.
- `src/domain/photos` owns IndexedDB photo persistence and deletion helpers.
- `src/domain/layouts` owns default layouts, custom layout ids, scaling, normalization, and capture count resolution.
- `src/domain/auth` and `src/domain/cloud` contain future provider contracts only.
- `src/shared/config` owns route and env helpers.

Browser-only APIs remain inside client flows or browser-called domain functions: localStorage for events, IndexedDB for photos, FileReader/Image for overlays, Canvas for composition, camera APIs for booth capture, and window print for print mode.

## Validation Results

Passed:

```powershell
npm.cmd run typecheck
```

Result: TypeScript completed with no errors.

Passed:

```powershell
npm.cmd run build
```

Result: Next.js production build completed successfully and included `/designer/[eventSlug]`.

Passed:

```powershell
npm.cmd run check
```

Result: `check` ran typecheck and build; both completed successfully.

Route smoke test: `next start` was run on `127.0.0.1:3100`, and these routes returned HTTP 200:

- `/`
- `/setup`
- `/designer/test-event`
- `/booth/test-event`
- `/gallery/test-event`
- `/photo/test-photo`
- `/print/test-photo`

The in-app browser connection failed in this sandbox before opening a tab, so visual browser testing and live camera testing were not possible here.

## Regression Notes

Agent 003 behavior was preserved:

- Event setup remains available.
- Tablet Portrait `1200 x 1600 px` remains the default output.
- Setup overlay guidance and uploaded overlay dimension status remain available.
- Camera access remains isolated in the booth camera hook.
- Live overlay viewfinder preview remains above the camera feed.
- Fullscreen booth capture mode remains active.
- Configurable countdown is still used before each shot.
- 1-photo through 4-photo capture flows still work through preset layouts.
- Canvas composition, final output preview, retake, save, gallery thumbnails, photo detail, QR preview, download, and browser print route remain wired.

Real-device testing is still needed for camera permissions, actual capture, overlay alignment, designer save/use flow in a browser, QR scanning, download behavior, and browser print dialog behavior.

## Known Limitations

QR links remain local-only because saved photos still live in this browser's IndexedDB unless a future cloud upload is added.

Printing remains browser-print only. Silent kiosk printing is not implemented and requires separate browser/device setup such as Chrome or Edge kiosk printing mode.

Firebase Auth is not implemented yet. Google Drive upload is not implemented yet. The new auth/cloud files are placeholders and contracts only.

No PWA/offline sync is implemented yet.

Camera behavior still depends on browser permissions, hardware availability, facing-mode support, and secure-context rules.

The designer is a numeric layout foundation, not a drag-and-drop editor.

## Recommended Next Tasks

1. Test event deletion and designer save/use flows on a real tablet browser with a transparent `1200 x 1600 px` PNG.
2. Add a small seeded sample event or developer-only fixture to speed up manual designer and booth testing.
3. Add unit tests for layout normalization, custom layout persistence, Drive folder planning, and event/photo deletion helpers.
4. Add camera switching for front/back camera selection.
5. Add cloud upload status fields to photo records before implementing real Firebase Auth or Google Drive upload.

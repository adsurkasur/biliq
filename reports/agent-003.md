# Development Report: Agent 003

## Summary

Refactored the photo booth MVP into a more maintainable `src/`-based structure with clearer boundaries between Next.js routes, feature UI, domain logic, browser infrastructure, shared utilities, and documentation. Existing Agent 002 product behavior was preserved: tablet portrait defaults, setup overlay guidance, live overlay viewfinder preview, fullscreen booth capture, 1-4 photo composition, gallery, photo detail, QR preview, download, and browser print remain intact.

## Scope

Included:

- Moved application code into `src/`.
- Split large booth and setup components into focused components and hooks.
- Moved event, photo, layout, camera, capture, and composition logic into domain modules.
- Added shared route, storage key, app metadata, browser, image, slug, validation, ID, download, and QR helpers.
- Improved path aliases, Tailwind content paths, `.gitignore`, package scripts, and developer documentation.
- Added route smoke testing against the built app.

Excluded:

- Cloud upload, Supabase, authentication, WhatsApp, email, payment, AI background removal, beauty filters, sticker editing, advanced dashboard, native print bridge, silent kiosk printing, PWA/offline sync, and visual redesign.

## Structure Changes

Before the refactor, the project used root-level `app/`, `components/`, and `lib/` folders. Route-level files and reusable components were functional but mixed route rendering, browser logic, domain defaults, storage, canvas, and UI concerns.

After the refactor, source code lives under:

```text
src/
  app/
  domain/
  features/
  shared/
```

`src/app` now contains thin route files. `src/features` owns feature-level UI and hooks. `src/domain` owns product/domain logic and browser infrastructure that is called from client flows. `src/shared` owns cross-feature config, helpers, shared components, and type re-exports.

Context documents were left in the repository root to avoid breaking existing references.

## Files Created or Modified

- `src/app/*` - Moved App Router files into `src/app` and kept route files thin.
- `src/features/events/components/EventConsole.tsx` - Moved the local event console out of the root route.
- `src/features/setup/components/EventSetupForm.tsx` - Reduced setup form responsibilities and delegated overlay/output details.
- `src/features/setup/components/OverlayAssetInfo.tsx` - Isolated overlay upload, preview, and dimension status UI.
- `src/features/setup/components/OutputPresetInfo.tsx` - Isolated output size, aspect ratio, and overlay recommendation UI.
- `src/features/setup/hooks/useEventSetupForm.ts` - Centralized setup loading, form state, layout/capture syncing, overlay upload, and save behavior.
- `src/features/setup/hooks/useOverlayDimensions.ts` - Isolated browser image-dimension reading.
- `src/features/booth/hooks/useBoothSession.ts` - Centralized booth state, countdown sequencing, multi-photo capture, composition, retake, and save actions.
- `src/features/booth/hooks/useCameraStream.ts` - Isolated camera stream startup and cleanup from the view component.
- `src/features/booth/components/*` - Split booth UI into client wrapper, capture surface, review panel, camera preview, countdown, progress, and final preview components.
- `src/features/gallery/*` - Moved gallery grid and simple gallery actions into a gallery feature.
- `src/features/photo/components/PhotoDetailClient.tsx` - Moved photo detail UI into the photo feature.
- `src/features/print/components/*` - Moved print client and print button into the print feature.
- `src/domain/events/*` - Added event types, defaults, output presets, and localStorage storage module.
- `src/domain/photos/*` - Added photo types and IndexedDB storage module.
- `src/domain/layouts/*` - Added layout types and default 1/2/3/4-photo layout definitions.
- `src/domain/media/*` - Added camera, capture, composition, and media types.
- `src/shared/*` - Added app config, route builders, storage keys, QR preview, and shared helpers.
- `README.md` - Added developer-facing project overview, run commands, routes, validation, and limitations.
- `docs/project-structure.md` - Added folder organization and future placement guidance.
- `docs/architecture-notes.md` - Added local-first, browser API, booth flow, layout/composition, and future integration notes.
- `.gitignore` - Expanded ignores for Next.js, Node, Windows, local env files, caches, logs, coverage, and test artifacts.
- `tsconfig.json` - Updated `@/*` alias to point at `src/*`.
- `tailwind.config.ts` - Updated content scanning to `src/app`, `src/features`, `src/shared`, and `src/domain`.
- `package.json` - Added `check` script that runs typecheck and build.

## Component and Hook Refactor

`BoothClient.tsx` was decomposed into:

- `useBoothSession` for session state, countdown, multi-photo sequencing, composition, retake, and save.
- `useCameraStream` for camera startup and stream cleanup.
- `BoothCaptureSurface` for fullscreen tablet-first capture UI.
- `BoothReviewPanel` for final output review, save, download, QR, gallery, and print actions.
- `CameraPreview`, `CountdownOverlay`, `CaptureProgress`, and `FinalOutputPreview` for focused view pieces.

`EventSetupForm.tsx` was decomposed into:

- `useEventSetupForm` for setup state, event loading, capture/layout synchronization, overlay upload, and save.
- `useOverlayDimensions` for browser-only image dimension reading.
- `OutputPresetInfo` for output and overlay sizing guidance.
- `OverlayAssetInfo` for overlay upload state, warnings, preview, and removal.

The decomposition keeps behavior the same while making future changes to camera switching, layout editing, cloud upload, or offline sync easier to isolate.

## Domain and Infrastructure Boundaries

Domain logic now lives outside React components:

- Events: `src/domain/events`
- Photos and IndexedDB: `src/domain/photos`
- Layout definitions and capture count normalization: `src/domain/layouts`
- Camera access, frame capture, canvas composition, thumbnails: `src/domain/media`

Route builders and storage key names live in `src/shared/config`. Slug generation, ID generation, image helpers, browser guards, download helpers, QR URL generation, and aspect-ratio formatting live in `src/shared/lib`.

Next.js route files import feature components and avoid business logic. Feature modules coordinate UI with domain modules.

## Browser API Safety

Browser-only APIs are isolated behind client components, hooks, or functions called from client flows:

- `localStorage` is guarded in `src/domain/events/storage.ts`.
- IndexedDB is guarded in `src/domain/photos/storage.ts`.
- Camera APIs are isolated in `src/domain/media/camera.ts` and called through `useCameraStream`.
- Canvas capture/composition is isolated in `src/domain/media/captureFrame.ts` and `src/domain/media/composePhoto.ts`.
- Image dimension reading is isolated in `useOverlayDimensions` and `src/shared/lib/image.ts`.
- `window.print()` remains inside the client print page component.

Server route files do not directly execute browser-only code.

## Gitignore and Tooling

`.gitignore` now covers Next.js output, Node dependencies, build folders, Vercel/Turbo output, environment files with `.env.example` allowed, npm/yarn/pnpm logs, OS junk files, IDE folders, coverage, Playwright output, test results, temporary files, and TypeScript build-info files. `reports/` and project context documents remain versionable.

`tsconfig.json` now maps `@/*` to `./src/*`. `tailwind.config.ts` scans the new source folders. `package.json` preserves `dev`, `typecheck`, and `build`, and adds:

```powershell
npm.cmd run check
```

The `check` script runs TypeScript and the production build. No lint script is configured, and no new major dependency upgrade was introduced.

## Documentation Added

- `README.md` - Developer overview, current MVP status, commands, routes, and limitations.
- `docs/project-structure.md` - Folder organization and import guidance for future work.
- `docs/architecture-notes.md` - Browser/API boundaries, local-first data flow, booth flow, layout/composition notes, and future integration points.

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

Result: Next.js production build completed successfully.

Passed:

```powershell
npm.cmd run check
```

Result: `check` ran `typecheck` and `build`; both completed successfully.

Route smoke test: `next start` was run on `127.0.0.1:3100`, and these routes returned HTTP 200:

- `/`
- `/setup`
- `/booth/test-event`
- `/gallery/test-event`
- `/photo/test-photo`
- `/print/test-photo`

No lint check was run because the project does not currently define a lint script.

## Regression Notes

Agent 002 behavior was preserved during the refactor:

- Event setup remains available.
- Tablet Portrait `1200 x 1600 px` remains the default output.
- Setup overlay guidance and uploaded overlay dimension status remain available.
- Booth capture remains fullscreen and tablet-first.
- Live overlay preview remains layered above the camera viewfinder.
- Configured countdown is still used before each shot.
- 1-photo through 4-photo capture and composition remain supported.
- Final preview, retake, save, gallery thumbnails, photo detail, QR preview, download, delete, and browser print route remain wired.

Live browser and camera testing was not possible because the in-app browser connector failed before opening a tab in this sandbox. Real device testing is still needed for camera permissions, actual overlay alignment, capture clicks, download behavior, QR scanning, and print dialog behavior.

## Known Limitations

QR links are local-only and depend on the same browser/device IndexedDB data. Cross-device public QR sharing still requires cloud upload in a later milestone.

Printing remains browser-print only. Silent kiosk printing is intentionally not implemented and requires separate device/browser setup such as Chrome or Edge kiosk printing mode.

Camera behavior depends on browser permissions, hardware availability, and secure-context support. Localhost is acceptable for development, but deployed camera use should be tested over HTTPS.

No cloud sharing, authentication, Supabase, PWA/offline sync, camera switching, or advanced layout builder exists yet.

## Recommended Next Tasks

1. Run real-device regression testing on an iPad/tablet using a transparent `1200 x 1600 px` overlay.
2. Add camera device selection and front/back switching inside the existing camera hook.
3. Add a lightweight thumbnail/progress rail during multi-photo capture.
4. Add automated tests for layout selection, event config normalization, and composition helpers.
5. Add PWA/offline sync planning around the existing IndexedDB photo boundary.

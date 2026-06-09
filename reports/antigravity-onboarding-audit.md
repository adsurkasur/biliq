# Antigravity Onboarding Audit

## Summary

I have successfully performed a complete onboarding audit of the `client-gita` project. The repository contains a fully structured, local-first Next.js photo booth MVP. The codebase is clean, well-architected, and fully consistent with the development reports from preceding agents (including the latest `reports/agent-005.md` and `docs/ui-motion-guidelines.md`). I fully understand the project state, its flow boundaries, and its constraints.

## Product Understanding

The product is a browser-based, cross-device, local-first photo booth MVP designed for clients to run photo booths at events. It operates entirely in-browser, leveraging a tablet-first layout (optimized for portrait viewports) to capture 1 to 4 photos per session. The MVP is built for operators to configure events (e.g. name, output size, countdown, overlay templates) and capture/compose images offline or locally without immediately requiring internet connectivity. Crucially, the UI identity is fully original and avoids copying LumaBooth branding, styling, icons, or proprietary design cues.

## Repository Structure

The repository structure follows a clean, modular layer architecture:
*   `src/app/`: Thin Next.js App Router files serving as routing entrypoints only (e.g., page and layout files).
*   `src/features/`: UI components, custom hooks, and styling structures grouped by feature (e.g., `booth`, `designer`, `events`, `gallery`, `photo`, `print`, `setup`).
*   `src/domain/`: Pure logic modules representing domain interfaces and local storage abstractions (e.g., `events`, `photos`, `layouts`, `media`, `auth`, `cloud`), separated from React component trees.
*   `src/shared/`: Cross-cutting helpers, global configurations, custom UI primitives, types, and library files.

This folder structure aligns perfectly with the intended architectural boundaries described in `docs/project-structure.md`.

## Implemented Feature Crosscheck

A deep dive into the codebase confirms that the following core baseline features are fully implemented:
*   **Event Setup & Management**: Configurable via `/setup` and saved via `localStorage` (implemented in `src/domain/events/storage.ts` and `src/features/setup/components/EventSetupForm.tsx`).
*   **Default Canvas Output**: Generates portrait configurations by default at `1200 x 1600 px` (configured in `src/domain/events/types.ts` and `src/domain/layouts/defaultLayouts.ts`).
*   **Viewfinder Sizing**: Viewfinder preserves the output aspect ratio and fills the viewport space (handled in `src/features/booth/components/BoothCaptureSurface.tsx`).
*   **Camera & Capture APIs**: Video frame captures using HTML5 Canvas methods (in `src/domain/media/captureFrame.ts`).
*   **Multi-Photo Flows**: Handles 1, 2, 3, or 4 shots (driven by the countdown state machine in `src/features/booth/hooks/useBoothSession.ts`).
*   **Canvas Composition**: Merges captured frames, overlays, and background fits using cover or contain sizing (in `src/domain/media/composePhoto.ts`).
*   **Custom Layout Designer**: Accessible at `/designer/[eventSlug]` to configure layouts (implemented in `src/features/designer/components/LayoutDesignerClient.tsx` and saved directly into the event's configuration).
*   **Gallery, Details & Prints**: Local gallery thumbnail browsing and detail preview, including QR previews and browser-based prints (`src/features/gallery/`, `src/features/photo/`, and `src/features/print/`).

## Agent 005 Crosscheck

The updates introduced by Agent 005 are fully present:
*   **CSS-Only Motion System**: Implemented strictly with standard CSS animations and transitions inside `src/app/globals.css` (e.g. `.motion-enter`, `.countdown-pop`, `.capture-flash`, `.result-reveal`). No runtime animation libraries (such as Framer Motion) are imported.
*   **Reduced-Motion Handling**: The media query `@media (prefers-reduced-motion: reduce)` is declared in `globals.css` to disable heavy scale/transform loops for accessibility.
*   **Shared UI Primitives**: Located at `src/shared/components/ui/` (`Button.tsx`, `Card.tsx`, `Badge.tsx`, `Modal.tsx`, `Toast.tsx`, `EmptyState.tsx`, `Spinner.tsx`, `PageShell.tsx`), including custom composition wrappers like `classNames.ts`.
*   **Feedback Polish**: The Toast notification system is integrated for CRUD feedback (e.g. event creation, deletion, saving layout).
*   **Polish to Booth & Console**: Fully contains countdown overlays, capture flashes, grid updates, and animated modals.
*   **Motion Documentation**: Detailed guidelines exist in `docs/ui-motion-guidelines.md`.

## Browser API and Storage Boundaries

Browser-only APIs are cleanly decoupled from the Next.js server route entrypoints and only execute in client components or isolated helper functions:
*   **Camera Streams**: Managed in `src/domain/media/camera.ts` using `navigator.mediaDevices.getUserMedia`.
*   **Frame Capture**: Performed on canvas elements in `src/domain/media/captureFrame.ts`.
*   **Canvas Composition**: Drawn in `src/domain/media/composePhoto.ts`.
*   **`localStorage` access**: Isolated inside `src/domain/events/storage.ts` and gated by `isBrowser()` checks.
*   **IndexedDB access**: Isolated inside `src/domain/photos/storage.ts` to persist captured photo records.
*   **Print Dialogs**: Triggered using `window.print()` in `src/features/print/components/PrintClient.tsx`.

No server routes invoke these APIs, satisfying the Next.js SSR-safe boundary constraints.

## Designer and Custom Layout Flow

1.  **Saving Custom Layouts**: The layout designer component (`src/features/designer/components/LayoutDesignerClient.tsx`) calls `useLayoutDesigner` to modify layout grids and slots. When saved, the custom layout structure is written directly to the `EventConfig.customLayout` property and saved via `upsertEventConfig` in `src/domain/events/storage.ts`.
2.  **Using Custom Layouts in Booth**: In `src/features/booth/hooks/useBoothSession.ts`, the hook retrieves the active event configuration. If a `customLayout` is present on the event config, the booth session uses it to drive the target capture count (matching the number of slots in the custom layout) and passes this layout directly to `composePhoto` to compile the final canvas composite.

## Event Deletion Flow

1.  **Triggering Deletion**: Within the event console dashboard (`src/features/events/components/EventConsole.tsx`), selecting "Delete" triggers the deletion modal.
2.  **Cascading Cleanup**: Clicking "Delete Event" executes `handleDeleteEvent()`, which:
    *   Calls `deletePhotosByEventId(deleteTarget.id)` from `src/domain/photos/storage.ts` to purge all photo records (including their binary image data) associated with the event from IndexedDB.
    *   Calls `deleteEventConfig(deleteTarget.id)` from `src/domain/events/storage.ts` to purge the event from `localStorage`.
    *   Reports the number of deleted photo records via a toast notification.

## Cloud Preparation

*   **Firebase Auth**: The interface contract resides in `src/domain/auth/types.ts`. A placeholder provider is in `src/domain/auth/provider.ts`, which returns `null` for `getCurrentUser()` and throws "Firebase Auth is not implemented yet" for action calls.
*   **Google Drive Storage**: The interface contract resides in `src/domain/cloud/types.ts`. A placeholder provider is in `src/domain/cloud/storageProvider.ts`, which throws "Cloud storage is not implemented yet" for all uploads.
*   **Folder Strategy**: A pure strategy function in `src/domain/cloud/driveFolderStrategy.ts` generates the folder layout plans using env configurations from `src/shared/config/env.ts` (mapped to `.env.example`).
*   No secrets or real API client initialization logic are present.

## Validation Results

*   **TypeScript Check**: Passed successfully without errors.
    ```powershell
    npm run typecheck
    ```
*   **Next.js Production Build**: Passed successfully.
    ```powershell
    npm run build
    ```
*   **Lint**: No custom lint script is configured in `package.json`.
*   **Route Smoke Tests**: Next.js compiled all route entrypoints (`/`, `/setup`, `/designer/[eventSlug]`, `/booth/[eventSlug]`, `/gallery/[eventSlug]`, `/photo/[photoId]`, `/print/[photoId]`) without compiling errors.

## Risks and Open Questions

1.  **Browser Media Permissions**: Browser security policies (especially on mobile/tablet devices) require `HTTPS` or `localhost` to allow camera stream access. Operators deploying locally to other machines over the LAN will need secure context configuration.
2.  **Storage Quotas**: Because the application stores high-resolution composed JPEG images in IndexedDB, long events could exceed typical browser storage quotas if not backed up or cleared.
3.  **Kiosk Printing Integration**: The browser's print route relies on standard OS print dialogs. Achieving silent or instant printing requires kiosk configuration (e.g. Chrome's `--kiosk --kiosk-printing` flags), which should be documented for the client.

## Recommended Next Tasks

1.  **Automated Unit/Integration Tests**: Write unit tests for local storage cleanup routines and custom layout resolution rules.
2.  **Add a Demo Setup Hook**: Create a script or button to quickly seed the IndexedDB and localStorage with a demo event containing sample photos to ease visual QA.
3.  **Camera Facing Mode Controls**: Extend the `useCamera` hook to allow toggling facing modes (e.g., switching between front and back camera on mobile tablets).
4.  **Cloud Sync Status Indicators**: Implement progress indicators in the gallery UI detailing upload queues (preparing for the upcoming Firebase Auth and Google Drive integration).

# Development Report: Agent 005

## Summary

Overhauled the UI and motion layer so the photo booth feels more polished, fluid, and demo-ready while preserving Agent 004 behavior. The booth now has animated camera entrance, countdown pulse, capture flash, capture feedback, progress dots, and a more refined review screen. Admin pages now use more consistent cards, buttons, toasts, loading states, empty states, and modal feedback.

No product-scope expansion was added. Cloud auth/upload, PWA/offline sync, camera switching, silent printing, and other non-goals remain unimplemented.

## Scope

Included:

- CSS-based motion system with reduced-motion handling.
- Shared UI primitives for buttons, cards, badges, modal, toast, empty state, spinner, and page shell.
- Animated booth countdown and capture flash.
- Multi-photo progress dots and capture success feedback.
- Animated result reveal and review action feedback.
- Event console card, empty state, toast, and delete modal polish.
- Setup page grouping, loading state, save feedback, and designer navigation.
- Designer selected-slot feedback, animated panels, overlay empty state, and add/remove/reset/save feedback.
- Gallery reveal, thumbnail hover, empty/loading states, and delete/download feedback.
- Photo detail, QR, print, and missing-data state polish.
- Practical motion documentation in `docs/ui-motion-guidelines.md`.

Excluded:

- Framer Motion dependency.
- Real Firebase Auth.
- Google Drive upload.
- Supabase.
- WhatsApp, email, payment, AI background removal, beauty filters, sticker editor, PWA/offline sync, native printer bridge, silent kiosk printing, and camera switching.

## Motion System

Framer Motion was not added. It was not already installed, and the environment has restricted network access. CSS keyframes, CSS transitions, and Tailwind utilities were enough for this pass and keep the app lighter.

Global motion helpers were added in `src/app/globals.css`, including:

- `motion-enter`
- `motion-card`
- `motion-pop`
- `motion-toast`
- `booth-viewfinder-enter`
- `booth-start-button`
- `countdown-pop`
- `capture-flash`
- `capture-success-pulse`
- `result-reveal`

Motion uses opacity, transform, scale, blur, and shadow. The app avoids animating the video element itself or layout-heavy properties like width, height, top, and left during booth capture.

Reduced motion is handled with a global `prefers-reduced-motion: reduce` rule that shortens animations and transitions while keeping essential state feedback visible.

## Booth Experience Polish

The booth capture surface now has an animated viewfinder entrance and a subtle dark kiosk-style background. The start button has a controlled ready-state pulse and touch-friendly active state.

Countdown numbers animate with a scale/pop effect keyed to each countdown value. The countdown timing remains driven by the existing countdown loop, so animation does not delay or change capture timing.

A capture flash now appears immediately after each `captureFrame` call returns. Multi-photo capture also shows animated progress dots and a short captured-state pulse between shots. Processing state remains visible while composition is running.

The transition to review is smoother through the result reveal animation. The review panel now has clearer action hierarchy, save success feedback, download feedback, QR reveal after save, and consistent print/retake controls.

The Agent 004 viewfinder sizing behavior was preserved: the frame still uses the event output aspect ratio, fills the viewport as much as possible, and keeps the booth capture surface non-scrolling.

## Admin and Designer UI Polish

Event console:

- Event cards now animate in and use consistent card/button styles.
- Event cards show whether an event is using a preset or custom layout.
- Empty state is more polished and action-oriented.
- Delete confirmation uses an animated modal instead of an abrupt plain panel.
- Delete success/failure feedback appears through toasts.

Setup page:

- Form controls are grouped into a clearer event details card.
- Inputs have consistent sizing, focus, and transition states.
- Output guidance keeps the required technical details with stronger visual hierarchy.
- Overlay upload has better hover feedback and status styling.
- Save feedback uses a toast.
- Editing an existing event now exposes a clear route to the designer.

Designer page:

- Canvas preview and panels have animated entrance and stronger visual hierarchy.
- Preview slots can be selected, with selected-slot ring feedback.
- Slot editor highlights the selected slot and responds on hover/focus.
- Add/remove/reset operations now provide feedback before saving.
- Overlay empty state and mismatch status are clearer.
- Save confirmation uses a toast.

Gallery and photo detail:

- Gallery loading and empty states are clearer.
- Gallery cards animate in and thumbnails have subtle hover/tap motion.
- Gallery download and delete actions provide feedback.
- Photo detail has a more polished result presentation, loading/missing states, and download feedback.
- QR preview now has loading/reveal states.

Print page:

- On-screen controls now match the shared button system.
- Print CSS remains focused on clean image output and still hides controls during print.
- Browser print remains the only print behavior.

## Shared UI Components

Added these shared UI primitives under `src/shared/components/ui`:

- `Button.tsx` - Shared button component and `buttonClassName` helper for links.
- `Card.tsx` - Shared card shell with optional hover elevation.
- `Badge.tsx` - Compact status labels.
- `Modal.tsx` - Accessible enough MVP modal shell for confirmation flows.
- `Toast.tsx` - Status feedback for save/delete/download actions.
- `EmptyState.tsx` - Consistent empty/missing-data presentation.
- `Spinner.tsx` - Lightweight loading indicator.
- `PageShell.tsx` - Common page spacing and animated shell.

Added `src/shared/lib/classNames.ts` for small class name composition.

These primitives are used across booth, event console, setup, designer, gallery, photo detail, print, and QR preview.

## Performance and Accessibility Notes

Animations are CSS-only and use performance-safe properties such as opacity and transform. The live camera video element is not transformed during countdown or capture feedback, preserving video/overlay alignment and reducing camera preview risk.

Capture flash and success feedback are short-lived overlays keyed by capture events. Continuous motion is limited to the start button pulse, which is disabled by reduced-motion rules.

Buttons remain real `button` elements where actions happen, and links remain links for navigation. Focus rings remain visible through the shared `booth-focus-ring` class. The delete confirmation modal uses `role="dialog"`, `aria-modal`, a labeled title, and real buttons.

Reduced motion is supported globally. Real reduced-motion behavior still needs browser verification.

## Files Created or Modified

- `src/app/globals.css` - Added motion keyframes, reduced-motion handling, and a slightly richer global page background.
- `src/shared/lib/classNames.ts` - Added class name composition helper.
- `src/shared/components/ui/*` - Added shared Button, Card, Badge, Modal, Toast, EmptyState, Spinner, and PageShell primitives.
- `src/features/booth/hooks/useBoothSession.ts` - Added capture feedback key and loaded-state tracking.
- `src/features/booth/components/BoothCaptureSurface.tsx` - Added viewfinder entrance, start button motion, capture flash, and captured pulse.
- `src/features/booth/components/CountdownOverlay.tsx` - Added animated countdown number and label reveal.
- `src/features/booth/components/CaptureProgress.tsx` - Added progress dots and animated busy/error badges.
- `src/features/booth/components/BoothReviewPanel.tsx` - Added polished result actions, toasts, badges, and QR reveal.
- `src/features/booth/components/FinalOutputPreview.tsx` - Added result image reveal and shared badge styling.
- `src/features/booth/components/CameraPreview.tsx` - Added animated camera loading/error overlay and spinner.
- `src/features/events/components/EventConsole.tsx` - Added shared cards, buttons, toasts, modal, badges, and empty state.
- `src/features/setup/components/*` - Polished form grouping, output guidance, overlay panel, loading, and save feedback.
- `src/features/designer/components/*` - Added selected slot visuals, animated panels, shared buttons/cards, and save/action feedback.
- `src/features/designer/hooks/useLayoutDesigner.ts` - Added selected slot state and add/remove/reset feedback.
- `src/features/gallery/components/GalleryGrid.tsx` - Added reveal animation, empty/loading states, card hover, and action feedback.
- `src/features/photo/components/PhotoDetailClient.tsx` - Added polished loading/missing states, result reveal, and download feedback.
- `src/features/print/components/PrintButton.tsx` - Switched to shared Button.
- `src/features/print/components/PrintClient.tsx` - Polished on-screen controls while preserving print output behavior.
- `src/shared/components/QrPreview.tsx` - Added loading and reveal state.
- `src/app/setup/page.tsx`, `src/app/gallery/[eventSlug]/page.tsx` - Adopted shared page/button patterns.
- `docs/ui-motion-guidelines.md` - Added practical motion guidelines.
- `docs/project-structure.md`, `docs/architecture-notes.md` - Documented shared UI and motion placement.

## Architecture Notes

The existing architecture remains intact:

- `src/app` route files remain thin.
- Feature-specific UI and motion usage live in `src/features`.
- Domain logic and persistence were not moved into UI components.
- Shared UI primitives and motion documentation live in `src/shared` and `docs`.
- Future auth/cloud placeholder code remains untouched and is not mixed into booth UI.

No new runtime dependency was added.

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

Result: `check` ran typecheck and build; both completed successfully.

Lint:

No lint script is configured in `package.json`, so lint was not run.

Route smoke test: `next start` was run on `127.0.0.1:3100`, and these routes returned HTTP 200:

- `/`
- `/setup`
- `/designer/test-event`
- `/booth/test-event`
- `/gallery/test-event`
- `/photo/test-photo`
- `/print/test-photo`

The in-app browser connection failed in this sandbox before opening a tab, so live browser, camera, visual animation, and real-device testing were not possible here.

## Regression Notes

Agent 004 behavior was preserved:

- Event setup still works.
- Tablet Portrait `1200 x 1600 px` remains the default output.
- Setup overlay guidance and uploaded overlay dimension status remain available.
- Camera access remains in the booth flow.
- Live overlay preview remains layered above the camera feed.
- Booth capture remains fullscreen and non-scrolling.
- Viewfinder still preserves 3:4/output aspect ratio and fills the viewport as much as possible.
- Configurable countdown remains the timing source.
- 1-photo through 4-photo capture flows remain supported.
- Custom layout designer and custom layout persistence remain wired.
- Booth capture and composition still use saved custom layouts.
- Final preview, retake, save to gallery, gallery thumbnails, photo detail, QR preview, download, print route, and event deletion remain wired.

Manual testing still needed on a real browser/device:

1. iPad or tablet portrait booth capture.
2. Viewfinder fills viewport while keeping 3:4 ratio.
3. Live overlay alignment.
4. Animated countdown timing.
5. Capture flash timing.
6. Multi-photo progress.
7. Review panel save, QR, download, and print controls.
8. Designer slot editing and save flow.
9. Event deletion with local photo cleanup.
10. Reduced-motion behavior.

## Known Limitations

QR links remain local-only because saved photos live in this browser's IndexedDB unless future cloud upload is added.

Printing remains browser-print only. Silent kiosk printing is not implemented and requires separate browser/device setup such as Chrome or Edge kiosk printing mode.

Firebase Auth is not implemented yet. Google Drive upload is not implemented yet.

No PWA/offline sync is implemented yet.

No camera switching is implemented yet.

Camera behavior still depends on browser permissions, hardware availability, facing-mode support, and secure-context rules.

The designer remains a numeric layout foundation, not a drag-and-drop editor.

## Recommended Next Tasks

1. Run a real iPad/tablet capture rehearsal with a `1200 x 1600 px` transparent overlay.
2. Add automated tests for event deletion, layout normalization, and custom layout capture count behavior.
3. Add a small demo fixture event to make repeat visual QA faster.
4. Add camera switching inside the existing camera hook.
5. Add cloud upload status fields before implementing real Firebase Auth or Google Drive upload.

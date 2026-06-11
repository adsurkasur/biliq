# Agent 011 Global Loading State Report

## Summary

Implemented a global shared `LoadingIndicator` component and successfully integrated it across the app, replacing ad-hoc loading states and one-off spinners to create a consistent, reliable, and clear user experience for state resolution.

## Scope

Included:
- Created the reusable `LoadingIndicator` component.
- Integrated into Designer Guide (preparing state).
- Integrated into Layout Designer Client (resolving layout).
- Integrated into Event Setup (resolving event config).
- Integrated into Booth Client (preparing event/session).
- Integrated into Gallery Grid (fetching IndexedDB records).
- Integrated into Photo Detail (loading local record).
- Integrated into Print View (preparing printable record).
- Kept all saving behaviors immediate as their backing logic (localStorage) is fully synchronous.

Excluded:
- Next.js route `loading.tsx` additions were excluded to keep server behavior lean and respect the fact that the data resolution is entirely client-side.
- Tooltip/Guide interactions, Designer property panels, camera behaviors.

## Shared Loading Primitive

The `LoadingIndicator` (`src/shared/components/ui/LoadingIndicator.tsx`) wraps the pre-existing Biliq `Spinner` to provide standardized layouts:
- `variant="inline"`: A compact inline spinner with optional label. Suitable for small areas (like the Guide preparing state).
- `variant="section"`: A soft rounded Card container with a larger spinner, title, and optional description. Ideal for Gallery or Setup.
- `variant="page"`: A full-screen centered grid layout with the largest spinner, title, and description. Ideal for primary page resolution like Designer, Booth, or Photo Detail.

**Accessibility**: Utilizes `role="status"` and `aria-live="polite"` out-of-the-box. Uses Biliq's native styles which respect `motion-safe` rules for reduced-motion preferences.

## Integrations

- **Designer Guide**: The temporary `Loader2` preparing state was swapped for `<LoadingIndicator variant="inline" label="Preparing guide…" />`.
- **Designer**: Replaced raw Page wrapper and Spinner with `<LoadingIndicator variant="page" ... />`.
- **Setup**: In `EventSetupForm.tsx`, the initial resolve state was upgraded to `<LoadingIndicator variant="inline" className="w-full justify-center" ... />` inside the Setup Card.
- **Booth**: In `BoothClient.tsx`, the page load state was replaced with `<LoadingIndicator variant="page" ... />`.
- **Gallery**: In `GalleryGrid.tsx`, fetching local photos now displays `<LoadingIndicator variant="section" ... />`.
- **Photo Detail**: `PhotoDetailClient.tsx` uses `<LoadingIndicator variant="page" ... />` while indexedDB resolves.
- **Print**: `PrintClient.tsx` uses `<LoadingIndicator variant="page" ... />` while indexedDB resolves.
- **Save Actions**: Event Setup and Designer saves are fully synchronous (`localStorage.setItem`) and trigger immediate success toasts. No fake async delays were introduced, strictly adhering to instructions.

## Loading vs Empty vs Error States

The implementation maintains strict boundaries. In components like `GalleryGrid`, `PhotoDetailClient`, and `PrintClient`, the state checks explicitly split `status === "Loading..."` from actual empty states (where the record isn't found) and error states (where `catch` blocks set failure statuses). Only the strict loading literal triggers the `LoadingIndicator`, while the rest safely render their respective `EmptyState` boundaries.

## Files Created or Modified

- **`src/shared/components/ui/LoadingIndicator.tsx`** [NEW]: The core shared primitive.
- **`src/features/designer/components/DesignerGuide.tsx`** [MODIFIED]: Integrated `variant="inline"`.
- **`src/features/designer/components/LayoutDesignerClient.tsx`** [MODIFIED]: Integrated `variant="page"`.
- **`src/features/setup/components/EventSetupForm.tsx`** [MODIFIED]: Integrated `variant="inline"`.
- **`src/features/booth/components/BoothClient.tsx`** [MODIFIED]: Integrated `variant="page"`.
- **`src/features/gallery/components/GalleryGrid.tsx`** [MODIFIED]: Integrated `variant="section"`.
- **`src/features/photo/components/PhotoDetailClient.tsx`** [MODIFIED]: Integrated `variant="page"`.
- **`src/features/print/components/PrintClient.tsx`** [MODIFIED]: Integrated `variant="page"`.

## Architecture Notes

- Kept inside `src/shared/components/ui`, preventing feature-coupling.
- Kept route layers (`src/app/`) thin and untouched.
- Prevented creating `loading.tsx` boundaries to avoid SSG mismatch with client-side IndexedDB resolution.

## Validation Results

- `npm run typecheck`: ✅ Passed
- `npm run build`: ✅ Passed
- `npm run check`: ✅ Passed
- **Manual Verification Notes**: Shared loading primitive variants (`inline`, `section`, `page`) mapped cleanly to the existing Biliq tonal system without breaking layout constraints. 

## Regression Notes

- All Designer interactions (Shift/Alt lock, snap, rotate, Tooltips, Checkpoints) remain fully intact.
- Booth Camera, Setup save logic, and photo gallery logic remain identical.
- Toast success prompts for synchronous actions remain immediate.

## Known Limitations

- Future async data (like cloud uploads) will need button-level `isLoading` states for Save actions, as the current saves are 100% synchronous local state mutations.

## Recommended Next Tasks

Agent 012 direction:
1. **PWA & Offline Sync:** Introduce service worker definitions and caching strategies for Biliq, ensuring that the Booth session stays resilient regardless of network conditions.

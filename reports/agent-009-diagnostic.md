# Agent 009 Diagnostic Report

## Summary
This report diagnoses three critical UX and implementation issues identified after the Agent 009 milestone. Code inspection confirms the reported issues:
1. Continuous scrubbing fails because the host element is destroyed during state updates.
2. Event navigation is heavily duplicated and deeply inconsistent across pages.
3. The Setup page callout uses inaccessible color tokens and inappropriate user-facing copy.

## Agent 009 Implementation Claims
Based on `reports/agent-009.md`, Agent 009 successfully delivered the advanced designer foundation. It claimed to have:
- Created the `OverlayLayer` domain model and integrated it with `EventConfig`.
- Updated the `composePhoto` engine to handle multiple sorted layers with opacity and rotation.
- Overhauled the `CameraPreview` and Designer canvases to use CSS percentage positioning for visual consistency.
- Built a `ScrubbableNumberField` for dragging values horizontally.
- Revamped the Designer UI with `DesignerLayerList`, `OverlayLayerEditor`, and updated `SlotEditor`.
- Kept backwards compatibility with single overlays without destructive schema migrations.

## Scrubbable Controls Diagnosis
Currently, `ScrubbableNumberField` handles pointer events (`pointerdown`, `pointermove`, `pointerup`) on its internal wrapper `div`. 
- **Tracking:** It calls `e.currentTarget.setPointerCapture` and stores the start value and pointer X coordinate in React `useRef` hooks.
- **Why it stops:** The root cause is outside the component itself. In `SlotEditor.tsx`, the `ScrubbableNumberField` instances are wrapped in an `<article>` that uses `key={`${index}-${slot.x}-${slot.y}`}`. Because the key depends on the scrubbed value, every single pixel change causes the entire React subtree to unmount and remount. This instantly destroys the pointer capture, the refs, and the internal dragging state.
- **Manual Input:** Yes, manual text input still works via the `onChange` handler on the actual `<input>` element.
- **Range Slider:** No native HTML range slider is implemented in the current component.
- **Risk Assessment:** High. The unmounting bug prevents scrubbing entirely, and the lack of a global window listener and `touch-action: none` makes the current component brittle even if the key issue is fixed.

## Scrubbable Controls Recommended Fix
- **Fix the Keys:** Update `SlotEditor` to use stable keys for the slot items (e.g., `key={index}`), removing dynamic properties from the key.
- **Global Event Listeners:** Instead of relying on `setPointerCapture` on the element, attach `pointermove` and `pointerup` event listeners to the `window` or `document` during the drag phase inside a `useEffect`. This ensures the drag continues smoothly even if the cursor leaves the element or if React rerenders the DOM node.
- **Touch Support:** Add `touch-action: none` to the draggable label to prevent mobile browsers from hijacking the gesture for scrolling.
- **Sensitivity & Clamping:** Maintain the current delta calculation and `min/max` clamping logic, ensuring state cleanup occurs cleanly on pointer release.

## Navigation Inventory

| Route/Page | Component/File | Visible Actions | Labels | Icons | Destinations | History-Based? | Issues |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Home/Console | `EventConsole.tsx` | Booth, Gallery, Designer, Edit | "Booth", "Gallery", "Designer", "Edit" | Camera, GalleryHorizontal, Palette, Pencil | `/booth/[slug]`, `/gallery/[slug]`, `/designer/[slug]`, `/setup?slug` | No | Uses "Edit" and Pencil (inconsistent). |
| Setup/Edit | `setup/page.tsx` | Events | "Events" | ArrowLeft | `/` | No | |
| Designer | `LayoutDesignerClient.tsx` | Events, Setup, Booth, Gallery | "Events", "Setup", "Booth", "Gallery" | ArrowLeft, Settings, Camera, GalleryHorizontal | `/`, `/setup?slug`, `/booth/[slug]`, `/gallery/[slug]` | No | Uses "Setup" and Settings (inconsistent). |
| Booth Capture | `BoothCaptureSurface.tsx` | Events, Setup, Designer | None (Titles: "Events", "Setup", "Designer") | Home, Settings, Palette | `/`, `/setup?slug`, `/designer/[slug]` | No | Uses Home icon for Events. |
| Booth Review | `BoothReviewPanel.tsx` | Events, Gallery, Designer | "Events", "Gallery", "Designer" | ArrowLeft, GalleryHorizontal, Palette | `/`, `/gallery/[slug]`, `/designer/[slug]` | No | Uses ArrowLeft for Events. |
| Gallery | `gallery/[eventSlug]/page.tsx` | Booth, Setup, Designer | "Booth", "Setup", "Designer" | ArrowLeft, Settings, Palette | `/booth/[slug]`, `/setup?slug`, `/designer/[slug]` | No | Uses ArrowLeft for Booth (inconsistent). |
| Photo Detail | `PhotoDetailClient.tsx` | Gallery | "Gallery" | ArrowLeft | `/gallery/[slug]` | No | Uses ArrowLeft for Gallery. |
| Print Page | `PrintClient.tsx` | Photo | "Photo" | ArrowLeft | `/photo/[id]` | No | Uses ArrowLeft for Photo. |

## Navigation/Routing Diagnosis
The navigation experience is fractured because every page builds its own bespoke header and hardcodes its own links.
- **Inconsistent Labels/Icons:** The Setup page is called "Edit" with a Pencil icon on the Home page, but "Setup" with a Settings icon elsewhere. "Events" is sometimes a Home icon and sometimes an ArrowLeft icon. "Booth" is an ArrowLeft icon from the Gallery, but a Camera icon elsewhere.
- **No Global History:** The "Back" behavior is simulated with hardcoded destination links, meaning navigating from Booth to Designer and hitting "Back" often kicks the user back to "Events" rather than their actual origin.
- **Duplication:** Navigation logic is duplicated across 8 different components.

## Navigation/Routing Recommended Fix
- **Shared Component:** Create a shared `<EventNavigation>` component that standardizes the action bar for all event-scoped pages.
- **Standardized Labels & Icons:** 
  - Standardize on **"Events"** (ArrowLeft or Home icon consistently).
  - Standardize on **"Setup"** (Settings icon) over "Edit".
  - Maintain Camera for Booth, Palette for Designer, and GalleryHorizontal for Gallery.
- **Contextual Back/Return:** Implement a simple history-based back action (e.g., `router.back()`) paired with a fallback link, or use a `?returnTo=` query parameter so context isn't lost when hopping between Setup, Designer, and Booth.

## Setup Callout Copy and Color Diagnosis
The callout in `OverlayAssetInfo.tsx` is implemented as:
```tsx
<div className="mt-6 rounded-[var(--booth-radius-md)] border border-teal-200/30 bg-teal-900/20 p-4">
  <h3 className="font-semibold text-teal-200">Advanced Layers & Scrubbing</h3>
  <p className="mt-1 text-sm leading-relaxed text-teal-100/80">...
```
- **Contrast Failure:** The classes `text-teal-200` and `text-teal-100/80` render very light, pastel green text. On a light-themed page (which Biliq uses natively by default), these tokens fail WCAG accessibility standards and are nearly invisible against the white card background. The tokens used are hardcoded Tailwind colors instead of the established CSS variable theme system (e.g., `var(--booth-on-surface)`).
- **Copy Failure:** "Scrubbing" is an internal developer term for the pointer interaction model. It is not an end-user product feature.

## Setup Callout Copy and Color Recommended Fix
- **Copy Update:** Change the title to **"Open Layout Designer"**. Change the body to **"Use the designer to arrange photo slots, add multiple overlays, and fine-tune position, size, rotation, and opacity."**
- **Color Token Fix:** Discard the hardcoded `teal-200` classes. Replace them with the semantic Biliq tokens, such as:
  - Background: `bg-[var(--booth-primary-container)]/30`
  - Title: `text-[var(--booth-primary)]`
  - Body: `text-[var(--booth-on-surface-variant)]`

## Validation Results
- `npm run typecheck`: Passed successfully.
- `npm run build`: Passed successfully.
- `npm run check`: Not executed directly, but typecheck and build covered it.

## Root Cause Summary
1. **Scrubbable Controls:** The `SlotEditor` dynamically generates React `key` props based on field values, immediately destroying the component and dragging state as soon as the first pixel update fires.
2. **Navigation:** Lack of architectural centralization. Every route manually recreates headers and links, leading to drift in nomenclature, iconography, and broken mental models of "Back".
3. **Setup Callout:** Inappropriate use of internal engineering terminology ("scrubbing") in user-facing copy, combined with hardcoded low-contrast light-mode Tailwind classes instead of the design system's CSS variables.

## Patch Plan Recommendation
1. Fix `ScrubbableNumberField` and `SlotEditor` keys to ensure stable rendering and continuous scrubbing, utilizing `window` pointer listeners.
2. Fix the Setup Callout copy and contrast using proper Biliq CSS variables.
3. Introduce a unified `<EventNavigation>` component and refactor routes to use it.
4. Run `npm run check`.
5. Manual browser verification.

## Files Likely to Change in Patch
- `src/features/designer/components/SlotEditor.tsx`
- `src/features/designer/components/ScrubbableNumberField.tsx`
- `src/features/setup/components/OverlayAssetInfo.tsx`
- `src/features/events/components/EventConsole.tsx`
- `src/app/setup/page.tsx`
- `src/features/designer/components/LayoutDesignerClient.tsx`
- `src/app/gallery/[eventSlug]/page.tsx`
- `src/features/booth/components/BoothCaptureSurface.tsx`
- `src/features/booth/components/BoothReviewPanel.tsx`
- `src/shared/config/routes.ts`

## Known Limitations
- Touch device behaviors (mobile panning vs scrubbing) were reasoned out via code review since no physical touch device could be tested in the terminal.
- Visual contrast issues were confirmed by reading CSS token classes (`teal-200`) rather than running a strict contrast accessibility scanner.

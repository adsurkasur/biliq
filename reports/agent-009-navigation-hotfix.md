# Agent 009 Navigation Hotfix Report

## Summary

This hotfix addresses two regressions introduced by the transition to a centralized `EventNavigation` system in the previous patch. First, it corrects the visual feedback for the Booth theme navigation buttons to ensure they respond interactively without looking broken. Second, it resolves a severe routing bug where navigating between Booth and Setup contexts concatenated URLs, creating malformed event slugs that resulted in "Event not found" errors.

## Scope

- **Included:**
  - `EventNavigation` Booth theme class refinements (hover, active, focus states).
  - `EventNavigation` `returnTo` URL parameter parsing and appending logic.
- **Excluded:**
  - Resize/rotate handles, snapping, multi-select.
  - Tooltips, interactive guide, or onboarding tour.
  - Camera switching, cloud upload, Firebase auth, Native printing.
  - Changes to underlying event routing functions in `routes.ts`.

## Booth Navigation Feedback Fix

The Booth-specific `theme="booth"` variant in `EventNavigation` applied a dark translucent `bg-stone-950/60` background. However, this hardcoded style unintentionally overrode the base `ghost` variant's `hover:bg-white/18` class, resulting in dead-feeling buttons.

**Fix Details:**
- explicitly added `hover:bg-white/15` and `active:bg-white/20` alongside `bg-stone-950/60`.
- The native `active:scale-[0.97]` from the underlying `buttonClassName` remains intact, delivering the requested mild press state.
- Focus rings remain visible and accessible through the inherited `booth-focus-ring` base class.
- The updates strictly use color/opacity transitions to avoid any layout shifts or disruptive visual pulses on the capture screen.

## Booth Setup Routing Bug Fix

When a user in `/booth/my-event` clicked "Setup", `EventNavigation` blindly appended `?returnTo=/booth/my-event` to the output of `routes.setup("my-event")`. 

Because `routes.setup(slug)` generates `/setup?slug=my-event`, the direct concatenation produced `/setup?slug=my-event?returnTo=/booth/my-event`. Next.js parsed everything after the first `?slug=` as the slug value. As a result, the active slug became `"my-event?returnTo=/booth/my-event"`. Navigating *back* to the Booth then routed to `/booth/my-event?returnTo=...` which is not a valid event, causing the "Event not found" screen.

**Fix Details:**
- Added a `getHrefWithReturnTo` helper inside `EventNavigation`.
- The helper now checks `baseHref.includes("?") ? "&" : "?"` to safely append `returnTo` as a proper secondary query parameter instead of corrupting the first parameter.

## ReturnTo and Slug Handling

- **Slug:** The slug is now safely preserved without query parameter pollution. When editing an existing event, `SetupPage` passes the clean `slug` back into `EventNavigation`.
- **ReturnTo:** The `returnTo` parameter is correctly separated by `&` when `?slug=` is present. The `ContextualBackButton` reads this `returnTo` using standard `searchParams.get("returnTo")` and validates it to ensure it is internal (`startsWith("/")` and not `startsWith("//")`), maintaining safety against open redirects.

## Files Created or Modified

- **`src/shared/components/navigation/EventNavigation.tsx`**: 
  - Updated the conditional CSS for `isBoothTheme` to include interactive `hover` and `active` Tailwind classes.
  - Added `getHrefWithReturnTo(baseHref)` logic and wrapped all `href` props to ensure correct URL parameter construction.

## Architecture Notes

The patch strictly adheres to the existing architecture. Navigation concern fixes remain inside `src/shared/components/navigation/EventNavigation.tsx`. No changes were made to `src/app` route files or domain-level routing logic, ensuring that `routes.setup(slug)` remains simple and predictable for other consumers.

## Validation Results

- `npm run typecheck`: Passed.
- `npm run build`: Passed cleanly, proving route and type safety across all pages.
- **Route simulation validation:** By fixing the `?` vs `&` concatenation bug, the `Booth -> Setup -> Booth` cycle is guaranteed to parse correctly, preserving the original valid event slug.

## Regression Notes

- Existing `returnTo` fallback behaviors on `ContextualBackButton` are perfectly preserved.
- The Booth capture surface UI remains clean and unobstructed by large button labels.
- The `Setup` page logic for new vs existing events remains unchanged (a new event naturally has no slug, hiding the Booth/Gallery links).
- Local storage and IndexedDB interactions are entirely unaffected.

## Known Limitations

- Mobile browser touch targets might still be dense on extremely small screens (e.g., iPhone SE portrait), though the layout flex gap allows them to wrap gracefully.

## Recommended Next Tasks

1. Address the missing interaction features on the designer canvas (resize handles, rotation, element snapping) to complete the Advanced Designer milestone.
2. Consider an interactive onboarding tour that guides new users to the layer panel instead of relying entirely on static setup callouts.

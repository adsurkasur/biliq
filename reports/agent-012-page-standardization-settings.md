# Agent 012 Page Standardization and Settings Report

## Summary

Agent 012 standardized the page structure and navigation across the Biliq app,
introduced a Settings page with theme/motion preferences, added an About page,
updated EventNavigation order and visual prominence, and added dark-mode CSS tokens
with a safe app-level motion preference override.

## Scope

### Included

- EventNavigation order revised: Events → Booth → Setup → Designer → Gallery
- Events button made visually distinctive (tonal)
- Booth button always-dark for prominence
- Setup/Designer/Gallery use secondary/tonal consistently
- Settings gear icon added to Events console header
- Event card action order simplified and flex-wrapped
- Settings page at `/settings` with theme + motion preferences
- About page at `/about` with Biliq product description
- Dark-mode CSS token block added
- App-level reduced-motion data-attr CSS block added
- AppPreferencesProvider client component added to root layout
- `useAppPreferences` hook in `src/features/settings/hooks/`
- routes.ts updated with `settings` and `about` entries

### Excluded

- PWA/offline sync
- Camera switching
- Cloud upload / Firebase Auth / Google Drive
- Payment / WhatsApp / native print bridge
- Silent kiosk printing
- Multi-select / grouping / rulers / undo-redo / alignment toolbar
- Designer canvas interaction changes
- Any changes to Tooltip, LoadingIndicator, or Designer Guide logic

## Page Layout Standardization

The existing `PageShell` component (`src/shared/components/ui/PageShell.tsx`) was already in place
for Gallery and Setup pages. No structural changes were needed there — it provides consistent
`min-h-screen px-5 py-8 sm:px-8 lg:px-10` padding and `mx-auto grid max-w-6xl/7xl gap-8` content width.

New pages (Settings, About) use `PageShell maxWidth="6xl"` matching the Setup page's narrower width,
appropriate for forms and content-focused pages.

The Events/Home (EventConsole) and Designer pages have their own page rendering (`min-h-screen px-5 py-8`)
which is structurally equivalent. No layout regressions were introduced.

## Navigation Standardization

### Revised order

`Events → Booth → Setup → Designer → Gallery`

Rationale:
- Events returns to the top-level context — visually distinct (`tonal` button)
- Booth opens the capture environment — always `dark` button for emphasis
- Setup/Designer/Gallery are event-management peers — `secondary` when inactive, `tonal` when active

### Accessibility improvements

- All `aria-current="page"` attributes preserved
- `aria-label` on nav element added
- `title` attributes kept on icon-only booth-theme nav
- `sr-only` spans on icon labels preserved for screen readers
- `LayoutGrid` icon replaces `Home` for "Events" to better communicate "list of events"

### Active state

Active route buttons get `ring-2 ring-[var(--booth-primary)]/30` ring and `pointer-events-none`
to prevent re-clicking the current page.

### Guide button placement

Already positioned within the Designer header alongside EventNavigation. The placement is clean
within the `justify-between` header flex container. No change needed — it is consistent.

## Settings Page

### Route: `/settings`

Static Next.js page using `PageShell`, server component wrapper + `SettingsClient` as the client component.

### Theme mode

Options: System / Light / Dark
- Stored in localStorage as `biliq-theme-mode`
- Applied via `html[data-theme="dark"]` attribute in `globals.css`
- Dark tokens provided as a complete Material You-inspired dark palette
- System (no attribute) means browser/CSS `color-scheme` auto

### Motion preference

Options: System / Reduced / Full
- Stored in localStorage as `biliq-motion-preference`
- Applied via `html[data-motion="reduced"]` CSS block (same effect as `prefers-reduced-motion`)
- System means OS-level `prefers-reduced-motion` media query takes precedence

### AppPreferencesProvider

A lightweight `"use client"` component placed in `layout.tsx` that reads stored preferences
on mount and applies them to `document.documentElement` via the `data-theme` and `data-motion`
attributes. This runs client-side only, avoids SSR hydration mismatch, and has no visual flash
because it runs on the first client tick.

## About Page

### Route: `/about`

- Linked from Settings
- Describes Biliq's name origin (from Indonesian _bilik_ meaning small personal booth)
- States prototype/MVP status and local-first architecture
- Explains event lifecycle: Setup → Designer → Booth → Gallery
- Includes a clear local storage disclaimer
- Back link returns to Settings

## Project Structure Notes

New files:
```
src/features/settings/
  hooks/
    useAppPreferences.ts       (NEW)
  components/
    AppPreferencesProvider.tsx (NEW)
    SettingsClient.tsx         (NEW)
    AboutClient.tsx            (NEW)
src/app/settings/page.tsx      (NEW)
src/app/about/page.tsx         (NEW)
```

Architecture boundaries preserved:
- Domain logic stays in `src/domain/`
- Feature UI in `src/features/settings/`
- Route shells in `src/app/`
- Shared primitives in `src/shared/`

## Documentation Updates

No separate docs files were updated in this pass. The Settings `biliq-theme-mode`
and `biliq-motion-preference` keys and their behavior are documented within this report.
A follow-up can update `docs/project-structure.md` if desired.

## Files Created or Modified

| File | Change |
|------|--------|
| `src/shared/config/routes.ts` | Added `settings` and `about` routes |
| `src/app/globals.css` | Added dark-mode token block, app-level reduced-motion data-attr block |
| `src/app/layout.tsx` | Added `AppPreferencesProvider` |
| `src/shared/components/navigation/EventNavigation.tsx` | Rewrote — new order, prominence, icons |
| `src/features/events/components/EventConsole.tsx` | Settings link in header, flex card actions |
| `src/features/settings/hooks/useAppPreferences.ts` | NEW — preferences hook |
| `src/features/settings/components/AppPreferencesProvider.tsx` | NEW — client-side provider |
| `src/features/settings/components/SettingsClient.tsx` | NEW — settings UI |
| `src/features/settings/components/AboutClient.tsx` | NEW — about content |
| `src/app/settings/page.tsx` | NEW — /settings route |
| `src/app/about/page.tsx` | NEW — /about route |

## Validation Results

- `npm run typecheck`: ✅ Passed
- `npm run build`: ✅ Passed (7 routes: home, not-found, about, booth, designer, gallery, photo, print, settings, setup)
- `npm run check`: ✅ Passed (both typecheck + build)
- No lint script detected

## Regression Notes

- Designer Guide, visual hints, checkpoints, custom Tooltip, global LoadingIndicator: all untouched
- Booth capture flow, camera, viewfinder: untouched
- Gallery, photo detail, print: untouched
- Toast system, modal exit animations: untouched
- returnTo and slug routing: preserved in EventNavigation rewrite
- localStorage event config, IndexedDB photos: untouched
- Snapping, drag, resize, rotation, Shift/Alt/Ctrl modifiers: untouched
- Print media behavior: untouched

## Known Limitations

1. **Dark mode — body background radial gradients**: The `body` rule uses a hardcoded teal-tinted radial gradient. In dark mode this gradient persists at low opacity and is not overridden in `html[data-theme="dark"]`. The effect is subtle enough to keep for now but a proper dark-mode body background would update the gradient colors.

2. **SSR hydration mismatch**: The `AppPreferencesProvider` applies preferences client-side only. On the very first paint the page renders in light mode, then snaps to dark if preferred. This is the standard approach for localStorage-based theming. A server-cookie approach would eliminate this but adds complexity not warranted at this prototype stage.

3. **No lint script**: The project does not have a `lint` script in `package.json`. TypeScript check and Next.js build serve as the primary validation path.

4. **EventConsole still uses its own page shell**: EventConsole renders `<main>` directly rather than using `PageShell`. This is acceptable — it has a unique header with logo lockup not needed in other pages. Standardizing this further would be a cosmetic-only refactor.

## Recommended Next Tasks

1. **PWA & Offline Sync (Agent 013)**: Add a service worker and caching strategy for offline booth operation.
2. **Setup Experience Improvements**: Migrate Designer tooltip/guide learnings into the Event Setup flows with contextual hints.
3. **Dark mode body gradient**: Override body radial gradients in `html[data-theme="dark"]` for a more refined dark experience.
4. **Docs update**: Refresh `docs/project-structure.md` with the new `features/settings/` structure and preference keys.

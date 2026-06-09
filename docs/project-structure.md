# Project Structure

The application uses `src/` to separate Next.js route files from feature code, domain logic, and shared utilities.

## Top-Level Layout

```text
src/
  app/
  domain/
  features/
  shared/
```

## `src/app`

Contains Next.js App Router files only. Route files should stay thin and import feature components instead of holding business logic.

Current routes:

- `src/app/page.tsx`
- `src/app/setup/page.tsx`
- `src/app/designer/[eventSlug]/page.tsx`
- `src/app/booth/[eventSlug]/page.tsx`
- `src/app/gallery/[eventSlug]/page.tsx`
- `src/app/photo/[photoId]/page.tsx`
- `src/app/print/[photoId]/page.tsx`

## `src/domain`

Contains product/domain logic that should not depend on React UI.

- `domain/events` - Event types, defaults, output presets, and localStorage persistence.
- `domain/photos` - Photo types and IndexedDB persistence.
- `domain/layouts` - Layout types and 1/2/3/4-photo layout definitions.
- `domain/media` - Camera access, video frame capture, canvas composition, and media types.
- `domain/auth` - Future Firebase Auth-facing user and provider contracts.
- `domain/cloud` - Future Google Drive storage contracts and folder strategy.

Future cloud upload, offline sync, and print bridge work should integrate from this layer outward rather than being embedded in React components.

## `src/features`

Contains feature-specific UI, hooks, and small feature helpers.

- `features/events` - Home/event console.
- `features/setup` - Event setup form, overlay info, output info, and setup hooks.
- `features/designer` - Custom layout and overlay designer foundation.
- `features/booth` - Booth session hook, camera hook, fullscreen capture UI, review UI, countdown, and progress display.
- `features/gallery` - Gallery grid and gallery actions.
- `features/photo` - Photo detail client UI.
- `features/print` - Browser print client and print button.

Feature components may use browser APIs only when they are client components or hooks.

## `src/shared`

Contains cross-feature code.

- `shared/config` - App metadata, route builders, and storage keys.
- `shared/components` - Shared UI such as QR preview and small UI primitives.
- `shared/lib` - Small reusable browser, download, image, ID, slug, validation, and QR URL helpers.
- `shared/types` - Re-export surface for common domain types.

Avoid placing broad `utils.ts` files here. Name helpers by responsibility.

Motion guidance lives in `docs/ui-motion-guidelines.md`.

## Import Guidance

Use the `@/*` alias for source imports. The alias points to `src/*`.

Examples:

```ts
import { routes } from "@/shared/config/routes";
import { getEventBySlug } from "@/domain/events/storage";
import { BoothClient } from "@/features/booth/components/BoothClient";
```

Avoid long relative imports across feature boundaries.

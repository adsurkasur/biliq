# Biliq Photo Booth

Biliq, a browser-based event photo booth system. This is a local-first web photo booth MVP built with Next.js, React, TypeScript, and Tailwind CSS. The app is designed around a tablet portrait booth flow and keeps camera capture, canvas composition, gallery storage, QR preview, and browser printing in the client browser.

## Current MVP Status

Implemented:

- Local event setup with configurable name, slug, countdown, capture count, output preset, layout, overlay, and browser print mode.
- Tablet Portrait default output at `1200 x 1600 px`.
- Transparent PNG overlay guidance and uploaded overlay dimension status.
- Fullscreen booth capture mode with live camera viewfinder and live overlay preview.
- 1-photo, 2-photo, 3-photo, and 4-photo capture flows.
- Canvas composition, final preview, retake, download, and local save.
- IndexedDB-backed local gallery with thumbnails, delete, download, detail, QR preview, and browser print route.
- Event deletion with associated local photo cleanup.
- Basic numeric layout and overlay designer foundation.
- Firebase Auth and Google Drive preparation through placeholder interfaces and docs.

Not implemented:

- Cloud upload, public cross-device QR sharing, Supabase, authentication, WhatsApp, email, payments, AI features, sticker editing, native print bridge, silent kiosk printing, or PWA offline sync.

## Install And Run

```powershell
cd "F:\My Files\Projects\biliq"
npm.cmd install
npm.cmd run dev -- --hostname 127.0.0.1 --port 3000
```

Open `http://127.0.0.1:3000`.

If port 3000 is unavailable:

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3100
```

## Validation

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run check
```

`check` runs TypeScript and the production build.

## Semantic Versioning

Biliq follows `MAJOR.MINOR.PATCH` semantic versioning. While the product is
below `1.0.0`, a minor bump can still represent a substantial compatible
feature milestone.

```powershell
npm.cmd run version:help
npm.cmd run version:show
npm.cmd run version:check

# Compatible bug fix: 0.2.0 -> 0.2.1
npm.cmd run version:patch

# Compatible feature release: 0.2.0 -> 0.3.0
npm.cmd run version:minor

# Breaking release: 0.2.0 -> 1.0.0
npm.cmd run version:major

# Start or advance a beta release
npm.cmd run version:prerelease

# Promote a beta to its stable version
npm.cmd run version:release

# Set an explicit valid SemVer
npm.cmd run version:set -- 0.4.0
```

These commands synchronize `package.json` and `package-lock.json`. They do not
create Git commits or tags, so the version change remains reviewable.

## Main Routes

- `/` - Local event console.
- `/setup` - Create or edit a local event.
- `/designer/[eventSlug]` - Edit a local event overlay and custom numeric photo layout.
- `/booth/[eventSlug]` - Fullscreen booth capture flow.
- `/gallery/[eventSlug]` - Local event gallery.
- `/photo/[photoId]` - Local photo detail/share page.
- `/print/[photoId]` - Browser print page.

## Important Limitations

QR links are local-only because saved photos live in the same browser's IndexedDB. Public sharing across devices requires a later cloud upload milestone.

Printing uses the browser print dialog only. Silent kiosk printing requires separate device/browser setup, such as Chrome or Edge kiosk printing mode.

Camera support depends on browser permissions, device hardware, and secure-context rules. Localhost works for development; deployed camera usage should be tested over HTTPS.

Firebase Auth and Google Drive are prepared only through placeholder types, environment variable names, and documentation. No real login or cloud upload runs in this MVP.

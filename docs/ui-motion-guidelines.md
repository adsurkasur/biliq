# UI Motion Guidelines

## Strategy

The project uses CSS transitions and keyframes instead of a motion dependency. Keep motion lightweight and focused on state clarity:

- Use opacity and transform for entrances, hover, capture feedback, and result reveals.
- Avoid animating width, height, top, left, or layout-heavy properties.
- Do not animate the live video element itself in ways that can break camera alignment.
- Keep repeated animations away from the camera preview unless they are small and short-lived.

## Shared Classes

Global motion helpers live in `src/app/globals.css`:

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

Use these before adding new keyframes.

## Reduced Motion

`prefers-reduced-motion: reduce` is respected globally by shortening animations and transitions. Essential feedback remains visible, but large or repeated motion should not be required to understand the UI state.

## Shared UI

Reusable UI primitives live under `src/shared/components/ui`. Feature components should use these when it improves consistency, but avoid building unused primitives.

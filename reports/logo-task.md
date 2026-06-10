# Biliq Logo Task Report

## Summary

Three distinct, hand-authored SVG logo concepts were explored and created for the Biliq browser-based event photo booth system. A recommended logo and a live HTML preview were also generated to aid visual review.

## Brand Interpretation

"Biliq" stems from the Indonesian "bilik" (a small personal room/booth), with a "q" adding a modern, digital touch. The concepts interpret this by combining the intimate, spatial aspect of a personal booth with the digital, photographic moment of capture. They avoid generic literal camera icons in favor of abstract, clean, Material You-friendly geometric forms.

## Concepts Created

1. **Concept A: Bilik Frame (`biliq-concept-a-frame.svg`)**
   A soft, rounded enclosure that suggests stepping into a personal capture room, complete with a minimal lens and a subtle ambient light dot.
2. **Concept B: Biliq Q Capture (`biliq-concept-b-q-capture.svg`)**
   An abstract lowercase 'q' constructed from geometric shapes. The circular body acts as a camera lens and shutter reflection, while the vertical stem ties it back to the product name and grounds the shape.
3. **Concept C: Moment Window (`biliq-concept-c-moment-window.svg`)**
   An arched window shape framing a simple 4-point sparkle, emphasizing the memory and the outcome of the event rather than the hardware.

## Recommended Direction

**Concept B (Biliq Q Capture)** is the recommended starting point. It elegantly marries the unique letter 'q' from the brand name with universal photographic elements (the lens ring and reflection). Its sturdy, geometric path structure ensures high legibility even at 24px, making it the most versatile and memorable mark for a software product interface.

## Files Created or Modified

- `brand/logo-concepts/biliq-concept-a-frame.svg` (Created)
- `brand/logo-concepts/biliq-concept-b-q-capture.svg` (Created)
- `brand/logo-concepts/biliq-concept-c-moment-window.svg` (Created)
- `brand/logo-concepts/biliq-recommended.svg` (Created, matches Concept B)
- `brand/logo-concepts/biliq-logo-preview.html` (Created)
- `docs/brand-identity.md` (Modified to include Logo Exploration section)

## SVG Quality Notes

- **viewBox**: All SVGs use a standard `0 0 64 64` square viewBox for easy embedding and alignment.
- **Scalability**: By utilizing semantic SVG primitives (`rect`, `circle`, `path`) without baked-in raster elements or fonts, the graphics scale infinitely without losing crispness.
- **Monochrome Suitability**: The designs rely heavily on shape contrast and negative space. They can be easily converted to solid monochrome (e.g., `#FFFFFF` or `#000000`) for watermarks or simple icons by replacing the multi-tone fills with a single color.
- **Editability**: They are completely un-minified and styled with inline `fill` attributes, making them extremely easy to tweak directly in a code editor or import cleanly into vector design software.

## Usage Notes

These vectors can serve multiple roles across the application. At small sizes (16px - 32px), they act as crisp favicons or PWA home screen icons. At medium sizes, they can replace text headers or sit alongside the "Biliq" name in the `EventConsole`. At large sizes, they are ideal for Empty States or print-safe branding materials for the physical photo booth casing.

## Known Limitations

These are initial SVG concept drafts created entirely via code. They have not undergone extensive visual optical balancing by a human designer, and some path alignments may need fine-tuning. They are prototype identities and must be reviewed and formally approved before being treated as final brand assets for client agreements.

## Recommended Next Steps

1. Human review of the `biliq-logo-preview.html` file to determine the preferred direction.
2. Refine the chosen logo using a vector tool (e.g., Figma or Illustrator) to apply optical kerning and perfect path boolean operations.
3. Export production-ready assets (favicon.ico, apple-touch-icon.png, and app header SVG) and integrate them into the Next.js `src/app` layout.

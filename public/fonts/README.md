# Fonts

Place your Clash Display font files here:

- `ClashDisplay-Variable.woff2` — variable font (preferred)
- Or individual weights: `ClashDisplay-Bold.woff2`, etc.

The layout.tsx file is configured to load `ClashDisplay-Variable.woff2`
via `next/font/local` and expose it as the CSS variable `--font-display`.

Inter is loaded via `next/font/google` as `--font-body`.

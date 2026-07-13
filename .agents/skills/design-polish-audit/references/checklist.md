# Awwwards-Level Polish Checklist

## Layout & Structure
- [ ] Does at least one section break the "centered container, stacked
      cards" template pattern?
- [ ] Is there a clear focal point / visual hierarchy on first paint?
- [ ] Does spacing follow a consistent scale (e.g. 4/8px base unit),
      not arbitrary pixel values?

## Typography
- [ ] Are headings using the project's display font token, not a fallback
      system font?
- [ ] Is there a genuine size/weight hierarchy (not just bold + slightly
      bigger for every heading level)?
- [ ] Line length for body text roughly 45-75 characters?

## Color & Depth
- [ ] Does the palette come from defined tokens, not one-off hex values?
- [ ] Is there real depth (shadow, blur, layering, gradient) where it earns
      its place, not flat-everywhere or shadow-everywhere?
- [ ] Does dark mode actually look designed, not just inverted?

## Motion
- [ ] Is there at least one intentional motion moment on this
      page/component?
- [ ] Do animations use eased, purposeful timing (not default linear/300ms
      everywhere)?
- [ ] Does `prefers-reduced-motion` disable non-essential motion?
- [ ] No layout-shifting animations (animating `width`/`height`/`top`
      instead of `transform`)?

## Interaction
- [ ] Do interactive elements have distinct hover, focus, and active
      states that were actually designed (not just a browser default or a
      flat color darken)?
- [ ] Are click/tap targets comfortably sized on mobile?

## Reference-tool specific (this is a data-dense site, not just a portfolio)
- [ ] Can a user scan/filter/compare many model entries quickly — is
      density balanced against visual flourish, not sacrificed for it?
- [ ] Do data-heavy views (tables, grids) stay readable at a glance while
      still carrying the same typography/color system as the rest of the
      site?

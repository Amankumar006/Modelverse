# Rule: Design System & Awwwards-Level Visual Bar

Apply these rules to every UI change, without needing to be reminded.

## Non-negotiables
- No default browser focus rings, no unstyled `<select>`/`<button>` elements,
  no Bootstrap/MUI-looking defaults. If a component looks like it could be
  the top Google Image result for its name, redo it.
- Every page needs at least one deliberate motion moment (scroll-linked
  reveal, staggered list entrance, cursor-aware hover, magnetic button, or
  similar) — but motion must never block content from being read; respect
  `prefers-reduced-motion`.
- Typography: define a type scale up front (e.g. a fluid `clamp()` scale) and
  use it everywhere — no ad hoc `text-[17px]`. Pair one display/serif or
  distinctive grotesk for headings with one clean workhorse sans for body.
  No default system-font-stack-looking headings.
- Color: derive from a small set of CSS variables / Tailwind theme tokens.
  Support dark mode from day one since this is a reference/browsing site
  people will use for long sessions.
- Layout: prefer asymmetry and intentional grid-breaking over centered
  three-column card grids for hero/landing sections. The model-listing/
  browsing views (table, grid, timeline) can and should be dense and
  scannable — this is a reference tool, not just a portfolio piece.
- Every interactive element needs a hover AND active/focus state that feels
  designed, not just a color darken.

## Performance budget
- No layout shift from images — always set explicit dimensions or use
  `next/image`.
- Animate `transform`/`opacity` only; avoid animating layout properties.
- Lazy-load below-the-fold media (model logos, screenshots) via
  `next/image` with `loading="lazy"`.
- Framer Motion: prefer `layout` animations and `viewport={{ once: true }}`
  for scroll reveals so re-entering the viewport doesn't re-trigger jank.

## Before calling any UI work "done"
Run the `design-polish-audit` skill against the component/page.

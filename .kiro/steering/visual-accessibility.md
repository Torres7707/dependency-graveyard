---
inclusion: always
---

# Visual and accessibility guidance

The visual language is an eerie night-time graveyard with restrained playfulness.
Use warm pumpkin/candle light as a limited accent against cool indigo, purple,
and graveyard-green surroundings. Avoid childish cartoon styling and avoid
turning the page into a generic orange-and-black Halloween template.

## Information before decoration

- Each dependency status must be recognizable from silhouette, text, and
  behavior—not color alone.
- The first viewport must make the package input and the primary action obvious.
- Decorative layers must never cover controls, intercept pointer events, or
  reduce text contrast.
- Prefer inline SVG and CSS rather than image assets or external dependencies.

## Motion and performance

- Respect `prefers-reduced-motion: reduce` without requiring a user action.
- The in-app reduced-motion switch must disable every continuous animation,
  including clouds, mist, stars, bats, flames, ghost floating, web movement,
  and tombstone entrance effects.
- Animate only `transform` and `opacity` where possible.
- Reduce per-tombstone decorative animation for large result sets; preserve
  static status indicators and controls at every size.

## Interaction and responsive requirements

- Every tombstone remains a native focusable button with a descriptive
  `aria-label` that includes package name, status, and meaningful metadata.
- Preserve the table view as an equivalent non-visual/high-density view.
- Keep visible focus styling and keyboard navigation. Dialogs must restore focus
  to their triggering tombstone when closed.
- At 375px viewport width, prevent horizontal scrolling and keep interactive
  targets at least 44px in their effective click area.

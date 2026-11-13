# Design: Halloween graveyard visual refresh

## Constraints

The work is a visual refresh of `demo/index.html`. It remains one standalone
HTML document: all artwork is inline SVG or CSS, and no business rules or npm
request behavior change.

## Scene layers

The scene should be ordered from back to front:

1. Deep indigo-to-purple sky with a restrained orange glow at the horizon.
2. Moon with crater marks and two to three cloud layers.
3. Distant church/spire, bare trees, and wrought-iron fence silhouettes in at
   least two opacity/depth layers.
4. Two independent low mist layers animated only with transforms and opacity.
5. A soil and grass ground treatment behind the dependency grid.
6. Tombstones, their accessible labels, and interactive controls above all
   decorative layers.

Decorative elements use `pointer-events: none`. On small screens, hide the
church and some bats before reducing controls or text.

## Stable tombstone variants

Create a small deterministic hash function from package name to choose:

- one of two or three status-specific SVG variants;
- tilt between -4 and 4 degrees;
- a compact depth class for foreground/midground placement.

Each status has a unique silhouette:

- Alive: complete stone plus pumpkin lantern/candle and warm halo.
- Zombie: cracked stone, moss, and raised hand.
- Ghost: translucent wavy body with a faint blue glow and trail.
- Dead: tilted or fallen stone with vine, web, or crow detail.

The package name is visibly engraved on the tombstone but the enclosing button
retains a complete text `aria-label`.

## Motion controls

Create a shared CSS motion gate. It must activate for either the existing
`body.reduce-motion` class or `@media (prefers-reduced-motion: reduce)` and
disable all animation and transition declarations on decorative elements. A
large-result class or CSS variable should further suppress per-tombstone motion.

## Compatibility

Do not use APIs unsupported by ordinary current browsers. Keep the existing
semantic controls, table view, live status region, and dialog behavior intact.

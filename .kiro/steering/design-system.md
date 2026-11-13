---
inclusion: fileMatch
fileMatchPattern: ["src/**/*.tsx", "src/styles/**/*.css", "design/**"]
---

# Design system

Direction: dark gothic fairy tale. Picture-book illustration + paper-cut silhouettes + candlelight. Eerie but cute: round shapes, big eyes, a little dopey. People should want to screenshot it.

**Originality:** borrow a style genre only. Never recreate characters, scenes or art from a specific film, game or animation. Every character (ghost, zombie hand, crow, will-o'-wisp) is drawn for this project.

## Color tokens

Defined in `src/styles/index.css` under `@theme`. Use the token, never a raw hex in components.

| Token | Value | Use |
|---|---|---|
| `--color-ink-night` | `#0d0b14` | page background, deepest sky |
| `--color-plum-dusk` | `#2a1b3d` | upper sky gradient, card base |
| `--color-violet-mist` | `#4b3a6b` | far silhouettes, secondary borders |
| `--color-bone` | `#e8e0cc` | body text, lit stone |
| `--color-bone-dim` | `#b9b0c9` | secondary text (still ≥ 4.5:1 on ink-night) |
| `--color-stone` | `#8a8597` | tombstone body |
| `--color-candle` | `#f2b950` | **alive**, candle light, primary button |
| `--color-moss` / `--color-moss-bright` | `#7d9a3c` / `#a9c763` | **zombie** |
| `--color-ectoplasm` | `#9fd8e8` | **ghost**, cold glow |
| `--color-grave-soil` / `--color-dust` | `#5a4636` / `#c9b49a` | **buried** |
| `--color-wisp` | `#c3b6e2` | **lost** |
| `--color-rose-blood` | `#e0707c` | errors only, used sparingly |

Candle orange is an accent against cool indigo and purple. Do not turn the page into a generic orange-and-black Halloween template.

## Type

| Use | Font token |
|---|---|
| Big titles, zone names (Latin only) | `--font-gothic` (Grenze Gotisch) |
| Engravings, epitaphs | `--font-fell` (IM Fell English) |
| Body, buttons, data | `--font-body` (Crimson Pro) |
| Package names, versions | `--font-mono` |

Chinese falls back to Songti SC / Noto Serif SC. Never use the gothic face for body text or Chinese.

## Icons and tombstones

- Status icons: `viewBox="0 0 64 64"`, 2px stroke, round caps, token fills, shadows as ink-night at 20%. Moving parts are separate `<g>` elements.
- Texture comes from SVG filters (`feTurbulence` + `feDisplacementMap`), never bitmaps.
- Tombstone variant (0/1/2), tilt (−4°…4°) and animation phase come from `lookFor(name)`.
- Each status has its own silhouette and text label, so status is never color-only.

## Motion

- Idle loops animate only `transform` and `opacity`. `d`, `pathLength`, filters, `width`/`height`/`top`/`left` and box-shadow are allowed in one-shot entry or hover animations only, never in a loop.
- One idle loop per icon (one moving group). Everything else in the icon is still at rest and moves only on hover/focus.
- Icons loop only while they hold a loop slot: `useLoopSlot` in `src/graves/motionBudget.ts` gives slots to the `LOOP_BUDGET` (8) visible graves nearest the viewport centre, and to none while scrolling (`SCROLL_IDLE_MS`). Don't add another way to start loops.
- No per-instance SVG filters inside icons (`<filter>` in a grave repeats for every grave). The shared `drop-shadow` on `.grave__icon` is fine because it isn't animated.
- Scene: every infinitely animated element is a compositor layer. Add one only if you remove another; animate whole `<svg>`/`<div>` layers, never many SVG children. Budget and numbers: `docs/PERFORMANCE.md`.
- Above `LIGHT_MODE_THRESHOLD` (80) graves: no loops, no layout animation; entry and hover stay.
- When `useReduce()` is true: no loops, no parallax, fog and fireflies hidden, transitions become fades.
- Stagger entry by `Math.min(index * 0.04, 1.2)` seconds so large yards don't take forever.
- Shared element transition from tombstone icon to dialog uses `layoutId={\`icon-${spec.id}\`}`.

Status motion signatures (keep them distinct):

| Status | Loop | Hover |
|---|---|---|
| alive | candle flame `scaleX`/`scaleY`/`skewX` flicker | flame grows, halo swells, sparks rise |
| zombie | wrist sways | quick grab, fingers curl in turn |
| ghost | whole ghost floats `y` 0↔−3.5 with ±2° rotate | startles, tail flutters, eyes glance |
| buried | stone is still; crow tilts head once every 6 s | wing ruffles, crow flaps up and lands |
| lost | question-mark wisp drifts slowly | wisp brightens |

Decorative layers are `pointer-events: none` and `aria-hidden="true"`.

# Requirements: graveyard-scene

## Introduction

The graveyard page: layered night scene, five zones, one tombstone per dependency with an animated status icon, filters, a health candle and a table view. Sources: `docs/DESIGN.md` §2.4–2.7, §3. Steering: `design-system.md`, `accessibility.md`.

## Requirements

### Requirement 1: Scene

1. THE SYSTEM SHALL draw sky, moon, clouds, far silhouettes, fireflies, fog and ground as decorative layers with `aria-hidden="true"` and no pointer events.
2. WHILE motion is allowed THE SYSTEM SHALL move moon and clouds with scroll parallax at different speeds.
3. THE SYSTEM SHALL place stars and fireflies from a stable hash, never `Math.random()`.

### Requirement 2: Zones and tombstones

**User story:** As a developer, I want to see at a glance which dependencies are alive, zombie, ghost, buried or lost.

1. THE SYSTEM SHALL group graves into zones in the order alive, zombie, ghost, buried, lost, and show each zone's name and count.
2. THE SYSTEM SHALL render each grave as a `<button>` showing package name, alias target (if any), declared range, status label and kind (when not prod).
3. THE SYSTEM SHALL pick tombstone variant, tilt and animation phase from a hash of the package name, so a package always looks the same.
4. WHEN a name is long THE SYSTEM SHALL shrink it in steps, then truncate with the full name in `title`.
5. THE SYSTEM SHALL draw dev dependencies as smaller tombstones.
6. THE SYSTEM SHALL give each grave an accessible name with name, alias, status and reason.

### Requirement 3: Status icons

1. THE SYSTEM SHALL draw a distinct, original icon per status: candle (alive), rising hand (zombie), floating ghost (ghost), crow on a still stone (buried), question-mark wisp (lost).
2. WHILE loops are allowed and the page is not scrolling THE SYSTEM SHALL play the idle loop of at most 8 visible graves, those nearest the viewport centre; all other graves SHALL rest in their static pose.
3. WHEN a grave is hovered or focused THE SYSTEM SHALL play its hover reaction.

### Requirement 4: Motion budget

1. WHEN graves rise on entry THE SYSTEM SHALL stagger them by 40 ms, capped at 1.2 s.
2. WHEN there are more than 80 graves THE SYSTEM SHALL switch off loops and layout animation and say so.
3. WHEN reduced motion is requested by the OS or the top-bar toggle THE SYSTEM SHALL stop loops, parallax, fog drift and fireflies.
4. Idle loops SHALL animate only transform and opacity, one moving group per icon; path, filter and part-level motion SHALL play only on entry or hover.
5. WHILE scrolling a 60-grave yard at 4× CPU throttle THE SYSTEM SHALL keep median frame time at or below 17 ms, and graves scrolled back into view SHALL be painted within 150 ms.

### Requirement 5: Filters, health, table

1. THE SYSTEM SHALL offer status charms (`aria-pressed`), a name search, and a prod/dev switch; filtered-out graves sink and the rest reflow.
2. THE SYSTEM SHALL show a health candle whose height is alive / judged (lost excluded), with a text equivalent.
3. THE SYSTEM SHALL offer a sortable table view with the same data, using `<table>`, `<caption>` and `aria-sort`.
4. WHEN no graves match THE SYSTEM SHALL show the empty note.
5. WHEN lookups failed THE SYSTEM SHALL show how many and a "Try again" button; WHEN the input was truncated THE SYSTEM SHALL say how many were skipped.

### Requirement 6: Loading ritual

1. WHILE lookups run THE SYSTEM SHALL show a row of candles that light as results arrive, as a `role="progressbar"` with a polite text status.

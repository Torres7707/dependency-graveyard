# Requirements: Halloween graveyard visual refresh

## User story

As a front-end developer inspecting my direct dependencies, I want the existing
graveyard interface to feel like a coherent Halloween night scene so that the
maintenance states are memorable without reducing usability.

## Acceptance criteria

1. WHEN the page first loads THEN the system SHALL show a moon with clouds, at
   least two distant silhouette layers, mist, bats, and a grass-and-soil ground
   treatment without obscuring the package input or controls.
2. WHEN a result is classified as alive, zombie, ghost, or dead THEN its
   tombstone SHALL have a distinct silhouette that remains distinguishable
   without relying on color.
3. WHEN a tombstone is rendered repeatedly for the same package name THEN the
   selected visual variation, depth, and tilt SHALL remain stable.
4. WHEN the user enables reduced motion OR the operating system requests reduced
   motion THEN the system SHALL stop all non-essential continuous animation.
5. WHEN the viewport is 375px wide THEN the page SHALL have no horizontal page
   scroll, all tombstones SHALL remain operable, and focus styles SHALL be
   visible.
6. WHEN package data is rendered THEN existing parsing, npm lookup, status
   classification, filters, table view, detail dialog, local-dependency handling,
   and error states SHALL continue to work unchanged.
7. WHEN a dependency count is large THEN decorative per-tombstone animations
   SHALL be reduced or disabled without removing status information.
8. WHEN themed copy is displayed THEN the system SHALL continue to state that
   this is maintenance activity information, not a security audit.

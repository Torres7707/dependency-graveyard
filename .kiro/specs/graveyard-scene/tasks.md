# Implementation plan: graveyard-scene

- [x] 1. Tokens, fonts and base styles in `src/styles/index.css`
  - _Requirements: 2.2, 4.4_

- [x] 2. Scene layers: sky, stars, moon, clouds, silhouettes, fog, fireflies; parallax gated by `useReduce`
  - _Requirements: 1.1–1.3, 4.3_

- [x] 3. Status icons
  - [x] 3.1 Static SVG masters for all five statuses
  - [x] 3.2 Animated JSX icons with loop + hover variants and hashed phase
  - _Requirements: 3.1, 3.3_

- [x] 4. Tombstone and Plaque: hashed look, name sizing, alias, dev size, accessible name, `useInView` gating
  - _Requirements: 2.2–2.6, 3.2_

- [x] 5. GraveZone and Graveyard layout: zone order, counts, staggered entry, light mode notice
  - _Requirements: 2.1, 4.1, 4.2_

- [x] 6. Toolbar filters, HealthCandle, empty state, network/truncated notices with retry
  - _Requirements: 5.1, 5.2, 5.4, 5.5_

- [x] 7. LedgerTable with sortable headers and `aria-sort`
  - _Requirements: 5.3_

- [x] 8. Ritual candles with `role="progressbar"`
  - _Requirements: 6.1_

- [x] 9a. Motion budget: `useLoopSlot` (8 slots, paused while scrolling), one idle loop per icon, scene loops cut to whole layers; before/after in `docs/PERFORMANCE.md`
  - _Requirements: 3.2, 4.4, 4.5_

- [ ] 9. Run the `a11y-reviewer` agent on the full UI and fix findings (forced-colors styles are not done yet: E3)
  - _Requirements: 2.6, 4.3, 5.3_

- [ ]* 10. Particle layer with tsParticles (fireflies scatter from the cursor)
- [ ]* 11. Ambient sound with howler, off by default

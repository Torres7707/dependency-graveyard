# Implementation plan: detail-panel

- [x] 1. Radix Dialog shell with Motion enter/exit and close button
  - _Requirements: 1.1, 1.2_

- [x] 2. Shared `layoutId` icon transition with placeholder in the tombstone
  - _Requirements: 1.3_

- [x] 3. Facts list, unknown values, npm-fallback note, last words
  - _Requirements: 2.1–2.5_

- [x] 4. `usePackageInfo`: description, license, links, GitHub stars; safe links only
  - _Requirements: 2.6, 2.7_

- [x] 5. Epitaph templates (en + zh, same counts), hashed pick, dialog description
  - _Requirements: 3.1–3.3_

- [x] 6. Disclaimer note and ghost gaze
  - _Requirements: 4.1, 5.1_

- [ ] 7. Run the `a11y-reviewer` agent on the dialog (B4, C1, C5, C6) and fix findings

- [ ]* 8. Share: poster PNG (html-to-image) and share link (lz-string in URL hash)

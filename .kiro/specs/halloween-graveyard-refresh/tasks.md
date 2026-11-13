# Tasks: Halloween graveyard visual refresh

- [x] Add scene-level CSS tokens for pumpkin-orange warmth, graveyard green,
      sky gradients, soil, and the shared motion gate.
- [x] Replace the current background with layered moon, cloud, skyline, fence,
      bare-tree, mist, and ground SVG/CSS layers.
- [x] Implement system-level and manual reduced-motion behavior; verify that no
      decorative animation continues after either mechanism is active.
- [x] Add a deterministic package-name hash helper and use it for tombstone
      variant, depth, vertical offset, and tilt selection.
- [x] Replace generic tombstone SVG output with distinct alive, zombie, ghost,
      and dead visual systems while retaining current state labels and ARIA text.
- [x] Move package names into tombstone artwork without removing readable text
      from accessible controls.
- [x] Restyle the input panel, summary legend, loader, and details dialog to
      match the graveyard visual system; update copy including the `入网` typo.
- [x] Apply large-result animation limits and responsive visibility rules.
- [x] Manually verify example loading, filtering, table switching, dialog open/
      close, local and error states, keyboard operation, reduced motion, and a
      375px-wide viewport.

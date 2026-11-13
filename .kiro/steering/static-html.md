---
inclusion: fileMatch
fileMatchPattern:
  - "demo/**/*.html"
  - "*.html"
---

# Standalone HTML conventions

- Do not add external scripts, font downloads, trackers, or runtime
  dependencies. The demo must work when opened directly as a local file.
- Keep styles and behavior in the same document while the prototype remains
  standalone; use clear section comments to separate responsibilities.
- Avoid injecting untrusted package names or registry fields through
  `innerHTML`. Create DOM nodes and assign `textContent` for untrusted values.
- Use CSS custom properties for scene colors and motion controls so themes and
  reduced-motion behavior remain centrally configurable.
- Maintain semantic buttons, labels, live regions, and dialog attributes when
  editing the DOM structure.

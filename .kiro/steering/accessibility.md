---
inclusion: fileMatch
fileMatchPattern: ["src/ui/**", "src/graves/**", "src/scene/**", "src/app/**", "src/styles/**", "src/i18n/**"]
---

# Accessibility checklist

Every interface change must pass this list. The `a11y-reviewer` agent (`.kiro/agents/a11y-reviewer.json`) checks against it item by item, so keep the IDs stable.

## Perception

- **A1 Contrast.** Body text ≥ 4.5:1, large text and UI boundaries ≥ 3:1 against the actual background they sit on (including fog and glow). `--color-bone` on `--color-ink-night` is > 14:1; `--color-bone-dim` is the floor for secondary text.
- **A2 Not color alone.** Each status has a distinct silhouette, a text label, and a distinct motion. Filters (charms) show the label, not only a colored dot.
- **A3 Decoration is silent.** Scene layers, particles, fog, candles in the ritual and decorative SVG carry `aria-hidden="true"` and `pointer-events: none`. Lucide icons next to text get `aria-hidden="true"`.
- **A4 Text stays text.** Package names on tombstones are real text, not drawn into SVG. Long names shrink, then truncate with the full name in `title` and in the accessible name.

## Operation

- **B1 Native controls.** Each tombstone is a `<button type="button">` with `aria-haspopup="dialog"`. Toggles use `aria-pressed`. No clickable `<div>`.
- **B2 Keyboard.** Every action works with Tab / Shift+Tab / Enter / Space / Esc. Hover effects also run on `whileFocus`.
- **B3 Visible focus.** `:focus-visible` outline is never removed; on tombstones it must be visible against the stone and the zone glow.
- **B4 Dialog.** Radix Dialog handles focus trap, Esc, and focus return to the tombstone that opened it. `Dialog.Title` is the package name; `Dialog.Description` is the epitaph. The close button has an accessible name from i18n.
- **B5 Targets.** Interactive targets are at least 24×24 CSS px (44×44 preferred on touch).
- **B6 Skip link.** "Skip to main content" stays first in tab order and lands on `<main>`.

## Understanding

- **C1 Accessible names carry the data.** Tombstone `aria-label` = name, alias target, status label, reason sentence, dev flag (see `t.grave.aria`). Don't make screen-reader users open the dialog to learn the status.
- **C2 Table view.** The ledger is a real `<table>` with `<caption>`, `<th scope="col">`, and `aria-sort` on sortable headers. It must expose everything the graveyard view shows.
- **C3 Errors.** Parse errors use `role="alert"`, are linked with `aria-describedby`, set `aria-invalid`, and give line and column when known.
- **C4 Progress.** The ritual has `role="progressbar"` with `aria-valuemin/max/now` and a polite live region with the text status.
- **C5 Language.** `<html lang>` follows the locale. Text in the other language (e.g. the bilingual seal) is wrapped with its own `lang`.
- **C6 Disclaimer.** "Maintenance activity, not a security audit" stays visible in the footer and the dialog.

## Motion

- **D1 Reduced motion.** `prefers-reduced-motion: reduce` or the manual toggle (`useReduce()`) stops all loops, parallax, fog drift and fireflies. Remaining transitions are fades ≤ 300 ms.
- **D2 No flashing.** Nothing flashes more than 3 times per second. Candle flicker stays a soft scale/opacity change.
- **D3 Pause control.** The motion toggle in the top bar is reachable by keyboard and its label states the action ("Pause motion" / "Resume motion").
- **D4 Sound** (if added) is off by default and never autoplays.

## Layout

- **E1 Reflow.** Works at 320 px width with no horizontal page scroll; zones stack vertically on phones.
- **E2 Zoom.** Usable at 200% browser zoom; no text clipped inside fixed-height tombstones.
- **E3 Forced colors.** In Windows High Contrast, tombstones and charms keep a visible border and text.

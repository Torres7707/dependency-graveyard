# Design: graveyard-scene

## Component tree

```
App
 ├─ Scene                      (src/scene/Scene.tsx, Silhouettes.tsx)  decorative, aria-hidden
 └─ Graveyard                  (src/app/Graveyard.tsx)
     ├─ Ritual                 while graves === null
     └─ main.yard
         ├─ header: counts, notices, HealthCandle
         ├─ Toolbar            charms, search, kind switch, view switch
         ├─ LedgerTable        view === "ledger"
         └─ LayoutGroup
             ├─ GraveZone × 5  (AnimatePresence popLayout)
             │   └─ Tombstone  motion.li > motion.button
             │       ├─ StatusIcon (Alive|Zombie|Ghost|Buried|Lost)Icon
             │       └─ Plaque (variant 0|1|2) + engraving text
             └─ DetailDialog   (see detail-panel spec)
```

## State

`useStore` (zustand): `hidden` per status, `query`, `kind`, `view`, `motionOff`, `selectedId`. `useReduce()` = OS reduced motion OR `motionOff`.

Derived in `Graveyard`: `counts`, `visible` (filters applied), `byStatus`, `light = graves.length > 80`.

Tombstone flags:
- `lively = !reduce && !light`
- `animated = useLoopSlot(ref, lively)` (`src/graves/motionBudget.ts`): one shared IntersectionObserver; on each rAF after a change, the `LOOP_BUDGET` visible graves nearest the viewport centre get a slot; no slots while scrolling and for `SCROLL_IDLE_MS` after
- `layout = !light`

## Look from hash

`lookFor(name)` → FNV-1a 32-bit → `variant = h % 3`, `tilt = ((h >>> 8) % 81) / 10 - 4`, `phase = ((h >>> 16) % 1000) / 1000 * 2`. Buried stones tilt 1.6× more.

## Icons

Each icon is hand-written JSX in a 64×64 viewBox (`IconSvg` wrapper), with moving parts as separate `<g>`. Shared variants and timing helpers in `icons/anim.ts`. Static SVG masters in `src/assets/status/*.svg`; preview page in `design/status-icons-preview.html`.

## Performance

- At most 8 icon loops at once, none during scroll; light mode above 80 graves; `memo` on Tombstone.
- One compositable loop per icon; scene loops limited to whole layers (1 twinkling star layer, 8 fireflies, 2 bats, 3 clouds, 2 fog).
- Measurement scripts, before/after numbers and remaining costs: `docs/PERFORMANCE.md`.
- Stars and fireflies precomputed at module load from hashes.
- Target: 60 fps on a mid-range laptop with ≤ 80 graves.

## Testing strategy

- Unit: `lookFor` deterministic and in range (`i18n.test.ts`).
- Manual checklist per `accessibility.md` (A–E), run by the `a11y-reviewer` agent after UI changes.
- Manual: sample graveyard shows all five statuses; 320 px width; reduced motion on/off; 150-dependency manifest for light mode.

# Kiro log

Raw notes for the "how we used Kiro" write-up. One entry per Kiro session, three lines each:

- **Did:** what I asked Kiro to do
- **Kiro:** how it went (what it got right, what it missed, how long)
- **Changed:** what I fixed or rewrote by hand

Keep entries honest and short. Only write up a feature in the final README if it shows up here.

## Kiro setup (what lives where)

| Feature | File(s) | Purpose |
|---|---|---|
| Spec | `.kiro/specs/{parse-package-json,fetch-package-health,classify-package,graveyard-scene,detail-panel}/` | requirements → design → tasks per area |
| Steering | `.kiro/steering/{tech,design-system,accessibility,copy-voice}.md` | stack rules (always); visuals, a11y and voice load on matching files |
| Hooks | `.kiro/hooks/check-on-save.json` | `PostFileSave` on `src/**/*.ts(x)` → `pnpm typecheck && pnpm lint` |
| | `.kiro/hooks/classify-property-tests.json` | `PostFileSave` on classify/config/types/parse → `pnpm test:pbt` |
| | `.kiro/hooks/kiro-not-ignored.json` | `PreToolUse` on shell; blocks `git commit` when `.kiro/` is ignored or untracked |
| PBT | `src/domain/{classify,parse}.property.test.ts` | fast-check properties for status rules and parsing |
| MCP | `.kiro/settings/mcp.json` | `fetch` server to read npm / deps.dev docs and live responses |
| Custom agent | `.kiro/agents/a11y-reviewer.json` | read-only review against `accessibility.md` |

Hook trigger names follow the Kiro docs as of 2026-11 (`PostFileSave`, `PreToolUse`). File hooks fire only on agent edits, not manual ones. Confirm in the IDE Hooks panel that all three show up.

## Entries

### 2026-11-13 · Kiro workspace setup

- **Did:** Added the five specs, four steering files, three hooks, fetch MCP, the a11y-reviewer agent, fast-check property tests, oxlint.
- **Kiro:** (fill in after opening the workspace in Kiro: do the specs, hooks and agent load without errors?)
- **Changed:** —

### 2026-11-13 · Property tests (classify + parse)

- **Did:** Wrote the four planned properties (monotonic, ghost first, exhaustive, no dependency key lost) plus "never throws" and "unreadable date is lost".
- **Found:** three bugs unit tests missed, all reproduced by fast-check with shrunk counterexamples:
  1. `classify` buried a package whose `lastPublishedAt` was `" "`. `new Date(" ")` is NaN, every comparison with NaN is false, so it fell through to `buried`. Counterexample: `[" ", 0, 946684800000]`. Now `lost / no_versions`.
  2. `parsePackageJson` silently dropped a dependency named `__proto__`: `z.record` leaves it out of the parsed copy. Counterexample: `devDependencies: { "__proto__": "" }` → `no_deps`. Now read from the source object; the key shows up as a `lost` grave (`bad_name`).
  3. `parsePackageJson` crashed with TypeError on `{"x": {"toString": ""}}` because `String(value)` calls the non-function `toString`. Found only in some runs (random seeds); kept as a regression unit test.
- **Changed:** Fixes in `classify.ts` and `parse.ts`, regression unit tests in `classify.test.ts` and `parse.property.test.ts`. 20 consecutive runs green afterward.

### 2026-11-13 · Scroll performance

- **Did:** Profiled the scroll jank (60 deps, 4× throttle: p50 83 ms; 172 compositor layers, 171 looping animations) and cut it to one idle loop per icon, max 8 looping icons, none while scrolling. Full numbers in `docs/PERFORMANCE.md`.
- **Kiro:** Done outside Kiro (CLI agent, Playwright traces). The `design-system.md` motion rules let "every part loops" through; they now set a loop budget.
- **Changed:** `motionBudget.ts`, all five icons, stars/fireflies/bats in the scene, motion rules in steering + `graveyard-scene` spec. After: p50 16.7 ms, 43 layers, no blank graves on scroll-back.

<!-- Template
### YYYY-MM-DD · <topic>

- **Did:**
- **Kiro:**
- **Changed:**
-->

## Questions to answer at the end

- Spec: how the work was split; compared with chatting freely, where specs were better and where slower.
- Steering: which steering file had the biggest effect on output quality.
- Hooks: what got automated and what it saved.
- PBT: what properties caught that unit tests didn't (see entry above; add more only if they really ran).
- MCP: what the fetch server made easier.
- Powers / custom agents: which ones were used and what each did. Leave out anything unused.
- IDE / CLI: how the two split the work (IDE for the spec flow, CLI for batch refactors and checks).

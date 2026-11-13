---
inclusion: always
---

# Tech stack and conventions

Source of truth for product and visuals: #[[file:docs/DESIGN.md]]

## Stack

- React 19 + TypeScript 7 (strict, `noUncheckedIndexedAccess`) + Vite 8. Pure front end: no backend, no accounts, no API keys.
- Tailwind 4 tokens in `src/styles/index.css` (`@theme`), plus hand-written component CSS in the same file.
- `motion/react` for every animation. Do not add GSAP, Lottie, Rive or Three.js.
- TanStack Query for requests, `p-limit` (shared queue in `src/data/limit.ts`, concurrency 6), `zod` for untrusted JSON, `zustand` for UI state, Radix Dialog/Tooltip for accessible primitives, `lucide-react` for small UI icons.
- Tests: `vitest` + Testing Library + `fast-check` for property tests. Lint: `oxlint`.
- Package manager: pnpm. Pin exact versions for runtime dependencies. Respect the pnpm minimum release age; do not add entries to `minimumReleaseAgeExclude` without asking.

## Layout

```
src/domain/   pure functions: parse, classify, hash, epitaph, format, config (thresholds)
src/data/     network: deps.dev, npm downloads, registry fallback, cache, links
src/store/    zustand store, useReduce (OS reduced motion OR manual toggle)
src/graves/   Tombstone, GraveZone, HealthCandle, Plaque, icons/<Status>Icon.tsx
src/scene/    decorative background layers
src/ui/       Gate, Ritual, Toolbar, LedgerTable, DetailDialog
src/i18n/     en.ts, zh.ts, types.ts (Dict); every user-facing string lives here
```

Import with the `@/` alias.

## Rules

- `src/domain/` stays pure: no `fetch`, no DOM, no `Date.now()` inside rules. The caller passes `now`.
- Never call `Math.random()` during render. Per-package variation comes from `hashString` / `lookFor` / `pickBy` in `src/domain/hash.ts`.
- Thresholds live only in `src/domain/config.ts`. UI copy reads them from there.
- A failed or missing lookup is `lost`, never `buried`. Do not weaken this.
- Only package names leave the browser. Never send the whole `package.json` or other fields.
- Treat every API body as untrusted: parse with zod or defensive readers, and render only http(s) links via `safeHttpUrl`.
- `localStorage` access is wrapped in try/catch and is best effort.
- Every new user-facing string goes into both `en.ts` and `zh.ts` (the `Dict` type enforces it).

## Commands

| Task | Command |
|---|---|
| Dev server | `pnpm dev` |
| Type check | `pnpm typecheck` |
| Lint | `pnpm lint` |
| All tests | `pnpm test` |
| Property tests only | `pnpm test:pbt` |
| Check `.kiro/` is committed | `pnpm check:kiro` |

Before calling a task done: `pnpm typecheck && pnpm lint && pnpm test`.

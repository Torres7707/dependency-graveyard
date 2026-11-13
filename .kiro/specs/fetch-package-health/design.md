# Design: fetch-package-health

## Overview

```
useGraveyard(specs, now)
 ├─ useQueries: one ["history", target] per distinct target ─► fetchHistory
 │     deps.dev ──fail──► npm abbreviated doc ──404──► not_found
 ├─ useQuery ["downloads", targets] ─► fetchWeeklyDownloads
 │     unscoped: bulk ≤128 ──fail──► per-name
 │     scoped:   per-name
 └─ when all settled: specs.map(classify(spec, lookup, downloads, now))
```

All network calls go through `getJson` (`src/data/http.ts`) and the shared `limit` queue (`src/data/limit.ts`, p-limit 6).

## Modules

| File | Responsibility |
|---|---|
| `src/data/history.ts` | `historyFromDepsDev`, `historyFromRegistry` (pure, zod), `fetchHistory` with fallback and cache |
| `src/data/downloads.ts` | `parseDownloads` (pure), bulk/scoped split, batch-failure fallback, cache |
| `src/data/cache.ts` | `readCache` / `writeCache` with `dg:v1:` prefix and TTL, all in try/catch |
| `src/data/packageInfo.ts` | `usePackageInfo`, loaded only when a dialog opens |
| `src/data/links.ts` | `safeHttpUrl`, `normalizeRepoUrl`, `githubSlug` |
| `src/data/useGraveyard.ts` | Compose queries, build graves once everything settles, `retryFailed` |

## API facts (checked with real responses)

These shapes were confirmed against live responses; see the MCP note in `docs/kiro-log.md`.

- deps.dev package: `{ versions: [{ versionKey: { version }, publishedAt, isDefault, isDeprecated, deprecatedReason }] }`. `publishedAt` is `YYYY-MM-DDTHH:MM:SSZ` for every version, so string comparison orders correctly.
- npm downloads, one name: `{ downloads, package, start, end }`; several names: `{ [name]: point | null }`.
- npm bulk + scoped: error body `scoped packages are not currently supported in bulk lookups`.
- `react` full packument is ~7 MB; abbreviated doc is used instead.

## Decisions

| Decision | Why |
|---|---|
| Graves render only after every query settles | Avoids graves jumping between zones mid-ritual; the candles show progress. |
| `now` is fixed at summon time | Every grave is judged against the same moment; also makes classify pure. |
| Downloads `null` ≠ 0 | 0 would wrongly bury a popular package when the API is down. |
| Cache in our own `localStorage` wrapper, not `persistQueryClient` | Smaller, per-package entries; survives across different package.json files. |

## Testing strategy

- Unit tests for the pure readers: `history.test.ts`, `downloads.test.ts`, `links.test.ts`.
- Recorded real responses as fixtures; failure paths (404, 500, malformed body).
- Network hooks are exercised manually with the sample graveyard; msw tests are optional (task 6).

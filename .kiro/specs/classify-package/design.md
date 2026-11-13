# Design: classify-package

## Overview

```ts
type HistoryLookup = { kind: "found"; history: PackageHistory } | { kind: "not_found" } | { kind: "error" };

function classify(
  spec: DependencySpec,
  lookup: HistoryLookup | undefined,
  weeklyDownloads: number | null | undefined,
  now: number,
): Grave; // { spec, status, reason, history?, weeklyDownloads?, error? }
```

Decision order (first match wins):

```
no target ─────────────────────────► lost / unsupported
lookup missing or error ───────────► lost / network
not found ─────────────────────────► lost / not_found
deprecated !== undefined ──────────► ghost / deprecated
no readable lastPublishedAt ───────► lost / no_versions
published within 12 months ────────► alive / recent
downloads null/undefined ──────────► lost / downloads_unavailable
downloads ≥ 50,000 ────────────────► zombie / stale_popular
otherwise ─────────────────────────► buried / stale_quiet
```

## Decisions

| Decision | Why |
|---|---|
| `now` is a parameter | Pure and testable; one fixed moment per summoning. |
| Month cutoff via `setUTCMonth(-12)` | Matches "12 months" as people read it; the exact boundary day counts as alive. |
| Unparseable dates are `lost` | `new Date("garbage")` is NaN; NaN comparisons are false, so without the guard the package fell through to `buried`. Found by property P5. |
| Ghost checked before the date | A deprecated package with a fresh release is still a ghost. |

## Testing strategy

Unit tests (`classify.test.ts`) cover each branch and boundary: exactly 12 months, exactly 50,000 downloads, empty deprecation message, missing downloads.

Property tests (`classify.property.test.ts`, fast-check, 100 runs each):

| ID | Property | Requirement |
|---|---|---|
| P1 | older publish ⇒ liveliness never increases | 3.1 |
| P2 | later `now` ⇒ liveliness never increases | 3.2 |
| P3 | deprecated ⇒ ghost | 3.3 |
| P4 | any input ⇒ one of five statuses, reason matches status | 3.4 |
| P5 | unreadable date ⇒ lost | 2.4 |

The `PostFileSave` hook `.kiro/hooks/classify-property-tests.json` runs these whenever classify, config or types change.

# Implementation plan: fetch-package-health

- [x] 1. Shared plumbing: `getJson` + `HttpError`, `isNotFound`, p-limit queue, localStorage cache
  - _Requirements: 3.1, 3.3_

- [x] 2. Publish history
  - [x] 2.1 `historyFromDepsDev` with zod; newest/oldest `publishedAt`; deprecation from default version
  - [x] 2.2 `historyFromRegistry` from the abbreviated document
  - [x] 2.3 `fetchHistory` with fallback, `not_found`, cache
  - [x] 2.4 Unit tests from real response shapes
  - _Requirements: 1.1–1.5, 4.2_

- [x] 3. Weekly downloads
  - [x] 3.1 `parseDownloads` for single and bulk bodies, `null` for missing
  - [x] 3.2 Bulk ≤128 for unscoped, single for scoped, per-name fallback on batch failure
  - [x] 3.3 Unit tests
  - _Requirements: 2.1–2.4_

- [x] 4. `useGraveyard` hook: queries, retry 1, settle-then-classify, progress, `retryFailed`
  - _Requirements: 3.2, 3.4–3.6_

- [x] 5. On-demand detail facts and safe links (`usePackageInfo`, `safeHttpUrl`, `normalizeRepoUrl`)
  - _Requirements: 4.3, 5.1, 5.2_

- [ ]* 6. msw tests for failure paths (deps.dev 500 → npm fallback; bulk 400 → per-name)
  - _Requirements: 1.3, 2.3_

- [ ]* 7. Offline demo: recorded responses for the sample graveyard behind a toggle (`docs/DESIGN.md` §10)

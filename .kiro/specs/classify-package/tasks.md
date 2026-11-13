# Implementation plan: classify-package

- [x] 1. Thresholds in `src/domain/config.ts` (`ALIVE_WITHIN_MONTHS`, `ZOMBIE_MIN_WEEKLY_DOWNLOADS`)
  - _Requirements: 4.2_

- [x] 2. `Status`, `ReasonCode`, `Grave` types and `STATUS_ORDER`
  - _Requirements: 4.1_

- [x] 3. Implement `classify` and `publishedWithin`
  - [x] 3.1 Lost branches: unsupported, network, not_found, no_versions, downloads_unavailable
  - [x] 3.2 Ghost before date; alive, zombie, buried
  - [x] 3.3 Boundary unit tests (12 months, 50,000, empty deprecation)
  - _Requirements: 1.1–1.4, 2.1–2.5_

- [x] 4. Property tests with fast-check (`src/domain/classify.property.test.ts`)
  - [x] 4.1 P1 monotonic in age
  - [x] 4.2 P2 monotonic in time
  - [x] 4.3 P3 ghost first
  - [x] 4.4 P4 exhaustive, reason matches status
  - [x] 4.5 P5 unreadable date is lost; fix `classify` (whitespace date was `buried`); add regression unit test
  - _Requirements: 2.4, 3.1–3.4_

- [x] 5. Reason sentences in `en.ts` / `zh.ts` that quote thresholds from config
  - _Requirements: 4.1_

- [x] 6. Hook: run property tests on save of classify-related files

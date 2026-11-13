# Implementation plan: parse-package-json

- [x] 1. Define `DependencySpec`, `DepKind`, `UnsupportedKind` in `src/domain/types.ts`
  - _Requirements: 1.6, 2.1–2.8_

- [x] 2. Implement `resolveSpec(name, raw)`
  - [x] 2.1 `npm:` aliases, scoped and unscoped, default range `*`
  - [x] 2.2 local, workspace, git/URL, GitHub shorthand, patch, non-string, bad name
  - [x] 2.3 Unit tests for every branch
  - _Requirements: 2.1–2.7_

- [x] 3. Implement `parsePackageJson(text, options)`
  - [x] 3.1 Empty, invalid JSON with line/column, not-object errors
  - [x] 3.2 zod field-shape check returning `bad_field`
  - [x] 3.3 Bare dependency map detection
  - [x] 3.4 Field order, dedupe, peer/optional toggles
  - [x] 3.5 Truncate at `MAX_DEPENDENCIES`
  - _Requirements: 1.1–1.5, 3.1–3.6_

- [x] 4. Property tests with fast-check (`src/domain/parse.property.test.ts`)
  - [x] 4.1 P1 no dependency key is lost
  - [x] 4.2 P2 every spec has a target or a reason; ids unique
  - [x] 4.3 P3 never throws on any text
  - [x] 4.4 Fix counterexamples: `__proto__` key dropped by zod; `{"toString": ""}` crashed `String()`; add regression unit tests
  - _Requirements: 1.4, 1.6, 2.8, 3.7_

- [x] 5. Wire into Gate: paste, file drop, file picker, sample, error note with `role="alert"`
  - _Requirements: 3.1–3.6, 4.1_

- [ ]* 6. Accept `package-lock.json` / `pnpm-lock.yaml` input (optional, post-hackathon)

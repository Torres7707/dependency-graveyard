# Requirements: classify-package

## Introduction

Decide each dependency's status from its spec, lookup result, weekly downloads and a fixed `now`. Pure function in `src/domain/classify.ts`. Thresholds live in `src/domain/config.ts`. Source: `docs/DESIGN.md` §1.2.

| Priority | Status | Rule |
|---|---|---|
| 1 | ghost | latest version is deprecated |
| 2 | alive | last publish within 12 months |
| 3 | zombie | older than 12 months, weekly downloads ≥ 50,000 |
| 4 | buried | older than 12 months, weekly downloads < 50,000 |
| — | lost | can't be queried, not found, request failed, or data missing |

## Requirements

### Requirement 1: Status rules

**User story:** As a developer, I want each dependency sorted by maintenance activity with a stated reason, so that I trust the result.

#### Acceptance criteria

1. WHEN the latest version carries a deprecation message (including an empty one) THE SYSTEM SHALL return `ghost` with reason `deprecated`, regardless of dates or downloads.
2. WHEN not deprecated and the last publish is on or after `now` minus `ALIVE_WITHIN_MONTHS` (calendar months, UTC) THE SYSTEM SHALL return `alive` with reason `recent`, regardless of downloads.
3. WHEN older than the cutoff and weekly downloads ≥ `ZOMBIE_MIN_WEEKLY_DOWNLOADS` THE SYSTEM SHALL return `zombie` with reason `stale_popular`.
4. WHEN older than the cutoff and weekly downloads < `ZOMBIE_MIN_WEEKLY_DOWNLOADS` THE SYSTEM SHALL return `buried` with reason `stale_quiet`.

### Requirement 2: Lost is never buried

**User story:** As a developer, I want failed lookups shown as unknown, so that a network error never tells me a package is dead.

#### Acceptance criteria

1. WHEN the spec has no `target` THE SYSTEM SHALL return `lost` with reason `unsupported`.
2. WHEN the lookup is missing or errored THE SYSTEM SHALL return `lost` with reason `network`.
3. WHEN the package is not found THE SYSTEM SHALL return `lost` with reason `not_found`.
4. WHEN the package has no readable last publish date (missing or unparseable) THE SYSTEM SHALL return `lost` with reason `no_versions`.
5. WHEN the package is stale and weekly downloads are `null` or missing THE SYSTEM SHALL return `lost` with reason `downloads_unavailable`.

### Requirement 3: Properties

1. **Monotonic in age.** FOR ALL inputs, making the last publish older SHALL NOT make the status more alive (order: alive > zombie > buried).
2. **Monotonic in time.** FOR ALL inputs, moving `now` later SHALL NOT make the status more alive.
3. **Ghost first.** FOR ALL inputs with a deprecation message, the status SHALL be `ghost`.
4. **Exhaustive.** FOR ALL inputs, including malformed ones, THE SYSTEM SHALL return exactly one of the five statuses, and the reason SHALL belong to that status.

### Requirement 4: Explainability

1. THE SYSTEM SHALL return a `reason` code with every grave; the UI turns it into a sentence that includes the threshold from config.
2. THE SYSTEM SHALL read thresholds only from `config.ts`.

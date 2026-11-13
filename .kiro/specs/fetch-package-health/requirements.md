# Requirements: fetch-package-health

## Introduction

For each queryable dependency, fetch the facts the status rules need (last publish date, latest-version deprecation, weekly downloads) from public CORS-enabled APIs, with no backend and no API key. Source: `docs/DESIGN.md` §4.

## Requirements

### Requirement 1: Publish history

**User story:** As a developer, I want each package's last release and deprecation status looked up, so that the graveyard reflects reality.

#### Acceptance criteria

1. THE SYSTEM SHALL request `https://api.deps.dev/v3/systems/npm/packages/{encodeURIComponent(name)}` for each distinct `target`.
2. WHEN deps.dev responds THE SYSTEM SHALL take `lastPublishedAt` as the newest `publishedAt` across all versions, `firstPublishedAt` as the oldest, and `deprecated` from the default (`isDefault`) version only.
3. WHEN deps.dev fails for a reason other than abort THE SYSTEM SHALL fall back to the abbreviated npm registry document (`Accept: application/vnd.npm.install-v1+json`), never the full packument.
4. WHEN both sources return 404 THE SYSTEM SHALL report `not_found`; WHEN both fail otherwise THE SYSTEM SHALL report an error.
5. WHEN using the npm fallback THE SYSTEM SHALL mark `source: "npm"` so the UI can say the date is the document's modified time.

### Requirement 2: Weekly downloads

1. THE SYSTEM SHALL request unscoped packages in bulk from `https://api.npmjs.org/downloads/point/last-week/{a},{b},…`, at most 128 per request.
2. THE SYSTEM SHALL request scoped packages one at a time, because the bulk endpoint rejects them.
3. WHEN a bulk request fails with a non-404 error THE SYSTEM SHALL retry those packages individually, so one bad name does not hide the rest.
4. WHEN a package's downloads are missing THE SYSTEM SHALL return `null` for it, not 0.

### Requirement 3: Limits, caching, isolation

1. THE SYSTEM SHALL keep at most 6 requests in flight across the whole app.
2. THE SYSTEM SHALL retry a failed query once.
3. THE SYSTEM SHALL cache successful results in `localStorage` for 6 hours, and treat storage errors as cache misses.
4. WHEN one package's lookup fails THE SYSTEM SHALL still classify every other package.
5. THE SYSTEM SHALL offer a "Try again" action that refetches only failed lookups.
6. WHILE lookups are running THE SYSTEM SHALL report `done` / `total` for the candle progress.

### Requirement 4: Privacy and safety

1. THE SYSTEM SHALL send only package names to deps.dev and npm.
2. THE SYSTEM SHALL validate every response body with zod or a defensive reader before use.
3. THE SYSTEM SHALL render only http(s) links taken from package metadata.

### Requirement 5: Detail facts (on demand)

1. WHEN a detail dialog opens THE SYSTEM SHALL fetch `registry.npmjs.org/{name}/latest` for description, license, homepage and repository.
2. WHEN the repository is on GitHub THE SYSTEM SHALL fetch stars and open issues from `api.deps.dev/v3/projects/github.com%2F{owner}%2F{repo}`; failure there SHALL NOT break the dialog.

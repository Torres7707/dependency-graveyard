---
inclusion: always
---

# Dependency Graveyard project guidance

Dependency Graveyard is a privacy-respecting, single-page visualizer for the
maintenance activity of direct dependencies declared in a pasted `package.json`.
It turns the results into a graveyard scene, but it is not a security scanner and
must never claim that a dependency is unsafe solely because it is inactive.

## Product boundaries

- Keep the experience usable without accounts, API keys, uploads, or persistence.
- Preserve the existing parsing, npm lookup, status classification, filtering,
  table view, and detail dialog unless a feature explicitly changes them.
- Treat each dependency result independently: a failed request must appear as an
  unavailable result, never as a `dead` dependency.
- Preserve deterministic visual identity for a package. Variants, tilt, and
  depth may derive from a stable hash of the package name, but not from an
  unseeded random value during rendering.

## Status language

- `alive`: published in the last 12 months.
- `zombie`: not published in the last 12 months but still widely downloaded.
- `ghost`: the latest package version is marked deprecated by npm.
- `dead`: none of the above; describe this as low activity, not insecurity.

Use clear factual copy alongside themed copy. Always retain the disclosure that
the product represents maintenance activity and is not a security audit.

## Scope and delivery

The repository currently contains a standalone, dependency-free prototype at
`demo/index.html`. Until an explicit migration is approved, keep it runnable by
opening the file directly in a browser: do not introduce a build step or remote
asset dependency solely for visual polish.

# Requirements: detail-panel

## Introduction

Clicking a tombstone opens a parchment card with the facts behind the status and a generated epitaph. Sources: `docs/DESIGN.md` §1.1 step 4, §2.7, §2.8, §3.4.

## Requirements

### Requirement 1: Open and close

1. WHEN a tombstone or a ledger row is activated THE SYSTEM SHALL open the detail dialog for that dependency.
2. THE SYSTEM SHALL trap focus inside the dialog, close it on Esc, overlay click or the close button, and return focus to the element that opened it.
3. WHILE motion is allowed THE SYSTEM SHALL move the status icon from the tombstone into the card with a shared-element transition.

### Requirement 2: Facts

1. THE SYSTEM SHALL show: status label with its name in the other language, package name as the dialog title, alias target, declared range, kind, and the reason sentence.
2. THE SYSTEM SHALL show last publish (ISO day + relative time), latest version, weekly downloads, version count, first publish when known.
3. WHEN the date came from the npm fallback THE SYSTEM SHALL say it is the document's modified time.
4. WHEN a value is unknown THE SYSTEM SHALL say "Unknown" rather than 0 or blank.
5. WHEN the package is deprecated THE SYSTEM SHALL show its deprecation message exactly, or "no message" when empty, unless the epitaph already quotes it.
6. WHEN the dialog opens THE SYSTEM SHALL load description, license, homepage, repository and GitHub stars on demand, without blocking the rest of the card.
7. THE SYSTEM SHALL link to the npm page, repository and homepage only when the URL is http(s), opening in a new tab with `rel="noopener noreferrer"`.

### Requirement 3: Epitaph

1. THE SYSTEM SHALL pick one epitaph template per status by hashing the package name, so the same package gets the same epitaph, in both languages.
2. THE SYSTEM SHALL interpolate only real data (name, days, dates, downloads, version, deprecation message).
3. THE SYSTEM SHALL use the dialog description slot for the epitaph.

### Requirement 4: Disclaimer

1. THE SYSTEM SHALL show the note that maintenance activity is not security on every card.

### Requirement 5: Ghost gaze

1. WHILE the dialog shows a ghost and motion is allowed THE SYSTEM SHALL let the ghost's eyes follow the pointer by at most 2 px.

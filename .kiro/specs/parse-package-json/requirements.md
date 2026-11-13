# Requirements: parse-package-json

## Introduction

Turn pasted or dropped `package.json` text into a list of `DependencySpec` records the rest of the app can look up. Parsing is pure and runs only in the browser. Source: `docs/DESIGN.md` §1.3.

## Requirements

### Requirement 1: Read dependency fields

**User story:** As a developer, I want to paste my package.json and have every dependency read, so that none of them is silently missing from the graveyard.

#### Acceptance criteria

1. WHEN the input is a JSON object THE SYSTEM SHALL read `dependencies` and `devDependencies`.
2. WHEN the peer toggle is on THE SYSTEM SHALL also read `peerDependencies`; WHEN the optional toggle is on THE SYSTEM SHALL also read `optionalDependencies`.
3. WHEN a key appears in several fields THE SYSTEM SHALL keep the first occurrence in the order prod, dev, peer, optional.
4. FOR ALL valid JSON inputs THE SYSTEM SHALL return every distinct dependency key from the enabled fields, either as a spec or counted in `truncated`. No key is dropped. *(property)*
5. WHEN the top-level object has no dependency field but every entry looks like `"name": "version"` THE SYSTEM SHALL treat it as a bare `dependencies` map.
6. THE SYSTEM SHALL give each spec an `id` of `${kind}:${name}` that is unique within one input.

### Requirement 2: Resolve declarations

**User story:** As a developer, I want aliases and non-registry declarations handled honestly, so that the graveyard shows what was actually installed or says it can't tell.

#### Acceptance criteria

1. WHEN a value is `npm:<pkg>@<range>` THE SYSTEM SHALL set `target` to `<pkg>` and `range` to `<range>` (default `*`), including scoped packages.
2. WHEN a value starts with `file:`, `link:`, `portal:` or a path THE SYSTEM SHALL mark it `unsupported: "local"` with `target: null`.
3. WHEN a value starts with `workspace:` THE SYSTEM SHALL mark it `unsupported: "workspace"`.
4. WHEN a value is a git URL, `github:`/`gitlab:`/`bitbucket:`/`gist:`, an http(s) URL or ends in `.git` THE SYSTEM SHALL mark it `unsupported: "git"`.
5. WHEN a value is `owner/repo` shorthand THE SYSTEM SHALL mark it `unsupported: "github"`; WHEN it starts with `patch:` THE SYSTEM SHALL mark it `unsupported: "patch"`.
6. WHEN a value is not a string THE SYSTEM SHALL mark it `unsupported: "not_string"` and show a printable form of the value as `range`.
7. WHEN the key is not a valid npm name THE SYSTEM SHALL mark it `unsupported: "bad_name"`.
8. FOR ALL specs THE SYSTEM SHALL have either a non-null `target` or an `unsupported` reason. *(property)*

### Requirement 3: Errors and limits

**User story:** As a developer, I want a clear note when my input is wrong, so that I can fix it without guessing.

#### Acceptance criteria

1. WHEN the input is empty or whitespace THE SYSTEM SHALL return `code: "empty"`.
2. WHEN JSON parsing fails THE SYSTEM SHALL return `code: "invalid_json"` with line and column when the engine reports them.
3. WHEN the top level is not an object THE SYSTEM SHALL return `code: "not_object"`.
4. WHEN a dependency field is not an object THE SYSTEM SHALL return `code: "bad_field"` naming the field.
5. WHEN no dependencies are found THE SYSTEM SHALL return `code: "no_deps"`.
6. WHEN more than `MAX_DEPENDENCIES` (300) specs are found THE SYSTEM SHALL keep the first 300 and report the rest in `truncated`.
7. FOR ALL string inputs THE SYSTEM SHALL return a result and never throw. *(property)*

### Requirement 4: Privacy

1. THE SYSTEM SHALL parse entirely in the browser and pass only package names to the data layer.

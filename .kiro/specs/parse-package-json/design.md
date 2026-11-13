# Design: parse-package-json

## Overview

One pure module, `src/domain/parse.ts`, exports `parsePackageJson(text, options)` and `resolveSpec(name, raw)`. No I/O. The Gate screen (`src/ui/Gate.tsx`) calls it on submit and renders either the error note or starts the summoning.

```
text ──JSON.parse──► unknown ──object?──► bare-map check ──zod (field shapes)──► per-field entries
                                                                                     │
                                                                  resolveSpec(name, raw) per entry
                                                                                     ▼
                                                        dedupe by name ─► slice(0, 300) ─► ParseResult
```

## Interfaces

```ts
type ParseResult =
  | { ok: true; packageName?: string; specs: DependencySpec[]; truncated: number }
  | { ok: false; code: ParseErrorCode; field?: string; line?: number; column?: number };

interface DependencySpec {
  id: string;            // `${kind}:${name}`
  name: string;          // key in package.json
  target: string | null; // package to query; null when it can't be queried
  range: string;
  kind: "prod" | "dev" | "peer" | "optional";
  unsupported?: UnsupportedKind;
}
```

## Decisions

| Decision | Why |
|---|---|
| zod validates only that each field is an object of unknown values | Values are classified by `resolveSpec`, which gives a reason per entry instead of rejecting the whole file. |
| Entries are read from the source object, not from zod's parsed copy | `z.record` drops a `__proto__` key; reading the source keeps every key (req 1.4). Found by property testing. |
| Non-string values are printed with `JSON.stringify` | `String(value)` throws for objects such as `{"toString": ""}` (req 3.7). Found by property testing. |
| Uppercase allowed in names | Old packages such as `JSONStream` use it. |
| Error location from the engine message (`line X column Y` or `position N`) | Works across V8 and other engines without a JSON parser dependency. |

## Error handling

All failures return `{ ok: false, code }`. The UI maps `code` to i18n text in `t.gate.errors` and shows it with `role="alert"`.

## Testing strategy

- Unit tests (`parse.test.ts`): each declaration kind, aliases incl. scoped, dedupe order, bare map, error codes, truncation at 300.
- Property tests (`parse.property.test.ts`, fast-check):
  - **P1 No key lost**: for random dependency maps, names + truncated = distinct keys. (req 1.4)
  - **P2 Every spec is queryable or explained**, ids unique. (req 1.6, 2.8)
  - **P3 Never throws** for any string or JSON text. (req 3.7)

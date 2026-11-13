import { z } from "zod";
import { MAX_DEPENDENCIES } from "./config";
import type { DependencySpec, DepKind, UnsupportedKind } from "./types";

export interface ParseOptions {
  includePeer?: boolean;
  includeOptional?: boolean;
}

export type ParseErrorCode = "empty" | "invalid_json" | "not_object" | "bad_field" | "no_deps" | "too_large";

export type ParseResult =
  | { ok: true; packageName?: string; specs: DependencySpec[]; truncated: number }
  | { ok: false; code: ParseErrorCode; field?: string; line?: number; column?: number };

const depMap = z.record(z.string(), z.unknown());

const PackageJson = z.looseObject({
  name: z.unknown().optional(),
  dependencies: depMap.optional(),
  devDependencies: depMap.optional(),
  peerDependencies: depMap.optional(),
  optionalDependencies: depMap.optional(),
});

const FIELDS: ReadonlyArray<readonly [DepKind, "dependencies" | "devDependencies" | "peerDependencies" | "optionalDependencies"]> = [
  ["prod", "dependencies"],
  ["dev", "devDependencies"],
  ["peer", "peerDependencies"],
  ["optional", "optionalDependencies"],
];

/** npm package names; uppercase is allowed because some long-lived packages (e.g. JSONStream) use it. */
const NAME_RE = /^(?:@[a-z0-9][a-z0-9._~-]*\/)?[a-z0-9~-][a-z0-9._~-]*$/i;

export function isValidPackageName(name: string): boolean {
  return name.length > 0 && name.length <= 214 && NAME_RE.test(name);
}

interface Resolved {
  target: string | null;
  range: string;
  unsupported?: UnsupportedKind;
}

export function resolveSpec(name: string, raw: unknown): Resolved {
  if (typeof raw !== "string") {
    // String(raw) throws for objects like {"toString": ""}; JSON text is always printable here.
    return { target: null, range: JSON.stringify(raw) ?? String(raw), unsupported: "not_string" };
  }
  const value = raw.trim();

  if (value.startsWith("npm:")) {
    const rest = value.slice(4);
    const at = rest.indexOf("@", rest.startsWith("@") ? 1 : 0);
    const target = at === -1 ? rest : rest.slice(0, at);
    const range = at === -1 ? "*" : rest.slice(at + 1) || "*";
    if (!isValidPackageName(target)) return { target: null, range: value, unsupported: "bad_alias" };
    return { target, range };
  }
  if (/^(file|link|portal):/.test(value) || /^(\.{1,2}\/|\/|~\/)/.test(value)) {
    return { target: null, range: value, unsupported: "local" };
  }
  if (value.startsWith("workspace:")) {
    return { target: null, range: value, unsupported: "workspace" };
  }
  if (/^(git\+|git:|github:|gitlab:|bitbucket:|gist:|https?:)/.test(value) || /\.git(#.*)?$/.test(value)) {
    return { target: null, range: value, unsupported: "git" };
  }
  if (value.startsWith("patch:")) {
    return { target: null, range: value, unsupported: "patch" };
  }
  if (/^[^@\s/:]+\/[^\s/]+(#.*)?$/.test(value)) {
    return { target: null, range: value, unsupported: "github" };
  }
  if (!isValidPackageName(name)) {
    return { target: null, range: value, unsupported: "bad_name" };
  }
  return { target: name, range: value || "*" };
}

function locateJsonError(text: string, error: unknown): { line?: number; column?: number } {
  const message = error instanceof Error ? error.message : "";
  const lc = /line (\d+) column (\d+)/.exec(message);
  if (lc) return { line: Number(lc[1]), column: Number(lc[2]) };
  const pos = /position (\d+)/.exec(message);
  if (!pos) return {};
  const before = text.slice(0, Number(pos[1]));
  const lines = before.split("\n");
  return { line: lines.length, column: (lines.at(-1)?.length ?? 0) + 1 };
}

/** A bare `{ "react": "^19" }` object is treated as a dependencies map. */
function looksLikeBareDependencyMap(obj: Record<string, unknown>): boolean {
  const entries = Object.entries(obj);
  return (
    entries.length > 0 &&
    !("name" in obj) &&
    !("version" in obj) &&
    entries.every(([k, v]) => typeof v === "string" && isValidPackageName(k))
  );
}

export function parsePackageJson(text: string, options: ParseOptions = {}): ParseResult {
  if (!text.trim()) return { ok: false, code: "empty" };

  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch (error) {
    return { ok: false, code: "invalid_json", ...locateJsonError(text, error) };
  }

  if (typeof json !== "object" || json === null || Array.isArray(json)) {
    return { ok: false, code: "not_object" };
  }

  const record = json as Record<string, unknown>;
  const hasDepField = FIELDS.some(([, field]) => field in record);
  const source = !hasDepField && looksLikeBareDependencyMap(record) ? { dependencies: record } : record;

  const parsed = PackageJson.safeParse(source);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    return { ok: false, code: "bad_field", field: field === undefined ? undefined : String(field) };
  }

  const enabled = new Set<DepKind>(["prod", "dev"]);
  if (options.includePeer) enabled.add("peer");
  if (options.includeOptional) enabled.add("optional");

  const seen = new Set<string>();
  const specs: DependencySpec[] = [];
  for (const [kind, field] of FIELDS) {
    if (!enabled.has(kind)) continue;
    // Read keys from the validated source object, not zod's copy: z.record drops `__proto__`,
    // and every key must surface (an invalid name becomes a `lost` grave, never disappears).
    const deps = (source as Record<string, Record<string, unknown> | undefined>)[field];
    for (const [name, raw] of Object.entries(deps ?? {})) {
      if (seen.has(name)) continue;
      seen.add(name);
      specs.push({ id: `${kind}:${name}`, name, kind, ...resolveSpec(name, raw) });
    }
  }

  if (specs.length === 0) {
    return { ok: false, code: "no_deps" };
  }

  const packageName = typeof parsed.data.name === "string" ? parsed.data.name : undefined;
  return {
    ok: true,
    packageName,
    specs: specs.slice(0, MAX_DEPENDENCIES),
    truncated: Math.max(0, specs.length - MAX_DEPENDENCIES),
  };
}

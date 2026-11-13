export type Status = "alive" | "zombie" | "ghost" | "buried" | "lost";

export type DepKind = "prod" | "dev" | "peer" | "optional";

/** Why a declaration cannot be looked up on npm. */
export type UnsupportedKind = "not_string" | "bad_alias" | "local" | "workspace" | "git" | "patch" | "github" | "bad_name";

export interface DependencySpec {
  /** Unique within one package.json: `${kind}:${name}`. */
  id: string;
  /** The key used in package.json. */
  name: string;
  /** The npm package actually queried. Differs from `name` for `npm:` aliases; null when it cannot be queried. */
  target: string | null;
  /** The declared version range, e.g. `^1.2.3`. */
  range: string;
  kind: DepKind;
  /** Why the declaration cannot be looked up on npm (local path, git URL, ...). */
  unsupported?: UnsupportedKind;
}

export interface PackageHistory {
  latestVersion?: string;
  lastPublishedAt?: string;
  firstPublishedAt?: string;
  /** Deprecation message on the default (latest) version, if it is deprecated. */
  deprecated?: string;
  versionCount: number;
  /** deps.dev gives exact publish dates; the npm fallback only knows when the package document last changed. */
  source: "deps.dev" | "npm";
}

export type LookupError = "unsupported_spec" | "not_found" | "network" | "downloads_unavailable";

export type ReasonCode =
  | "unsupported"
  | "network"
  | "not_found"
  | "no_versions"
  | "deprecated"
  | "recent"
  | "downloads_unavailable"
  | "stale_popular"
  | "stale_quiet";

export interface Grave {
  spec: DependencySpec;
  status: Status;
  history?: PackageHistory;
  weeklyDownloads?: number | null;
  error?: LookupError;
  /** Which rule produced the status; the UI turns it into a sentence. */
  reason: ReasonCode;
}

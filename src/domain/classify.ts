import { ALIVE_WITHIN_MONTHS, ZOMBIE_MIN_WEEKLY_DOWNLOADS } from "./config";
import type { DependencySpec, Grave, PackageHistory } from "./types";

export type HistoryLookup =
  | { kind: "found"; history: PackageHistory }
  | { kind: "not_found" }
  | { kind: "error" };

export function publishedWithin(iso: string, months: number, now: number): boolean {
  const cutoff = new Date(now);
  cutoff.setUTCMonth(cutoff.getUTCMonth() - months);
  return new Date(iso).getTime() >= cutoff.getTime();
}

/**
 * Order matters: ghost (deprecated) wins over everything, then alive, then
 * zombie vs buried by weekly downloads. Missing data never becomes `buried`.
 */
export function classify(
  spec: DependencySpec,
  lookup: HistoryLookup | undefined,
  weeklyDownloads: number | null | undefined,
  now: number,
): Grave {
  if (!spec.target) return { spec, status: "lost", error: "unsupported_spec", reason: "unsupported" };
  if (!lookup || lookup.kind === "error") return { spec, status: "lost", error: "network", reason: "network" };
  if (lookup.kind === "not_found") return { spec, status: "lost", error: "not_found", reason: "not_found" };

  const { history } = lookup;
  const base = { spec, history, weeklyDownloads };

  if (history.deprecated !== undefined) return { ...base, status: "ghost", reason: "deprecated" };
  // An unreadable date compares as NaN and would otherwise fall through to `buried`.
  if (!history.lastPublishedAt || Number.isNaN(Date.parse(history.lastPublishedAt))) {
    return { ...base, status: "lost", error: "not_found", reason: "no_versions" };
  }
  if (publishedWithin(history.lastPublishedAt, ALIVE_WITHIN_MONTHS, now)) return { ...base, status: "alive", reason: "recent" };
  if (weeklyDownloads === null || weeklyDownloads === undefined) {
    return { ...base, status: "lost", error: "downloads_unavailable", reason: "downloads_unavailable" };
  }
  return weeklyDownloads >= ZOMBIE_MIN_WEEKLY_DOWNLOADS
    ? { ...base, status: "zombie", reason: "stale_popular" }
    : { ...base, status: "buried", reason: "stale_quiet" };
}

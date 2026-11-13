import { CACHE_STALE_MS } from "@/domain/config";
import { readCache, writeCache } from "./cache";
import { getJson, isNotFound } from "./http";
import { limit } from "./limit";

const API = "https://api.npmjs.org/downloads/point/last-week/";
/** The bulk endpoint accepts up to 128 unscoped packages; scoped packages must be queried one at a time. */
const BULK_MAX = 128;

export type DownloadMap = Record<string, number | null>;

function pointDownloads(value: unknown): number | null {
  if (typeof value !== "object" || value === null) return null;
  const n = (value as { downloads?: unknown }).downloads;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

/** A single-package response is the point itself; a multi-package response maps names to points (or null). */
export function parseDownloads(names: readonly string[], body: unknown): DownloadMap {
  if (names.length === 1) return { [names[0]!]: pointDownloads(body) };
  const map = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;
  return Object.fromEntries(names.map((n) => [n, pointDownloads(map[n])]));
}

async function request(names: readonly string[], signal?: AbortSignal): Promise<DownloadMap> {
  try {
    const body = await limit(() => getJson(API + names.join(","), signal));
    return parseDownloads(names, body);
  } catch (error) {
    if (signal?.aborted) throw error;
    if (!isNotFound(error) && names.length > 1) {
      // Keep one bad batch from hiding everything: fall back to individual lookups.
      const parts = await Promise.all(names.map((n) => request([n], signal)));
      return Object.assign({}, ...parts) as DownloadMap;
    }
    return Object.fromEntries(names.map((n) => [n, null]));
  }
}

export async function fetchWeeklyDownloads(names: readonly string[], signal?: AbortSignal): Promise<DownloadMap> {
  const result: DownloadMap = {};
  const unscoped: string[] = [];
  const scoped: string[] = [];
  for (const name of names) {
    const cached = readCache<number>(`dl:${name}`, CACHE_STALE_MS);
    if (cached !== undefined) result[name] = cached;
    else (name.startsWith("@") ? scoped : unscoped).push(name);
  }

  const jobs: Promise<DownloadMap>[] = [];
  for (let i = 0; i < unscoped.length; i += BULK_MAX) jobs.push(request(unscoped.slice(i, i + BULK_MAX), signal));
  for (const name of scoped) jobs.push(request([name], signal));

  for (const part of await Promise.all(jobs)) {
    for (const [name, n] of Object.entries(part)) {
      result[name] = n;
      if (n !== null) writeCache(`dl:${name}`, n);
    }
  }
  return result;
}

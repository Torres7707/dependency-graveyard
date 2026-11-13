import { z } from "zod";
import type { HistoryLookup } from "@/domain/classify";
import { CACHE_STALE_MS } from "@/domain/config";
import type { PackageHistory } from "@/domain/types";
import { readCache, writeCache } from "./cache";
import { getJson, isNotFound } from "./http";
import { limit } from "./limit";

const DepsDevPackage = z.object({
  versions: z
    .array(
      z.looseObject({
        versionKey: z.looseObject({ version: z.string().optional() }).optional(),
        publishedAt: z.string().optional(),
        isDefault: z.boolean().optional(),
        isDeprecated: z.boolean().optional(),
        deprecatedReason: z.string().optional(),
      }),
    )
    .default([]),
});

export function historyFromDepsDev(data: unknown): PackageHistory {
  const { versions } = DepsDevPackage.parse(data);
  let last: (typeof versions)[number] | undefined;
  let first: string | undefined;
  for (const v of versions) {
    if (!v.publishedAt) continue;
    if (!last?.publishedAt || v.publishedAt > last.publishedAt) last = v;
    if (!first || v.publishedAt < first) first = v.publishedAt;
  }
  const latest = versions.find((v) => v.isDefault) ?? last;
  return {
    latestVersion: latest?.versionKey?.version,
    lastPublishedAt: last?.publishedAt,
    firstPublishedAt: first,
    deprecated: latest?.isDeprecated ? (latest.deprecatedReason ?? "") : undefined,
    versionCount: versions.length,
    source: "deps.dev",
  };
}

const AbbreviatedPackument = z.looseObject({
  "dist-tags": z.looseObject({ latest: z.string().optional() }).optional(),
  versions: z.record(z.string(), z.looseObject({ deprecated: z.string().optional() })).default({}),
  modified: z.string().optional(),
});

export function historyFromRegistry(data: unknown): PackageHistory {
  const doc = AbbreviatedPackument.parse(data);
  const latestVersion = doc["dist-tags"]?.latest;
  const latest = latestVersion ? doc.versions[latestVersion] : undefined;
  return {
    latestVersion,
    lastPublishedAt: doc.modified,
    deprecated: latest?.deprecated,
    versionCount: Object.keys(doc.versions).length,
    source: "npm",
  };
}

const depsDevUrl = (name: string) => `https://api.deps.dev/v3/systems/npm/packages/${encodeURIComponent(name)}`;
const registryUrl = (name: string) => `https://registry.npmjs.org/${name.replace("/", "%2F")}`;

async function fromRegistry(name: string, signal?: AbortSignal): Promise<HistoryLookup> {
  try {
    // The abbreviated document is far smaller than the full packument (react's full one is ~7 MB).
    const data = await limit(() => getJson(registryUrl(name), signal, { Accept: "application/vnd.npm.install-v1+json" }));
    return { kind: "found", history: historyFromRegistry(data) };
  } catch (error) {
    if (isNotFound(error)) return { kind: "not_found" };
    throw error;
  }
}

/**
 * deps.dev first; npm registry when deps.dev fails or has not indexed the package yet.
 * Throws only when both sources fail, so the caller can show the grave as `lost`.
 */
export async function fetchHistory(name: string, signal?: AbortSignal): Promise<HistoryLookup> {
  const cacheKey = `history:${name}`;
  const cached = readCache<PackageHistory>(cacheKey, CACHE_STALE_MS);
  if (cached) return { kind: "found", history: cached };

  let lookup: HistoryLookup;
  try {
    const data = await limit(() => getJson(depsDevUrl(name), signal));
    lookup = { kind: "found", history: historyFromDepsDev(data) };
  } catch (error) {
    if (signal?.aborted) throw error;
    lookup = await fromRegistry(name, signal);
  }
  if (lookup.kind === "found") writeCache(cacheKey, lookup.history);
  return lookup;
}

const PREFIX = "dg:v1:";

/** localStorage can be missing, full, or throw in private windows; every access is best effort. */
export function readCache<T>(key: string, maxAgeMs: number): T | undefined {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return undefined;
    const entry = JSON.parse(raw) as { t: number; v: T };
    if (typeof entry.t !== "number" || Date.now() - entry.t > maxAgeMs) return undefined;
    return entry.v;
  } catch {
    return undefined;
  }
}

export function writeCache(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ t: Date.now(), v: value }));
  } catch {
    // Ignore quota and access errors: the cache only saves requests.
  }
}

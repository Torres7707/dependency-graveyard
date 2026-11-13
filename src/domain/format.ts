const DAY_MS = 24 * 60 * 60 * 1000;

export function daysSince(iso: string, now: number): number {
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / DAY_MS));
}

/** Locale-free ISO day, used in the ledger and detail dialog. */
export function isoDay(iso: string): string {
  return iso.slice(0, 10);
}

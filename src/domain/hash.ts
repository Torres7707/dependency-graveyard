/** 32-bit FNV-1a. Stable across sessions, so a package always gets the same look. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export interface GraveLook {
  /** Which plaque silhouette to draw: 0, 1 or 2. */
  variant: 0 | 1 | 2;
  /** Tilt in degrees, between -4 and 4. */
  tilt: number;
  /** Seconds to offset looping animations so graves don't move in lockstep. */
  phase: number;
}

export function lookFor(name: string): GraveLook {
  const h = hashString(name);
  return {
    variant: (h % 3) as 0 | 1 | 2,
    tilt: ((h >>> 8) % 81) / 10 - 4,
    phase: (((h >>> 16) % 1000) / 1000) * 2,
  };
}

export function pickBy<T>(name: string, items: readonly T[], salt = ""): T {
  const item = items[hashString(salt + name) % items.length];
  if (item === undefined) throw new Error("pickBy needs at least one item");
  return item;
}

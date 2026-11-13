import { hashString } from "./hash";
import type { Grave } from "./types";

/** Each locale supplies the same number of templates per status, so the pick is stable across languages. */
export const EPITAPH_COUNT = { alive: 6, zombie: 6, ghost: 5, buried: 6, lost: 3 } as const;

export function epitaphIndex(grave: Grave): number {
  return hashString("epitaph" + grave.spec.name) % EPITAPH_COUNT[grave.status];
}

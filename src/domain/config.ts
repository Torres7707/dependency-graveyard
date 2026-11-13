/** A package is alive when it has published within this many months. */
export const ALIVE_WITHIN_MONTHS = 12;
/** A stale package with at least this many weekly downloads is a zombie; fewer means buried. */
export const ZOMBIE_MIN_WEEKLY_DOWNLOADS = 50_000;
/** Larger manifests are truncated to keep requests and rendering bounded. */
export const MAX_DEPENDENCIES = 300;
/** Above this many graves, looping icon animations are switched off. */
export const LIGHT_MODE_THRESHOLD = 80;
export const REQUEST_CONCURRENCY = 6;
export const CACHE_STALE_MS = 6 * 60 * 60 * 1000;
/** At most this many tombstone icons run their idle loop at once (nearest the viewport centre). */
export const LOOP_BUDGET = 8;
/** Icon loops pause while scrolling and resume this long after the last scroll event. */
export const SCROLL_IDLE_MS = 180;

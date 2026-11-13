import { ALIVE_WITHIN_MONTHS, ZOMBIE_MIN_WEEKLY_DOWNLOADS } from "@/domain/config";
import { daysSince } from "@/domain/format";
import { epitaphIndex } from "@/domain/epitaph";
import type { Grave, Status } from "@/domain/types";
import { useStore } from "@/store/useStore";
import { en } from "./en";
import type { Dict, GraveVars, Locale } from "./types";
import { zh } from "./zh";

export type { Locale } from "./types";

const DICTS: Record<Locale, Dict> = { en, zh };
const TAGS: Record<Locale, string> = { en: "en-US", zh: "zh-CN" };

/** Status rules interpolate config values, so they are built here rather than in the dictionaries. */
function rule(locale: Locale, status: Status, threshold: string): string {
  const m = ALIVE_WITHIN_MONTHS;
  const rules: Record<Locale, Record<Status, string>> = {
    en: {
      alive: `Published a new version in the last ${m} months`,
      zombie: `No release for over ${m} months, but still ≥ ${threshold} weekly downloads`,
      ghost: "The latest version is marked deprecated on npm",
      buried: `No release for over ${m} months, and < ${threshold} weekly downloads`,
      lost: "Lookup failed, not on npm, or a local path / Git declaration that cannot be looked up",
    },
    zh: {
      alive: `过去 ${m} 个月内发布过新版本`,
      zombie: `超过 ${m} 个月未发布，但每周仍有 ≥ ${threshold} 次下载`,
      ghost: "最新版本已被 npm 标记为弃用（deprecated）",
      buried: `超过 ${m} 个月未发布，且每周下载 < ${threshold}`,
      lost: "查询失败、npm 上不存在，或是本地路径、Git 等无法查询的声明",
    },
  };
  return rules[locale][status];
}

export interface Translator {
  locale: Locale;
  t: Dict;
  /** Weekly downloads, compact above 10k (e.g. 21M / 2100万). */
  downloads: (n: number | null | undefined) => string;
  number: (n: number) => string;
  month: (iso: string | undefined) => string;
  relative: (iso: string | undefined, now: number) => string;
  rule: (status: Status) => string;
  reason: (grave: Grave, now: number) => string;
  epitaph: (grave: Grave, now: number) => string;
}

const cache = new Map<Locale, Translator>();

export function translator(locale: Locale): Translator {
  const hit = cache.get(locale);
  if (hit) return hit;

  const t = DICTS[locale];
  const tag = TAGS[locale];
  const compact = new Intl.NumberFormat(tag, { notation: "compact", maximumFractionDigits: 1 });
  const full = new Intl.NumberFormat(tag);
  const monthFmt = new Intl.DateTimeFormat(tag, { year: "numeric", month: "long", timeZone: "UTC" });
  const rel = new Intl.RelativeTimeFormat(tag, { numeric: "auto" });

  const downloads = (n: number | null | undefined) =>
    n === null || n === undefined ? t.unknown : n >= 10_000 ? compact.format(n) : full.format(n);
  const month = (iso: string | undefined) => (iso ? monthFmt.format(new Date(iso)) : t.unknown);
  const relative = (iso: string | undefined, now: number) => {
    if (!iso) return t.unknown;
    const days = daysSince(iso, now);
    if (days < 31) return rel.format(-days, "day");
    const months = Math.floor(days / 30.44);
    if (months < 24) return rel.format(-months, "month");
    return rel.format(-Math.floor(days / 365.25), "year");
  };
  const threshold = downloads(ZOMBIE_MIN_WEEKLY_DOWNLOADS);

  const vars = (grave: Grave, now: number): GraveVars => {
    const { spec, history, weeklyDownloads } = grave;
    return {
      name: spec.name,
      when: relative(history?.lastPublishedAt, now),
      days: history?.lastPublishedAt ? String(daysSince(history.lastPublishedAt, now)) : "?",
      last: month(history?.lastPublishedAt),
      born: month(history?.firstPublishedAt),
      downloads: downloads(weeklyDownloads),
      threshold,
      months: ALIVE_WITHIN_MONTHS,
      version: history?.latestVersion ?? spec.range,
      words: history?.deprecated || (locale === "zh" ? "（它什么也没说）" : "(it said nothing)"),
    };
  };

  const result: Translator = {
    locale,
    t,
    downloads,
    number: (n) => full.format(n),
    month,
    relative,
    rule: (status) => rule(locale, status, threshold),
    reason: (grave, now) =>
      grave.reason === "unsupported" && grave.spec.unsupported
        ? t.unsupported[grave.spec.unsupported]
        : t.reason[grave.reason](vars(grave, now)),
    epitaph: (grave, now) => t.epitaphs[grave.status][epitaphIndex(grave)]!(vars(grave, now)),
  };
  cache.set(locale, result);
  return result;
}

export function useT(): Translator {
  return translator(useStore((s) => s.locale));
}

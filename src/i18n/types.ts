import type { ParseErrorCode } from "@/domain/parse";
import type { DepKind, ReasonCode, Status, UnsupportedKind } from "@/domain/types";

export type Locale = "en" | "zh";

export interface StatusText {
  label: string;
  /** Plural noun for the yard summary, e.g. "watchers". */
  many: (n: number) => string;
  zone: string;
}

/** Values interpolated into reasons and epitaphs, already formatted for the locale. */
export interface GraveVars {
  name: string;
  /** Relative time of the last publish, e.g. "3 years ago". */
  when: string;
  days: string;
  last: string;
  born: string;
  downloads: string;
  threshold: string;
  months: number;
  version: string;
  words: string;
}

export interface Dict {
  langName: string;
  switchTo: string;
  skip: string;
  nav: { label: string; resummon: string; motionOn: string; motionOff: string; language: string };
  footer: { disclaimerA: string; disclaimerStrong: string; disclaimerB: string; dataA: string; and: string; dataB: string };
  gate: {
    /** Small line under the gothic title. */
    tagline: string;
    lede: [string, string];
    label: string;
    hint: string;
    fixed: string;
    kindsLegend: string;
    summon: string;
    sample: string;
    file: string;
    tooBig: string;
    errorAt: (line: number, column: number | undefined) => string;
    errors: Record<ParseErrorCode, (field?: string) => string>;
  };
  ritual: { title: string; progress: string; status: (count: number, done: number, total: number) => string };
  yard: {
    eyebrow: (pkg?: string) => string;
    title: (n: number) => string;
    truncated: (shown: number, rest: number) => string;
    network: (n: number) => string;
    retry: string;
    light: string;
    empty: string;
  };
  health: { label: string; aria: (alive: number, judged: number, pct: number) => string };
  toolbar: { byStatus: string; search: string; searchPlaceholder: string; kinds: string; all: string; prod: string; dev: string; view: string; yard: string; ledger: string };
  zone: { count: (shown: number, total: number) => string };
  grave: { aria: (name: string, alias: string | null, label: string, reason: string, dev: boolean) => string };
  ledger: { caption: string; name: string; status: string; last: string; downloads: string; reason: string };
  dialog: {
    close: string;
    alias: (target: string) => string;
    declared: string;
    reasonPrefix: string;
    last: string;
    fromNpm: string;
    latest: string;
    downloads: string;
    versions: string;
    first: string;
    license: string;
    stars: string;
    lastWords: string;
    noWords: string;
    npm: string;
    repo: string;
    home: string;
    note: string;
  };
  unknown: string;
  kind: Record<DepKind, string>;
  status: Record<Status, StatusText>;
  unsupported: Record<UnsupportedKind, string>;
  reason: Record<ReasonCode, (v: GraveVars) => string>;
  epitaphs: Record<Status, ReadonlyArray<(v: GraveVars) => string>>;
}

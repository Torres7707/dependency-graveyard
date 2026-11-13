import { describe, expect, it } from "vitest";
import { EPITAPH_COUNT } from "@/domain/epitaph";
import { lookFor } from "@/domain/hash";
import type { Grave, ReasonCode, Status } from "@/domain/types";
import { en } from "./en";
import { translator } from "./index";
import { zh } from "./zh";

const NOW = Date.UTC(2026, 10, 13);

const grave = (status: Status, reason: ReasonCode, extra: Partial<Grave> = {}): Grave => ({
  spec: { id: "prod:left-pad", name: "left-pad", target: "left-pad", range: "^1.3.0", kind: "prod" },
  status,
  reason,
  history: {
    latestVersion: "1.3.0",
    lastPublishedAt: "2018-04-09T01:10:45Z",
    firstPublishedAt: "2014-03-14T00:00:00Z",
    deprecated: "use String.prototype.padStart()",
    versionCount: 12,
    source: "deps.dev",
  },
  weeklyDownloads: 2_255_313,
  ...extra,
});

describe("dictionaries", () => {
  it("have the epitaph counts the picker expects, in both languages", () => {
    for (const s of Object.keys(EPITAPH_COUNT) as Status[]) {
      expect(en.epitaphs[s]).toHaveLength(EPITAPH_COUNT[s]);
      expect(zh.epitaphs[s]).toHaveLength(EPITAPH_COUNT[s]);
    }
  });
});

describe("translator", () => {
  it("renders reasons with locale-formatted numbers and dates", () => {
    const g = grave("zombie", "stale_popular");
    expect(translator("en").reason(g, NOW)).toBe("Last published 8 years ago, 2.3M weekly downloads (≥ 50K)");
    expect(translator("zh").reason(g, NOW)).toBe("最后发布于 8年前，周下载 225.5万（≥ 5万）");
  });

  it("uses the unsupported kind for undeclarable specs", () => {
    const g = grave("lost", "unsupported", { spec: { id: "prod:x", name: "x", target: null, range: "file:../x", kind: "prod", unsupported: "local" } });
    expect(translator("en").reason(g, NOW)).toMatch(/Local path/);
    expect(translator("zh").reason(g, NOW)).toMatch(/本地路径/);
  });

  it("picks the same epitaph slot in both languages and quotes the last words", () => {
    const g = grave("ghost", "deprecated");
    const a = translator("en").epitaph(g, NOW);
    expect(a).toBe(translator("en").epitaph(g, NOW));
    expect(a).toContain("use String.prototype.padStart()");
    expect(translator("zh").epitaph(g, NOW)).toContain("use String.prototype.padStart()");
  });

  it("formats compact download counts per locale", () => {
    expect(translator("en").downloads(21_000_000)).toBe("21M");
    expect(translator("zh").downloads(21_000_000)).toBe("2100万");
    expect(translator("en").downloads(null)).toBe("Unknown");
    expect(translator("en").downloads(9_999)).toBe("9,999");
  });

  it("builds status rules from config", () => {
    expect(translator("en").rule("zombie")).toContain("50K");
    expect(translator("zh").rule("alive")).toContain("12 个月");
  });
});

describe("lookFor", () => {
  it("is deterministic and within range", () => {
    for (const name of ["react", "left-pad", "@types/node", "a"]) {
      const look = lookFor(name);
      expect(look).toEqual(lookFor(name));
      expect(look.tilt).toBeGreaterThanOrEqual(-4);
      expect(look.tilt).toBeLessThanOrEqual(4);
      expect([0, 1, 2]).toContain(look.variant);
    }
  });
});

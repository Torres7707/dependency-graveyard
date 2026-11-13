import { describe, expect, it } from "vitest";
import { classify, publishedWithin, type HistoryLookup } from "./classify";
import { ZOMBIE_MIN_WEEKLY_DOWNLOADS } from "./config";
import type { DependencySpec, PackageHistory } from "./types";

const NOW = Date.UTC(2026, 10, 13);
const spec: DependencySpec = { id: "prod:x", name: "x", target: "x", range: "^1", kind: "prod" };

const found = (h: Partial<PackageHistory>): HistoryLookup => ({
  kind: "found",
  history: { versionCount: 1, source: "deps.dev", ...h },
});

describe("publishedWithin", () => {
  it("includes the exact 12-month boundary", () => {
    expect(publishedWithin("2025-11-13T00:00:00Z", 12, NOW)).toBe(true);
    expect(publishedWithin("2025-11-12T23:59:59Z", 12, NOW)).toBe(false);
  });
});

describe("classify", () => {
  it("ghost wins over a recent release", () => {
    const g = classify(spec, found({ lastPublishedAt: "2026-11-01", deprecated: "use y" }), 10, NOW);
    expect(g).toMatchObject({ status: "ghost", reason: "deprecated" });
  });

  it("treats an empty deprecation message as deprecated", () => {
    expect(classify(spec, found({ lastPublishedAt: "2016-01-01", deprecated: "" }), 10, NOW).status).toBe("ghost");
  });

  it("alive when published within 12 months, regardless of downloads", () => {
    expect(classify(spec, found({ lastPublishedAt: "2026-06-01" }), 0, NOW)).toMatchObject({ status: "alive", reason: "recent" });
    expect(classify(spec, found({ lastPublishedAt: "2026-06-01" }), null, NOW).status).toBe("alive");
  });

  it("zombie at exactly the download threshold, buried just below", () => {
    const old = found({ lastPublishedAt: "2019-01-01" });
    expect(classify(spec, old, ZOMBIE_MIN_WEEKLY_DOWNLOADS, NOW)).toMatchObject({ status: "zombie", reason: "stale_popular" });
    expect(classify(spec, old, ZOMBIE_MIN_WEEKLY_DOWNLOADS - 1, NOW)).toMatchObject({ status: "buried", reason: "stale_quiet" });
  });

  it("never buries a package whose downloads failed to load", () => {
    const g = classify(spec, found({ lastPublishedAt: "2019-01-01" }), null, NOW);
    expect(g).toMatchObject({ status: "lost", error: "downloads_unavailable", reason: "downloads_unavailable" });
  });

  it("maps lookup failures to lost with the right reason", () => {
    expect(classify(spec, { kind: "error" }, 1, NOW).reason).toBe("network");
    expect(classify(spec, undefined, 1, NOW).reason).toBe("network");
    expect(classify(spec, { kind: "not_found" }, 1, NOW).reason).toBe("not_found");
    expect(classify({ ...spec, target: null, unsupported: "local" }, undefined, undefined, NOW)).toMatchObject({
      status: "lost",
      error: "unsupported_spec",
      reason: "unsupported",
    });
  });

  it("is lost when a package has no published versions", () => {
    expect(classify(spec, found({}), 100, NOW)).toMatchObject({ status: "lost", reason: "no_versions" });
  });

  // Found by the fast-check property "never buries ... last publish date cannot be read".
  it("is lost, not buried, when the publish date cannot be parsed", () => {
    expect(classify(spec, found({ lastPublishedAt: " " }), 0, NOW)).toMatchObject({ status: "lost", reason: "no_versions" });
    expect(classify(spec, found({ lastPublishedAt: "unknown" }), 10, NOW).status).toBe("lost");
  });
});

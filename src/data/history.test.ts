import { describe, expect, it } from "vitest";
import { historyFromDepsDev, historyFromRegistry } from "./history";

describe("historyFromDepsDev", () => {
  it("uses the default version for deprecation and the newest publish date", () => {
    const h = historyFromDepsDev({
      versions: [
        { versionKey: { version: "1.0.0" }, publishedAt: "2015-01-01T00:00:00Z" },
        { versionKey: { version: "2.0.0-beta" }, publishedAt: "2019-05-01T00:00:00Z" },
        {
          versionKey: { version: "1.3.0" },
          publishedAt: "2018-04-09T01:10:45Z",
          isDefault: true,
          isDeprecated: true,
          deprecatedReason: "use String.prototype.padStart()",
        },
      ],
    });
    expect(h).toEqual({
      latestVersion: "1.3.0",
      lastPublishedAt: "2019-05-01T00:00:00Z",
      firstPublishedAt: "2015-01-01T00:00:00Z",
      deprecated: "use String.prototype.padStart()",
      versionCount: 3,
      source: "deps.dev",
    });
  });

  it("is not deprecated when only an older version is", () => {
    const h = historyFromDepsDev({
      versions: [
        { versionKey: { version: "1.0.0" }, publishedAt: "2020-01-01Z", isDeprecated: true },
        { versionKey: { version: "2.0.0" }, publishedAt: "2021-01-01Z", isDefault: true },
      ],
    });
    expect(h.deprecated).toBeUndefined();
  });

  it("handles a package with no versions", () => {
    expect(historyFromDepsDev({})).toMatchObject({ versionCount: 0, lastPublishedAt: undefined });
  });
});

describe("historyFromRegistry", () => {
  it("reads the latest dist-tag's deprecation", () => {
    const h = historyFromRegistry({
      "dist-tags": { latest: "2.88.2" },
      versions: { "2.88.2": { deprecated: "request has been deprecated" }, "2.88.0": {} },
      modified: "2024-04-16T05:01:57.431Z",
    });
    expect(h).toMatchObject({ latestVersion: "2.88.2", deprecated: "request has been deprecated", versionCount: 2, source: "npm" });
  });
});

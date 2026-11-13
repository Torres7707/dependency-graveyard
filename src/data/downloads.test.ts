import { describe, expect, it } from "vitest";
import { parseDownloads } from "./downloads";

describe("parseDownloads", () => {
  it("reads a single-package point response", () => {
    expect(parseDownloads(["@types/node"], { downloads: 620333764, package: "@types/node" })).toEqual({ "@types/node": 620333764 });
  });

  it("reads a bulk response and keeps missing packages as null", () => {
    const body = { react: { downloads: 252219874, package: "react" }, "this-pkg-does-not-exist-zzz": null };
    expect(parseDownloads(["react", "this-pkg-does-not-exist-zzz"], body)).toEqual({
      react: 252219874,
      "this-pkg-does-not-exist-zzz": null,
    });
  });

  it("treats malformed bodies as unknown", () => {
    expect(parseDownloads(["a", "b"], "nope")).toEqual({ a: null, b: null });
    expect(parseDownloads(["a"], { error: "not found" })).toEqual({ a: null });
  });
});

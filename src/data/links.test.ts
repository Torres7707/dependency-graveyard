import { describe, expect, it } from "vitest";
import { githubSlug, normalizeRepoUrl, safeHttpUrl } from "./links";

describe("normalizeRepoUrl", () => {
  it.each([
    ["git+https://github.com/expressjs/express.git", "https://github.com/expressjs/express"],
    ["git://github.com/a/b.git", "https://github.com/a/b"],
    ["git@github.com:a/b.git", "https://github.com/a/b"],
    ["ssh://git@github.com/a/b.git", "https://github.com/a/b"],
    ["github:a/b", "https://github.com/a/b"],
    ["a/b", "https://github.com/a/b"],
    ["gitlab:a/b", "https://gitlab.com/a/b"],
  ])("normalizes %s", (raw, expected) => {
    expect(normalizeRepoUrl(raw)).toBe(expected);
    expect(normalizeRepoUrl({ type: "git", url: raw })).toBe(expected);
  });

  it("drops non-http links", () => {
    expect(normalizeRepoUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeHttpUrl("javascript:alert(1)")).toBeUndefined();
    expect(safeHttpUrl("data:text/html,hi")).toBeUndefined();
    expect(safeHttpUrl(42)).toBeUndefined();
  });
});

describe("githubSlug", () => {
  it("extracts owner/repo", () => {
    expect(githubSlug("https://github.com/expressjs/express")).toBe("expressjs/express");
    expect(githubSlug("https://gitlab.com/a/b")).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { MAX_DEPENDENCIES } from "./config";
import { parsePackageJson, resolveSpec } from "./parse";

describe("parsePackageJson", () => {
  it("reads dependencies and devDependencies by default", () => {
    const r = parsePackageJson(
      JSON.stringify({
        name: "app",
        dependencies: { react: "^19.0.0" },
        devDependencies: { vite: "^8.0.0" },
        peerDependencies: { vue: "^3" },
      }),
    );
    expect(r.ok && r.specs.map((s) => [s.name, s.kind])).toEqual([
      ["react", "prod"],
      ["vite", "dev"],
    ]);
    expect(r.ok && r.packageName).toBe("app");
  });

  it("includes peer and optional dependencies on request", () => {
    const r = parsePackageJson(JSON.stringify({ peerDependencies: { vue: "^3" }, optionalDependencies: { fsevents: "*" } }), {
      includePeer: true,
      includeOptional: true,
    });
    expect(r.ok && r.specs.map((s) => s.kind)).toEqual(["peer", "optional"]);
  });

  it("keeps the first declaration when a package appears in several fields", () => {
    const r = parsePackageJson(JSON.stringify({ dependencies: { a: "1" }, devDependencies: { a: "2" } }));
    expect(r.ok && r.specs).toHaveLength(1);
    expect(r.ok && r.specs[0]?.kind).toBe("prod");
  });

  it("accepts a bare dependency map", () => {
    const r = parsePackageJson('{ "react": "^19", "@types/node": "^24" }');
    expect(r.ok && r.specs.map((s) => s.target)).toEqual(["react", "@types/node"]);
  });

  it("reports invalid JSON with a position", () => {
    const r = parsePackageJson('{\n  "dependencies": {\n    "react": "^19",\n  }\n}');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.code).toBe("invalid_json");
      expect(r.line).toBeGreaterThan(1);
    }
  });

  it("rejects non-objects, empty input and manifests without dependencies", () => {
    const code = (text: string) => {
      const r = parsePackageJson(text);
      return r.ok ? null : r.code;
    };
    expect(code("")).toBe("empty");
    expect(code("[1,2]")).toBe("not_object");
    expect(code('"hi"')).toBe("not_object");
    expect(code('{"name":"x","version":"1.0.0"}')).toBe("no_deps");
  });

  it("rejects a dependency field that is not an object", () => {
    const r = parsePackageJson('{"dependencies": ["react"]}');
    expect(r).toMatchObject({ ok: false, code: "bad_field", field: "dependencies" });
  });

  it("truncates very large manifests", () => {
    const deps = Object.fromEntries(Array.from({ length: MAX_DEPENDENCIES + 5 }, (_, i) => [`pkg-${i}`, "1.0.0"]));
    const r = parsePackageJson(JSON.stringify({ dependencies: deps }));
    expect(r.ok && r.specs).toHaveLength(MAX_DEPENDENCIES);
    expect(r.ok && r.truncated).toBe(5);
  });
});

describe("resolveSpec", () => {
  it.each([
    ["my-lodash", "npm:lodash@^4.17.21", "lodash", "^4.17.21"],
    ["types", "npm:@types/node@^24", "@types/node", "^24"],
    ["bare", "npm:left-pad", "left-pad", "*"],
  ])("resolves npm alias %s", (name, raw, target, range) => {
    expect(resolveSpec(name, raw)).toEqual({ target, range });
  });

  it.each([
    ["file:../lib", "local"],
    ["link:../lib", "local"],
    ["./local", "local"],
    ["../local", "local"],
    ["workspace:*", "workspace"],
    ["git+https://github.com/a/b.git", "git"],
    ["github:a/b", "git"],
    ["a/b", "github"],
    ["a/b#main", "github"],
    ["https://example.com/pkg.tgz", "git"],
    ["git@github.com:a/b.git", "git"],
    ["patch:pkg@1#./p.patch", "patch"],
  ])("marks %s as unsupported (%s)", (raw, kind) => {
    expect(resolveSpec("x", raw)).toMatchObject({ target: null, unsupported: kind });
  });

  it("does not treat a scoped name or a semver range as a GitHub shorthand", () => {
    expect(resolveSpec("@scope/pkg", "^1.0.0").target).toBe("@scope/pkg");
    expect(resolveSpec("pkg", ">=1.0.0 <2").target).toBe("pkg");
    expect(resolveSpec("pkg", "latest").target).toBe("pkg");
    expect(resolveSpec("pkg", "").range).toBe("*");
  });

  it("rejects non-string ranges and invalid names", () => {
    expect(resolveSpec("x", 1).unsupported).toBe("not_string");
    expect(resolveSpec("bad name", "1").unsupported).toBe("bad_name");
    expect(resolveSpec("x", "npm:Bad Name@1").unsupported).toBe("bad_alias");
  });
});

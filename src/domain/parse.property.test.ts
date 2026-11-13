import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { MAX_DEPENDENCIES } from "./config";
import { parsePackageJson } from "./parse";

/**
 * Property tests for package.json parsing (docs/DESIGN.md §1.3).
 * Spec: .kiro/specs/parse-package-json/requirements.md
 */

const depMap = fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.jsonValue()), { maxKeys: 40 });

describe("parsePackageJson properties", () => {
  it("keeps every dependency key from any valid package.json", () => {
    fc.assert(
      fc.property(depMap, depMap, fc.dictionary(fc.string(), fc.jsonValue(), { maxKeys: 5 }), (deps, devDeps, extra) => {
        const text = JSON.stringify({ ...extra, dependencies: deps, devDependencies: devDeps });
        const result = parsePackageJson(text);

        const expected = new Set([...Object.keys(JSON.parse(text).dependencies), ...Object.keys(JSON.parse(text).devDependencies)]);
        if (expected.size === 0) {
          expect(result).toMatchObject({ ok: false, code: "no_deps" });
          return;
        }
        expect(result.ok).toBe(true);
        if (!result.ok) return;

        const names = result.specs.map((s) => s.name);
        expect(names.length + result.truncated).toBe(expected.size);
        expect(new Set(names).size).toBe(names.length);
        for (const name of names) expect(expected.has(name)).toBe(true);
        if (expected.size <= MAX_DEPENDENCIES) expect(new Set(names)).toEqual(expected);
      }),
    );
  });

  // Counterexample fast-check found: zod's z.record silently dropped this key.
  it("keeps a `__proto__` key as a lost grave instead of dropping it", () => {
    const result = parsePackageJson('{"devDependencies":{"__proto__":""}}');
    expect(result).toMatchObject({ ok: true, specs: [{ name: "__proto__", target: null, unsupported: "bad_name" }] });
  });

  // Counterexample fast-check found: String({ toString: "" }) throws a TypeError.
  it("does not crash on a version object with a non-function toString", () => {
    const result = parsePackageJson('{"dependencies":{"x":{"toString":""}}}');
    expect(result).toMatchObject({ ok: true, specs: [{ name: "x", target: null, unsupported: "not_string" }] });
  });

  it("gives every spec a unique id and a lookup target or a reason it has none", () => {
    fc.assert(
      fc.property(depMap, depMap, (deps, devDeps) => {
        const result = parsePackageJson(JSON.stringify({ dependencies: deps, devDependencies: devDeps }));
        if (!result.ok) return;
        expect(new Set(result.specs.map((s) => s.id)).size).toBe(result.specs.length);
        for (const s of result.specs) expect(s.target !== null || s.unsupported !== undefined).toBe(true);
      }),
    );
  });

  it("never throws, whatever text is pasted", () => {
    fc.assert(
      fc.property(fc.oneof(fc.string(), fc.json()), (text) => {
        expect(() => parsePackageJson(text)).not.toThrow();
      }),
    );
  });
});

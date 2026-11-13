import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { classify, type HistoryLookup } from "./classify";
import type { DependencySpec, PackageHistory, ReasonCode, Status } from "./types";

/**
 * Property tests for the status rules in docs/DESIGN.md §1.2.
 * Spec: .kiro/specs/classify-package/requirements.md
 */

const DAY = 24 * 60 * 60 * 1000;
const MIN = Date.UTC(2000, 0, 1);
const MAX = Date.UTC(2040, 0, 1);

const spec: DependencySpec = { id: "prod:x", name: "x", target: "x", range: "^1", kind: "prod" };

const time = fc.integer({ min: MIN, max: MAX });
const iso = time.map((t) => new Date(t).toISOString());
const downloads = fc.oneof(fc.constant(null), fc.constant(undefined), fc.nat({ max: 10_000_000 }));

const history = (lastPublishedAt: string | undefined, deprecated?: string): PackageHistory => ({
  lastPublishedAt,
  deprecated,
  versionCount: 1,
  source: "deps.dev",
});
const found = (h: PackageHistory): HistoryLookup => ({ kind: "found", history: h });

/** Higher means "more alive". Ghost and lost sit outside the time axis. */
const LIVELINESS: Record<Status, number> = { alive: 3, zombie: 2, buried: 1, ghost: 0, lost: 0 };

const STATUS_OF_REASON: Record<ReasonCode, Status> = {
  unsupported: "lost",
  network: "lost",
  not_found: "lost",
  no_versions: "lost",
  downloads_unavailable: "lost",
  deprecated: "ghost",
  recent: "alive",
  stale_popular: "zombie",
  stale_quiet: "buried",
};

describe("classify properties", () => {
  it("is monotonic: the longer a package goes without a release, the less alive it is", () => {
    fc.assert(
      fc.property(time, fc.nat({ max: 20 * 365 }), downloads, time, (published, extraDays, dl, now) => {
        const newer = classify(spec, found(history(new Date(published).toISOString())), dl, now);
        const older = classify(spec, found(history(new Date(published - extraDays * DAY).toISOString())), dl, now);
        expect(LIVELINESS[older.status]).toBeLessThanOrEqual(LIVELINESS[newer.status]);
      }),
    );
  });

  it("is monotonic in time: the same package never comes back to life as `now` moves forward", () => {
    fc.assert(
      fc.property(iso, downloads, time, fc.nat({ max: 20 * 365 }), (published, dl, now, laterDays) => {
        const before = classify(spec, found(history(published)), dl, now);
        const after = classify(spec, found(history(published)), dl, now + laterDays * DAY);
        expect(LIVELINESS[after.status]).toBeLessThanOrEqual(LIVELINESS[before.status]);
      }),
    );
  });

  it("ghost wins: a deprecated latest version is always a ghost", () => {
    fc.assert(
      fc.property(
        fc.option(fc.string(), { nil: undefined }),
        fc.string(),
        downloads,
        time,
        (published, reason, dl, now) => {
          const g = classify(spec, found(history(published, reason)), dl, now);
          expect(g.status).toBe("ghost");
          expect(g.reason).toBe("deprecated");
        },
      ),
    );
  });

  it("is exhaustive: any input yields one of the five statuses, with a matching reason", () => {
    const anySpec = fc.record({
      id: fc.string(),
      name: fc.string(),
      target: fc.option(fc.string(), { nil: null }),
      range: fc.string(),
      kind: fc.constantFrom("prod", "dev", "peer", "optional" as const),
    });
    const anyHistory = fc.record({
      lastPublishedAt: fc.option(fc.oneof(iso, fc.string()), { nil: undefined }),
      deprecated: fc.option(fc.string(), { nil: undefined }),
      versionCount: fc.nat(),
      source: fc.constantFrom("deps.dev", "npm" as const),
    });
    const anyLookup = fc.option(
      fc.oneof(
        anyHistory.map((h): HistoryLookup => ({ kind: "found", history: h })),
        fc.constant<HistoryLookup>({ kind: "not_found" }),
        fc.constant<HistoryLookup>({ kind: "error" }),
      ),
      { nil: undefined },
    );
    const anyDownloads = fc.oneof(downloads, fc.double(), fc.integer());

    fc.assert(
      fc.property(anySpec, anyLookup, anyDownloads, fc.oneof(time, fc.integer()), (s, lookup, dl, now) => {
        const g = classify(s, lookup, dl, now);
        expect(Object.keys(LIVELINESS)).toContain(g.status);
        expect(STATUS_OF_REASON[g.reason]).toBe(g.status);
      }),
    );
  });

  it("never buries or raises a package whose last publish date cannot be read", () => {
    fc.assert(
      fc.property(
        fc.string().filter((s) => Number.isNaN(new Date(s).getTime())),
        downloads,
        time,
        (garbage, dl, now) => {
          const g = classify(spec, found(history(garbage)), dl, now);
          expect(g.status).toBe("lost");
        },
      ),
    );
  });
});

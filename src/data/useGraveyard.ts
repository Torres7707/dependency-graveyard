import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { classify, type HistoryLookup } from "@/domain/classify";
import { CACHE_STALE_MS } from "@/domain/config";
import type { DependencySpec, Grave } from "@/domain/types";
import { fetchWeeklyDownloads } from "./downloads";
import { fetchHistory } from "./history";

export interface GraveyardState {
  graves: Grave[] | null;
  /** Finished lookups out of `total`, for the candle progress. */
  done: number;
  total: number;
  retryFailed: () => void;
}

export function useGraveyard(specs: readonly DependencySpec[], now: number): GraveyardState {
  const queryClient = useQueryClient();
  const targets = useMemo(
    () => [...new Set(specs.flatMap((s) => (s.target ? [s.target] : [])))].sort(),
    [specs],
  );

  const histories = useQueries({
    queries: targets.map((target) => ({
      queryKey: ["history", target],
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchHistory(target, signal),
      staleTime: CACHE_STALE_MS,
      retry: 1,
    })),
  });

  const downloads = useQuery({
    queryKey: ["downloads", targets],
    queryFn: ({ signal }) => fetchWeeklyDownloads(targets, signal),
    enabled: targets.length > 0,
    staleTime: CACHE_STALE_MS,
    retry: 1,
  });

  const settled = histories.filter((q) => q.isSuccess || q.isError).length;
  const downloadsSettled = targets.length === 0 || downloads.isSuccess || downloads.isError;
  const ready = settled === targets.length && downloadsSettled;

  // Rebuild graves only when a query result actually changes.
  const signature = histories.map((q) => `${q.status}${q.dataUpdatedAt}`).join() + downloads.dataUpdatedAt;

  const graves = useMemo(() => {
    if (!ready) return null;
    const lookups = new Map<string, HistoryLookup>();
    targets.forEach((target, i) => {
      const q = histories[i];
      lookups.set(target, q?.isSuccess ? q.data : { kind: "error" });
    });
    return specs.map((spec) =>
      classify(
        spec,
        spec.target ? lookups.get(spec.target) : undefined,
        spec.target ? downloads.data?.[spec.target] : undefined,
        now,
      ),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, signature, specs, now]);

  const retryFailed = useCallback(() => {
    targets.forEach((target, i) => {
      if (histories[i]?.isError) void queryClient.refetchQueries({ queryKey: ["history", target] });
    });
    void queryClient.refetchQueries({ queryKey: ["downloads", targets] });
  }, [histories, queryClient, targets]);

  return { graves, done: settled + (downloadsSettled ? 1 : 0), total: targets.length + 1, retryFailed };
}

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { RotateCcw } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useGraveyard } from "@/data/useGraveyard";
import { useT } from "@/i18n";
import { LIGHT_MODE_THRESHOLD } from "@/domain/config";
import { STATUS_ORDER } from "@/domain/status";
import type { Grave, Status } from "@/domain/types";
import { GraveZone } from "@/graves/GraveZone";
import { HealthCandle } from "@/graves/HealthCandle";
import { useReduce } from "@/store/useReduce";
import { useStore, type Summons } from "@/store/useStore";
import { DetailDialog } from "@/ui/DetailDialog";
import { LedgerTable } from "@/ui/LedgerTable";
import { Ritual } from "@/ui/Ritual";
import { Toolbar } from "@/ui/Toolbar";

const emptyCounts = (): Record<Status, number> => ({ alive: 0, zombie: 0, ghost: 0, buried: 0, lost: 0 });

export function Graveyard({ summons }: { summons: Summons }) {
  const { graves, done, total, retryFailed } = useGraveyard(summons.specs, summons.now);
  const { hidden, query, kind, view, selectedId, select } = useStore();
  const reduce = useReduce();
  const T = useT();
  const { t } = T;
  const onOpen = useCallback((id: string) => select(id), [select]);

  const counts = useMemo(() => {
    const c = emptyCounts();
    graves?.forEach((g) => c[g.status]++);
    return c;
  }, [graves]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (graves ?? []).filter(
      (g) =>
        !hidden[g.status] &&
        (kind === "all" || (kind === "dev" ? g.spec.kind === "dev" : g.spec.kind !== "dev")) &&
        (!q || g.spec.name.toLowerCase().includes(q) || g.spec.target?.toLowerCase().includes(q)),
    );
  }, [graves, hidden, query, kind]);

  const byStatus = useMemo(() => {
    const map = new Map<Status, Grave[]>();
    for (const g of visible) map.set(g.status, [...(map.get(g.status) ?? []), g]);
    return map;
  }, [visible]);

  const selected = graves?.find((g) => g.spec.id === selectedId) ?? null;
  const light = (graves?.length ?? 0) > LIGHT_MODE_THRESHOLD;
  const networkLost = graves?.filter((g) => g.error === "network" || g.error === "downloads_unavailable").length ?? 0;
  const judged = (graves?.length ?? 0) - counts.lost;

  return (
    <AnimatePresence mode="wait">
      {!graves ? (
        <Ritual key="ritual" done={done} total={total} count={summons.specs.length} />
      ) : (
        <motion.main key="yard" className="yard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <header className="yard__header">
            <div>
              <p className="yard__eyebrow">{t.yard.eyebrow(summons.packageName)}</p>
              <h1 className="yard__title">{t.yard.title(graves.length)}</h1>
              <p className="yard__summary">
                {STATUS_ORDER.filter((s) => s !== "lost" || counts.lost > 0)
                  .map((s) => `${counts[s]} ${t.status[s].many(counts[s])}`)
                  .join(" · ")}
              </p>
              {summons.truncated ? <p className="yard__notice">{t.yard.truncated(graves.length, summons.truncated)}</p> : null}
              {networkLost ? (
                <p className="yard__notice">
                  {t.yard.network(networkLost)}
                  <button type="button" className="link-btn" onClick={retryFailed}>
                    <RotateCcw size={14} aria-hidden="true" /> {t.yard.retry}
                  </button>
                </p>
              ) : null}
              {light && !reduce ? <p className="yard__notice">{t.yard.light}</p> : null}
            </div>
            <HealthCandle alive={counts.alive} judged={judged} />
          </header>

          <Toolbar counts={counts} />

          {visible.length === 0 ? (
            <p className="yard__empty">{t.yard.empty}</p>
          ) : view === "ledger" ? (
            <LedgerTable graves={visible} now={summons.now} onOpen={onOpen} />
          ) : (
            <LayoutGroup>
              <div className="zones">
                <AnimatePresence mode="popLayout">
                  {STATUS_ORDER.filter((s) => byStatus.has(s)).map((s) => (
                    <GraveZone
                      key={s}
                      status={s}
                      graves={byStatus.get(s)!}
                      total={counts[s]}
                      now={summons.now}
                      lively={!reduce && !light}
                      layout={!light}
                      selectedId={selectedId}
                      onOpen={onOpen}
                    />
                  ))}
                </AnimatePresence>
              </div>
              <DetailDialog grave={selected} now={summons.now} onClose={() => select(null)} />
            </LayoutGroup>
          )}
          {view === "ledger" ? <DetailDialog grave={selected} now={summons.now} onClose={() => select(null)} /> : null}
        </motion.main>
      )}
    </AnimatePresence>
  );
}

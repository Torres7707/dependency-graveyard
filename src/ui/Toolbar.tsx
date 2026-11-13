import { LayoutGrid, Search, Table2 } from "lucide-react";
import { STATUS_ORDER } from "@/domain/status";
import type { Status } from "@/domain/types";
import { StatusIcon } from "@/graves/icons/StatusIcon";
import { useT } from "@/i18n";
import { useStore, type KindFilter } from "@/store/useStore";

const KINDS: KindFilter[] = ["all", "prod", "dev"];

export function Toolbar({ counts }: { counts: Record<Status, number> }) {
  const { hidden, toggleStatus, query, setQuery, kind, setKind, view, setView } = useStore();
  const { t } = useT();
  return (
    <div className="toolbar">
      <div className="charms" role="group" aria-label={t.toolbar.byStatus}>
        {STATUS_ORDER.filter((s) => counts[s] > 0).map((s) => (
          <button
            key={s}
            type="button"
            className={`charm charm--${s}`}
            aria-pressed={!hidden[s]}
            onClick={() => toggleStatus(s)}
          >
            <StatusIcon status={s} size={28} />
            <span>{t.status[s].label}</span>
            <span className="charm__count">{counts[s]}</span>
          </button>
        ))}
      </div>
      <div className="toolbar__row">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">{t.toolbar.search}</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.toolbar.searchPlaceholder} />
        </label>
        <div className="segmented" role="group" aria-label={t.toolbar.kinds}>
          {KINDS.map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)}>
              {t.toolbar[k]}
            </button>
          ))}
        </div>
        <div className="segmented" role="group" aria-label={t.toolbar.view}>
          <button type="button" aria-pressed={view === "yard"} onClick={() => setView("yard")}>
            <LayoutGrid size={16} aria-hidden="true" /> {t.toolbar.yard}
          </button>
          <button type="button" aria-pressed={view === "ledger"} onClick={() => setView("ledger")}>
            <Table2 size={16} aria-hidden="true" /> {t.toolbar.ledger}
          </button>
        </div>
      </div>
    </div>
  );
}

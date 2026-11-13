import { useMemo, useState } from "react";
import { isoDay } from "@/domain/format";
import { STATUS_ORDER } from "@/domain/status";
import type { Grave } from "@/domain/types";
import { StatusIcon } from "@/graves/icons/StatusIcon";
import { useT } from "@/i18n";

type Key = "name" | "status" | "last" | "downloads";

const COLUMNS: Key[] = ["name", "status", "last", "downloads"];

function value(g: Grave, key: Key): string | number {
  switch (key) {
    case "name":
      return g.spec.name;
    case "status":
      return STATUS_ORDER.indexOf(g.status);
    case "last":
      return g.history?.lastPublishedAt ?? "";
    case "downloads":
      return g.weeklyDownloads ?? -1;
  }
}

export function LedgerTable({ graves, now, onOpen }: { graves: Grave[]; now: number; onOpen: (id: string) => void }) {
  const T = useT();
  const { t } = T;
  const [sort, setSort] = useState<{ key: Key; dir: 1 | -1 }>({ key: "status", dir: 1 });
  const rows = useMemo(
    () =>
      [...graves].sort((a, b) => {
        const va = value(a, sort.key);
        const vb = value(b, sort.key);
        const c = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
        return (c || a.spec.name.localeCompare(b.spec.name)) * sort.dir;
      }),
    [graves, sort],
  );

  return (
    <div className="ledger">
      <table>
        <caption className="sr-only">{t.ledger.caption}</caption>
        <thead>
          <tr>
            {COLUMNS.map((c) => (
              <th
                key={c}
                scope="col"
                className={c === "downloads" ? "num" : undefined}
                aria-sort={sort.key === c ? (sort.dir === 1 ? "ascending" : "descending") : "none"}
              >
                <button type="button" onClick={() => setSort((s) => ({ key: c, dir: s.key === c ? ((-s.dir) as 1 | -1) : 1 }))}>
                  {t.ledger[c]}
                  <span aria-hidden="true">{sort.key === c ? (sort.dir === 1 ? " ↑" : " ↓") : ""}</span>
                </button>
              </th>
            ))}
            <th scope="col">{t.ledger.reason}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((g) => (
            <tr key={g.spec.id}>
              <th scope="row">
                <button type="button" className="ledger__name" onClick={() => onOpen(g.spec.id)}>
                  {g.spec.name}
                </button>
                <span className="ledger__range">
                  {g.spec.range}
                  {g.spec.kind !== "prod" ? ` · ${t.kind[g.spec.kind]}` : ""}
                </span>
              </th>
              <td>
                <span className={`ledger__status ledger__status--${g.status}`}>
                  <StatusIcon status={g.status} size={22} />
                  {t.status[g.status].label}
                </span>
              </td>
              <td>{g.history?.lastPublishedAt ? isoDay(g.history.lastPublishedAt) : "—"}</td>
              <td className="num">{g.weeklyDownloads != null ? T.number(g.weeklyDownloads) : "—"}</td>
              <td className="ledger__reason">{T.reason(g, now)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

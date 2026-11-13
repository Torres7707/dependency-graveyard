import { AnimatePresence, motion } from "motion/react";
import type { Grave, Status } from "@/domain/types";
import { translator, useT } from "@/i18n";
import { StatusIcon } from "./icons/StatusIcon";
import { Tombstone } from "./Tombstone";

interface Props {
  status: Status;
  graves: Grave[];
  total: number;
  now: number;
  lively: boolean;
  layout: boolean;
  selectedId: string | null;
  onOpen: (id: string) => void;
}

export function GraveZone({ status, graves, total, now, lively, layout, selectedId, onOpen }: Props) {
  const T = useT();
  const meta = T.t.status[status];
  // In Chinese the English zone name adds a gothic flourish; English needs no second name.
  const alt = T.locale === "zh" ? translator("en").t.status[status].zone : null;
  const headingId = `zone-${status}`;
  return (
    <motion.section
      className={`zone zone--${status}`}
      aria-labelledby={headingId}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
    >
      <header className="zone__header">
        <StatusIcon status={status} size={44} className="zone__emblem" />
        <div>
          <h2 id={headingId} className="zone__title">
            <span className="zone__title-main">{meta.zone}</span>
            {alt ? (
              <span className="zone__title-alt" lang="en">
                {alt}
              </span>
            ) : null}
          </h2>
          <p className="zone__rule">
            <strong>{meta.label}</strong> · {T.rule(status)}
          </p>
        </div>
        <span className="zone__count" aria-label={T.t.zone.count(graves.length, total)}>
          {graves.length}
          {graves.length !== total ? <small> / {total}</small> : null}
        </span>
      </header>
      <ul className="zone__graves" role="list">
        <AnimatePresence mode="popLayout" initial={true}>
          {graves.map((g, i) => (
            <Tombstone
              key={g.spec.id}
              grave={g}
              now={now}
              index={i}
              lively={lively}
              layout={layout}
              selected={selectedId === g.spec.id}
              onOpen={onOpen}
            />
          ))}
        </AnimatePresence>
      </ul>
      <div className="zone__ground" aria-hidden="true" />
    </motion.section>
  );
}

import { motion } from "motion/react";
import { memo, useRef } from "react";
import { lookFor } from "@/domain/hash";
import type { Grave } from "@/domain/types";
import { useT } from "@/i18n";
import { StatusIcon } from "./icons/StatusIcon";
import { useLoopSlot } from "./motionBudget";
import { Plaque } from "./Plaque";

interface Props {
  grave: Grave;
  now: number;
  index: number;
  /** Loops are allowed (motion on, not in light mode); the grave still pauses off-screen. */
  lively: boolean;
  /** Layout animations for filtering; off for very large yards. */
  layout: boolean;
  selected: boolean;
  onOpen: (id: string) => void;
}

function nameSize(name: string): string {
  if (name.length <= 9) return "1.25rem";
  if (name.length <= 14) return "1.05rem";
  if (name.length <= 20) return "0.9rem";
  return "0.8rem";
}

export const Tombstone = memo(function Tombstone({ grave, now, index, lively, layout, selected, onOpen }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const T = useT();
  const { spec, status } = grave;
  const look = lookFor(spec.name);
  const label = T.t.status[status].label;
  const alias = spec.target && spec.target !== spec.name ? spec.target : null;
  // Only LOOP_BUDGET icons nearest the viewport centre loop, and none while scrolling.
  const animated = useLoopSlot(ref, lively);

  return (
    <motion.li
      layout={layout ? "position" : false}
      className="grave-slot"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 36, transition: { duration: 0.3 } }}
      transition={{ type: "spring", stiffness: 160, damping: 18, delay: Math.min(index * 0.04, 1.2) }}
    >
      <motion.button
        ref={ref}
        type="button"
        className={`grave grave--${status}${spec.kind === "dev" ? " grave--dev" : ""}`}
        style={{ rotate: status === "buried" ? look.tilt * 1.6 : look.tilt }}
        initial="rest"
        animate="rest"
        whileHover="hover"
        whileFocus="hover"
        whileTap={{ scale: 0.97 }}
        onClick={() => onOpen(spec.id)}
        aria-label={T.t.grave.aria(spec.name, alias, label, T.reason(grave, now), spec.kind === "dev")}
        aria-haspopup="dialog"
      >
        <span className="grave__icon">
          {selected ? (
            <span className="grave__icon-placeholder" />
          ) : (
            <motion.span layoutId={`icon-${spec.id}`} className="grave__icon-inner">
              <StatusIcon status={status} animated={animated} phase={look.phase} size="100%" />
            </motion.span>
          )}
        </span>
        <span className="grave__stone">
          <Plaque status={status} variant={look.variant} />
          <span className="grave__engraving">
            <span className="grave__name" style={{ fontSize: nameSize(spec.name) }} title={spec.name}>
              {spec.name}
            </span>
            {alias ? <span className="grave__alias">→ {alias}</span> : null}
            <span className="grave__range">{spec.range}</span>
            <span className="grave__label">
              {label}
              {spec.kind !== "prod" ? <span className="grave__kind"> · {T.t.kind[spec.kind]}</span> : null}
            </span>
          </span>
        </span>
      </motion.button>
    </motion.li>
  );
});

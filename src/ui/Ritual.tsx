import { motion } from "motion/react";
import { useT } from "@/i18n";

const CANDLES = 13;

/** Candles light up as lookups finish. */
export function Ritual({ done, total, count }: { done: number; total: number; count: number }) {
  const { t } = useT();
  const lit = total === 0 ? CANDLES : Math.round((done / total) * CANDLES);
  return (
    <motion.section
      className="ritual"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)", transition: { duration: 0.6 } }}
    >
      <h2 className="ritual__title">{t.ritual.title}</h2>
      <div
        className="ritual__candles"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={done}
        aria-label={t.ritual.progress}
      >
        {Array.from({ length: CANDLES }, (_, i) => {
          const on = i < lit;
          return (
            <svg key={i} viewBox="0 0 20 60" className={`ritual__candle${on ? " is-lit" : ""}`} aria-hidden="true">
              <motion.path
                d="M10 2 c3 5 4 8 4 10 a4 4 0 0 1 -8 0 c0 -2 1 -5 4 -10 z"
                fill="#f2b950"
                style={{ transformOrigin: "10px 16px" }}
                initial={false}
                animate={on ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
              />
              <line x1={10} y1={16} x2={10} y2={20} stroke="#1a1424" strokeWidth={1.2} />
              <rect x={5} y={20} width={10} height={20 + ((i * 7) % 4) * 6} rx={1.5} fill="#e8e0cc" stroke="#1a1424" strokeWidth={1.2} />
            </svg>
          );
        })}
      </div>
      <p className="ritual__status" aria-live="polite">
        {t.ritual.status(count, done, total)}
      </p>
    </motion.section>
  );
}

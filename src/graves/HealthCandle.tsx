import { motion } from "motion/react";
import { useT } from "@/i18n";

/** The candle's remaining wax shows the share of graves that are alive. */
export function HealthCandle({ alive, judged }: { alive: number; judged: number }) {
  const { t } = useT();
  const share = judged === 0 ? 0 : alive / judged;
  const pct = Math.round(share * 100);
  const wax = 10 + share * 60;
  return (
    <figure className="health" aria-label={t.health.aria(alive, judged, pct)}>
      <svg viewBox="0 0 40 100" className="health__svg" aria-hidden="true">
        <defs>
          <radialGradient id="health-halo">
            <stop offset="0" stopColor="#f2b950" stopOpacity=".55" />
            <stop offset="1" stopColor="#f2b950" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={20} cy={94} rx={16} ry={4} fill="#3a2b52" />
        <motion.g initial={{ y: 70 }} animate={{ y: 0 }} transition={{ duration: 1.4, ease: "easeOut" }}>
          <rect x={12} y={92 - wax} width={16} height={wax} rx={2} fill="#e8e0cc" stroke="#1a1424" strokeWidth={1.5} />
          <path d={`M13 ${94 - wax} h14 v4 q0 3 -2 3 q-2 0 -2 -3 q-1 -1 -2 0 v5 q0 2 -2 2 q-2 0 -2 -2 v-4 q-2 -2 -4 0 z`} fill="#fff8e6" />
          <line x1={20} y1={92 - wax} x2={20} y2={88 - wax} stroke="#1a1424" strokeWidth={1.2} />
          <circle cx={20} cy={80 - wax} r={14} fill="url(#health-halo)" className="health__halo" />
          <path
            className="health__flame"
            d={`M20 ${72 - wax} c4 5 5 8 5 10 a5 5 0 0 1 -10 0 c0 -2 1 -5 5 -10 z`}
            fill="#f2b950"
            style={{ transformOrigin: `20px ${88 - wax}px` }}
          />
        </motion.g>
      </svg>
      <figcaption className="health__caption">
        <span className="health__pct">{pct}%</span>
        <span className="health__label">{t.health.label}</span>
      </figcaption>
    </figure>
  );
}

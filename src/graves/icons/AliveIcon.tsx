import { motion } from "motion/react";
import { loop, pivot, reaction, type IconProps } from "./anim";
import { IconSvg, useSvgId } from "./IconSvg";

const FACE = [
  "M21 42 L25.5 35.5 L29 42 Z",
  "M35 42 L38.5 35.5 L43 42 Z",
  "M30.5 46 L32 43.5 L33.5 46 Z",
  "M20 48 Q32 58 44 48 Q41.5 50.5 39.5 49.5 L37.8 52.2 L35.2 50.2 L32 52.8 L28.8 50.2 L26.2 52.2 L24.5 49.5 Q22.5 50.5 20 48 Z",
];

const SPARKS = [
  { cx: 28.5, cy: 9, r: 0.9, delay: 0 },
  { cx: 35.5, cy: 7, r: 0.8, delay: 0.12 },
  { cx: 31, cy: 4, r: 0.7, delay: 0.24 },
];
/** Sparks rise only on hover; at rest the flame is the single idle loop (docs/PERFORMANCE.md). */
const spark = (delay: number) =>
  reaction({ y: 0, opacity: 0 }, { y: [0, -1.5, -9], opacity: [0, 1, 0], transition: { duration: 0.9, delay, ease: "easeOut" } });

const flameHover = reaction(
  { scaleX: 1, scaleY: 1 },
  { scaleX: 1.1, scaleY: 1.28, transition: { type: "spring", stiffness: 380, damping: 11 } },
);
const haloHover = reaction({ scale: 1 }, { scale: 1.25, transition: { duration: 0.3 } });

/** A candle burning on a jack-o'-lantern. */
export function AliveIcon({ animated = false, phase = 0, size, className, title }: IconProps) {
  const id = useSvgId("alive");
  return (
    <IconSvg size={size} className={className} title={title}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#f2b950" stopOpacity=".6" />
          <stop offset=".45" stopColor="#f2b950" stopOpacity=".2" />
          <stop offset="1" stopColor="#f2b950" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${id}-body`} cx=".42" cy=".32" r=".8">
          <stop offset="0" stopColor="#f39445" />
          <stop offset="1" stopColor="#b4501e" />
        </radialGradient>
        <radialGradient id={`${id}-lobe`} cx=".5" cy=".35" r=".8">
          <stop offset="0" stopColor="#e07a34" />
          <stop offset="1" stopColor="#9c4319" />
        </radialGradient>
      </defs>

      <motion.g variants={haloHover} style={pivot(32, 14)}>
        <circle cx={32} cy={14} r={16} fill={`url(#${id}-halo)`} opacity={0.85} />
      </motion.g>

      <rect x={28.5} y={19} width={7} height={14} rx={1.5} fill="#e8e0cc" stroke="#1a1424" strokeWidth={2} />
      <path d="M29.5 20 H34.5 V22 Q34.5 24 33.6 24 Q32.6 24 32.6 22.6 Q32.2 21.6 31.2 22 V23.6 Q31.2 25 30.3 25 Q29.5 25 29.5 23.6 Z" fill="#fff8e6" />
      <line x1={32} y1={19} x2={32} y2={16.5} stroke="#1a1424" strokeWidth={1.5} strokeLinecap="round" />

      <g stroke="#1a1424" strokeWidth={2}>
        <ellipse cx={21.5} cy={46} rx={11.5} ry={13} fill={`url(#${id}-lobe)`} />
        <ellipse cx={42.5} cy={46} rx={11.5} ry={13} fill={`url(#${id}-lobe)`} />
        <ellipse cx={32} cy={45} rx={10.5} ry={14} fill={`url(#${id}-body)`} />
      </g>
      <path d="M36 31 Q40.5 26.5 44 29.5" fill="none" stroke="#5c6b34" strokeWidth={2} strokeLinecap="round" />

      <g>
        <g fill="#ffb84d" stroke="#ffb84d" strokeOpacity={0.35} strokeWidth={3} strokeLinejoin="round">
          {FACE.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
        <g fill="#ffd77a" stroke="#1a1424" strokeWidth={1.4} strokeLinejoin="round">
          {FACE.map((d) => (
            <path key={d} d={d} />
          ))}
        </g>
      </g>

      <motion.g variants={flameHover} style={pivot(32, 18.5)}>
        <motion.g
          style={pivot(32, 18.5)}
          {...loop(
            animated,
            { scaleX: [1, 0.95, 1.04, 0.97, 1], scaleY: [1, 1.07, 0.93, 1.09, 1], skewX: [0, -4, 3, -1.5, 0] },
            { duration: 1.3, delay: phase, times: [0, 0.2, 0.45, 0.7, 1] },
            { scaleX: 1, scaleY: 1, skewX: 0 },
          )}
        >
          <path d="M32 2 C36 7.5 37.5 10.5 37.5 13 A5.5 5.5 0 0 1 26.5 13 C26.5 10.5 28 7.5 32 2 Z" fill="#f29a3a" />
          <path d="M32 6 C34.8 9.8 35.6 11.6 35.6 13.6 A3.6 3.6 0 0 1 28.4 13.6 C28.4 11.6 29.2 9.8 32 6 Z" fill="#f2b950" />
          <path d="M32 10 C33.4 12 33.8 13 33.8 14.2 A1.8 1.8 0 0 1 30.2 14.2 C30.2 13 30.6 12 32 10 Z" fill="#fff3c4" />
        </motion.g>
      </motion.g>

      {SPARKS.map((s) => (
        <motion.circle
          key={s.delay}
          cx={s.cx}
          cy={s.cy}
          r={s.r}
          fill="#ffd77a"
          variants={spark(s.delay)}
        />
      ))}
    </IconSvg>
  );
}

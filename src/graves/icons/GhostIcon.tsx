import { motion } from "motion/react";
import { loop, pivot, reaction, type IconProps } from "./anim";
import { IconSvg, useSvgId } from "./IconSvg";

// Both tail shapes share the same commands and point count so Motion can interpolate `d`.
// Path morphing can't run on the compositor, so it plays only on hover (docs/PERFORMANCE.md).
const TAIL_A =
  "M14 32 C14 17 22 8 32 8 C42 8 50 17 50 32 L50 49 Q47 55 43 50 Q39 56 35 51 Q31 57 27 51 Q23 56 19 50 Q16 54 14 49 Z";
const TAIL_B =
  "M14 32 C14 17 22 8 32 8 C42 8 50 17 50 32 L51 50 Q48 52 45 50.5 Q41 55 36 52 Q31 54.5 27.5 52.5 Q23 55.5 19.5 51.5 Q15.5 52 13 49 Z";

const MOTES = [
  { cx: 9, cy: 14, r: 1 },
  { cx: 55, cy: 17, r: 1.2 },
  { cx: 56, cy: 46, r: 0.8 },
  { cx: 7, cy: 48, r: 0.7 },
];

const startle = reaction(
  { scale: 1, opacity: 1 },
  { scale: [1, 0.8, 1.14, 1], opacity: [1, 0.5, 0.6, 1], transition: { duration: 0.6 } },
);
const flutter = reaction({ d: TAIL_A }, { d: [TAIL_A, TAIL_B, TAIL_A], transition: { duration: 0.6 } });
const glance = reaction({ x: 0, y: 0 }, { x: [0, -1.6, 1.6, 0], y: [0, 0.4, -0.3, 0], transition: { duration: 0.8 } });

/** A floating sheet ghost. At rest only the whole ghost floats; everything else is still. */
export function GhostIcon({ animated = false, phase = 0, size, className, title, gaze }: IconProps) {
  const id = useSvgId("ghost");
  return (
    <IconSvg size={size} className={className} title={title}>
      <defs>
        <radialGradient id={`${id}-aura`}>
          <stop offset="0" stopColor="#9fd8e8" stopOpacity=".5" />
          <stop offset=".55" stopColor="#9fd8e8" stopOpacity=".14" />
          <stop offset="1" stopColor="#9fd8e8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6fcfd" />
          <stop offset=".7" stopColor="#d4eef4" />
          <stop offset="1" stopColor="#a9d6e2" />
        </linearGradient>
      </defs>

      <circle cx={32} cy={30} r={30} fill={`url(#${id}-aura)`} opacity={0.85} />
      <ellipse cx={32} cy={61} rx={12} ry={1.8} fill="#9fd8e8" opacity={0.3} />

      <motion.g
        style={pivot(32, 32)}
        {...loop(animated, { y: [0, -3.5, 0], rotate: [-2, 2, -2] }, { duration: 3, delay: phase }, { y: 0, rotate: 0 })}
      >
        <motion.g variants={startle} style={pivot(32, 30)}>
          <g opacity={0.92}>
            <path d="M15.5 30 Q8 31 8.5 37 Q9 39 11 38 Q13 35 16 35.5 Z" fill="#e6f6fa" stroke="#1a1424" strokeWidth={2} strokeLinejoin="round" />
            <path d="M48.5 30 Q56 31 55.5 37 Q55 39 53 38 Q51 35 48 35.5 Z" fill="#e6f6fa" stroke="#1a1424" strokeWidth={2} strokeLinejoin="round" />
            <motion.path
              d={TAIL_A}
              variants={flutter}
              fill={`url(#${id}-body)`}
              stroke="#1a1424"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <path d="M19 26 C19 18 23.5 13 29 11.6" fill="none" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" opacity={0.8} />

            <ellipse cx={22.5} cy={31.5} rx={2.6} ry={1.6} fill="#f4a6b8" opacity={0.6} />
            <ellipse cx={41.5} cy={31.5} rx={2.6} ry={1.6} fill="#f4a6b8" opacity={0.6} />
            <motion.g {...(gaze ? { style: { x: gaze.x, y: gaze.y } } : { variants: glance })}>
              <ellipse cx={26.5} cy={25.5} rx={2.8} ry={3.8} fill="#1a1424" />
              <ellipse cx={37.5} cy={25.5} rx={2.8} ry={3.8} fill="#1a1424" />
              <circle cx={27.4} cy={24} r={1} fill="#ffffff" />
              <circle cx={38.4} cy={24} r={1} fill="#ffffff" />
            </motion.g>
            <ellipse cx={32} cy={34} rx={2.2} ry={2.8} fill="#1a1424" />
          </g>
        </motion.g>
      </motion.g>

      {MOTES.map((m) => (
        <circle key={m.cx} cx={m.cx} cy={m.cy} r={m.r} fill="#9fd8e8" opacity={0.5} />
      ))}
    </IconSvg>
  );
}

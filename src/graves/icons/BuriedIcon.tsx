import { motion } from "motion/react";
import { loop, pivot, reaction, type IconProps } from "./anim";
import { IconSvg } from "./IconSvg";

const LEAVES = [
  { d: "M20.8 51 q-4 -2.4 -6 .8 q3.2 2 6 -.8 z", delay: 0.6 },
  { d: "M22.6 40 q4 -2.6 6.2 .4 q-3.2 2.2 -6.2 -.4 z", delay: 0.95 },
  { d: "M24.6 30.5 q-3.6 -3 -6 -.2 q2.8 2.6 6 .2 z", delay: 1.3 },
];

const DUST = [
  { cx: 14, cy: 57, r: 1.4 },
  { cx: 45, cy: 56.5, r: 1.1 },
];

/** Wing ruffle plays only on hover. */
const ruffle = reaction({ rotate: 0 }, { rotate: [0, -14, 2, -10, 0], transition: { duration: 0.5 } });

const flapUp = reaction(
  { y: 0, rotate: 0 },
  { y: [0, -8, -6, 0], rotate: [0, -10, 5, 0], transition: { duration: 0.7 } },
);

/** A leaning tombstone with a crow on top. */
export function BuriedIcon({ animated = false, phase = 0, size, className, title }: IconProps) {
  return (
    <IconSvg size={size} className={className} title={title}>
      <g transform="rotate(6 32 58)">
        <path d="M18 60 L18 31 Q18 18 32 18 Q46 18 46 31 L46 60 Z" fill="#8a8597" />
        <path d="M40 20.2 Q46 23.5 46 31 L46 60 L41 60 Z" fill="#6e6a7c" />
        <path d="M21.5 30 Q22 22.5 28 20.6" fill="none" stroke="#a9a4b5" strokeWidth={1.4} strokeLinecap="round" />
        <path d="M30 29 V45 M25 34 H35" stroke="#a9a4b5" strokeWidth={1} strokeLinecap="round" transform="translate(.7 .7)" />
        <path d="M30 29 V45 M25 34 H35" stroke="#57536a" strokeWidth={2.6} strokeLinecap="round" />
        <path d="M44 24 L40.5 29 L42.8 32 L39.5 37.5" fill="none" stroke="#1a1424" strokeWidth={1.3} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 60 L18 31 Q18 18 32 18 Q46 18 46 31 L46 60" fill="none" stroke="#1a1424" strokeWidth={2} strokeLinejoin="round" />
        <ellipse cx={22} cy={55.5} rx={3.4} ry={1.7} fill="#5c6b34" />
        <ellipse cx={25.5} cy={57} rx={2} ry={1.1} fill="#6f7f40" />

        <motion.path
          d="M21 61 C17 54 24 50 21.5 44 C19 38 26.5 34 24.5 27"
          fill="none"
          stroke="#6b5a3a"
          strokeWidth={1.8}
          strokeLinecap="round"
          initial={animated ? { pathLength: 0 } : false}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, delay: 0.2, ease: "easeOut" }}
        />
        <g fill="#8a7a3e" stroke="#1a1424" strokeWidth={0.7}>
          {LEAVES.map((l) => (
            <motion.path
              key={l.d}
              d={l.d}
              initial={animated ? { opacity: 0, scale: 0.3 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: l.delay, ease: "easeOut" }}
            />
          ))}
        </g>
      </g>

      <motion.g variants={flapUp} style={pivot(38, 14)}>
        <path d="M36.6 17 L35.6 18.6 M39.6 17 L39.1 19" stroke="#b39b5a" strokeWidth={1.1} strokeLinecap="round" />
        <path d="M43 13 L51.5 16.5 L50.5 12.5 Z" fill="#2b2238" stroke="#6a5590" strokeWidth={1.2} strokeLinejoin="round" />
        <ellipse cx={38.5} cy={12.5} rx={7} ry={4.8} fill="#2b2238" stroke="#6a5590" strokeWidth={1.2} />
        <motion.path
          d="M35 10.5 Q41 7.5 45.5 12 Q41 15.5 35 13.5 Z"
          fill="#3a2e4d"
          stroke="#6a5590"
          strokeWidth={1}
          strokeLinejoin="round"
          style={pivot(36, 11)}
          variants={ruffle}
        />
        <motion.g
          style={pivot(33.5, 10)}
          {...loop(
            animated,
            { rotate: [0, 0, -16, -16, 4, 0] },
            { duration: 6, delay: 1.6 + phase, times: [0, 0.62, 0.68, 0.82, 0.88, 1] },
            { rotate: 0 },
          )}
        >
          <path d="M29 6.6 L24.2 8.2 L29 9.4 Z" fill="#b39b5a" stroke="#1a1424" strokeWidth={0.8} strokeLinejoin="round" />
          <circle cx={32.5} cy={7.5} r={4.2} fill="#2b2238" stroke="#6a5590" strokeWidth={1.2} />
          <circle cx={31.6} cy={6.6} r={1.25} fill="#e8e0cc" />
          <circle cx={31.2} cy={6.6} r={0.55} fill="#1a1424" />
        </motion.g>
      </motion.g>

      <path
        d="M-1 65 L-1 61 Q10 55 22 57.5 Q32 54.5 42 57.5 Q54 55 65 61 L65 65 Z"
        fill="#5a4636"
        stroke="#1a1424"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <g fill="#7a604a">
        <circle cx={10} cy={61} r={0.9} />
        <circle cx={28} cy={60} r={1} />
        <circle cx={47} cy={61.5} r={0.8} />
      </g>
      <path d="M51 58.5 Q51.5 53.5 54.5 51.6" fill="none" stroke="#6b5a3a" strokeWidth={1.3} strokeLinecap="round" />
      <circle cx={55} cy={52} r={1.8} fill="#8a6f3e" stroke="#1a1424" strokeWidth={0.8} />
      {DUST.map((d) => (
        <circle key={d.cx} cx={d.cx} cy={d.cy} r={d.r} fill="#8a7a66" opacity={0.35} />
      ))}
    </IconSvg>
  );
}

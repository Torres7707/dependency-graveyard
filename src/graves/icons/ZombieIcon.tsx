import { motion } from "motion/react";
import { loop, pivot, reaction, type IconProps } from "./anim";
import { IconSvg } from "./IconSvg";

const FINGERS = [
  { d: "M27.5 31 L25.8 20.5 Q25.3 17.5 22.8 16", o: [27.5, 31], wrinkle: "M25 23.6 L27.1 23.3", turn: 9, delay: 0 },
  { d: "M31.5 30 L31.3 16 Q31.2 13 29 11.2", o: [31.5, 30], wrinkle: "M30.2 21.5 L32.5 21.5", turn: 9, delay: 0.15 },
  { d: "M35.5 30.5 L37.2 18.5 Q37.6 15.6 36 13.6", o: [35.5, 30.5], wrinkle: "M35.6 23 L37.8 23.4", turn: 9, delay: 0.3 },
  { d: "M38.5 32.5 L42 24.5 Q43 22 42 19.8", o: [38.5, 32.5], turn: 9, delay: 0.45 },
  { d: "M26 36 L20 31.5 Q18 29.6 18.4 26.8", o: [26, 36], turn: -10, delay: 0.6 },
] as const;

const CLOD_LANDING = { x: 0, y: [4, -6, 0], opacity: [0, 1, 1] };

/** Final resting places; each clod flies out from `dx` closer to the hand. */
const CLODS = [
  { cx: 14, cy: 51.5, r: 2.2, dx: -5 },
  { cx: 50.5, cy: 50.5, r: 2, dx: 5 },
  { cx: 45, cy: 48.5, r: 1.3, dx: 5 },
];

const grab = reaction({ scale: 1 }, { scale: [1, 1.16, 0.96, 1], transition: { duration: 0.45 } });
/** Fingers curl only on hover; at rest the hand only sways (one idle loop per icon, see docs/PERFORMANCE.md). */
const curl = (turn: number, delay: number) =>
  reaction({ rotate: 0 }, { rotate: [0, turn, 0], transition: { duration: 0.5, delay: delay * 0.4 } });

/** A hand clawing its way out of the soil. */
export function ZombieIcon({ animated = false, phase = 0, size, className, title }: IconProps) {
  return (
    <IconSvg size={size} className={className} title={title}>
      <path d="M6 60 Q20 49 32 50 Q44 49 58 60 Z" fill="#4a3a2d" />

      <motion.g
        initial={animated ? { y: 38 } : false}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 11, delay: phase * 0.25 }}
      >
        <motion.g
          style={pivot(32, 58)}
          {...loop(animated, { rotate: [-5, 5, -5] }, { duration: 2.4, delay: 1.1 + phase }, { rotate: 0 })}
        >
          <motion.g variants={grab} style={pivot(32, 40)}>
            <path d="M26 40 L27 58 L37 58 L38.5 40 Z" fill="#6f8a33" stroke="#1a1424" strokeWidth={2} strokeLinejoin="round" />
            <path
              d="M25.4 47.5 L27.6 50 L29.6 47 L32 50 L34.4 47 L36.4 50 L38.6 47.5 L39 58 L25 58 Z"
              fill="#4b3a6b"
              stroke="#1a1424"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />

            {FINGERS.map((f) => (
              <motion.g
                key={f.d}
                style={pivot(f.o[0], f.o[1])}
                variants={curl(f.turn, f.delay)}
              >
                <path d={f.d} fill="none" stroke="#1a1424" strokeWidth={6.6} strokeLinecap="round" strokeLinejoin="round" />
                <path d={f.d} fill="none" stroke="#7d9a3c" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
                {"wrinkle" in f ? <path d={f.wrinkle} stroke="#56722a" strokeWidth={1} strokeLinecap="round" /> : null}
              </motion.g>
            ))}

            <path
              d="M24.5 40.5 C23.5 34 24 28.5 27 27.5 C30 26.5 36 26.5 38.5 28 C41 29.5 41 35 39.5 40.5 Z"
              fill="#7d9a3c"
              stroke="#1a1424"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <path d="M25.6 38.5 C25 35 25.2 31.5 26.6 29.6" fill="none" stroke="#9db85a" strokeWidth={1.2} strokeLinecap="round" />
            <circle cx={35.5} cy={31} r={1.6} fill="#56722a" />
            <g stroke="#1a1424" strokeWidth={1.2} strokeLinecap="round">
              <path d="M28.5 33.5 L36.5 37" />
              <path d="M30 32.9 L29.3 34.9 M32.6 34 L31.9 36 M35.2 35.2 L34.5 37.2" />
            </g>
          </motion.g>
        </motion.g>
      </motion.g>

      <path
        d="M-1 65 L-1 60 Q8 52 18 54.5 Q24 51.5 30 54 Q35 51.5 41 54 Q49 51 56 55 Q61 57 65 60 L65 65 Z"
        fill="#5a4636"
        stroke="#1a1424"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <g fill="#7a604a">
        <circle cx={12} cy={59} r={1} />
        <circle cx={22} cy={60} r={0.8} />
        <circle cx={33} cy={58.5} r={1} />
        <circle cx={44} cy={59.5} r={1.1} />
        <circle cx={52} cy={61} r={0.7} />
      </g>
      <path d="M9 56 l-1 -4 M10.5 55.5 l.5 -4.5 M55 57 l1.5 -4 M53.5 56 l-.5 -3.5" stroke="#7d9a3c" strokeWidth={1.5} strokeLinecap="round" />

      <g fill="#6b5340" stroke="#1a1424" strokeWidth={1}>
        {CLODS.map((c) => (
          <motion.circle
            key={c.cx}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            initial={animated ? { x: -c.dx, y: 4, opacity: 0 } : false}
            // Same target whether or not this icon holds a loop slot, so regaining a slot
            // after scrolling doesn't replay the entrance.
            animate={CLOD_LANDING}
            transition={{ duration: 0.9, delay: 0.25 + phase * 0.25, ease: [0.2, 0.7, 0.4, 1] }}
          />
        ))}
      </g>
    </IconSvg>
  );
}

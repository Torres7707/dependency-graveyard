import { motion } from "motion/react";
import { loop, pivot, reaction, type IconProps } from "./anim";
import { IconSvg, useSvgId } from "./IconSvg";

const brighten = reaction({ scale: 1 }, { scale: 1.12, transition: { type: "spring", stiffness: 300, damping: 12 } });

/** A will-o'-wisp shaped like a question mark. */
export function LostIcon({ animated = false, phase = 0, size, className, title }: IconProps) {
  const id = useSvgId("lost");
  return (
    <IconSvg size={size} className={className} title={title}>
      <defs>
        <radialGradient id={`${id}-aura`}>
          <stop offset="0" stopColor="#b8a9d9" stopOpacity=".45" />
          <stop offset=".55" stopColor="#b8a9d9" stopOpacity=".12" />
          <stop offset="1" stopColor="#b8a9d9" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle
        cx={32}
        cy={34}
        r={27}
        fill={`url(#${id}-aura)`}
        opacity={0.8}
      />

      <motion.g {...loop(animated, { x: [0, -2.5, 0, 2.5, 0], y: [0, -1.5, -3, -1.5, 0] }, { duration: 5, delay: phase }, { x: 0, y: 0 })}>
        <motion.g variants={brighten} style={pivot(32, 34)}>
          <g>
            <path
              d="M33 4 C41 14 47 23 47 35 A15 15 0 0 1 17 35 C17 25 24 21 26.5 13 C29 17.5 32 14 33 4 Z"
              fill="#b8a9d9"
              stroke="#1a1424"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            <path d="M32.5 16 C37.5 22 41 27 41 35 A9 9 0 0 1 23 35 C23 29 27 26 28.5 21 C30.5 23.5 32 21 32.5 16 Z" fill="#e4dcf5" />
          </g>
          <path
            d="M27.5 31.5 Q27.5 26.5 32 26.5 Q36.5 26.5 36.5 30.5 Q36.5 33.5 32 35 L32 38.5"
            fill="none"
            stroke="#2a1b3d"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx={32} cy={43.5} r={1.9} fill="#2a1b3d" />
        </motion.g>
      </motion.g>

      <circle cx={24} cy={55} r={1.2} fill="#b8a9d9" opacity={0.5} />
      <circle cx={39} cy={57} r={0.9} fill="#b8a9d9" opacity={0.5} />
    </IconSvg>
  );
}

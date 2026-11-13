import { motion, useScroll, useTransform } from "motion/react";
import { hashString } from "@/domain/hash";
import { useReduce } from "@/store/useReduce";
import { Silhouettes } from "./Silhouettes";

const unit = (seed: string) => hashString(seed) / 0xffffffff;

const STARS = Array.from({ length: 70 }, (_, i) => ({
  x: unit(`sx${i}`) * 1000,
  y: unit(`sy${i}`) * 420,
  r: 0.5 + unit(`sr${i}`) * 1.2,
}));
/**
 * A third of the stars twinkle together as one <svg> layer; the rest stay still.
 * Animating opacity on 70 separate SVG circles repainted the sky every frame, and each
 * extra full-screen layer costs compositor time (docs/PERFORMANCE.md).
 */
const STAR_GROUPS = [STARS.filter((_, i) => i % 3 !== 0), STARS.filter((_, i) => i % 3 === 0)];

/** Few enough to stay cheap: each firefly is its own compositor layer. */
const FIREFLIES = Array.from({ length: 8 }, (_, i) => ({
  left: `${unit(`fx${i}`) * 100}%`,
  bottom: `${4 + unit(`fy${i}`) * 34}%`,
  dx: `${(unit(`fdx${i}`) - 0.5) * 80}px`,
  dy: `${-20 - unit(`fdy${i}`) * 60}px`,
  dur: `${6 + unit(`fdur${i}`) * 6}s`,
  delay: `${-unit(`fd${i}`) * 8}s`,
}));

function Moon() {
  return (
    <svg viewBox="0 0 200 200" className="scene__moon-svg">
      <defs>
        <radialGradient id="moon-glow">
          <stop offset=".45" stopColor="#f6ecd0" stopOpacity=".35" />
          <stop offset="1" stopColor="#f6ecd0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moon-face" cx=".4" cy=".35" r=".75">
          <stop offset="0" stopColor="#fff8e4" />
          <stop offset=".6" stopColor="#ece0bd" />
          <stop offset="1" stopColor="#c8b98f" />
        </radialGradient>
      </defs>
      <circle cx={100} cy={100} r={98} fill="url(#moon-glow)" />
      <circle cx={100} cy={100} r={54} fill="url(#moon-face)" />
      <g fill="#cdbf98" opacity={0.7}>
        <circle cx={84} cy={86} r={9} />
        <circle cx={118} cy={112} r={12} />
        <circle cx={92} cy={124} r={5} />
        <circle cx={120} cy={78} r={4} />
      </g>
    </svg>
  );
}

function Cloud({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 90" className={`cloud ${className}`}>
      <path
        d="M20 60 Q20 30 55 32 Q70 8 105 20 Q130 5 155 28 Q190 25 190 55 Q200 75 175 78 H35 Q10 78 20 60 Z"
        fill="#3a2b52"
        stroke="#5b4a7c"
        strokeWidth={1.5}
        strokeOpacity={0.5}
      />
    </svg>
  );
}

function Bat({ className }: { className: string }) {
  return (
    <span className={`bat ${className}`}>
      {/* The flap squashes the whole <svg> (compositor) instead of rotating each wing path (repaint). */}
      <svg viewBox="0 0 60 30" className="bat__body">
        <g fill="#0b0810">
          <path d="M30 15 Q22 4 8 6 Q12 10 10 14 Q4 14 2 18 Q14 16 20 22 Q24 16 30 18 Z" />
          <path d="M30 15 Q38 4 52 6 Q48 10 50 14 Q56 14 58 18 Q46 16 40 22 Q36 16 30 18 Z" />
          <ellipse cx={30} cy={16} rx={3.6} ry={5.5} />
          <path d="M27.5 11.5 L27 8 L29.3 10.6 Z M32.5 11.5 L33 8 L30.7 10.6 Z" />
        </g>
      </svg>
    </span>
  );
}

/** Decorative night sky, silhouettes, mist and fireflies behind the page. */
export function Scene() {
  const reduce = useReduce();
  const { scrollY } = useScroll();
  const moonY = useTransform(scrollY, [0, 1600], [0, -140]);
  const cloudY = useTransform(scrollY, [0, 1600], [0, -70]);

  return (
    <div className="scene" aria-hidden="true">
      <div className="scene__horizon" />
      {STAR_GROUPS.map((group, g) => (
        <svg
          key={g}
          className={`scene__stars scene__stars--${g}`}
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMin slice"
        >
          {group.map((s) => (
            <circle key={`${s.x}-${s.y}`} cx={s.x} cy={s.y} r={s.r} className="star" />
          ))}
        </svg>
      ))}
      <motion.div className="scene__moon" style={reduce ? undefined : { y: moonY }}>
        <Moon />
      </motion.div>
      <motion.div className="scene__clouds" style={reduce ? undefined : { y: cloudY }}>
        <Cloud className="cloud--1" />
        <Cloud className="cloud--2" />
        <Cloud className="cloud--3" />
      </motion.div>
      <Bat className="bat--1" />
      <Bat className="bat--2" />
      <Silhouettes />
      <div className="fog fog--back" />
      <div className="fireflies">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="firefly"
            style={
              {
                left: f.left,
                bottom: f.bottom,
                "--dx": f.dx,
                "--dy": f.dy,
                "--dur": f.dur,
                "--delay": f.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <div className="fog fog--front" />
    </div>
  );
}

import type { MotionValue, TargetAndTransition, Transition, Variants } from "motion/react";
import type { CSSProperties } from "react";

export interface IconProps {
  size?: number | string;
  /** Run looping animations. When false the icon rests in its final, static pose. */
  animated?: boolean;
  /** Seconds added to loop delays so neighbouring icons don't move in lockstep. */
  phase?: number;
  className?: string;
  /** Accessible name. Without it the icon is decorative and hidden from assistive tech. */
  title?: string;
  /** Ghost only: eye offset in viewBox units, e.g. to follow the pointer. */
  gaze?: { x: MotionValue<number>; y: MotionValue<number> };
}

/** Motion defaults SVG transforms to fill-box; these icons pivot around fixed points in the 64×64 viewBox. */
export const pivot = (x: number, y: number): CSSProperties => ({
  transformBox: "view-box",
  transformOrigin: `${x}px ${y}px`,
});

export function loop(
  animated: boolean,
  keyframes: TargetAndTransition,
  transition: Transition,
  rest: TargetAndTransition,
): { animate: TargetAndTransition; transition: Transition } {
  return animated
    ? { animate: keyframes, transition: { repeat: Infinity, ease: "easeInOut", ...transition } }
    : { animate: rest, transition: { duration: 0.35 } };
}

/** Hover reactions are variants, so they follow a parent's `whileHover="hover"`. */
export const reaction = (rest: TargetAndTransition, hover: TargetAndTransition): Variants => ({ rest, hover });

import { useReducedMotion } from "motion/react";
import { useStore } from "./useStore";

/** True when the OS asks for reduced motion or the visitor switched animations off. */
export function useReduce(): boolean {
  const os = useReducedMotion();
  const off = useStore((s) => s.motionOff);
  return off || !!os;
}

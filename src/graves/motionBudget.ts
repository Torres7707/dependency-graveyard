import { useEffect, useState, type RefObject } from "react";
import { LOOP_BUDGET, SCROLL_IDLE_MS } from "@/domain/config";

/**
 * Decides which tombstone icons may run their idle loop.
 *
 * Every looping element costs main-thread frame work and a compositor layer,
 * so the cost grows with the number of graves on screen. This keeps it flat:
 * at most LOOP_BUDGET icons loop at once (those nearest the viewport centre),
 * and none loop while the page is scrolling. See docs/PERFORMANCE.md.
 */

type Listener = (looping: boolean) => void;

const members = new Map<Element, Listener>();
const visible = new Set<Element>();
const looping = new Set<Element>();
let scrolling = false;
let idleTimer: ReturnType<typeof setTimeout> | undefined;
let observer: IntersectionObserver | undefined;
let frame = 0;

function apply(next: Set<Element>) {
  for (const el of looping) if (!next.has(el)) members.get(el)?.(false);
  for (const el of next) if (!looping.has(el)) members.get(el)?.(true);
  looping.clear();
  for (const el of next) looping.add(el);
}

function pick() {
  frame = 0;
  if (scrolling) {
    apply(new Set());
    return;
  }
  const mid = window.innerHeight / 2;
  const ranked = [...visible]
    .map((el) => {
      const r = el.getBoundingClientRect();
      return { el, d: Math.abs(r.top + r.height / 2 - mid) };
    })
    .sort((a, b) => a.d - b.d)
    .slice(0, LOOP_BUDGET);
  apply(new Set(ranked.map((r) => r.el)));
}

function schedule() {
  if (!frame) frame = requestAnimationFrame(pick);
}

function onScroll() {
  if (!scrolling) {
    scrolling = true;
    schedule();
  }
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    scrolling = false;
    schedule();
  }, SCROLL_IDLE_MS);
}

function start() {
  observer = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      schedule();
    },
    { rootMargin: "0px" },
  );
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", schedule, { passive: true });
}

function stop() {
  observer?.disconnect();
  observer = undefined;
  window.removeEventListener("scroll", onScroll);
  window.removeEventListener("resize", schedule);
  clearTimeout(idleTimer);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  scrolling = false;
  visible.clear();
  looping.clear();
}

function join(el: Element, listener: Listener): () => void {
  if (members.size === 0) start();
  members.set(el, listener);
  observer?.observe(el);
  return () => {
    observer?.unobserve(el);
    members.delete(el);
    visible.delete(el);
    if (looping.delete(el)) schedule();
    if (members.size === 0) stop();
  };
}

/** True while this element holds one of the loop slots. Always false when `enabled` is false. */
export function useLoopSlot(ref: RefObject<Element | null>, enabled: boolean): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) {
      setOn(false);
      return;
    }
    return join(el, setOn);
  }, [ref, enabled]);
  return enabled && on;
}

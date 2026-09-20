"use client";

import { useReducedMotion, type Transition, type Variants } from "framer-motion";
import { duration, easing } from "./tokens";

export { duration, easing };

/**
 * Page-load choreography. Each stage is a start offset (seconds) — the
 * individual animations that begin at these offsets are all ≤ 0.36s long.
 *
 *   hero copy → workbench panel → workbench figures count → ticker slides in
 *
 * Tool cards, comparison and news animate on scroll into view instead.
 */
export const stage = {
  heroEyebrow: 0,
  heroHeadline: 0.06,
  heroSubhead: 0.14,
  heroActions: 0.22,
  heroMeta: 0.3,
  heroVisual: 0.2,
  workbenchPanel: 0.34,
  workbenchFigures: 0.5,
  ticker: 0.62,
} as const;

/** Per-item stagger inside a cascading group (80–120ms band). */
export const cascade = 0.09;

export const ease: Transition = { duration: duration.base, ease: easing };
export const easeSlow: Transition = { duration: duration.slow, ease: easing };
export const easeFast: Transition = { duration: duration.fast, ease: easing };

/** Fade + 8px rise. Used for hero copy stages. */
export const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...ease, delay },
  }),
};

/** Fade + 12px rise, slightly slower — panels and cards. */
export const risePanel: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { ...easeSlow, delay },
  }),
};

/** Parent variant that staggers `risePanel` children on scroll. */
export const cascadeGroup: Variants = {
  hidden: {},
  visible: (delay: number = 0) => ({
    transition: { staggerChildren: cascade, delayChildren: delay },
  }),
};

/** Children of a `cascadeGroup` (no custom delay — parent staggers). */
export const cascadeItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: easeSlow },
};

/** Viewport trigger settings shared by every scroll reveal. */
export const inViewOnce = { once: true, amount: 0.2 } as const;

/**
 * Returns `true` when the user prefers reduced motion. Components use this to
 * render the finished state immediately (no staged reveals, no loops).
 */
export function useMotionOff(): boolean {
  const reduced = useReducedMotion();
  return reduced === true;
}

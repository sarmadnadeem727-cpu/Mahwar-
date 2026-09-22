"use client";

import { animate, createTimeline, stagger, svg, utils, type Timeline } from "animejs";

/**
 * lib/anime.ts — the anime.js side of the motion vocabulary.
 *
 * Division of labour (kept deliberate so the two libraries never compete):
 *   Framer Motion  → scroll-linked, pointer-driven and layout motion
 *                    (parallax, whileInView, drag, AnimatePresence).
 *   anime.js v4    → choreographed entrances and generative SVG work:
 *                    line drawing (svg.createDrawable), shape morphing
 *                    (svg.morphTo) and multi-stage timelines (createTimeline).
 *
 * Everything here mirrors lib/motion.ts: one easing family, a few durations,
 * and a single reduced-motion check that every timeline must respect.
 */

export { animate, createTimeline, stagger, svg, utils };
export type { Timeline };

/** The one easing used for entrances, matching EASE_OUT in lib/motion.ts. */
export const EASE = "outExpo" as const;
export const EASE_DRAW = "inOutSine" as const;

export const DURATION = {
  fast: 420,
  base: 900,
  slow: 1400,
  draw: 1600,
} as const;

/** True when the visitor asked the OS for less motion. Safe to call during SSR. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Skip straight to the finished state — every timeline calls this when motion is reduced. */
export function settle(root: ParentNode, selectors: string[]) {
  for (const sel of selectors) {
    root.querySelectorAll<HTMLElement | SVGElement>(sel).forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
    });
  }
}

/** A timeline with the house defaults applied. */
export function timeline(params: Parameters<typeof createTimeline>[0] = {}): Timeline {
  return createTimeline({ defaults: { ease: EASE, duration: DURATION.base }, ...params });
}

/**
 * Adds a stroke draw-on for every SVG path/line/polyline/circle matched by
 * `selector` under `root`. Returns the timeline for chaining.
 */
export function addDraw(
  tl: Timeline,
  root: ParentNode,
  selector: string,
  opts: { duration?: number; each?: number; position?: string | number; ease?: string; from?: "first" | "last" | "center" | number } = {}
): Timeline {
  const nodes = root.querySelectorAll<SVGGeometryElement>(selector);
  if (!nodes.length) return tl;
  const drawables = svg.createDrawable(Array.from(nodes));
  tl.add(
    drawables,
    {
      draw: ["0 0", "0 1"],
      duration: opts.duration ?? DURATION.draw,
      ease: opts.ease ?? EASE_DRAW,
      delay: opts.each ? stagger(opts.each, { from: opts.from ?? "first" }) : 0,
    },
    opts.position
  );
  return tl;
}

/** Fade + rise, the standard entrance for copy and cards. */
export function addRise(
  tl: Timeline,
  targets: Element | Element[] | NodeListOf<Element> | string,
  opts: { y?: number; each?: number; duration?: number; blur?: number; position?: string | number } = {}
): Timeline {
  tl.add(
    targets,
    {
      opacity: [0, 1],
      translateY: [opts.y ?? 20, 0],
      ...(opts.blur ? { filter: [`blur(${opts.blur}px)`, "blur(0px)"] } : {}),
      duration: opts.duration ?? DURATION.base,
      delay: opts.each ? stagger(opts.each) : 0,
    },
    opts.position
  );
  return tl;
}

/**
 * createDrawable writes stroke-dasharray, stroke-dashoffset and pathLength as
 * attributes. Call this before handing an element back to CSS keyframes or
 * to React-managed dash attributes (for example the corridor flow on the map).
 */
export function releaseDrawable(root: ParentNode, selector: string) {
  root.querySelectorAll<SVGElement>(selector).forEach((el) => {
    el.removeAttribute("stroke-dasharray");
    el.removeAttribute("stroke-dashoffset");
    el.removeAttribute("pathLength");
  });
}

/** Runs `fn` once, the first time `el` enters the viewport. */
export function onceInView(el: Element, fn: () => void, rootMargin = "-15% 0px") {
  if (typeof IntersectionObserver === "undefined") { fn(); return () => {}; }
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); fn(); }
  }, { rootMargin });
  io.observe(el);
  return () => io.disconnect();
}

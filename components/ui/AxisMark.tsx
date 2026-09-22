"use client";

import React, { forwardRef } from "react";
import { addDraw, stagger, type Timeline, DURATION } from "@/lib/anime";

/**
 * AxisMark — the Mahwar mark reduced to line: a ring, the axis (محور) running
 * through and past it, a chord for the second flow, and one gold node where
 * the two meet. Every element is a stroke so it can be drawn on with
 * svg.createDrawable; the node is faded in last.
 *
 * Pair it with `addAxisMark(tl, root, position)` to drop the full draw-on
 * into any timeline.
 */
interface Props { size?: number; className?: string }

const AxisMark = forwardRef<SVGSVGElement, Props>(function AxisMark({ size = 64, className = "" }, ref) {
  return (
    <svg ref={ref} width={size} height={size} viewBox="0 0 96 96" fill="none" className={className} aria-hidden="true">
      <circle data-mark-ring cx="48" cy="48" r="30" stroke="var(--emerald)" strokeWidth="1.25" />
      <circle data-mark-ring-inner cx="48" cy="48" r="20" stroke="var(--emerald)" strokeWidth="0.6" strokeOpacity="0.5" />
      <line data-mark-axis x1="4" y1="48" x2="92" y2="48" stroke="var(--fg-1)" strokeWidth="1.1" />
      <line data-mark-chord x1="24" y1="72" x2="72" y2="24" stroke="var(--gold)" strokeWidth="1.1" />
      {[12, 84].map((x) => (
        <line key={x} data-mark-tick x1={x} y1="44" x2={x} y2="52" stroke="var(--fg-3)" strokeWidth="1" />
      ))}
      <circle data-mark-node cx="48" cy="48" r="3.2" fill="var(--gold)" opacity="0" />
    </svg>
  );
});

export default AxisMark;

/** Adds the mark's draw-on to `tl`, starting at `position`. Returns the timeline. */
export function addAxisMark(tl: Timeline, root: ParentNode, position?: string | number): Timeline {
  addDraw(tl, root, "[data-mark-ring], [data-mark-ring-inner]", { duration: DURATION.slow, each: 120, position });
  addDraw(tl, root, "[data-mark-axis]", { duration: DURATION.base, position: "-=900" });
  addDraw(tl, root, "[data-mark-chord]", { duration: DURATION.base, position: "-=600" });
  addDraw(tl, root, "[data-mark-tick]", { duration: DURATION.fast, each: 80, position: "-=500" });
  tl.add(root.querySelectorAll("[data-mark-node]"), { opacity: [0, 1], scale: [0, 1], duration: DURATION.fast, delay: stagger(0), ease: "outBack" }, "-=200");
  return tl;
}

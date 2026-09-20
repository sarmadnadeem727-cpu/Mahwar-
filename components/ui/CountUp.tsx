"use client";

import { animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useState } from "react";
import { duration, easing, useMotionOff } from "../../lib/mw-motion";

interface CountUpProps {
  value: number;
  /** Formats the in-flight number (e.g. formatMoney). Receives the interpolated value. */
  format: (n: number) => string;
  /** Start offset in seconds (page-load choreography) */
  delay?: number;
  /** Animation length in seconds — kept ≤ 0.36 by default */
  length?: number;
  className?: string;
}

/**
 * Counts from 0 to `value`. Server render and reduced-motion both show the
 * finished value, so content is never hidden behind an animation.
 */
export function CountUp({ value, format, delay = 0, length = duration.slow, className }: CountUpProps) {
  const off = useMotionOff();
  const mv = useMotionValue(value);
  const [text, setText] = useState(() => format(value));
  const [armed, setArmed] = useState(false);

  useMotionValueEvent(mv, "change", (latest) => setText(format(latest)));

  useEffect(() => {
    if (off) return;
    setArmed(true);
    mv.set(0);
    setText(format(0));
    const controls = animate(mv, value, { duration: length, ease: easing, delay });
    return () => controls.stop();
    // format is stable per call-site; intentionally not a dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [off, value, length, delay, mv]);

  return (
    <span className={className} data-counting={armed ? "true" : undefined} aria-live="off">
      {text}
    </span>
  );
}

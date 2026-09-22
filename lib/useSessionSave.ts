"use client";

import { useEffect, useRef } from "react";
import { useTerminalStore, type SessionAnalyses } from "@/store/useTerminalStore";

/**
 * useSessionSave — debounced write of an engine's inputs/outputs into the session.
 *
 * Engines recompute on every keystroke; writing to the persisted store that
 * often serialised the whole session to localStorage per key press and
 * re-rendered every subscriber. This coalesces to one write per pause.
 */
export function useSessionSave<K extends keyof SessionAnalyses>(key: K, inputs: unknown, outputs: unknown, delay = 400) {
  const update = useTerminalStore((s) => s.updateSessionAnalysis);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      update(key, { inputs, outputs, computedAt: new Date().toISOString() } as SessionAnalyses[K]);
    }, delay);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [key, inputs, outputs, delay, update]);
}

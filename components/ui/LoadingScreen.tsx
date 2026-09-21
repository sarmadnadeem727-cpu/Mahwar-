"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MahwarLogo from "./MahwarLogo";
import { APP, TOOLS, toolsBySuite } from "@/lib/registry";

const BOOT_KEY = "mahwar-booted";

/**
 * Terminal boot sequence. Runs once per browser session (sessionStorage),
 * lasts ~1.4s, and prints real facts about the build rather than fake
 * "connecting to satellites" theatre.
 */
export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [lines, setLines] = useState<string[]>([]);

  useEffect(() => {
    if (sessionStorage.getItem(BOOT_KEY)) {
      setShow(false);
      return;
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const script = [
      `mahwar terminal v${APP.version}`,
      `engines ........ ${TOOLS.length} (${toolsBySuite("finance").length} finance / ${toolsBySuite("operations").length} operations)`,
      "locale ......... en · ar (rtl)",
      "session ........ restored from local storage",
      "ready",
    ];
    const timers: number[] = [];
    const step = reduced ? 0 : 180;
    script.forEach((l, i) => timers.push(window.setTimeout(() => setLines((p) => [...p, l]), 300 + i * step)));
    timers.push(
      window.setTimeout(() => {
        sessionStorage.setItem(BOOT_KEY, "1");
        setShow(false);
      }, 300 + script.length * step + (reduced ? 100 : 700))
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="boot"
          exit={{ opacity: 0, filter: "blur(10px)", scale: 1.02 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[9999] bg-ink-0 grain flex items-center justify-center"
          role="status"
          aria-live="polite"
        >
          <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000,transparent)]" />
          <div className="relative w-[min(92vw,460px)]">
            <div className="flex items-center gap-4">
              <MahwarLogo size={56} />
              <div>
                <div className="font-serif text-3xl text-fg leading-none">{APP.name}</div>
                <div className="font-mono text-[10px] tracking-[0.3em] text-emerald-light mt-2">{APP.nameAr} · TERMINAL</div>
              </div>
            </div>
            <div className="mt-8 font-mono text-[12px] leading-relaxed text-fg-2 min-h-[120px]" dir="ltr">
              {lines.map((l, i) => (
                <div key={i} className={i === lines.length - 1 ? "text-fg" : ""}>
                  <span className="text-emerald-light mr-2">{">"}</span>
                  {l}
                </div>
              ))}
              <span className="inline-block w-[7px] h-[13px] bg-emerald-light animate-blink align-middle ml-4" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


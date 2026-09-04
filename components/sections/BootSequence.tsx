"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, CheckCircle2 } from "lucide-react";

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "INITIALIZING SOVEREIGN GRID...",
  "CONNECTING GCC EXCHANGES (TADAUL, DFM, ADX)...",
  "LOADING QUANTITATIVE ENGINE SUITE...",
  "SYSTEM READY."
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Check prefers-reduced-motion or prior session flag
    if (typeof window !== "undefined") {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const sessionDone = sessionStorage.getItem("mahwar_boot_done");
      if (reducedMotion || sessionDone) {
        onComplete();
        return;
      }
    }

    let isMounted = true;
    let charIdx = 0;
    let lineIdx = 0;

    const printNextChar = () => {
      if (!isMounted) return;
      
      const currentFullLine = BOOT_LOGS[lineIdx];
      if (charIdx <= currentFullLine.length) {
        setDisplayedText(currentFullLine.slice(0, charIdx));
        charIdx++;
        setTimeout(printNextChar, 18); // Rapid typewriter speed
      } else {
        // Line finished, move to next after brief pause
        setTimeout(() => {
          if (!isMounted) return;
          if (lineIdx < BOOT_LOGS.length - 1) {
            lineIdx++;
            charIdx = 0;
            setCurrentLineIndex(lineIdx);
            setDisplayedText("");
            printNextChar();
          } else {
            // Sequence completed
            setIsFinished(true);
            try {
              sessionStorage.setItem("mahwar_boot_done", "true");
            } catch {}
            setTimeout(() => {
              if (isMounted) onComplete();
            }, 300);
          }
        }, 180);
      }
    };

    printNextChar();

    return () => {
      isMounted = false;
    };
  }, [onComplete]);

  const skipBoot = () => {
    try {
      sessionStorage.setItem("mahwar_boot_done", "true");
    } catch {}
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl bg-slate-900 border border-emerald/30 rounded-xl p-6 shadow-2xl overflow-hidden font-mono text-xs"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-emerald">
            <Terminal size={16} />
            <span className="font-bold tracking-wider text-mono-caption uppercase">MAHWAR BOOT SEQUENCE</span>
          </div>
          <button
            onClick={skipBoot}
            className="text-[10px] text-slate-400 hover:text-emerald uppercase tracking-widest transition-colors px-2 py-1 bg-slate-800 rounded border border-slate-700 cursor-pointer"
          >
            Skip [ESC]
          </button>
        </div>

        <div className="space-y-2 min-h-[120px] font-mono text-slate-300">
          {BOOT_LOGS.slice(0, currentLineIndex).map((log, idx) => (
            <div key={idx} className="flex items-center gap-2 text-emerald-light opacity-80">
              <CheckCircle2 size={12} className="text-emerald shrink-0" />
              <span>{log}</span>
            </div>
          ))}
          {!isFinished && (
            <div className="flex items-center gap-2 text-emerald">
              <span className="w-1.5 h-3 bg-emerald animate-pulse shrink-0" />
              <span>{displayedText}</span>
            </div>
          )}
          {isFinished && (
            <div className="flex items-center gap-2 text-emerald font-bold pt-2">
              <CheckCircle2 size={14} className="text-emerald shrink-0" />
              <span>{BOOT_LOGS[BOOT_LOGS.length - 1]}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

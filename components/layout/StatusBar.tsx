"use client";

import React, { useEffect, useState } from "react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { getTool } from "@/lib/registry";

/** Bottom status strip: clock, session facts, recent modules and shortcut hints. */
export default function StatusBar() {
  const { language, currency, sessionAnalyses, recentPanels, setPanel, activePanel } = useTerminalStore();
  const isAr = language === "ar";
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setNow(
        new Intl.DateTimeFormat(isAr ? "ar-SA-u-nu-latn" : "en-GB", {
          hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Riyadh",
        }).format(new Date())
      );
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [isAr]);

  const recent = recentPanels.filter((p) => p !== activePanel).slice(0, 5);

  return (
    <footer
      className="h-7 min-h-7 border-t border-line bg-ink-2 flex items-center justify-between px-3 md:px-5 font-mono text-[10px] text-fg-3 no-print overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex items-center gap-4 min-w-0">
        <span className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-light" />
          {isAr ? "الرياض" : "Riyadh"} <span className="text-fg-2 num">{now}</span>
        </span>
        <span className="hidden sm:inline shrink-0">{currency}</span>
        <span className="hidden sm:inline shrink-0">
          {Object.keys(sessionAnalyses).length} {isAr ? "تحليلات محفوظة" : "analyses in session"}
        </span>
        {recent.length > 0 && (
          <span className="hidden md:flex items-center gap-2 min-w-0">
            <span className="text-fg-4">{isAr ? "الأخيرة" : "recent"}</span>
            {recent.map((id) => {
              const t = getTool(id);
              return t ? (
                <button key={id} onClick={() => setPanel(id)} className="text-fg-3 hover:text-emerald-light transition-colors">
                  {t.code}
                </button>
              ) : null;
            })}
          </span>
        )}
      </div>
      <div className="hidden md:flex items-center gap-4 shrink-0 text-fg-4">
        <span><kbd className="text-fg-3">/</kbd> {isAr ? "سطر الأوامر" : "command line"}</span>
        <span><kbd className="text-fg-3">⌘K</kbd> {isAr ? "اللوحة" : "palette"}</span>
      </div>
    </footer>
  );
}

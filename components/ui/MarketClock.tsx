"use client";

import React, { useEffect, useState } from "react";
import { EXCHANGES, exchangeStatus } from "@/lib/geo/hubs";

/** Live session board for the seven GCC exchanges — computed from the clock, not market data. */
export default function MarketClock({ isAr, compact = false, className = "" }: { isAr: boolean; compact?: boolean; className?: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return null;

  const rows = EXCHANGES.map((ex) => ({ ex, s: exchangeStatus(ex, now) }));
  const openCount = rows.filter((r) => r.s.open).length;

  if (compact) {
    return (
      <span className={`flex items-center gap-3 ${className}`} title={isAr ? "جلسات الأسواق الخليجية" : "GCC exchange sessions"}>
        {rows.map(({ ex, s }) => (
          <span key={ex.id} className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${s.open ? "bg-pos" : s.phase === "pre" ? "bg-gold" : "bg-fg-4"}`} />
            <span className={s.open ? "text-fg-2" : "text-fg-4"}>{ex.name}</span>
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className={`panel-data overflow-hidden ${className}`} dir={isAr ? "rtl" : "ltr"}>
      <div className="px-5 py-3.5 border-b border-line flex items-center justify-between font-sans text-[11px] text-fg-3 bg-white/[0.02]">
        <span className="font-semibold tracking-tight text-fg-2">{isAr ? "جلسات التداول الخليجية" : "GCC Trading Sessions"}</span>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono ${openCount ? "bg-pos/15 text-pos border border-pos/30" : "bg-ink-4 text-fg-4"}`}>
          {openCount ? <span className="w-1.5 h-1.5 rounded-full bg-pos animate-pulse" /> : null}
          {openCount} {isAr ? "مفتوح الآن" : "open now"}
        </span>
      </div>
      <ul className="divide-y divide-line/60">
        {rows.map(({ ex, s }) => (
          <li key={ex.id} className="px-5 py-2.5 grid grid-cols-[1fr_auto_auto] gap-4 items-center text-[12px] hover:bg-white/[0.02] transition-colors">
            <span className="flex items-center gap-2.5 min-w-0 font-sans">
              <span className={`w-2 h-2 rounded-full shrink-0 ${s.open ? "bg-pos shadow-[0_0_8px_rgba(29,154,103,0.6)]" : s.phase === "pre" ? "bg-gold shadow-[0_0_6px_rgba(176,138,46,0.5)]" : "bg-ink-5"}`} />
              <span className="text-fg font-medium truncate">{isAr ? ex.nameAr : ex.name}</span>
              <span className="text-fg-4 hidden sm:inline text-[11px]">{ex.city}</span>
            </span>
            <span className="text-fg-3 font-mono text-[11px]">{ex.open}–{ex.close}</span>
            <span className={`w-14 text-end font-sans text-[11.5px] font-medium ${s.open ? "text-pos font-semibold" : s.phase === "pre" ? "text-gold" : "text-fg-4"}`}>
              {s.open ? (isAr ? "مفتوح" : "open") : s.phase === "pre" ? (isAr ? "قريباً" : "pre") : (isAr ? "مغلق" : "closed")}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}


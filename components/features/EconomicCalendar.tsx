"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, Filter, AlertCircle } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

const EVENTS = [
  { id: 1, country: "SA", date: "2026-07-28", time: "10:00 AST", title: "Saudi Aramco Q2 Dividend Announcement", impact: "HIGH", category: "Dividends" },
  { id: 2, country: "SA", date: "2026-07-29", time: "11:30 AST", title: "Saudi General Authority of Statistics CPI Inflation", impact: "MEDIUM", category: "Macro" },
  { id: 3, country: "UAE", date: "2026-07-30", time: "14:00 AST", title: "ADX Market Reform & Foreign Ownership Limits", impact: "HIGH", category: "CMA / Regulatory" },
  { id: 4, country: "SA", date: "2026-08-01", time: "09:00 AST", title: "Saudi National Bank (SNB) Earnings Conference Call", impact: "HIGH", category: "Earnings" },
  { id: 5, country: "QA", date: "2026-08-02", time: "12:00 AST", title: "Qatar Hydrocarbon Output Statistics", impact: "MEDIUM", category: "Macro" }
];

export default function EconomicCalendar() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const [countryFilter, setCountryFilter] = useState<string>("ALL");

  const filteredEvents = EVENTS.filter(
    (e) => countryFilter === "ALL" || e.country === countryFilter
  );

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* FILTER BAR */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="text-[var(--gold)]" size={24} />
          <div>
            <h2 className="font-garamond text-2xl font-bold text-white">
              {t("panel_calendar", language)}
            </h2>
            <span className="text-xs font-mono text-slate-400">
              GCC Macroeconomic & Earnings Timeline
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <Filter size={14} className="text-slate-400" />
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="terminal-input cursor-pointer"
          >
            <option value="ALL">All Countries</option>
            <option value="SA">Saudi Arabia (KSA)</option>
            <option value="UAE">United Arab Emirates</option>
            <option value="QA">Qatar</option>
          </select>
        </div>
      </div>

      {/* EVENT TIMELINE CARDS */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => (
          <div
            key={evt.id}
            className="glass-panel p-5 rounded-xl border border-white/10 flex items-center justify-between hover:border-[var(--emerald)] transition-all bg-[#14171A]"
          >
            <div className="flex items-center gap-4">
              <span className="px-3 py-1.5 rounded-lg bg-[var(--gold)]/20 text-[var(--gold)] font-mono text-xs font-bold">
                {evt.country}
              </span>
              <div>
                <h3 className="font-bold text-white text-sm mb-1">{evt.title}</h3>
                <div className="flex items-center gap-3 font-mono text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {evt.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {evt.time}
                  </span>
                  <span className="text-[var(--emerald)] font-bold">{evt.category}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full font-mono text-[10px] font-bold ${
                  evt.impact === "HIGH" 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                ● {evt.impact} IMPACT
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

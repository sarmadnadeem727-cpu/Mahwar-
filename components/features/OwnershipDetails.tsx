"use client";

import React from "react";
import { motion } from "framer-motion";
import { Users, PieChart as PieIcon, Shield, TrendingUp } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

const OWNERSHIP_DISTRIBUTION = [
  { name: "Public Investment Fund (PIF)", value: 65, fill: "#0E7C69" },
  { name: "Global Institutional Funds", value: 20, fill: "#C9A84C" },
  { name: "Local GCC Retail Investors", value: 15, fill: "#334155" }
];

const TOP_INSTITUTIONS = [
  { name: "Public Investment Fund (PIF)", shares: "157.3 Billion", pct: "65.0%", change: "+0.0%", date: "Q1 2025" },
  { name: "BlackRock Institutional Trust", shares: "4.8 Billion", pct: "2.0%", change: "+0.15%", date: "Q1 2025" },
  { name: "Vanguard Emerging Markets", shares: "3.6 Billion", pct: "1.5%", change: "+0.08%", date: "Q1 2025" },
  { name: "State Street Global Advisors", shares: "2.4 Billion", pct: "1.0%", change: "-0.02%", date: "Q1 2025" }
];

export default function OwnershipDetails() {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="grid grid-cols-12 gap-6">
        {/* DONUT CHART (4 COLS) */}
        <div className="col-span-12 lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[var(--gold)] font-mono text-xs font-bold uppercase tracking-wider">
              <PieIcon size={16} />
              <span>Capital Structure</span>
            </div>
            <h3 className="font-garamond text-xl font-bold text-white mb-4">
              Ownership Allocation ({activeTicker})
            </h3>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={OWNERSHIP_DISTRIBUTION}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={4}
                >
                  {OWNERSHIP_DISTRIBUTION.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "#0F1113", borderColor: "rgba(255,255,255,0.15)", fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 font-mono text-xs pt-4 border-t border-white/10">
            {OWNERSHIP_DISTRIBUTION.map((item) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="truncate max-w-[160px]">{item.name}</span>
                </span>
                <span className="font-bold text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* TOP INSTITUTIONAL HOLDERS TABLE (8 COLS) */}
        <div className="col-span-12 lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
            Top Institutional & Sovereign Holders
          </h3>
          <div className="overflow-x-auto">
            <table className="terminal-table">
              <thead>
                <tr>
                  <th>Institution / Sovereign Entity</th>
                  <th>Shares Held</th>
                  <th>% Portfolio</th>
                  <th>Net Change</th>
                  <th>Reported Date</th>
                </tr>
              </thead>
              <tbody>
                {TOP_INSTITUTIONS.map((inst, i) => (
                  <tr key={i}>
                    <td className="font-bold text-white">{inst.name}</td>
                    <td className="text-slate-200">{inst.shares}</td>
                    <td className="text-[var(--gold)] font-bold">{inst.pct}</td>
                    <td className={inst.change.startsWith("+") ? "text-[var(--pos)] font-bold" : "text-[var(--neg)]"}>
                      {inst.change}
                    </td>
                    <td className="text-slate-400">{inst.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

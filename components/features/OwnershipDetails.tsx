"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useOwnership } from "@/hooks/useMarketData";
import { Users, TrendingUp, ArrowRight, Landmark, Loader2 } from "lucide-react";

// Source: Yahoo Finance API (institutionOwnership + fundOwnership)
// Refresh Cadence: Live data sync on active ticker change
const OwnershipDetails = () => {
  const { activeTicker, language } = useTerminalStore();
  const isAr = language === "ar";

  const { data, isLoading } = useOwnership(activeTicker);

  // Group real ownership list
  const holders = data?.institutionOwnership?.ownershipList || [];

  // Sum total institutional holdings
  const totalInstPct = useMemo(() => {
    return holders.reduce((acc: number, cur: any) => acc + (cur.pctHeld || 0), 0);
  }, [holders]);

  // Compute top 5 concentration
  const top5Concentration = useMemo(() => {
    const sorted = [...holders].sort((a: any, b: any) => (b.pctHeld || 0) - (a.pctHeld || 0));
    const sum = sorted.slice(0, 5).reduce((acc: number, cur: any) => acc + (cur.pctHeld || 0), 0);
    return (sum * 100).toFixed(1) + "%";
  }, [holders]);

  // Dynamic PieChart Data
  const ownershipData = useMemo(() => {
    const list = holders.slice(0, 4).map((h: any, idx: number) => {
      const colors = ["var(--emerald)", "rgba(16,185,129,0.7)", "rgba(16,185,129,0.4)", "rgba(18,29,56,0.6)"];
      return {
        name: h.organization || `Holder ${idx + 1}`,
        value: Number(((h.pctHeld || 0) * 100).toFixed(2)),
        color: colors[idx % colors.length],
      };
    });

    if (totalInstPct < 1 && holders.length > 0) {
      list.push({
        name: isAr ? "مستثمرون آخرون / أفراد" : "Others / Retail",
        value: Number(((1 - totalInstPct) * 100).toFixed(2)),
        color: "var(--bg2)",
      });
    }

    return list;
  }, [holders, totalInstPct, isAr]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-12">
        <Loader2 className="w-12 h-12 text-[var(--emerald)] animate-spin mb-6" />
        <h2 className="text-xl font-serif text-[var(--text1)] font-bold mb-2">
          {isAr ? "جاري فحص هيكل الملكية..." : "Analyzing Ownership Structure..."}
        </h2>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          {isAr ? "تحليل سجلات المساهمين وتوزيع رأس المال..." : "Tracing shareholder registers and equity allocation..."}
        </p>
      </div>
    );
  }

  if (holders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-12" dir={isAr ? "rtl" : "ltr"}>
        <Users className="w-12 h-12 text-zinc-600 mb-6 animate-pulse" />
        <h2 className="text-xl font-serif text-[var(--text1)] font-bold mb-2">
          {isAr ? "بيانات الملكية غير متوفرة" : "No Institutional Ownership Data Available"}
        </h2>
        <p className="text-zinc-500 text-xs font-mono uppercase tracking-widest">
          {isAr ? "لا توجد سجلات ملكية مؤسسية لهذا الرمز حالياً" : "Major institutional holding lists are unavailable for this symbol."}
        </p>
      </div>
    );
  }

  const recentChanges = holders.slice(0, 10).map((row: any) => {
    const rawChange = row.pctChange || 0;
    const isIncrease = rawChange > 0;
    const isDecrease = rawChange < 0;
    
    return {
      holder: row.organization,
      date: row.reportDate ? row.reportDate.split("T")[0] : "N/A",
      type: isIncrease ? "Increase" : isDecrease ? "Decrease" : "No Change",
      change: (rawChange * 100).toFixed(2) + "%",
      pctHeld: (row.pctHeld * 100).toFixed(2) + "%",
    };
  });

  return (
    <div className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      <div className="grid grid-cols-12 gap-8">
        {/* Ownership Structure Chart */}
        <div className="col-span-12 lg:col-span-7 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative overflow-hidden">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-serif font-bold text-[var(--text1)] mb-1 uppercase tracking-tight">
                {isAr ? "هيكل الملكية المؤسسي" : "Institutional Ownership Structure"}
              </h3>
              <p className="text-[10px] text-[var(--text3)] uppercase tracking-[.2em]">{activeTicker} · Major Concentration</p>
            </div>
          </div>

          <div className="h-[300px] w-full flex items-center">
            {ownershipData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownershipData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    animationDuration={1500}
                  >
                    {ownershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: "var(--bg1)", border: "1px solid var(--border)", borderRadius: "12px", fontSize: "11px", color: "var(--text1)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}
                    itemStyle={{ fontWeight: 700 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : null}
            
            {/* Legend Overlay */}
            <div className="hidden md:flex flex-col gap-4 pr-8">
               {ownershipData.map((item, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                   <div className="flex flex-col">
                     <span className="text-[10px] text-[var(--text1)] font-bold">{item.value}%</span>
                     <span className="text-[9px] text-[var(--text3)] uppercase tracking-wider">{item.name}</span>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Ownership Stats Cards */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
           {[
             { title: isAr ? "تركيز كبار الملاك" : "Top 5 Concentration", value: top5Concentration, icon: <Users className="w-4 h-4" /> },
             { title: isAr ? "إجمالي ملكية المؤسسات" : "Total Institutional Holdings", value: (totalInstPct * 100).toFixed(1) + "%", icon: <Landmark className="w-4 h-4" /> },
             { title: isAr ? "إجمالي المؤسسات المالكة" : "Registered Institutions", value: holders.length.toString(), icon: <TrendingUp className="w-4 h-4" /> },
           ].map((stat, i) => (
             <div key={i} className="bg-[var(--bg1)] border border-[var(--border)] rounded-2xl p-6 flex items-center justify-between group hover:border-[var(--emerald)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-all">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-[var(--bg2)] rounded-xl text-[var(--emerald)] group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">{stat.icon}</div>
                  <span className="text-xs text-[var(--text2)] font-bold">{stat.title}</span>
               </div>
               <span className="text-xl font-ibm-plex-mono font-bold text-[var(--text1)]">{stat.value}</span>
             </div>
           ))}
        </div>

        {/* Recent Changes Table */}
        <div className="col-span-12 bg-[var(--bg1)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-lg shadow-[rgba(14,124,105,0.02)]">
          <div className="p-8 border-b border-[var(--border)] flex justify-between items-center">
             <h3 className="text-xl font-serif font-bold text-[var(--text1)] uppercase tracking-tight">
               {isAr ? "سجل ملكية المساهمين وتغييرات الحصص" : "Shareholder Register & Position Adjustments"}
             </h3>
             <span className="text-[9px] font-mono tracking-widest text-[var(--emerald)] px-3 py-1 bg-[var(--pos-bg)] border border-[var(--pos)] rounded-full font-bold">REGIONAL SHAREHOLDER REGISTRY</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[var(--bg2)] text-[var(--text3)] uppercase tracking-[.2em] font-mono">
                <th className="px-8 py-4">{isAr ? "المساهم" : "Shareholder"}</th>
                <th className="px-8 py-4">{isAr ? "تاريخ الإبلاغ" : "Reporting Date"}</th>
                <th className="px-8 py-4">{isAr ? "النسبة المملوكة" : "Share held"}</th>
                <th className="px-8 py-4 text-right">{isAr ? "تغير الحصة" : "Change (YoY)"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {recentChanges.map((row, i) => (
                <tr key={i} className="hover:bg-[var(--bg2)] transition-colors group">
                  <td className="px-8 py-4 font-bold text-[var(--text1)] group-hover:text-[var(--emerald)]">{row.holder}</td>
                  <td className="px-8 py-4 font-mono text-[var(--text2)]">{row.date}</td>
                  <td className="px-8 py-4 font-mono font-bold">{row.pctHeld}</td>
                  <td className={`px-8 py-4 text-right font-ibm-plex-mono font-extrabold ${
                    row.type === "Increase" ? "text-[var(--pos)]" : 
                    row.type === "Decrease" ? "text-[var(--neg)]" : 
                    "text-[var(--text1)]"
                  }`}>
                    {row.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OwnershipDetails;

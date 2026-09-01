"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem, EASE_PREMIUM } from "@/lib/motion";
import SectionLabel from "@/components/ui/SectionLabel";

const IntelligenceSection = () => {
  return (
    <section id="ai-research" className="relative py-[120px] px-6 lg:px-24 bg-white overflow-hidden">
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--emerald-glow)] blur-[160px] opacity-20 rounded-full pointer-events-none" />

      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        {/* Left Column */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <SectionLabel label="Institutional Analysis" />
          <motion.h2 variants={staggerItem} className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8 text-[#171717]">
            Structured calculations. <br /> Clear insights.
          </motion.h2>
          <motion.p variants={staggerItem} className="font-sans text-base text-slate-650 max-w-[500px] leading-relaxed mb-12">
            The platform delivers institutional-grade modeling equations, ratio screening, and deal analysis templates designed specifically for the Gulf context.
          </motion.p>
          
          <ul className="space-y-6">
            {[
              "Manual corporate profiles & peer screening",
              "Automated client-side Shariah ratio audits",
              "Custom intrinsic DCF valuation models",
              "Dynamic sources/uses waterfall LBO builder",
              "Consolidated multi-model printable report templates",
            ].map((item, i) => (
              <motion.li
                key={i}
                variants={staggerItem}
                className="flex items-center gap-4 text-sm font-sans text-slate-700"
              >
                <div className="w-5 h-[1px] bg-[var(--emerald)]" />
                {item}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Right Column: Dashboard Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE_PREMIUM }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md">
            {/* Top Bar */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              </div>
              <div className="flex gap-4">
                {["OVERVIEW", "DCF", "RESEARCH"].map((tab, i) => (
                  <span key={i} className={`font-mono text-[8px] tracking-widest ${i === 2 ? "text-[var(--emerald)] font-bold" : "text-slate-400"}`}>
                    {tab}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* KPI Row */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "WACC (%)", val: "9.2%", chg: "Stable", up: true },
                  { label: "FV (SAR)", val: "34.50", chg: "Upside", up: true },
                  { label: "ZAKAT", val: "2.5%", chg: "Compliant", up: true },
                ].map((kpi, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                    <span className="block font-mono text-[8px] text-slate-500 mb-1">{kpi.label}</span>
                    <div className="flex items-end justify-between">
                      <span className="font-mono text-xs font-semibold text-[#171717]">{kpi.val}</span>
                      <span className={`font-mono text-[8px] text-[var(--emerald)]`}>
                        ▲ {kpi.chg}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chart Area */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 h-[140px] relative overflow-hidden">
                <span className="absolute top-4 left-4 font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                  Valuation Bridge
                </span>
                <svg className="w-full h-full pt-6" viewBox="0 0 400 100">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--emerald)" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="var(--emerald)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d="M 0 80 Q 50 20 100 60 Q 150 90 200 40 Q 250 10 300 50 Q 350 30 400 70"
                    fill="none"
                    stroke="var(--emerald)"
                    strokeWidth="1.5"
                  />
                  <motion.path
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 1 }}
                    d="M 0 80 Q 50 20 100 60 Q 150 90 200 40 Q 250 10 300 50 Q 350 30 400 70 V 100 H 0 Z"
                    fill="url(#chartGradient)"
                  />
                </svg>
              </div>

              {/* Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1 font-mono text-[8px] text-slate-400 uppercase tracking-widest">
                  <span>Ticker</span>
                  <span>Price</span>
                  <span>Chg%</span>
                </div>
                {[
                  { t: "2222.SR", p: "28.40", c: "+0.53%", u: true },
                  { t: "1120.SR", p: "87.60", c: "+1.39%", u: true },
                  { t: "1180.SR", p: "38.90", c: "+2.91%", u: true },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
                    <span className="font-mono text-[10px] text-[var(--emerald)]">{row.t}</span>
                    <span className="font-mono text-[10px] text-slate-800">{row.p}</span>
                    <span className={`font-mono text-[10px] text-green-600`}>
                      {row.c}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default IntelligenceSection;

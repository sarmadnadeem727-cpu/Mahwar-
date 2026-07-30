"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Compass, Landmark, TrendingUp, ShieldCheck } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

const GCC_COUNTRIES = [
  {
    id: "SA",
    nameEn: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    exchange: "Tadawul (TASI)",
    marketCap: "$2.9 Trillion",
    topStock: "Saudi Aramco (2222.SR)",
    visionProgress: 88,
    status: "Primary Market Hub"
  },
  {
    id: "UAE",
    nameEn: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    exchange: "ADX & DFM",
    marketCap: "$940 Billion",
    topStock: "IHC / Emirates NBD",
    visionProgress: 92,
    status: "Financial Center"
  },
  {
    id: "QA",
    nameEn: "Qatar",
    nameAr: "دولة قطر",
    exchange: "QSE",
    marketCap: "$180 Billion",
    topStock: "QNB Group",
    visionProgress: 85,
    status: "LNG Sovereign Hub"
  },
  {
    id: "KW",
    nameEn: "Kuwait",
    nameAr: "دولة الكويت",
    exchange: "Boursa Kuwait",
    marketCap: "$145 Billion",
    topStock: "NBK / KFH",
    visionProgress: 80,
    status: "Banking & Retail"
  },
  {
    id: "OM",
    nameEn: "Oman",
    nameAr: "سلطنة عمان",
    exchange: "MSX",
    marketCap: "$62 Billion",
    topStock: "Bank Muscat",
    visionProgress: 76,
    status: "Emerging Market"
  },
  {
    id: "BH",
    nameEn: "Bahrain",
    nameAr: "مملكة البحرين",
    exchange: "Bahrain Bourse",
    marketCap: "$32 Billion",
    topStock: "Ahli United",
    visionProgress: 78,
    status: "Offshore Hub"
  }
];

export default function GCCSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';
  const [selectedCountry, setSelectedCountry] = useState(GCC_COUNTRIES[0]);

  return (
    <section id="gcc" className="py-28 bg-[#0F1113] relative overflow-hidden border-t border-white/10" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Compass size={14} />
            <span>{isAr ? "استخبارات أسواق المال الخليجية" : "GCC Regional Intelligence"}</span>
          </div>

          <h2 className="font-garamond text-4xl md:text-6xl font-bold text-white mb-6">
            {isAr ? "تغطية سيادية شاملة لدول مجلس التعاون" : "Sovereign Coverage Across All 6 GCC Markets"}
          </h2>

          <p className="text-slate-400 text-base md:text-lg">
            {isAr 
              ? "متابعة دقيقة لرؤية المملكة 2030، تداول السعودي، وسوق دبي وأبوظبي المالي مع ربط المؤشرات الاقتصادية اللحظية."
              : "Institutional alignment with Saudi Vision 2030, Tadawul liquidity inflows, and Gulf sovereign wealth trends."
            }
          </p>
        </div>

        {/* Country Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {GCC_COUNTRIES.map((c) => {
            const active = selectedCountry.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  active 
                    ? "bg-[var(--emerald)]/15 border-[var(--emerald)] text-white shadow-lg shadow-[var(--emerald)]/20" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-200"
                }`}
              >
                <div className="font-mono text-xs font-bold uppercase tracking-widest mb-1 text-[var(--gold)]">
                  {c.id}
                </div>
                <div className="font-bold text-xs truncate">
                  {isAr ? c.nameAr : c.nameEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Country Intelligence Detail Box */}
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#14171A]">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded bg-[var(--gold)]/20 text-[var(--gold)] font-mono text-xs font-bold">
                {selectedCountry.id}
              </span>
              <h3 className="font-garamond text-3xl md:text-4xl font-bold text-white">
                {isAr ? selectedCountry.nameAr : selectedCountry.nameEn}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 font-mono text-xs">
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400 block mb-1">Exchange</span>
                <span className="text-white font-bold text-sm">{selectedCountry.exchange}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400 block mb-1">Market Cap</span>
                <span className="text-[var(--emerald)] font-bold text-sm">{selectedCountry.marketCap}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400 block mb-1">Top Benchmark Component</span>
                <span className="text-white font-bold text-xs">{selectedCountry.topStock}</span>
              </div>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10">
                <span className="text-slate-400 block mb-1">Market Classification</span>
                <span className="text-[var(--gold)] font-bold text-xs">{selectedCountry.status}</span>
              </div>
            </div>
          </div>

          {/* Vision 2030 Progress Indicator */}
          <div className="lg:col-span-5 p-8 rounded-2xl bg-black/60 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-mono text-xs text-slate-400 uppercase tracking-widest font-bold">
                  {isAr ? "مؤشر تحول رؤية 2030" : "Vision Transformation Index"}
                </span>
                <span className="font-mono text-xl font-bold text-[var(--emerald)]">
                  {selectedCountry.visionProgress}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-3 mb-6 overflow-hidden p-0.5 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedCountry.visionProgress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="bg-gradient-to-r from-[#0E7C69] to-[#C9A84C] h-full rounded-full"
                />
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed font-mono">
              {isAr 
                ? "يتابع المحور التحولات الهيكلية للخصخصة وتطورات أسواق الدين السيادي والائتمان المالي."
                : "Mahwar tracks structural privatization targets, sovereign debt issuances, and non-oil GDP expansion."
              }
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

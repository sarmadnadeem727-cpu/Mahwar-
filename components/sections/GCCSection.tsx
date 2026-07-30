"use client";

import React, { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Compass } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

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
  const shouldReduceMotion = useReducedMotion();
  const [selectedCountry, setSelectedCountry] = useState(GCC_COUNTRIES[0]);

  return (
    <section id="gcc" className="py-20 bg-[#0A0B0D] relative overflow-hidden border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <motion.div 
            variants={staggerItem} 
            className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/25 text-[var(--gold)] text-[10px] font-mono font-bold uppercase tracking-wider mb-4"
          >
            <Compass size={12} />
            <span>{isAr ? "استخبارات أسواق المال الخليجية" : "GCC Regional Intelligence"}</span>
          </motion.div>

          <h2 className="font-garamond text-3xl md:text-5xl font-extrabold text-white mb-5">
            {isAr ? "تغطية سيادية شاملة لدول مجلس التعاون" : "Sovereign Coverage Across All 6 GCC Markets"}
          </h2>

          <p className="text-slate-400 font-sans text-xs md:text-sm">
            {isAr 
              ? "متابعة دقيقة لرؤية المملكة 2030، تداول السعودي، وسوق دبي وأبوظبي المالي مع ربط المؤشرات الاقتصادية اللحظية."
              : "Institutional alignment with Saudi Vision 2030, Tadawul liquidity inflows, and Gulf sovereign wealth trends."
            }
          </p>
        </motion.div>

        {/* Country Selector Grid */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {GCC_COUNTRIES.map((c) => {
            const active = selectedCountry.id === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCountry(c)}
                className={`p-3 rounded-lg border text-center transition-all cursor-pointer font-mono text-[10px] ${
                  active 
                    ? "bg-[var(--emerald)]/10 border-[var(--emerald)] text-white" 
                    : "bg-[#0F1113]/30 border-white/5 text-slate-400 hover:bg-[#0F1113]/60 hover:text-slate-200"
                }`}
              >
                <div className="font-bold text-[9px] uppercase tracking-widest mb-1 text-[var(--gold)]">
                  {c.id}
                </div>
                <div className="font-bold text-[9px] truncate">
                  {isAr ? c.nameAr : c.nameEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Country Info Box */}
        <div className="p-6 md:p-8 rounded-xl border border-white/5 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#0F1113]/60">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[var(--gold)]/10 border border-[var(--gold)]/20 text-[var(--gold)] font-mono text-[9px] font-bold">
                {selectedCountry.id}
              </span>
              <h3 className="font-garamond text-xl md:text-2xl font-bold text-white">
                {isAr ? selectedCountry.nameAr : selectedCountry.nameEn}
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
              <div className="p-3 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block mb-0.5">Exchange</span>
                <span className="text-white font-bold">{selectedCountry.exchange}</span>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block mb-0.5">Market Cap</span>
                <span className="text-[var(--emerald)] font-bold">{selectedCountry.marketCap}</span>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block mb-0.5">Benchmark Components</span>
                <span className="text-white font-bold">{selectedCountry.topStock}</span>
              </div>
              <div className="p-3 rounded bg-black/40 border border-white/5">
                <span className="text-slate-500 block mb-0.5">Classification</span>
                <span className="text-[var(--gold)] font-bold">{selectedCountry.status}</span>
              </div>
            </div>
          </div>

          {/* Transformation Progress Slider */}
          <div className="lg:col-span-5 p-6 rounded-lg bg-black/40 border border-white/5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                  {isAr ? "مؤشر تحول رؤية 2030" : "Vision Transformation Index"}
                </span>
                <span className="font-mono text-base font-bold text-[var(--emerald)]">
                  {selectedCountry.visionProgress}%
                </span>
              </div>

              {/* Simple progress track */}
              <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden p-px border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${selectedCountry.visionProgress}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="bg-gradient-to-r from-[#0E7C69] to-[#C9A84C] h-full rounded-full"
                />
              </div>
            </div>

            <p className="text-slate-500 font-mono text-[9px] leading-relaxed">
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

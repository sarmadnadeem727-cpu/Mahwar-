"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, MapPin, TrendingUp, CheckCircle2 } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

interface GCCCountry {
  id: string;
  name: string;
  nameAr: string;
  exchange: string;
  indexName: string;
  indexValue: string;
  change: string;
  isPositive: boolean;
  marketCap: string;
  path: string; // SVG path data
  labelPos: { cx: number; cy: number };
}

const GCC_COUNTRIES: GCCCountry[] = [
  {
    id: "ksa",
    name: "Saudi Arabia",
    nameAr: "المملكة العربية السعودية",
    exchange: "Tadaul (TASI)",
    indexName: "TASI",
    indexValue: "12,450.80",
    change: "+0.85%",
    isPositive: true,
    marketCap: "SAR 10.8T",
    path: "M 180,180 L 260,150 L 320,190 L 360,280 L 320,380 L 240,360 L 170,300 Z",
    labelPos: { cx: 250, cy: 260 },
  },
  {
    id: "uae",
    name: "United Arab Emirates",
    nameAr: "الإمارات العربية المتحدة",
    exchange: "DFM & ADX",
    indexName: "DFMGI / FADGI",
    indexValue: "4,680.12",
    change: "+1.15%",
    isPositive: true,
    marketCap: "AED 3.6T",
    path: "M 365,270 L 410,265 L 430,295 L 390,310 Z",
    labelPos: { cx: 395, cy: 285 },
  },
  {
    id: "qa",
    name: "Qatar",
    nameAr: "دولة قطر",
    exchange: "Qatar Stock Exchange",
    indexName: "QSI",
    indexValue: "10,120.45",
    change: "+0.42%",
    isPositive: true,
    marketCap: "QAR 610B",
    path: "M 345,235 L 358,232 L 360,252 L 348,255 Z",
    labelPos: { cx: 352, cy: 243 },
  },
  {
    id: "kw",
    name: "Kuwait",
    nameAr: "دولة الكويت",
    exchange: "Boursa Kuwait",
    indexName: "BK Premier",
    indexValue: "7,890.30",
    change: "-0.18%",
    isPositive: false,
    marketCap: "KWD 42B",
    path: "M 285,140 L 302,138 L 305,152 L 288,154 Z",
    labelPos: { cx: 295, cy: 146 },
  },
  {
    id: "bh",
    name: "Bahrain",
    nameAr: "مملكة البحرين",
    exchange: "Bahrain Bourse",
    indexName: "BHBX",
    indexValue: "2,015.60",
    change: "+0.10%",
    isPositive: true,
    marketCap: "BHD 31B",
    path: "M 332,215 L 340,213 L 341,222 L 333,223 Z",
    labelPos: { cx: 336, cy: 218 },
  },
  {
    id: "om",
    name: "Oman",
    nameAr: "سلطنة عمان",
    exchange: "Muscat Stock Exchange",
    indexName: "MSX 30",
    indexValue: "4,780.90",
    change: "+0.35%",
    isPositive: true,
    marketCap: "OMR 24B",
    path: "M 410,310 L 460,335 L 430,390 L 385,340 Z",
    labelPos: { cx: 425, cy: 345 },
  },
];

export default function GCCMapSection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [selectedId, setSelectedId] = useState<string>("ksa");

  const activeCountry = GCC_COUNTRIES.find((c) => c.id === selectedId) || GCC_COUNTRIES[0];

  return (
    <section className="py-20 bg-white relative border-b border-surface-border select-none font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-dim border border-emerald-border text-emerald text-mono-caption font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <Globe size={13} />
            <span>{isAr ? "التغطية الإقليمية الجغرافية" : "GCC REGIONAL MAP & EXCHANGES"}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-heading mb-4">
            {isAr ? "متابعة تكتيكية لكافة أسواق المال الخليجية 6" : "Unified Sovereign Coverage Across All 6 GCC Markets"}
          </h2>

          <p className="text-slate-body text-body-sm leading-relaxed font-sans font-medium">
            {isAr
              ? "بيانات مالية موحدة وهياكل نمذجة مخصصة للأسواق السعودية، الإماراتية، القطرية، الكويتية، البحرينية، والعمانية."
              : "Real-time index feeds, market cap metrics, and tailored valuation models calibrated for Gulf Cooperation Council exchanges."
            }
          </p>
        </div>

        {/* MAP & CARDS LAYOUT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* FLAT 2D VECTOR MAP CONTAINER */}
          <div className="lg:col-span-7 bg-surface-subtle p-6 rounded-xl border border-surface-border shadow-terminal-card relative flex items-center justify-center">
            
            <svg
              viewBox="140 100 350 320"
              className="w-full h-auto max-h-[400px] overflow-visible drop-shadow-sm"
            >
              {/* GCC STATES VECTOR PATHS */}
              {GCC_COUNTRIES.map((country) => {
                const isSelected = country.id === selectedId;
                return (
                  <g key={country.id} onClick={() => setSelectedId(country.id)} className="cursor-pointer group">
                    <motion.path
                      d={country.path}
                      fill={isSelected ? "#0E7C69" : "#CBD5E1"}
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className="transition-colors duration-200"
                    />
                    {/* Map Node Pin */}
                    <circle
                      cx={country.labelPos.cx}
                      cy={country.labelPos.cy}
                      r={isSelected ? 6 : 4}
                      fill={isSelected ? "#FFFFFF" : "#0E7C69"}
                      stroke="#0E7C69"
                      strokeWidth="2"
                    />
                  </g>
                );
              })}
            </svg>

            <div className="absolute bottom-4 left-4 font-mono text-[10px] text-slate-muted bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded border border-surface-border">
              Standard Neutral GCC Geographical Dataset (WGS84)
            </div>
          </div>

          {/* ACTIVE MARKET DETAIL CARD */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white p-6 rounded-xl border border-surface-border shadow-terminal-card space-y-5">
              <div className="flex items-center justify-between border-b border-surface-border pb-4">
                <div>
                  <span className="text-mono-caption font-mono font-bold text-emerald uppercase tracking-wider block mb-0.5">
                    {isAr ? countryName(activeCountry, isAr) : activeCountry.name}
                  </span>
                  <h3 className="font-serif text-2xl font-bold text-slate-heading">
                    {activeCountry.exchange}
                  </h3>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-dim border border-emerald-border text-emerald">
                  <MapPin size={20} />
                </div>
              </div>

              {/* MARKET METRICS GRID */}
              <div className="grid grid-cols-2 gap-4 font-mono">
                <div className="p-3.5 bg-surface-subtle rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">Index Level</span>
                  <span className="text-lg font-extrabold text-slate-heading block">{activeCountry.indexValue}</span>
                  <span className={`text-[10px] font-bold block ${activeCountry.isPositive ? "text-emerald" : "text-red-500"}`}>
                    {activeCountry.change} Daily
                  </span>
                </div>

                <div className="p-3.5 bg-surface-subtle rounded-lg border border-surface-border">
                  <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">Market Cap</span>
                  <span className="text-lg font-extrabold text-emerald block">{activeCountry.marketCap}</span>
                  <span className="text-[10px] text-slate-muted block">Combined Equities</span>
                </div>
              </div>

              {/* QUICK COUNTRY SELECTOR BUTTONS */}
              <div className="pt-2">
                <span className="text-mono-caption font-mono text-slate-muted block mb-2 font-bold">Select GCC Market:</span>
                <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                  {GCC_COUNTRIES.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedId(c.id)}
                      className={`py-1.5 px-2 rounded border text-center font-bold transition-all cursor-pointer truncate ${
                        selectedId === c.id
                          ? "bg-emerald text-white border-emerald shadow-2xs"
                          : "bg-surface-subtle border-surface-border text-slate-muted hover:text-slate-heading"
                      }`}
                    >
                      {c.indexName}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

function countryName(country: GCCCountry, isAr: boolean) {
  return isAr ? country.nameAr : country.name;
}

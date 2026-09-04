"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

interface TickerItem {
  ticker: string;
  name: string;
  nameAr: string;
  price: string;
  change: string;
  isPositive: boolean;
  market: string;
}

const TICKER_DATA: TickerItem[] = [
  { ticker: "TASI", name: "Tadawul All Share", nameAr: "مؤشر تاسي الرئيسي", price: "12,410.50", change: "+0.42%", isPositive: true, market: "KSA" },
  { ticker: "2222.SR", name: "Saudi Aramco", nameAr: "أرامكو السعودية", price: "27.85 SAR", change: "+1.20%", isPositive: true, market: "TASI" },
  { ticker: "1120.SR", name: "Al Rajhi Bank", nameAr: "مصرف الراجحي", price: "88.40 SAR", change: "+0.85%", isPositive: true, market: "TASI" },
  { ticker: "2010.SR", name: "SABIC", nameAr: "سابك", price: "74.20 SAR", change: "-0.30%", isPositive: false, market: "TASI" },
  { ticker: "7010.SR", name: "STC Group", nameAr: "إس تي سي", price: "41.50 SAR", change: "+0.60%", isPositive: true, market: "TASI" },
  { ticker: "EMAAR.AE", name: "Emaar Properties", nameAr: "إعمار العقارية", price: "8.65 AED", change: "+2.15%", isPositive: true, market: "DFM" },
  { ticker: "QNBK.QA", name: "QNB Group", nameAr: "مجموعة QNB", price: "16.20 QAR", change: "-0.40%", isPositive: false, market: "QSE" },
  { ticker: "NBK.KW", name: "National Bank of Kuwait", nameAr: "بنك الكويت الوطني", price: "890 KWF", change: "+0.34%", isPositive: true, market: "BK" },
];

export default function LiveTickerStrip() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <div 
      className="w-full bg-slate-50 border-y border-surface-border py-2.5 px-4 overflow-hidden select-none font-mono text-body-sm"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Badge */}
        <div className="flex items-center gap-2 text-emerald font-bold shrink-0 pr-4 rtl:pr-0 rtl:pl-4 border-r rtl:border-r-0 rtl:border-l border-surface-border">
          <Activity size={14} className="animate-pulse" />
          <span className="uppercase text-[11px] tracking-wider">
            {isAr ? "بث أسواق الخليج" : "GCC BOURSES LIVE"}
          </span>
        </div>

        {/* Scrolling Tickers */}
        <div className="flex-1 overflow-hidden">
          <motion.div 
            animate={{ x: isAr ? [0, 400] : [0, -400] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="flex items-center gap-6 whitespace-nowrap"
          >
            {[...TICKER_DATA, ...TICKER_DATA].map((item, idx) => (
              <div 
                key={`${item.ticker}-${idx}`}
                className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-surface-border rounded-md shadow-2xs font-mono text-[11px]"
              >
                <span className="font-bold text-slate-heading">{item.ticker}</span>
                <span className="text-slate-muted text-[10px] hidden sm:inline">
                  {isAr ? item.nameAr : item.name}
                </span>
                <span className="font-bold text-slate-body">{item.price}</span>
                <span className={`inline-flex items-center font-bold ${item.isPositive ? "text-emerald" : "text-rose-600"}`}>
                  {item.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{item.change}</span>
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

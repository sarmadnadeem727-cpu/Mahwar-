"use client";

import React, { useState, useMemo } from "react";
import { Handshake, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import InputGroup from "@/components/shared/InputGroup";
import ChartWrapper from "@/components/shared/ChartWrapper";
import { panelReveal } from "@/lib/motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from "recharts";

export default function MergerAnalysis() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  // Acquirer Inputs
  const [acqNetIncome, setAcqNetIncome] = useState(1500); // in millions
  const [acqShares, setAcqShares] = useState(500); // in millions
  const [acqPrice, setAcqPrice] = useState(45.0);

  // Target Inputs
  const [tgtNetIncome, setTgtNetIncome] = useState(300); // in millions
  const [tgtShares, setTgtShares] = useState(150); // in millions
  const [tgtPrice, setTgtPrice] = useState(25.0);

  // Deal Assumptions
  const [premium, setPremium] = useState(20); // % premium over current target price
  const [cashPercent, setCashPercent] = useState(50); // % of deal funded by cash/debt
  const [costOfDebt, setCostOfDebt] = useState(6.0); // pre-tax cost of new debt
  const [taxRate, setTaxRate] = useState(20); // effective tax rate
  const [synergies, setSynergies] = useState(50); // post-tax synergies in millions

  const results = useMemo(() => {
    const acqEPS = acqNetIncome / acqShares;
    const tgtEPS = tgtNetIncome / tgtShares;

    // Deal metrics
    const offerPrice = tgtPrice * (1 + premium / 100);
    const totalDealValue = offerPrice * tgtShares;
    const cashPortion = totalDealValue * (cashPercent / 100);
    const equityPortion = totalDealValue - cashPortion;

    // Exchange Ratio (shares of acq per share of target) for equity portion
    const exchangeRatio = offerPrice / acqPrice;
    
    // New shares issued
    // If equityPortion is 50%, then we only issue shares for 50% of target shares
    const newSharesIssued = (equityPortion / acqPrice);

    // Financing cost (After tax interest on new debt)
    const newInterestExp = cashPortion * (costOfDebt / 100) * (1 - taxRate / 100);

    // Pro Forma Combined
    const pfNetIncome = acqNetIncome + tgtNetIncome + synergies - newInterestExp;
    const pfShares = acqShares + newSharesIssued;
    const pfEPS = pfNetIncome / pfShares;

    const epsAccretion = pfEPS - acqEPS;
    const epsAccretionPct = (epsAccretion / acqEPS) * 100;

    // Bridge Data (Impact on EPS)
    // 1. Base Acquirer EPS
    // 2. Target Earnings Impact = (Tgt NI) / pfShares
    // 3. Synergies Impact = Synergies / pfShares
    // 4. Interest Expense Impact = -newInterestExp / pfShares
    // 5. Dilution Impact = The difference needed to balance (or mathematically driven)
    
    // Better bridge math:
    const targetEarningsImpact = tgtNetIncome / acqShares; // naive accretion
    const synergiesImpact = synergies / acqShares;
    const interestImpact = -newInterestExp / acqShares;
    // Dilution impact is the negative effect of a higher share denominator
    const totalBeforeDilution = acqEPS + targetEarningsImpact + synergiesImpact + interestImpact;
    const dilutionImpact = pfEPS - totalBeforeDilution;

    const bridgeData = [
      { name: isAr ? "ربحية السهم الأساسية" : "Standalone EPS", value: acqEPS, type: "base" },
      { name: isAr ? "أرباح المستهدف" : "Target Earnings", value: targetEarningsImpact, type: "pos" },
      { name: isAr ? "تآزر التكاليف" : "Synergies", value: synergiesImpact, type: "pos" },
      { name: isAr ? "تكلفة التمويل" : "Financing Cost", value: interestImpact, type: "neg" },
      { name: isAr ? "أثر التخفيف (الإصدار)" : "Share Dilution", value: dilutionImpact, type: "neg" },
      { name: isAr ? "ربحية السهم بعد الاندماج" : "Pro Forma EPS", value: pfEPS, type: "total" }
    ];

    return { acqEPS, pfEPS, epsAccretion, epsAccretionPct, offerPrice, totalDealValue, newSharesIssued, bridgeData };
  }, [acqNetIncome, acqShares, acqPrice, tgtNetIncome, tgtShares, tgtPrice, premium, cashPercent, costOfDebt, taxRate, synergies, isAr]);

  const isAccretive = results.epsAccretion >= 0;

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="max-w-7xl mx-auto space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <Handshake className="text-emerald" size={24} />
        <div>
          <h2 className="font-mono text-xl font-extrabold text-slate-900 uppercase">
            {isAr ? "تحليل الاندماج والاستحواذ (EPS)" : "Merger Accretion / Dilution"}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {isAr ? "تقييم أثر الصفقات على ربحية السهم والتخفيف" : "Pro forma EPS impact and synergy bridge"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS - 5 COLS */}
        <div className="lg:col-span-5 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Acquirer */}
            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
                {isAr ? "الشركة المستحوذة" : "Acquirer (Base)"}
              </h3>
              <InputGroup label={isAr ? "صافي الدخل" : "Net Income"} value={acqNetIncome} onChange={setAcqNetIncome} prefix="$M" />
              <InputGroup label={isAr ? "الأسهم القائمة" : "Shares Out"} value={acqShares} onChange={setAcqShares} suffix="M" />
              <InputGroup label={isAr ? "سعر السهم" : "Share Price"} value={acqPrice} onChange={setAcqPrice} prefix="$" step={0.5} />
            </div>
            
            {/* Target */}
            <div className="bg-white p-4 rounded-lg border border-[#E2E8F0] shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
                {isAr ? "الشركة المستهدفة" : "Target"}
              </h3>
              <InputGroup label={isAr ? "صافي الدخل" : "Net Income"} value={tgtNetIncome} onChange={setTgtNetIncome} prefix="$M" />
              <InputGroup label={isAr ? "الأسهم القائمة" : "Shares Out"} value={tgtShares} onChange={setTgtShares} suffix="M" />
              <InputGroup label={isAr ? "سعر السهم" : "Share Price"} value={tgtPrice} onChange={setTgtPrice} prefix="$" step={0.5} />
            </div>
          </div>

          {/* Deal Structure */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
              {isAr ? "هيكل الصفقة" : "Deal Structure & Financing"}
            </h3>
            <InputGroup label={isAr ? "علاوة الاستحواذ" : "Offer Premium"} value={premium} onChange={setPremium} suffix="%" />
            <InputGroup label={isAr ? "نسبة النقد/الدين" : "% Funded by Cash/Debt"} value={cashPercent} onChange={(v) => setCashPercent(Math.min(100, Math.max(0, v)))} suffix="%" />
            <InputGroup label={isAr ? "تكلفة الدين (للاستحواذ)" : "Cost of New Debt"} value={costOfDebt} onChange={setCostOfDebt} suffix="%" step={0.1} />
            <InputGroup label={isAr ? "معدل الضريبة" : "Tax Rate"} value={taxRate} onChange={setTaxRate} suffix="%" step={0.5} />
            <InputGroup label={isAr ? "تآزر التكاليف (بعد الضريبة)" : "Post-Tax Synergies"} value={synergies} onChange={setSynergies} prefix="$M" />
          </div>
        </div>

        {/* OUTPUTS - 7 COLS */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-6 rounded-lg shadow-lg flex flex-col items-center justify-center text-center text-white ${isAccretive ? 'bg-emerald' : 'bg-rose-500'}`}>
              <span className="block text-xs font-mono uppercase mb-1 opacity-80">
                {isAr ? "الأثر على ربحية السهم" : "EPS Impact"}
              </span>
              <span className="font-mono text-4xl font-extrabold tracking-tight">
                {isAccretive ? "+" : ""}{results.epsAccretionPct.toFixed(2)}%
              </span>
              <span className="mt-2 text-sm font-bold bg-white/20 px-3 py-1 rounded-full uppercase">
                {isAccretive ? (isAr ? "نمو (Accretive)" : "Accretive") : (isAr ? "تخفيف (Dilutive)" : "Dilutive")}
              </span>
            </div>
            
            <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg flex flex-col justify-center space-y-3">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono opacity-70">{isAr ? "سعر العرض للمستهدف" : "Target Offer Price"}</span>
                <span className="font-mono font-bold">${results.offerPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono opacity-70">{isAr ? "حجم الصفقة الإجمالي" : "Total Deal Value"}</span>
                <span className="font-mono font-bold">${results.totalDealValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}M</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-mono opacity-70">{isAr ? "ربحية السهم (الأساسية)" : "Standalone EPS"}</span>
                <span className="font-mono font-bold">${results.acqEPS.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs font-mono opacity-70">{isAr ? "ربحية السهم (الاندماج)" : "Pro Forma EPS"}</span>
                <span className="font-mono font-bold">${results.pfEPS.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <ChartWrapper title={isAr ? "تحليل أثر مكونات الاندماج على الربحية" : "EPS Impact Bridge"} isAr={isAr}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results.bridgeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} tickFormatter={(val) => `$${val.toFixed(2)}`} domain={['auto', 'auto']} />
                <ReTooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ fontFamily: 'monospace', fontSize: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`$${val.toFixed(2)}`, "Impact/EPS"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                  {results.bridgeData.map((entry, index) => {
                    let color = "#94a3b8"; // default/base
                    if (entry.type === "pos") color = "#10b981";
                    else if (entry.type === "neg") color = "#f43f5e";
                    else if (entry.type === "total") color = "#0f172a";
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      </div>
    </motion.div>
  );
}

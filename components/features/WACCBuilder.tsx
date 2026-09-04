"use client";

import React, { useState, useMemo } from "react";
import { Calculator, PieChart, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import InputGroup from "@/components/shared/InputGroup";
import ChartWrapper from "@/components/shared/ChartWrapper";
import { panelReveal } from "@/lib/motion";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip, Legend } from "recharts";

export default function WACCBuilder() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";

  // CAPM Inputs
  const [riskFreeRate, setRiskFreeRate] = useState(4.5);
  const [equityBeta, setEquityBeta] = useState(1.1);
  const [erp, setErp] = useState(5.5); // Equity Risk Premium
  
  // Debt Inputs
  const [costOfDebt, setCostOfDebt] = useState(6.0);
  const [taxRate, setTaxRate] = useState(20);
  
  // Weights (assuming Equity Weight + Debt Weight = 100%)
  const [debtWeight, setDebtWeight] = useState(30);
  const equityWeight = 100 - debtWeight;

  const results = useMemo(() => {
    // CAPM -> Cost of Equity
    const ke = riskFreeRate + (equityBeta * erp);
    
    // Cost of Debt (After Tax)
    const kdAfterTax = costOfDebt * (1 - (taxRate / 100));
    
    // WACC
    const wacc = (ke * (equityWeight / 100)) + (kdAfterTax * (debtWeight / 100));
    
    return { ke, kdAfterTax, wacc };
  }, [riskFreeRate, equityBeta, erp, costOfDebt, taxRate, equityWeight, debtWeight]);

  const pieData = [
    { name: isAr ? "الملكية (الأسهم)" : "Equity", value: equityWeight, color: "#10b981" },
    { name: isAr ? "الدين" : "Debt", value: debtWeight, color: "#94a3b8" }
  ];

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <Activity className="text-emerald" size={24} />
        <div>
          <h2 className="font-mono text-xl font-extrabold text-slate-900 uppercase">
            {isAr ? "باني تكلفة رأس المال (WACC/CAPM)" : "WACC & CAPM Builder"}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {isAr ? "تحليل مكونات تكلفة التمويل" : "Cost of capital breakdown and optimization"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* INPUTS - 8 COLS */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Equity Panel */}
          <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
              {isAr ? "تكلفة الملكية (CAPM)" : "Cost of Equity (CAPM)"}
            </h3>
            <InputGroup label={isAr ? "المعدل الخالي من المخاطر" : "Risk-Free Rate (Rf)"} value={riskFreeRate} onChange={setRiskFreeRate} suffix="%" step={0.1} />
            <InputGroup label={isAr ? "معامل بيتا" : "Equity Beta (β)"} value={equityBeta} onChange={setEquityBeta} step={0.05} />
            <InputGroup label={isAr ? "علاوة مخاطر السوق" : "Equity Risk Premium (ERP)"} value={erp} onChange={setErp} suffix="%" step={0.1} />
            
            <div className="mt-4 p-3 bg-slate-50 border border-[#E2E8F0] rounded flex justify-between items-center">
              <span className="font-bold text-xs text-slate-600 font-mono">{isAr ? "تكلفة الملكية المحسوبة" : "Implied Ke"}</span>
              <span className="font-bold text-emerald font-mono">{results.ke.toFixed(2)}%</span>
            </div>
          </div>

          {/* Debt & Weights Panel */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
                {isAr ? "تكلفة الدين" : "Cost of Debt"}
              </h3>
              <InputGroup label={isAr ? "تكلفة الدين (قبل الضريبة)" : "Cost of Debt (Pre-tax)"} value={costOfDebt} onChange={setCostOfDebt} suffix="%" step={0.1} />
              <InputGroup label={isAr ? "معدل الضريبة/الزكاة" : "Effective Tax Rate"} value={taxRate} onChange={setTaxRate} suffix="%" step={0.5} />
              
              <div className="mt-4 p-3 bg-slate-50 border border-[#E2E8F0] rounded flex justify-between items-center">
                <span className="font-bold text-xs text-slate-600 font-mono">{isAr ? "تكلفة الدين (بعد الضريبة)" : "Implied Kd (After-tax)"}</span>
                <span className="font-bold text-slate-700 font-mono">{results.kdAfterTax.toFixed(2)}%</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
                {isAr ? "الهيكل الرأسمالي المستهدف" : "Target Capital Structure"}
              </h3>
              <InputGroup label={isAr ? "وزن الدين" : "Debt Weight (Wd)"} value={debtWeight} onChange={(v) => setDebtWeight(Math.min(100, Math.max(0, v)))} suffix="%" step={1} />
              <div className="flex justify-between items-center bg-[#F8FAFC] p-2.5 rounded border border-[#E2E8F0]">
                <span className="text-slate-600 font-bold text-xs font-sans">{isAr ? "وزن الملكية" : "Equity Weight (We)"}</span>
                <span className="font-bold text-xs font-mono text-slate-900">{equityWeight}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* OUTPUTS & CHART - 4 COLS */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg flex flex-col items-center justify-center min-h-[160px] text-center">
            <span className="block text-xs text-slate-400 font-mono uppercase mb-2">
              {isAr ? "المتوسط المرجح لتكلفة رأس المال" : "Weighted Average Cost of Capital"}
            </span>
            <span className="font-mono text-5xl font-extrabold text-emerald tracking-tight">
              {results.wacc.toFixed(2)}%
            </span>
          </div>

          <ChartWrapper title={isAr ? "هيكل رأس المال" : "Capital Structure Breakdown"} isAr={isAr}>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ReTooltip 
                  formatter={(value: number) => [`${value}%`, isAr ? "الوزن" : "Weight"]}
                  contentStyle={{ fontFamily: 'monospace', fontSize: '12px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px' }}/>
              </RePieChart>
            </ResponsiveContainer>
          </ChartWrapper>
        </div>
      </div>
    </motion.div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import InputGroup from "@/components/shared/InputGroup";
import ChartWrapper from "@/components/shared/ChartWrapper";
import { panelReveal } from "@/lib/motion";

// Math utilities
function computeNPV(rate: number, initialInvestment: number, cashFlows: number[]) {
  let npv = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    npv += cashFlows[i] / Math.pow(1 + rate, i + 1);
  }
  return npv;
}

function computeIRR(initialInvestment: number, cashFlows: number[], guess = 0.1) {
  const maxIter = 1000;
  const tol = 1e-6;
  let rate = guess;
  for (let i = 0; i < maxIter; i++) {
    const npv = computeNPV(rate, initialInvestment, cashFlows);
    if (Math.abs(npv) < tol) return rate;
    
    // Derivative of NPV with respect to rate
    let deriv = 0;
    for (let j = 0; j < cashFlows.length; j++) {
      deriv -= ((j + 1) * cashFlows[j]) / Math.pow(1 + rate, j + 2);
    }
    if (deriv === 0) break;
    const newRate = rate - npv / deriv;
    if (Math.abs(newRate - rate) < tol) return newRate;
    rate = newRate;
  }
  return null; // Did not converge
}

function computePayback(initialInvestment: number, cashFlows: number[]) {
  let cumulative = -initialInvestment;
  for (let i = 0; i < cashFlows.length; i++) {
    cumulative += cashFlows[i];
    if (cumulative >= 0) {
      // Linear interpolation for fractional year
      const prevCumulative = cumulative - cashFlows[i];
      return i + Math.abs(prevCumulative / cashFlows[i]);
    }
  }
  return null;
}

export default function QuickNPV() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";

  const [initialInvestment, setInitialInvestment] = useState(100000);
  const [discountRate, setDiscountRate] = useState(10);
  const [cashFlows, setCashFlows] = useState<number[]>([25000, 30000, 35000, 40000, 45000]);

  const addYear = () => setCashFlows([...cashFlows, 0]);
  const removeYear = (index: number) => {
    if (cashFlows.length <= 1) return;
    const newCF = [...cashFlows];
    newCF.splice(index, 1);
    setCashFlows(newCF);
  };

  const updateCF = (index: number, val: number) => {
    const newCF = [...cashFlows];
    newCF[index] = val;
    setCashFlows(newCF);
  };

  const results = useMemo(() => {
    const npv = computeNPV(discountRate / 100, initialInvestment, cashFlows);
    const irr = computeIRR(initialInvestment, cashFlows);
    const payback = computePayback(initialInvestment, cashFlows);
    return { npv, irr, payback };
  }, [initialInvestment, discountRate, cashFlows]);

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="text-emerald" size={24} />
        <div>
          <h2 className="font-mono text-xl font-extrabold text-slate-900 uppercase">
            {isAr ? "حاسبة القيمة الحالية (NPV / IRR)" : "Standalone NPV / IRR Calculator"}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {isAr ? "تحليل سريع للتدفقات النقدية" : "Lightweight cash flow series analysis"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="panel-input p-5 space-y-4">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
              {isAr ? "معلمات الاستثمار" : "Investment Parameters"}
            </h3>
            <InputGroup
              label={isAr ? "الاستثمار الأولي" : "Initial Investment (Yr 0)"}
              value={initialInvestment}
              onChange={setInitialInvestment}
              prefix={currency}
            />
            <InputGroup
              label={isAr ? "معدل الخصم" : "Discount Rate"}
              value={discountRate}
              onChange={setDiscountRate}
              suffix="%"
              step={0.1}
            />
          </div>

          <div className="panel-result text-white p-5 space-y-4">
            <h3 className="font-bold font-mono text-xs uppercase text-slate-400">
              {isAr ? "النتائج المباشرة" : "Live Results"}
            </h3>
            
            <div>
              <span className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                {isAr ? "القيمة الحالية الصافية (NPV)" : "Net Present Value (NPV)"}
              </span>
              <span className={`font-mono text-2xl font-bold ${results.npv >= 0 ? "text-emerald" : "text-rose-400"}`}>
                {currency} {results.npv.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                {isAr ? "معدل العائد الداخلي (IRR)" : "Internal Rate of Return (IRR)"}
              </span>
              <span className="font-mono text-xl font-bold">
                {results.irr !== null ? `${(results.irr * 100).toFixed(2)}%` : "N/A"}
              </span>
            </div>

            <div>
              <span className="block text-[10px] text-slate-400 font-mono uppercase mb-1">
                {isAr ? "فترة الاسترداد" : "Payback Period"}
              </span>
              <span className="font-mono text-lg font-bold">
                {results.payback !== null ? `${results.payback.toFixed(2)} Years` : "Does not payback"}
              </span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="panel-input p-5">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="font-bold text-slate-900 font-mono text-xs uppercase">
                {isAr ? "التدفقات النقدية الدورية" : "Periodic Cash Flows"}
              </h3>
              <button 
                onClick={addYear}
                className="flex items-center gap-1 text-xs font-mono font-bold text-emerald hover:text-emerald-dark bg-emerald/10 px-2 py-1 rounded"
              >
                <Plus size={14} /> {isAr ? "إضافة سنة" : "Add Year"}
              </button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {cashFlows.map((cf, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-slate-400 w-16">
                    Year {idx + 1}
                  </span>
                  <div className="flex-1">
                    <InputGroup
                      label=""
                      value={cf}
                      onChange={(val) => updateCF(idx, val)}
                      prefix={currency}
                    />
                  </div>
                  <button 
                    onClick={() => removeYear(idx)}
                    disabled={cashFlows.length <= 1}
                    className="p-2 text-slate-400 hover:text-rose-500 disabled:opacity-30 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

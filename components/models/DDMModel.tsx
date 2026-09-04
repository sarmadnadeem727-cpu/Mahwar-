"use client";

import React, { useState, useMemo } from "react";
import { Calculator, Coins, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import InputGroup from "@/components/shared/InputGroup";
import ChartWrapper from "@/components/shared/ChartWrapper";
import { panelReveal } from "@/lib/motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, Cell } from "recharts";

export default function DDMModel() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";

  // Inputs
  const [currentDPS, setCurrentDPS] = useState(2.50);
  const [costOfEquity, setCostOfEquity] = useState(9.5);
  const [highGrowthRate, setHighGrowthRate] = useState(12.0);
  const [highGrowthYears, setHighGrowthYears] = useState(5);
  const [terminalGrowthRate, setTerminalGrowthRate] = useState(3.0);

  const results = useMemo(() => {
    let presentValueHighGrowth = 0;
    let expectedDPS = currentDPS;
    const bridgeData = [];
    
    // High Growth Stage
    for (let i = 1; i <= highGrowthYears; i++) {
      expectedDPS *= (1 + highGrowthRate / 100);
      const pv = expectedDPS / Math.pow(1 + costOfEquity / 100, i);
      presentValueHighGrowth += pv;
      
      bridgeData.push({
        name: `Year ${i}`,
        value: pv,
        type: 'pv'
      });
    }

    // Terminal Value
    const terminalDPS = expectedDPS * (1 + terminalGrowthRate / 100);
    const terminalValue = terminalDPS / ((costOfEquity / 100) - (terminalGrowthRate / 100));
    const presentValueTerminal = terminalValue / Math.pow(1 + costOfEquity / 100, highGrowthYears);
    
    bridgeData.push({
      name: isAr ? 'القيمة النهائية' : 'Terminal Value',
      value: presentValueTerminal,
      type: 'tv'
    });

    const impliedSharePrice = presentValueHighGrowth + presentValueTerminal;
    
    // Sensitivity Table (Cost of Equity vs Terminal Growth)
    const sensKe = [costOfEquity - 2, costOfEquity - 1, costOfEquity, costOfEquity + 1, costOfEquity + 2];
    const sensTg = [terminalGrowthRate - 1, terminalGrowthRate - 0.5, terminalGrowthRate, terminalGrowthRate + 0.5, terminalGrowthRate + 1];
    
    const sensitivity = sensKe.map(ke => {
      const row: any = { ke: ke.toFixed(1) + '%' };
      sensTg.forEach(tg => {
        let pvHG = 0;
        let expDPS = currentDPS;
        for (let i = 1; i <= highGrowthYears; i++) {
          expDPS *= (1 + highGrowthRate / 100);
          pvHG += expDPS / Math.pow(1 + ke / 100, i);
        }
        const termDPS = expDPS * (1 + tg / 100);
        const tv = termDPS / ((ke / 100) - (tg / 100));
        const pvTV = tv / Math.pow(1 + ke / 100, highGrowthYears);
        row[tg.toFixed(1) + '%'] = pvHG + pvTV;
      });
      return row;
    });

    return { impliedSharePrice, presentValueHighGrowth, presentValueTerminal, bridgeData, sensitivity, sensTg };
  }, [currentDPS, costOfEquity, highGrowthRate, highGrowthYears, terminalGrowthRate, isAr]);

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex items-center gap-3 mb-6">
        <Coins className="text-emerald" size={24} />
        <div>
          <h2 className="font-mono text-xl font-extrabold text-slate-900 uppercase">
            {isAr ? "نموذج خصم التوزيعات (DDM)" : "Dividend Discount Model (DDM)"}
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            {isAr ? "تقييم الشركات الموزعة للأرباح بنموذج متعدد المراحل" : "Multi-stage valuation for dividend-paying equities"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* INPUTS - 4 COLS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="panel-input p-5 space-y-4">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
              {isAr ? "المدخلات الأساسية" : "Model Assumptions"}
            </h3>
            <InputGroup label={isAr ? "توزيعات السهم الحالية (DPS)" : "Current DPS"} value={currentDPS} onChange={setCurrentDPS} prefix={currency} step={0.1} />
            <InputGroup label={isAr ? "تكلفة الملكية (Ke)" : "Cost of Equity (Ke)"} value={costOfEquity} onChange={setCostOfEquity} suffix="%" step={0.1} />
          </div>

          <div className="panel-input p-5 space-y-4">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase border-b pb-2">
              {isAr ? "مراحل النمو" : "Growth Stages"}
            </h3>
            <InputGroup label={isAr ? "معدل النمو العالي" : "High Growth Rate"} value={highGrowthRate} onChange={setHighGrowthRate} suffix="%" step={0.5} />
            <InputGroup label={isAr ? "سنوات النمو العالي" : "High Growth Years"} value={highGrowthYears} onChange={setHighGrowthYears} step={1} min={1} max={20} />
            <InputGroup label={isAr ? "النمو النهائي (Terminal)" : "Terminal Growth Rate"} value={terminalGrowthRate} onChange={setTerminalGrowthRate} suffix="%" step={0.1} />
          </div>
          
          <div className="panel-result text-white p-6 flex flex-col items-center justify-center text-center">
            <span className="block text-xs text-slate-400 font-mono uppercase mb-2">
              {isAr ? "القيمة الضمنية للسهم" : "Implied Share Price"}
            </span>
            <span className="font-mono text-4xl font-extrabold text-emerald tracking-tight">
              {currency} {results.impliedSharePrice.toFixed(2)}
            </span>
          </div>
        </div>

        {/* OUTPUTS & CHARTS - 8 COLS */}
        <div className="lg:col-span-8 space-y-6">
          <ChartWrapper title={isAr ? "جسر القيمة الحالية" : "Value Contribution Bridge"} isAr={isAr}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={results.bridgeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'monospace' }} tickFormatter={(val) => `${currency} ${val}`} />
                <ReTooltip
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ fontFamily: 'monospace', fontSize: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${currency} ${val.toFixed(2)}`, "PV Contribution"]}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={60}>
                  {results.bridgeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.type === 'tv' ? '#0f172a' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Sensitivity Table */}
          <div className="panel-input p-5 overflow-x-auto">
            <h3 className="font-bold text-slate-900 font-mono text-xs uppercase mb-4">
              {isAr ? "جدول الحساسية (تكلفة الملكية مقابل النمو النهائي)" : "Sensitivity Analysis (Ke vs Terminal Growth)"}
            </h3>
            <table className="w-full text-xs font-mono text-right" dir="ltr">
              <thead>
                <tr>
                  <th className="p-2 border-b-2 border-r-2 border-[#E2E8F0] bg-slate-50 text-slate-500 font-bold">Ke \ TG</th>
                  {results.sensTg.map(tg => (
                    <th key={tg} className="p-2 border-b-2 border-[#E2E8F0] bg-slate-50 text-slate-700">{tg.toFixed(1)}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.sensitivity.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="p-2 border-r-2 border-[#E2E8F0] bg-slate-50 text-slate-700 font-bold">{row.ke}</td>
                    {results.sensTg.map(tg => {
                      const val = row[tg.toFixed(1) + '%'];
                      // highlight center cell
                      const isCenter = idx === 2 && tg === terminalGrowthRate;
                      return (
                        <td key={tg} className={`p-2 ${isCenter ? 'bg-emerald/10 text-emerald font-bold' : 'text-slate-600'}`}>
                          {currency} {val.toFixed(2)}
                        </td>
                      );
                    })}
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

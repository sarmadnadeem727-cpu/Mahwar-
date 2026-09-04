"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell 
} from "recharts";
import { Calculator, Download, CheckCircle2, DollarSign, Layers, ArrowUpRight, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

export default function AcquisitionCostCalculator() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  // Inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(1500); // SAR M
  const [assumedDebt, setAssumedDebt] = useState<number>(350); // SAR M
  const [advisoryFeesPct, setAdvisoryFeesPct] = useState<number>(2.5); // %
  const [integrationCosts, setIntegrationCosts] = useState<number>(45); // SAR M
  const [workingCapAdj, setWorkingCapAdj] = useState<number>(20); // SAR M
  const [earnOuts, setEarnOuts] = useState<number>(80); // SAR M
  const [targetEbitda, setTargetEbitda] = useState<number>(180); // SAR M

  const [exporting, setExporting] = useState(false);

  // Calculations
  const advisoryFeesAmount = Number(((purchasePrice * advisoryFeesPct) / 100).toFixed(2));
  const totalEnterpriseCost = Number((purchasePrice + assumedDebt + advisoryFeesAmount + integrationCosts + workingCapAdj + earnOuts).toFixed(2));
  const netCashOutlay = Number((purchasePrice + advisoryFeesAmount + integrationCosts + workingCapAdj).toFixed(2));
  const impliedEvEbitda = targetEbitda > 0 ? Number((totalEnterpriseCost / targetEbitda).toFixed(2)) : 0;
  const headlineEvEbitda = targetEbitda > 0 ? Number(((purchasePrice + assumedDebt) / targetEbitda).toFixed(2)) : 0;

  // Waterfall Chart Data
  const waterfallData = [
    { name: isAr ? "سعر الشراء" : "Purchase Price", amount: purchasePrice, fill: "#0E7C69" },
    { name: isAr ? "الديون المحولة" : "Assumed Debt", amount: assumedDebt, fill: "#22C55E" },
    { name: isAr ? "أتعاب الاستشارة" : "Advisory Fees", amount: advisoryFeesAmount, fill: "#3B82F6" },
    { name: isAr ? "تكاليف الدمج" : "Integration", amount: integrationCosts, fill: "#F59E0B" },
    { name: isAr ? "تسوية رأس المال" : "NWC Adj.", amount: workingCapAdj, fill: "#8B5CF6" },
    { name: isAr ? "المكافآت المؤجلة" : "Earn-outs", amount: earnOuts, fill: "#EC4899" },
  ];

  useEffect(() => {
    updateSessionAnalysis("acquisitionCost", {
      inputs: { purchasePrice, assumedDebt, advisoryFeesPct, integrationCosts, workingCapAdj, earnOuts, targetEbitda },
      outputs: { totalEnterpriseCost, netCashOutlay, impliedEvEbitda, headlineEvEbitda, advisoryFeesAmount },
      computedAt: new Date().toISOString()
    });
  }, [purchasePrice, assumedDebt, advisoryFeesPct, integrationCosts, workingCapAdj, earnOuts, targetEbitda]);

  const exportPDF = async () => {
    const el = document.getElementById("acquisition-cost-pdf-area");
    if (!el) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(el, { scale: 1.8, backgroundColor: "#FFFFFF" });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, (canvas.height * 210) / canvas.width);
      pdf.save(`MAHWAR_MA_ACQUISITION_COST_REPORT.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-slate-800"
      dir={isAr ? "rtl" : "ltr"}
      id="acquisition-cost-pdf-area"
    >
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-surface-border shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-lg bg-emerald-dim border border-emerald-border text-emerald">
            <Calculator size={24} />
          </div>
          <div>
            <h1 className="font-serif text-xl font-bold text-slate-heading">
              {isAr ? "حاسبة التكلفة الإجمالية للاستحواذ والاندماج (M&A)" : "M&A Total Acquisition Cost Calculator"}
            </h1>
            <p className="text-xs text-slate-muted font-sans font-medium">
              {isAr ? "حساب التكلفة الفعلية الشاملة للاستحواذ متضمنة الديون والأتعاب والدمج والمستحقات" : "Comprehensive true acquisition cost breakdown beyond headline purchase price"}
            </p>
          </div>
        </div>

        <button
          onClick={exportPDF}
          disabled={exporting}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald hover:bg-emerald-light text-white font-mono font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
        >
          <Download size={14} />
          <span>{exporting ? (isAr ? "جاري التصدير..." : "Exporting...") : (isAr ? "تصدير PDF" : "Export M&A PDF")}</span>
        </button>
      </div>

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 bg-emerald-dim rounded-xl border border-emerald-border shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">Total M&A Enterprise Cost</span>
          <span className="text-2xl font-extrabold text-emerald">SAR {totalEnterpriseCost.toLocaleString()}M</span>
          <span className="text-[10px] text-emerald font-bold block mt-1">True Acquisition Burden</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">Implied EV / EBITDA</span>
          <span className="text-2xl font-extrabold text-slate-heading">{impliedEvEbitda}x</span>
          <span className="text-[10px] text-slate-muted block mt-1">Vs {headlineEvEbitda}x Headline</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">Net Cash Outlay</span>
          <span className="text-2xl font-extrabold text-slate-heading">SAR {netCashOutlay.toLocaleString()}M</span>
          <span className="text-[10px] text-slate-muted block mt-1">Cash Required at Closing</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-surface-border shadow-xs">
          <span className="text-[10px] text-slate-muted uppercase font-bold block mb-1">Advisory & Legal Fees</span>
          <span className="text-2xl font-extrabold text-slate-heading">SAR {advisoryFeesAmount}M</span>
          <span className="text-[10px] text-slate-muted block mt-1">{advisoryFeesPct}% of Purchase Price</span>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INPUTS COLUMN */}
        <div className="bg-white p-5 rounded-xl border border-surface-border space-y-4 shadow-xs">
          <h3 className="font-mono text-xs font-bold text-slate-heading uppercase tracking-wider border-b border-surface-border pb-3 flex items-center gap-2">
            <DollarSign size={14} className="text-emerald" />
            <span>{isAr ? "مدخلات الصفحة والصفقة" : "Transaction Inputs"}</span>
          </h3>

          <div className="space-y-3.5 text-xs font-sans">
            <div>
              <label className="text-slate-body font-medium block mb-1">Headline Purchase Price (SAR M)</label>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs font-bold text-slate-heading"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Target Net Debt Assumed (SAR M)</label>
              <input
                type="number"
                value={assumedDebt}
                onChange={(e) => setAssumedDebt(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Advisory & Legal Fees (% of Price)</label>
              <input
                type="number"
                step="0.1"
                value={advisoryFeesPct}
                onChange={(e) => setAdvisoryFeesPct(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Integration & Restructuring (SAR M)</label>
              <input
                type="number"
                value={integrationCosts}
                onChange={(e) => setIntegrationCosts(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Net Working Capital Adjustment (SAR M)</label>
              <input
                type="number"
                value={workingCapAdj}
                onChange={(e) => setWorkingCapAdj(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Earn-outs & Deferred Consideration (SAR M)</label>
              <input
                type="number"
                value={earnOuts}
                onChange={(e) => setEarnOuts(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-slate-body font-medium block mb-1">Target LTM EBITDA (SAR M)</label>
              <input
                type="number"
                value={targetEbitda}
                onChange={(e) => setTargetEbitda(Number(e.target.value))}
                className="w-full px-3 py-2 rounded bg-surface-subtle border border-surface-border font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>

        {/* WATERFALL CHART & BREAKDOWN TABLE */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-xs space-y-4">
            <h3 className="font-serif text-sm font-bold text-slate-heading border-b border-surface-border pb-3">
              {isAr ? "مخطط التكلفة المتراكمة للاستحواذ (Acquisition Cost Stack)" : "Acquisition Cost Component Breakdown Stack"}
            </h3>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={waterfallData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#64748B" fontSize={10} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8F0", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any) => [`SAR ${val}M`, "Amount"]}
                  />
                  <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                    {waterfallData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ITEM SUMMARY TABLE */}
          <div className="bg-white p-5 rounded-xl border border-surface-border shadow-xs">
            <h3 className="font-mono text-xs font-bold text-slate-heading uppercase tracking-wider mb-3">
              {isAr ? "مصفوفة ملخص مكونات الصفقة" : "M&A Deal Component Waterfall Summary"}
            </h3>
            
            <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-surface-border bg-surface-subtle text-slate-muted">
                  <th className="py-2 px-3">Component</th>
                  <th className="py-2 px-3 text-right">Amount (SAR M)</th>
                  <th className="py-2 px-3 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {waterfallData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-surface-subtle">
                    <td className="py-2.5 px-3 font-medium text-slate-heading flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span>{item.name}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">SAR {item.amount.toLocaleString()}M</td>
                    <td className="py-2.5 px-3 text-right text-slate-muted">
                      {((item.amount / totalEnterpriseCost) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-900 bg-emerald-dim font-bold text-emerald">
                  <td className="py-3 px-3">TOTAL ENTERPRISE ACQUISITION COST</td>
                  <td className="py-3 px-3 text-right text-sm">SAR {totalEnterpriseCost.toLocaleString()}M</td>
                  <td className="py-3 px-3 text-right">100.0%</td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

// components/operations/SupplierScorecard.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Trophy, Plus, Trash2 } from "lucide-react";
import { 
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip 
} from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { ScorecardCriterion, SupplierCandidate, AuditData } from "@/lib/operations/types";
import { DEFAULT_CRITERIA, DEFAULT_SUPPLIERS, computeSupplierRankings, generateScorecardAudit } from "@/lib/operations/supplierScorecard";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";

export default function SupplierScorecard() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [criteria, setCriteria] = useState<ScorecardCriterion[]>(DEFAULT_CRITERIA);
  const [suppliers, setSuppliers] = useState<SupplierCandidate[]>(DEFAULT_SUPPLIERS);
  const [scaleMax, setScaleMax] = useState<number>(10);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { rankings, radarData, isWeightValid, totalWeight } = computeSupplierRankings(suppliers, criteria, scaleMax);
  const winner = rankings[0];

  // Sync session state
  useEffect(() => {
    updateSessionAnalysis("supplierScorecard", {
      inputs: { criteria, suppliers, scaleMax },
      outputs: { winnerName: winner?.supplierName, winningScore: winner?.weightedScore },
      computedAt: new Date().toISOString(),
    });
  }, [criteria, suppliers, scaleMax, winner]);

  let validationError = "";
  if (!isWeightValid) {
    validationError = isAr
      ? `أوزان المعايير يجب أن تساوي 100% بالضبط (المجموع الحالي: ${totalWeight}%).`
      : `Criterion weights must sum to exactly 100% (current sum: ${totalWeight}%).`;
  }

  const updateWeight = (critId: string, weight: number) => {
    setCriteria(criteria.map((c) => (c.id === critId ? { ...c, weightPct: weight } : c)));
  };

  const updateCriterionName = (critId: string, name: string) => {
    setCriteria(criteria.map((c) => (c.id === critId ? { ...c, name } : c)));
  };

  const addCriterion = () => {
    const newCrit: ScorecardCriterion = {
      id: `crit-${Date.now()}`,
      name: "Compliance & Sustainability",
      weightPct: 0,
    };
    setCriteria([...criteria, newCrit]);
  };

  const removeCriterion = (critId: string) => {
    if (criteria.length <= 2) return;
    setCriteria(criteria.filter((c) => c.id !== critId));
  };

  const updateScore = (supplierId: string, critId: string, score: number) => {
    setSuppliers(
      suppliers.map((s) =>
        s.id === supplierId
          ? { ...s, scores: { ...s.scores, [critId]: Math.min(scaleMax, Math.max(0, score)) } }
          : s
      )
    );
  };

  const addSupplier = () => {
    if (suppliers.length >= 5) return;
    const nextIdx = suppliers.length + 1;
    const initialScores: Record<string, number> = {};
    criteria.forEach((c) => {
      initialScores[c.id] = scaleMax * 0.7;
    });
    const newSup: SupplierCandidate = {
      id: `sup-${Date.now()}`,
      name: `Supplier ${String.fromCharCode(64 + nextIdx)}`,
      scores: initialScores,
    };
    setSuppliers([...suppliers, newSup]);
  };

  const removeSupplier = (supplierId: string) => {
    if (suppliers.length <= 2) return;
    setSuppliers(suppliers.filter((s) => s.id !== supplierId));
  };

  const handleExportExcel = () => {
    const rows = rankings.map((r) => {
      const rowData: Record<string, any> = {
        Rank: r.rank,
        "Supplier Name": r.supplierName,
        "Weighted Score": r.weightedScore,
        "Percentage Score (%)": r.normalizedScorePct,
      };
      r.criterionBreakdown.forEach((cb) => {
        rowData[cb.criterionName] = cb.rawScore;
      });
      return rowData;
    });
    exportToExcel([{ name: "Supplier Scorecard", data: rows }], "MAHWAR_Supplier_Scorecard_Radar");
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("supplier-scorecard-container", "MAHWAR_Supplier_Scorecard_Radar");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateScorecardAudit(criteria, rankings, scaleMax);

  // Radar chart colors
  const RADAR_COLORS = [T.colors.emerald, T.series[2], T.series[1], T.series[3], T.series[4]];

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="supplier-scorecard-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="COST & SOURCING"
        categoryTagAr="التكاليف والتوريد"
        title="Multi-Criteria Supplier Scorecard & Radar Evaluation"
        titleAr="بطاقة تقييم ومقارنة الموردين متعددة المعايير والمخطط الراداري"
        subtitle="Rank procurement vendors across weighted price, quality, delivery, and financial stability criteria"
        subtitleAr="مقارنة وترتيب الموردين عبر أوزان معايير الأسعار، الجودة، الالتزام بالتسليم والملاءة المالية"
        icon={<Award size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setCriteria(DEFAULT_CRITERIA);
          setSuppliers(DEFAULT_SUPPLIERS);
          setScaleMax(10);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* TOP SUPPLIER BANNER */}
      {winner && (
        <div className="p-4 bg-emerald/10 border border-emerald/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald text-ink-0">
              <Trophy size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-emerald uppercase tracking-wider">
                  {isAr ? "المورد الأعلى تصنيفاً" : "Rank #1 Winning Supplier"}
                </span>
                <span className="label-pill label-pill-emerald text-[9px]">
                  {winner.normalizedScorePct}% COMPOSITE RATING
                </span>
              </div>
              <h3 className="font-serif text-lg font-bold text-fg mt-0.5">
                {winner.supplierName}
              </h3>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-xs text-fg-3 block">Weighted Score:</span>
            <span className="text-2xl font-extrabold text-emerald">
              {winner.weightedScore} <span className="text-xs text-fg-3">/ {scaleMax}</span>
            </span>
          </div>
        </div>
      )}

      {validationError && <InlineError message={validationError} isAr={isAr} />}

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CRITERIA & SCORES INPUT (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="panel-input p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
              <div>
                <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
                  {isAr ? "معايير التقييم والأوزان النسبية" : "Evaluation Criteria & Weights"}
                </h3>
                <span className={`text-[11px] font-mono font-bold ${isWeightValid ? "text-emerald" : "text-neg"}`}>
                  Total Weight: {totalWeight}% / 100%
                </span>
              </div>

              {/* SCALE TOGGLE */}
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-fg-3">Scale:</span>
                <div className="flex rounded border border-line overflow-hidden">
                  <button
                    onClick={() => setScaleMax(5)}
                    className={`px-2 py-0.5 ${scaleMax === 5 ? "bg-emerald text-ink-0 font-bold" : "bg-ink-2 text-fg-2"}`}
                  >
                    1–5
                  </button>
                  <button
                    onClick={() => setScaleMax(10)}
                    className={`px-2 py-0.5 ${scaleMax === 10 ? "bg-emerald text-ink-0 font-bold" : "bg-ink-2 text-fg-2"}`}
                  >
                    1–10
                  </button>
                </div>
              </div>
            </div>

            {/* CRITERIA LIST */}
            <div className="space-y-2.5">
              {criteria.map((crit) => (
                <div key={crit.id} className="p-3 bg-ink-3 rounded-lg border border-line space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={crit.name}
                      onChange={(e) => updateCriterionName(crit.id, e.target.value)}
                      className="flex-1 px-2 py-1 rounded bg-ink-2 border border-line font-sans text-xs font-bold text-fg"
                    />
                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        value={crit.weightPct}
                        onChange={(e) => updateWeight(crit.id, Number(e.target.value))}
                        className="w-16 px-2 py-1 rounded bg-ink-2 border border-line font-mono text-xs font-bold text-right"
                      />
                      <span className="text-xs font-mono text-fg-3">%</span>
                    </div>
                    <button
                      onClick={() => removeCriterion(crit.id)}
                      disabled={criteria.length <= 2}
                      className="text-fg-3 hover:text-neg disabled:opacity-20 p-1 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  {/* VENDOR SCORES FOR THIS CRITERION */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-line">
                    {suppliers.map((sup) => (
                      <div key={sup.id} className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-fg-3 truncate max-w-[80px]" title={sup.name}>
                          {sup.name.split(" ")[0]}:
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          max={scaleMax}
                          value={sup.scores[crit.id] ?? 0}
                          onChange={(e) => updateScore(sup.id, crit.id, Number(e.target.value))}
                          className="w-12 px-1.5 py-0.5 rounded bg-ink-2 border border-line font-bold text-right text-emerald"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={addCriterion}
                className="text-xs font-mono font-bold text-emerald hover:underline flex items-center gap-1"
              >
                <Plus size={13} /> Add Criterion
              </button>

              {suppliers.length < 5 && (
                <button
                  onClick={addSupplier}
                  className="text-xs font-mono font-bold text-fg-2 hover:text-emerald flex items-center gap-1"
                >
                  <Plus size={13} /> Add Supplier
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RADAR SPIDER CHART & LEADERBOARD (6 COLS) */}
        <div className="lg:col-span-6 space-y-6">
          {/* RADAR SPIDER CHART */}
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "المخطط الراداري لمقارنة الموردين عبر المعايير" : "Multi-Criteria Radar Benchmark"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "مقارنة شمولية لقوة وضعف كل مورد في آن واحد" : "Simultaneous multi-attribute visual comparison"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                SPIDER RADAR
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} outerRadius="75%">
                  <PolarGrid stroke="rgba(158,190,180,0.14)" />
                  <PolarAngleAxis dataKey="criterion" stroke={T.colors.slate} fontSize={9} fontFamily="sans-serif" />
                  <PolarRadiusAxis domain={[0, scaleMax]} stroke={T.colors.neutral} fontSize={8} />
                  <Tooltip
                    contentStyle={{ backgroundColor: T.colors.surface, borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                  {suppliers.map((sup, idx) => (
                    <Radar
                      key={sup.id}
                      name={sup.name}
                      dataKey={sup.name}
                      stroke={RADAR_COLORS[idx % RADAR_COLORS.length]}
                      fill={RADAR_COLORS[idx % RADAR_COLORS.length]}
                      fillOpacity={0.25}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RANKING LEADERBOARD TABLE */}
          <div className="panel-data p-5">
            <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider mb-3">
              {isAr ? "جدول الترتيب النهائي للموردين" : "Supplier Final Rankings"}
            </h3>

            <table className="w-full text-xs font-mono text-left rtl:text-right border-collapse">
              <thead>
                <tr className="border-b border-line bg-ink-3 text-fg-3">
                  <th className="py-2 px-3">Rank</th>
                  <th className="py-2 px-3">Supplier</th>
                  <th className="py-2 px-3 text-right">Weighted Score</th>
                  <th className="py-2 px-3 text-right">Performance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rankings.map((r) => (
                  <tr key={r.supplierId} className="hover:bg-ink-3 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-fg">
                      {r.rank === 1 ? (
                        <span className="px-1.5 py-0.5 rounded bg-emerald text-ink-0 text-[10px]">#1 WIN</span>
                      ) : (
                        `#${r.rank}`
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-fg font-sans">{r.supplierName}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald text-sm">
                      {r.weightedScore} <span className="text-[10px] text-fg-3">/ {scaleMax}</span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-fg-2">
                      {r.normalizedScorePct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULA AUDIT MODAL */}
      <FormulaAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        auditData={auditData}
        isAr={isAr}
      />
    </motion.div>
  );
}


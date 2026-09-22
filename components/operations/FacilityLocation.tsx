// components/operations/FacilityLocation.tsx
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import { DemandPoint, CandidateLocation, AuditData } from "@/lib/operations/types";
import { GCC_DEMAND_POINTS_PRESET, computeCenterOfGravity, generateFacilityAudit } from "@/lib/operations/facilityLocation";
import OperationsHeader from "./shared/OperationsHeader";
import FormulaAuditModal from "./shared/FormulaAuditModal";
import InlineError from "./shared/InlineError";
import { exportToExcel, exportToPdf } from "./shared/exportOperations";

const INITIAL_CANDIDATES: CandidateLocation[] = [
  { id: "cand-1", name: "Al-Kharj Industrial Park", x: 47.30, y: 24.15 },
  { id: "cand-2", name: "King Abdullah Port (KAEC)", x: 39.10, y: 22.45 },
  { id: "cand-3", name: "Ras Al Khair Logistics", x: 49.15, y: 27.50 },
];

export default function FacilityLocation() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === "ar";

  const [demandPoints, setDemandPoints] = useState<DemandPoint[]>(GCC_DEMAND_POINTS_PRESET);
  const [candidates, setCandidates] = useState<CandidateLocation[]>(INITIAL_CANDIDATES);

  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const { cgX, cgY, totalVolume, evaluatedCandidates, scatterPoints } = computeCenterOfGravity(
    demandPoints,
    candidates
  );

  // Sync to sessionAnalyses
  useEffect(() => {
    updateSessionAnalysis("facilityLocation", {
      inputs: { demandPoints, candidates },
      outputs: { cgX, cgY, totalVolume },
      computedAt: new Date().toISOString(),
    });
  }, [demandPoints, candidates, cgX, cgY, totalVolume]);

  const updatePoint = (id: string, field: keyof DemandPoint, val: any) => {
    setDemandPoints(
      demandPoints.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const addPoint = () => {
    const nextIdx = demandPoints.length + 1;
    const newP: DemandPoint = {
      id: `dp-${Date.now()}`,
      name: `Demand City ${nextIdx}`,
      x: 48.0,
      y: 25.0,
      volume: 15000,
    };
    setDemandPoints([...demandPoints, newP]);
  };

  const removePoint = (id: string) => {
    if (demandPoints.length <= 2) return;
    setDemandPoints(demandPoints.filter((p) => p.id !== id));
  };

  const addCandidate = () => {
    if (candidates.length >= 4) return;
    const nextIdx = candidates.length + 1;
    const newCand: CandidateLocation = {
      id: `cand-${Date.now()}`,
      name: `Candidate Site ${nextIdx}`,
      x: cgX,
      y: cgY,
    };
    setCandidates([...candidates, newCand]);
  };

  const removeCandidate = (id: string) => {
    setCandidates(candidates.filter((c) => c.id !== id));
  };

  const handleExportExcel = () => {
    const dpRows = demandPoints.map((p) => ({
      "City / Demand Node": p.name,
      "X Coord (Lon)": p.x,
      "Y Coord (Lat)": p.y,
      "Demand Volume (Tons/Shipments)": p.volume,
    }));

    const candRows = evaluatedCandidates.map((c) => ({
      Rank: c.rank,
      "Candidate Site": c.name,
      "X Coord": c.x,
      "Y Coord": c.y,
      "Total Weighted Load Distance": c.totalWeightedDistance,
    }));

    exportToExcel(
      [
        { name: "Demand Nodes", data: dpRows },
        { name: "Candidate Rankings", data: candRows },
      ],
      "MAHWAR_Center_of_Gravity_Facility_Location"
    );
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    await exportToPdf("facility-location-container", "MAHWAR_Center_of_Gravity_Facility_Location");
    setIsExportingPdf(false);
  };

  const auditData: AuditData = generateFacilityAudit(demandPoints, cgX, cgY, totalVolume);

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 font-sans text-fg"
      dir={isAr ? "rtl" : "ltr"}
      id="facility-location-container"
    >
      {/* UNIFIED HEADER */}
      <OperationsHeader
        categoryTag="NETWORK & LOGISTICS"
        categoryTagAr="الشبكة اللوجستية"
        title="Facility Location — Center of Gravity Model"
        titleAr="تحديد موقع المنشأة والمستودع — نموذج مركز الثقل الجغرافي"
        subtitle="Identify optimal regional distribution hub coordinates minimizing total freight ton-mileage"
        subtitleAr="تحديد الموقع الجغرافي الأمثل لمركز التوزيع الإقليمي الذي يقلل تكاليف ومسافات الشحن الإجمالية"
        icon={<MapPin size={24} />}
        onOpenAudit={() => setIsAuditOpen(true)}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        onSaveSession={() => {}}
        onResetDefaults={() => {
          setDemandPoints(GCC_DEMAND_POINTS_PRESET);
          setCandidates(INITIAL_CANDIDATES);
        }}
        isExportingPdf={isExportingPdf}
        isAr={isAr}
      />

      {/* KPI HIGHLIGHT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* OPTIMAL COORDINATES */}
        <div className="p-4 rounded-xl border border-emerald/30 bg-emerald/10 shadow-xs">
          <span className="text-[10px] text-emerald uppercase font-bold block mb-1">
            {isAr ? "مركز الثقل الأمثل المحسوب" : "Calculated Center of Gravity"}
          </span>
          <div className="text-xl font-extrabold text-emerald">
            X: {cgX} | Y: {cgY}
          </div>
          <span className="text-[10px] text-emerald font-sans font-medium block mt-1">
            Minimizes regional delivery ton-kilometers
          </span>
        </div>

        {/* TOTAL VOLUME */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "إجمالي حجم الطلب الموزع" : "Aggregate Demand Volume"}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-fg">{totalVolume.toLocaleString()}</span>
            <span className="text-xs font-bold text-fg-3">Tons</span>
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Across {demandPoints.length} demand hubs
          </span>
        </div>

        {/* BEST REAL CANDIDATE */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "الموقع المرشح الأفضل (#1)" : "Top Ranked Candidate Site"}
          </span>
          <div className="text-sm font-extrabold text-fg truncate">
            {evaluatedCandidates[0]?.name || "None Evaluated"}
          </div>
          <span className="text-[10px] text-emerald font-bold block mt-1">
            Score: {evaluatedCandidates[0]?.totalWeightedDistance?.toLocaleString()} load-dist
          </span>
        </div>

        {/* NETWORK BALANCE */}
        <div className="p-4 rounded-xl border border-line bg-ink-2 shadow-xs">
          <span className="text-[10px] text-fg-3 uppercase font-bold block mb-1">
            {isAr ? "نطاق الشبكة" : "Network Extent"}
          </span>
          <div className="text-sm font-extrabold text-fg">
            GCC Regional Scale
          </div>
          <span className="text-[10px] text-fg-3 font-sans font-medium block mt-1">
            Compatible with Lat/Lon or relative grids
          </span>
        </div>
      </div>

      {/* WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* DEMAND POINTS & CANDIDATES TABLE (6 COLS) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="panel-input p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-mono text-xs font-bold text-fg uppercase tracking-wider">
                  {isAr ? "نقاط الطلب الإقليمية والأوزان" : "Regional Demand Points & Freight Volumes"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans">
                  {isAr ? "إحداثيات جغرافية مع حجم الاستهلاك السنوي" : "X/Y coordinates weighted by freight demand"}
                </p>
              </div>
              <button
                onClick={addPoint}
                className="text-xs font-mono font-bold text-emerald hover:underline flex items-center gap-1"
              >
                <Plus size={13} /> Add Node
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {demandPoints.map((dp) => (
                <div key={dp.id} className="p-2.5 bg-ink-3 rounded-lg border border-line text-xs font-mono flex items-center gap-2">
                  <input
                    type="text"
                    value={dp.name}
                    onChange={(e) => updatePoint(dp.id, "name", e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-ink-2 border border-line font-sans font-medium"
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-fg-3">X:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={dp.x}
                      onChange={(e) => updatePoint(dp.id, "x", Number(e.target.value))}
                      className="w-16 px-1.5 py-1 rounded bg-ink-2 border border-line text-right"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-fg-3">Y:</span>
                    <input
                      type="number"
                      step="0.01"
                      value={dp.y}
                      onChange={(e) => updatePoint(dp.id, "y", Number(e.target.value))}
                      className="w-16 px-1.5 py-1 rounded bg-ink-2 border border-line text-right"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-fg-3">Vol:</span>
                    <input
                      type="number"
                      value={dp.volume}
                      onChange={(e) => updatePoint(dp.id, "volume", Number(e.target.value))}
                      className="w-20 px-1.5 py-1 rounded bg-ink-2 border border-line font-bold text-right text-emerald"
                    />
                  </div>
                  <button
                    onClick={() => removePoint(dp.id)}
                    disabled={demandPoints.length <= 2}
                    className="text-fg-3 hover:text-neg disabled:opacity-20 p-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* CANDIDATES EVALUATION */}
            <div className="pt-3 border-t border-line space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-bold text-fg text-xs">
                  {isAr ? "مواقع المنشآت المرشحة للمقارنة" : "Candidate Real Sites Evaluated:"}
                </span>
                {candidates.length < 4 && (
                  <button
                    onClick={addCandidate}
                    className="text-[11px] font-mono text-emerald hover:underline flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Add Candidate
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {evaluatedCandidates.map((cand) => (
                  <div key={cand.id} className="p-2 rounded bg-ink-2 border border-line flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-emerald text-ink-0 text-[9px] font-bold">
                        #{cand.rank}
                      </span>
                      <span className="font-medium font-sans text-fg">{cand.name}</span>
                      <span className="text-[10px] text-fg-3">({cand.x}, {cand.y})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald text-[11px]">
                        Dist: {cand.totalWeightedDistance?.toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeCandidate(cand.id)}
                        className="text-fg-3 hover:text-neg p-0.5"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 2D SCATTER PLOT COLUMN (6 COLS) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="panel-data p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-line pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-fg">
                  {isAr ? "خريطة التوزيع الجغرافي ومركز الثقل" : "2D Geographic Scatter Map & Gravity Center"}
                </h3>
                <p className="text-[11px] text-fg-3 font-sans font-medium">
                  {isAr ? "حجم الدوائر يتناسب مع حجم الطلب، والنجمة الخضراء تمثل المركز الأمثل" : "Bubble sizes proportional to freight demand; emerald crosshair marks optimal hub"}
                </p>
              </div>
              <span className="label-pill label-pill-emerald text-[10px]">
                2D SCATTER
              </span>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(158,190,180,0.14)" />
                  <XAxis
                    type="number"
                    dataKey="x"
                    name="X (Lon)"
                    stroke="#a7b9b2"
                    fontSize={10}
                    fontFamily="monospace"
                    domain={['auto', 'auto']}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    name="Y (Lat)"
                    stroke="#a7b9b2"
                    fontSize={10}
                    fontFamily="monospace"
                    domain={['auto', 'auto']}
                  />
                  <ZAxis type="number" dataKey="volume" range={[60, 450]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: "#0e161a", borderColor: "rgba(158,190,180,0.14)", borderRadius: "8px", fontSize: "11px" }}
                    formatter={(val: any, name: any) => [val, name]}
                  />
                  <Scatter name="Demand Nodes" data={demandPoints} fill="#3B82F6" opacity={0.7} />
                  {/* Mark the Center of Gravity as a distinct scatter point */}
                  <Scatter
                    name="Optimal Center of Gravity"
                    data={[{ name: "Optimal Hub", x: cgX, y: cgY, volume: 300 }]}
                    fill="#17a88a"
                    shape="cross"
                  />
                  {/* Candidate sites */}
                  {candidates.length > 0 && (
                    <Scatter
                      name="Candidate Sites"
                      data={candidates}
                      fill="#F59E0B"
                      shape="diamond"
                    />
                  )}
                  <Legend wrapperStyle={{ fontSize: "10px", fontFamily: "monospace" }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-ink-3 rounded-lg border border-line text-xs text-fg-2 font-sans leading-relaxed">
              <span className="font-bold text-fg block mb-0.5">
                {isAr ? "ملاحظة نموذج التوزيع" : "Logistics Optimization Note:"}
              </span>
              {isAr
                ? `النقطة الجغرافية المحسوبة (${cgX}, ${cgY}) تمثل المركز المرجح بحجم البضائع. اختيار أقرب موقع حقيقي مثل (${evaluatedCandidates[0]?.name}) يوفر تكاليف النقل الإقليمية بنسبة قصوى.`
                : `The computed center of gravity (${cgX}, ${cgY}) balances the physical mass of regional supply. Selecting the nearest candidate (${evaluatedCandidates[0]?.name}) minimizes cumulative fleet ton-kilometers.`}
            </div>
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


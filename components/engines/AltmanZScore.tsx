"use client";
import React, { useMemo, useState } from "react";
import { HeartPulse } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import EngineShell, { Field, Select, Kpis, Card, fmt, pct } from "./EngineShell";
import AppleGauge from "@/components/ui/AppleGauge";
import { computeZ, type ZInputs } from "@/lib/finance/zscore";
import { TERMINAL_CHART_THEME as T } from "@/lib/chartTheme";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";
import { mapToAltmanZInputs, type LinkedSecurity } from "@/lib/market/engineBridge";

import { Upload, FileText, CheckCircle2 } from "lucide-react";
import DocumentIngestionModal from "@/components/shared/DocumentIngestionModal";
import ProvenanceBadge from "@/components/shared/ProvenanceBadge";

const DEFAULTS: ZInputs = { model: "public", workingCapital: 420, retainedEarnings: 1_180, ebit: 610, equityValue: 5_400, totalLiabilities: 2_900, sales: 4_200, totalAssets: 6_100 };

export default function AltmanZScore() {
  const { language, currency, activeSecurity, sessionValues } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<ZInputs>(() => {
    if (activeSecurity) {
      return mapToAltmanZInputs(activeSecurity);
    }
    return DEFAULTS;
  });
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  const set = <K extends keyof ZInputs>(k: K, v: ZInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeZ(i), [i]);
  useSessionSave("zscore", i, { z: o.z, zone: o.zone, impliedPd: o.impliedPd });

  const handleSyncSecurity = (sec: LinkedSecurity) => {
    setI(mapToAltmanZInputs(sec));
  };

  const handleApplyDocument = (data: Record<string, number>, fileName: string) => {
    setUploadedFile(fileName);
    setI((prev) => ({
      ...prev,
      workingCapital: data.workingCapital ?? prev.workingCapital,
      retainedEarnings: data.retainedEarnings ?? prev.retainedEarnings,
      ebit: data.ebit ?? prev.ebit,
      equityValue: data.equityValue ?? data.equity ?? prev.equityValue,
      totalLiabilities: data.totalLiabilities ?? prev.totalLiabilities,
      sales: data.revenue ?? prev.sales,
      totalAssets: data.totalAssets ?? prev.totalAssets,
    }));
  };

  const zoneLabel = { safe: isAr ? "منطقة آمنة" : "Safe zone", grey: isAr ? "منطقة رمادية" : "Grey zone", distress: isAr ? "منطقة خطر" : "Distress zone" }[o.zone];
  const accent = { safe: "emerald", grey: "warn", distress: "neg" }[o.zone] as "emerald" | "warn" | "neg";
  const gauge = Math.max(0, Math.min(1, o.z / (o.thresholds.safe * 1.6)));

  const auditSteps = [
    ...(uploadedFile
      ? [
          {
            title: isAr ? "مصدر البيانات" : "Data Provenance",
            formula: "populated from uploaded statement",
            substitution: uploadedFile,
            result: isAr ? "تمت المراجعة والاعتماد" : "User-reviewed",
          },
        ]
      : []),
    ...o.components.map((c) => ({
      title: c.name,
      formula: `${c.weight} × ratio`,
      substitution: `${c.weight} × ${c.ratio.toFixed(3)}`,
      result: c.contribution.toFixed(3),
    })),
    {
      title: "Z-score",
      formula: "Σ contributions",
      substitution: o.components.map((c) => c.contribution.toFixed(2)).join(" + "),
      result: o.z.toFixed(2),
    },
  ];

  return (
    <>
      <DocumentIngestionModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        targetEngine="zscore"
        onApply={handleApplyDocument}
      />
      <EngineShell
        id="zscore"
        icon={<HeartPulse size={22} />}
        onReset={() => {
          setI(DEFAULTS);
          setUploadedFile(null);
        }}
        onSyncSecurity={handleSyncSecurity}
        audit={{
          toolName: "Altman Z-score",
          toolNameAr: "مؤشر ألتمان Z",
          summary: uploadedFile
            ? `populated from uploaded statement: ${uploadedFile} · Z = Σ wᵢ × ratioᵢ`
            : "Z = Σ wᵢ × ratioᵢ using the coefficient set for the chosen firm type.",
          summaryAr: uploadedFile
            ? `مستخرجة من القائمة المالية: ${uploadedFile} · Z = مجموع الأوزان × النسب`
            : "Z = مجموع الأوزان × النسب حسب نوع الشركة.",
          steps: auditSteps,
        }}
        exportRows={[{ Metric: "Z-score", Value: o.z }, { Metric: "Zone", Value: o.zone }, { Metric: "Implied 1y PD %", Value: o.impliedPd * 100 }, ...(uploadedFile ? [{ Metric: "Source Document", Value: uploadedFile }] : []), ...o.components.map((c) => ({ Metric: c.name, Ratio: c.ratio, Weight: c.weight, Value: c.contribution }))]}
        inputs={<>
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-line">
            <span className="font-mono text-[10px] text-fg-3 uppercase">
              {isAr ? "الاستيراد الذكي" : "Smart Ingestion"}
            </span>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald/10 border border-emerald/30 text-emerald-light hover:bg-emerald/20 transition-colors text-[11px] font-mono font-bold"
            >
              <Upload size={12} />
              <span>{isAr ? "رفع القوائم (PDF/صورة)" : "Upload Statement (PDF/Image)"}</span>
            </button>
          </div>

          {uploadedFile && (
            <div className="p-2 mb-3 rounded border border-emerald/40 bg-emerald/10 text-emerald-light text-xs font-mono flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 size={13} className="shrink-0" />
                <span className="truncate">
                  {isAr ? `مستخرج من: ${uploadedFile}` : `Extracted: ${uploadedFile}`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setUploadedFile(null)}
                className="text-fg-4 hover:text-fg text-[10px] underline ms-2"
              >
                {isAr ? "مسح" : "Clear"}
              </button>
            </div>
          )}

          {!uploadedFile && sessionValues["working-capital"] && (
            <ProvenanceBadge
              engineId="wc_financing"
              metricLabelEn="Working Capital"
              metricLabelAr="رأس المال العامل"
              originalValue={sessionValues["working-capital"].value.toLocaleString()}
              unit={currency}
              isModified={i.workingCapital !== sessionValues["working-capital"].value}
              onReset={() => set("workingCapital", sessionValues["working-capital"]!.value)}
              className="mb-2"
            />
          )}

          <Select label={isAr ? "نوع الشركة" : "Firm type"} value={i.model} onChange={(v) => set("model", v)} options={[{ value: "public", label: isAr ? "مدرجة صناعية (Z)" : "Public manufacturer (Z)" }, { value: "private", label: isAr ? "خاصة صناعية (Z')" : "Private manufacturer (Z′)" }, { value: "nonmfg", label: isAr ? "غير صناعية / ناشئة (Z'')" : "Non-manufacturer / EM (Z″)" }]} />
          <Field label={isAr ? "رأس المال العامل" : "Working capital"} value={i.workingCapital} onChange={(v) => set("workingCapital", v)} suffix={currency} />
          <Field label={isAr ? "الأرباح المبقاة" : "Retained earnings"} value={i.retainedEarnings} onChange={(v) => set("retainedEarnings", v)} suffix={currency} />
          <Field label="EBIT" value={i.ebit} onChange={(v) => set("ebit", v)} suffix={currency} />
          <Field label={i.model === "public" ? (isAr ? "القيمة السوقية لحقوق الملكية" : "Market value of equity") : (isAr ? "القيمة الدفترية لحقوق الملكية" : "Book equity")} value={i.equityValue} onChange={(v) => set("equityValue", v)} suffix={currency} />
          <Field label={isAr ? "إجمالي الالتزامات" : "Total liabilities"} value={i.totalLiabilities} onChange={(v) => set("totalLiabilities", v)} suffix={currency} />
          {i.model !== "nonmfg" && <Field label={isAr ? "المبيعات" : "Sales"} value={i.sales} onChange={(v) => set("sales", v)} suffix={currency} />}
          <Field label={isAr ? "إجمالي الأصول" : "Total assets"} value={i.totalAssets} onChange={(v) => set("totalAssets", v)} suffix={currency} />
        </>}>
      <Kpis items={[
        { label: "Z-score", value: o.z.toFixed(2), accent, sub: zoneLabel },
        { label: isAr ? "احتمال التعثر (سنة)" : "Implied 1-yr default prob.", value: pct(o.impliedPd * 100), accent: o.impliedPd > 0.15 ? "neg" : o.impliedPd > 0.05 ? "warn" : "emerald" },
        { label: isAr ? "حد الخطر" : "Distress cutoff", value: o.thresholds.distress.toFixed(2) },
        { label: isAr ? "حد الأمان" : "Safe cutoff", value: o.thresholds.safe.toFixed(2), accent: "gold" },
      ]} />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
        <div className="md:col-span-4 flex">
          <AppleGauge
            value={o.z}
            min={0}
            max={+(o.thresholds.safe * 1.6).toFixed(1)}
            thresholds={{ safe: o.thresholds.safe, warn: o.thresholds.distress }}
            title="Altman Z-Score"
            subtitle={zoneLabel}
            statusLabel={o.zone.toUpperCase()}
            size={120}
            className="w-full h-full justify-between"
          />
        </div>
        <div className="md:col-span-8 flex flex-col justify-center">
          <Card title={isAr ? "الموضع على المقياس" : "Position on the scale"}>
            <div className="relative h-3 rounded-full overflow-hidden bg-ink-4">
              <div className="absolute inset-y-0 left-0 bg-neg/70" style={{ width: `${(o.thresholds.distress / (o.thresholds.safe * 1.6)) * 100}%` }} />
              <div className="absolute inset-y-0 bg-warn/60" style={{ left: `${(o.thresholds.distress / (o.thresholds.safe * 1.6)) * 100}%`, width: `${((o.thresholds.safe - o.thresholds.distress) / (o.thresholds.safe * 1.6)) * 100}%` }} />
              <div className="absolute inset-y-0 right-0 bg-emerald/70" style={{ left: `${(o.thresholds.safe / (o.thresholds.safe * 1.6)) * 100}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-fg border-2 border-ink-0 shadow-[0_0_14px_var(--emerald-light)] transition-all duration-500" style={{ left: `${gauge * 100}%` }} />
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-fg-4"><span>0</span><span>{o.thresholds.distress}</span><span>{o.thresholds.safe}</span><span>{(o.thresholds.safe * 1.6).toFixed(1)}+</span></div>
          </Card>
        </div>
      </div>
      <Card title={isAr ? "مساهمة كل نسبة" : "Contribution by ratio"}>
        <div className="h-56">
          <ResponsiveContainer>
            <BarChart data={o.components.map((c) => ({ name: c.name.split(" / ")[0], v: c.contribution }))} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
              <CartesianGrid {...T.grid} />
              <XAxis dataKey="name" {...T.axis} interval={0} tick={{ fontSize: 9 }} />
              <YAxis {...T.axis} />
              <Tooltip contentStyle={T.tooltipStyle} labelStyle={T.tooltipLabelStyle} formatter={(v: number) => fmt(v, 3)} />
              <Bar dataKey="v" radius={[3, 3, 0, 0]}>{o.components.map((c, k) => <Cell key={k} fill={c.contribution >= 0 ? T.colors.emerald : T.colors.negative} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </EngineShell>
    </>
  );
}

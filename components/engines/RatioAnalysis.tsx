"use client";
import React, { useMemo, useState } from "react";
import { Gauge } from "lucide-react";
import EngineShell, { Field, Kpis, Card, fmt, pct } from "./EngineShell";
import { computeRatios, type RatioInputs, type Ratio } from "@/lib/finance/ratios";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";

const DEFAULTS: RatioInputs = {
  revenue: 4_200, cogs: 2_730, opex: 690, depreciation: 210, interestExpense: 95, taxExpense: 62, netIncome: 390,
  cash: 380, receivables: 610, inventory: 520, currentAssets: 1_640, totalAssets: 6_100,
  currentLiabilities: 1_120, totalDebt: 1_530, totalLiabilities: 2_900, equity: 3_200, payables: 470,
  operatingCashFlow: 560, capex: 260, sharesOutstanding: 500, price: 16.4,
};
const GROUPS: { id: Ratio["group"]; en: string; ar: string }[] = [
  { id: "liquidity", en: "Liquidity", ar: "السيولة" }, { id: "leverage", en: "Leverage & coverage", ar: "الرفع والتغطية" },
  { id: "efficiency", en: "Efficiency", ar: "الكفاءة" }, { id: "profitability", en: "Profitability", ar: "الربحية" }, { id: "market", en: "Market", ar: "السوق" },
];
const STATUS = { good: "bg-pos", watch: "bg-warn", weak: "bg-neg" };

export default function RatioAnalysis() {
  const { language, currency } = useTerminalStore();
  const isAr = language === "ar";
  const [i, setI] = useState<RatioInputs>(DEFAULTS);
  const set = <K extends keyof RatioInputs>(k: K, v: RatioInputs[K]) => setI((p) => ({ ...p, [k]: v }));
  const o = useMemo(() => computeRatios(i), [i]);
  useSessionSave("ratios", i, { score: o.score, roe: o.dupont.roe * 100, netDebtEbitda: o.ratios.find((r) => r.key === "ndebitda")?.value, currentRatio: o.ratios.find((r) => r.key === "current")?.value });
  const show = (r: Ratio) => (r.unit === "%" ? pct(r.value) : r.unit === "days" ? `${fmt(r.value, 0)} d` : `${fmt(r.value, 2)}x`);
  const f = (k: keyof RatioInputs, en: string, ar: string, suffix: string = currency) => <Field key={k} label={isAr ? ar : en} value={i[k]} onChange={(v) => set(k, v)} suffix={suffix} />;

  return (
    <EngineShell id="ratios" icon={<Gauge size={22} />} onReset={() => setI(DEFAULTS)}
      audit={{
        toolName: "Ratio analysis", toolNameAr: "تحليل النسب المالية",
        summary: "Twenty standard ratios from the income statement, balance sheet and cash flow; DuPont splits ROE into margin × turnover × leverage.", summaryAr: "عشرون نسبة قياسية من القوائم الثلاث؛ ديبونت يفكك العائد على حقوق الملكية.",
        steps: [
          { title: "EBITDA", formula: "Revenue − COGS − Opex", substitution: `${i.revenue} − ${i.cogs} − ${i.opex}`, result: fmt(o.ebitda) },
          { title: "Net margin", formula: "NI / Revenue", substitution: `${i.netIncome} / ${i.revenue}`, result: pct(o.dupont.netMargin * 100, 2) },
          { title: "Asset turnover", formula: "Revenue / Total assets", substitution: `${i.revenue} / ${i.totalAssets}`, result: fmt(o.dupont.assetTurnover, 3) },
          { title: "Equity multiplier", formula: "Total assets / Equity", substitution: `${i.totalAssets} / ${i.equity}`, result: fmt(o.dupont.leverage, 3) },
          { title: "ROE (DuPont)", formula: "margin × turnover × multiplier", substitution: `${(o.dupont.netMargin * 100).toFixed(2)}% × ${o.dupont.assetTurnover.toFixed(3)} × ${o.dupont.leverage.toFixed(3)}`, result: pct(o.dupont.roe * 100, 2) },
        ],
      }}
      exportRows={[{ Metric: "Health score", Value: o.score }, ...o.ratios.map((r) => ({ Metric: r.label, Value: r.value, Unit: r.unit, Status: r.status }))]}
      inputs={<>
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-1">{isAr ? "قائمة الدخل" : "Income statement"}</div>
        {f("revenue", "Revenue", "الإيرادات")}{f("cogs", "COGS", "تكلفة المبيعات")}{f("opex", "Operating expenses", "المصاريف التشغيلية")}{f("depreciation", "D&A", "الإهلاك")}{f("interestExpense", "Interest expense", "مصروف الفائدة")}{f("netIncome", "Net income", "صافي الدخل")}
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "الميزانية" : "Balance sheet"}</div>
        {f("cash", "Cash", "النقد")}{f("receivables", "Receivables", "الذمم المدينة")}{f("inventory", "Inventory", "المخزون")}{f("currentAssets", "Current assets", "الأصول المتداولة")}{f("totalAssets", "Total assets", "إجمالي الأصول")}{f("payables", "Payables", "الذمم الدائنة")}{f("currentLiabilities", "Current liabilities", "الالتزامات المتداولة")}{f("totalDebt", "Total debt", "إجمالي الدين")}{f("totalLiabilities", "Total liabilities", "إجمالي الالتزامات")}{f("equity", "Equity", "حقوق الملكية")}
        <div className="font-mono text-[10px] text-fg-4 uppercase tracking-wider pt-2 border-t border-line">{isAr ? "التدفق والسوق" : "Cash flow & market"}</div>
        {f("operatingCashFlow", "Operating cash flow", "التدفق التشغيلي")}{f("capex", "Capex", "الإنفاق الرأسمالي")}{f("sharesOutstanding", "Shares (m)", "الأسهم (م)", "")}{f("price", "Share price", "سعر السهم")}
      </>}>
      <Kpis items={[
        { label: isAr ? "مؤشر الصحة المالية" : "Financial health", value: `${fmt(o.score)} / 100`, accent: o.score >= 66 ? "emerald" : o.score >= 40 ? "warn" : "neg" },
        { label: "ROE (DuPont)", value: pct(o.dupont.roe * 100), accent: "gold" },
        { label: "EBITDA", value: fmt(o.ebitda), sub: currency },
        { label: isAr ? "التدفق النقدي الحر" : "Free cash flow", value: fmt(o.fcf), sub: currency, accent: o.fcf < 0 ? "neg" : undefined },
      ]} />
      <Card title={isAr ? "تفكيك ديبونت" : "DuPont decomposition"}>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[12px]">
          {[{ l: isAr ? "هامش صافي" : "Net margin", v: pct(o.dupont.netMargin * 100, 2) }, { l: "×", v: "" }, { l: isAr ? "دوران الأصول" : "Asset turnover", v: fmt(o.dupont.assetTurnover, 3) }, { l: "×", v: "" }, { l: isAr ? "مضاعف حقوق الملكية" : "Equity multiplier", v: fmt(o.dupont.leverage, 3) }, { l: "=", v: "" }, { l: "ROE", v: pct(o.dupont.roe * 100, 2) }].map((x, k) =>
            x.v ? <span key={k} className={`panel-data px-3 py-2 ${x.l === "ROE" ? "border-emerald-border text-emerald-light" : ""}`}><span className="text-fg-3 text-[10px] block">{x.l}</span>{x.v}</span> : <span key={k} className="text-fg-3">{x.l}</span>
          )}
        </div>
      </Card>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {GROUPS.map((g) => (
          <Card key={g.id} title={isAr ? g.ar : g.en}>
            <ul className="divide-y divide-line">
              {o.ratios.filter((r) => r.group === g.id).map((r) => (
                <li key={r.key} className="py-2 flex items-center gap-3">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS[r.status]}`} />
                  <span className="flex-1 text-[12.5px] text-fg-2 min-w-0 truncate">{r.label}</span>
                  <span className="font-mono text-[10px] text-fg-4 hidden sm:inline">{r.unit === "%" ? `${r.band[0]}–${r.band[1]}%` : r.unit === "days" ? `${r.band[0]}–${r.band[1]}d` : `${r.band[0]}–${r.band[1]}x`}</span>
                  <span className={`font-mono text-[13px] num w-20 text-end ${r.status === "weak" ? "text-neg" : r.status === "watch" ? "text-warn" : "text-fg"}`}>{show(r)}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </EngineShell>
  );
}

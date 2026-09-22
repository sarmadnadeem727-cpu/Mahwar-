/**
 * lib/signals.ts — cross-engine signals.
 * Reads every saved analysis in the session and raises flags that a
 * finance or operations lead would want to see on one screen.
 */
import type { PanelType, SessionAnalyses } from "@/store/useTerminalStore";
import { TOOLS } from "@/lib/registry";

export type Signal = {
  id: string;
  panel: PanelType;
  /** Engine code, filled in from the registry for display. */
  code?: string;
  tone: "neg" | "warn" | "ok";
  en: string;
  ar: string;
  value: string;
};

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const out = (s: SessionAnalyses, k: keyof SessionAnalyses): any => (s[k] as { outputs?: unknown } | undefined)?.outputs ?? null;

export function computeSignals(s: SessionAnalyses): Signal[] {
  const sig: Signal[] = [];
  const push = (x: Signal) => sig.push(x);

  const ccc = out(s, "ccc");
  const cccDays = num(ccc?.ccc);
  if (cccDays !== null) {
    if (cccDays > 60) push({ id: "ccc-long", panel: "ccc", tone: "neg", value: `${cccDays.toFixed(0)}d`, en: "Cash conversion cycle is long — cash is trapped in working capital", ar: "دورة التحويل النقدي طويلة — النقد محتجز في رأس المال العامل" });
    else if (cccDays < 0) push({ id: "ccc-neg", panel: "ccc", tone: "ok", value: `${cccDays.toFixed(0)}d`, en: "Negative cash cycle — suppliers are financing operations", ar: "دورة نقدية سالبة — الموردون يمولون العمليات" });
  }

  const z = out(s, "zscore");
  if (z?.zone === "distress") push({ id: "z-distress", panel: "zscore", tone: "neg", value: `Z ${num(z.z)?.toFixed(2)}`, en: "Altman Z in the distress zone", ar: "مؤشر ألتمان في منطقة التعثر" });
  else if (z?.zone === "grey") push({ id: "z-grey", panel: "zscore", tone: "warn", value: `Z ${num(z.z)?.toFixed(2)}`, en: "Altman Z in the grey zone — monitor leverage", ar: "مؤشر ألتمان في المنطقة الرمادية — راقب الرافعة" });

  const c13 = out(s, "cash13");
  const gap = num(c13?.unfundedGap);
  if (gap !== null && gap > 0) push({ id: "c13-gap", panel: "cash13", tone: "neg", value: gap.toLocaleString("en-US", { maximumFractionDigits: 0 }), en: `Unfunded cash gap in week ${c13?.minCashWeek ?? "?"} of the 13-week forecast`, ar: `فجوة نقدية غير ممولة في الأسبوع ${c13?.minCashWeek ?? "?"} من توقعات الـ13 أسبوعاً` });
  else if (num(c13?.peakRevolver) !== null && (c13.peakRevolver as number) > 0) push({ id: "c13-rev", panel: "cash13", tone: "warn", value: (c13.peakRevolver as number).toLocaleString("en-US", { maximumFractionDigits: 0 }), en: "Revolver draw needed to hold the minimum cash balance", ar: "سحب من التسهيل الدوار مطلوب للحفاظ على الحد الأدنى من النقد" });

  const r = out(s, "ratios");
  const score = num(r?.score);
  if (score !== null) {
    if (score < 45) push({ id: "ratio-weak", panel: "ratios", tone: "neg", value: `${score.toFixed(0)}/100`, en: "Ratio health score is weak", ar: "درجة صحة النسب المالية ضعيفة" });
    else if (score >= 75) push({ id: "ratio-good", panel: "ratios", tone: "ok", value: `${score.toFixed(0)}/100`, en: "Ratio health score is strong", ar: "درجة صحة النسب المالية قوية" });
  }

  const flow = out(s, "flow");
  const oee = num(flow?.oee);
  if (oee !== null && oee < 0.6) push({ id: "oee-low", panel: "flow", tone: "neg", value: `OEE ${(oee * 100).toFixed(0)}%`, en: "OEE below 60% — availability, speed or quality losses are large", ar: "الفعالية الكلية للمعدات أقل من 60% — خسائر كبيرة في التوافر أو السرعة أو الجودة" });
  if (flow?.bottleneck) push({ id: "flow-bn", panel: "flow", tone: "warn", value: `${num(flow.utilisationPct)?.toFixed(0)}%`, en: "Line is a bottleneck — cycle time exceeds takt", ar: "الخط عنق زجاجة — زمن الدورة يتجاوز التاكت" });

  const sr = out(s, "supplierRisk");
  if (sr?.hhiLabel === "concentrated") push({ id: "sr-hhi", panel: "supplier_risk", tone: "neg", value: `HHI ${num(sr.hhi)?.toFixed(0)}`, en: "Supplier spend is concentrated — single points of failure", ar: "إنفاق الموردين مركّز — نقاط فشل مفردة" });
  const ssp = num(sr?.singleSourcePct);
  if (ssp !== null && ssp > 30) push({ id: "sr-single", panel: "supplier_risk", tone: "warn", value: `${ssp.toFixed(0)}%`, en: "Large share of spend is single-sourced", ar: "حصة كبيرة من الإنفاق من مصدر واحد" });

  const dcf = out(s, "dcf");
  const upside = num(dcf?.upsidePct ?? dcf?.upside);
  if (upside !== null) push({ id: "dcf-up", panel: "DCF", tone: upside >= 0 ? "ok" : "warn", value: `${upside.toFixed(1)}%`, en: upside >= 0 ? "DCF implies upside to the current price" : "DCF implies the current price is rich", ar: upside >= 0 ? "التدفقات المخصومة تشير إلى مجال صعودي" : "التدفقات المخصومة تشير إلى أن السعر مرتفع" });

  const bw = out(s, "bullwhip");
  const amp = num(bw?.endToEndAmplification);
  if (amp !== null && amp > 2) push({ id: "bw", panel: "bullwhip", tone: "warn", value: `×${amp.toFixed(1)}`, en: "Order variance amplifies more than 2× upstream", ar: "تضخم تباين الطلبات يتجاوز الضعف صعوداً في السلسلة" });

  const cr = out(s, "capitalRationing");
  const left = num(cr?.budgetLeft); const used = num(cr?.budgetUsed);
  if (left !== null && used !== null && left + used > 0 && left / (left + used) > 0.2) push({ id: "cr-idle", panel: "capital_rationing", tone: "warn", value: `${((left / (left + used)) * 100).toFixed(0)}%`, en: "A fifth of the capital budget is unallocated", ar: "خُمس ميزانية رأس المال غير مخصص" });

  const fx = out(s, "fxHedge");
  const cost = num(fx?.hedgeCostPct);
  if (cost !== null && Math.abs(cost) > 3) push({ id: "fx-cost", panel: "fx_hedge", tone: "warn", value: `${cost.toFixed(2)}%`, en: "Hedging cost exceeds 3% of the exposure", ar: "تكلفة التحوط تتجاوز 3% من التعرض" });

  const order = { neg: 0, warn: 1, ok: 2 };
  return sig
    .map((x) => ({ ...x, code: TOOLS.find((t) => t.id === x.panel)?.code }))
    .sort((a, b) => order[a.tone] - order[b.tone]);
}

export const deriveSignals = computeSignals;

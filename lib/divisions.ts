/**
 * lib/divisions.ts — the two halves of Mahwar and where they meet.
 *
 * A division is a reader-facing grouping of engines: Finance and Supply chain.
 * Both read from the registry, so adding an engine there adds it here. The
 * "axis" is the working-capital cluster, which belongs to both.
 */
import { Landmark, Ship, type LucideIcon } from "lucide-react";
import { CLUSTERS, CLUSTER_ORDER, ENGINES, TOOL_MAP, type Cluster, type ToolDef } from "@/lib/registry";
import type { PanelType } from "@/store/useTerminalStore";

export type DivisionId = "finance" | "supply-chain";

export interface RoadmapItem { en: string; ar: string; status: "next" | "planned" }

export interface Division {
  id: DivisionId;
  code: string;
  en: string;
  ar: string;
  /** One line under the name. */
  leadEn: string;
  leadAr: string;
  /** The paragraph that explains who this half is for. */
  bodyEn: string;
  bodyAr: string;
  icon: LucideIcon;
  /** Colour token used for this division's accents. */
  accent: "emerald" | "navy";
  /** Clusters shown on the division page, in order. */
  clusters: (keyof typeof CLUSTERS)[];
  /** Engines highlighted at the top of the division page. */
  flagships: PanelType[];
  /** Panels that open the division's home in the terminal. */
  entry: PanelType;
  /** Where this half goes next — the updates we move to after this release. */
  roadmap: RoadmapItem[];
}

export const DIVISIONS: Division[] = [
  {
    id: "finance",
    code: "FIN",
    en: "Finance",
    ar: "المالية",
    leadEn: "Valuation, deals, statements, debt and markets for GCC capital.",
    leadAr: "التقييم والصفقات والقوائم والدين والأسواق لرأس المال الخليجي.",
    bodyEn: "Every model an analyst, a corporate-finance team or a sukuk desk reaches for, with Zakat-aware WACC, AAOIFI screening and a live GCC stock screener in the same window. Each engine keeps an audited formula trail and exports to PDF or Excel.",
    bodyAr: "كل نموذج يحتاجه المحلل أو فريق التمويل أو مكتب الصكوك، مع تكلفة رأس مال مراعية للزكاة وفحص أيوفي وفاحص أسهم خليجي مباشر في النافذة نفسها. لكل محرك سجل صيغ مدقّق ويصدّر إلى PDF أو Excel.",
    icon: Landmark,
    accent: "emerald",
    clusters: ["markets", "valuation", "deals", "statements", "debt", "research"],
    flagships: ["screener", "DCF", "LBO", "sukuk"],
    entry: "screener",
    roadmap: [
      { en: "Live fundamentals from the market-data provider feeding DCF, comps and DDM defaults", ar: "أساسيات مباشرة من مزود البيانات تغذي القيم الافتراضية لـ DCF والمماثلة وخصم التوزيعات", status: "next" },
      { en: "Watchlists and price alerts on the screener", ar: "قوائم متابعة وتنبيهات أسعار في الفاحص", status: "next" },
      { en: "Sukuk yield curves by issuer and tenor", ar: "منحنيات عائد الصكوك حسب المُصدر والأجل", status: "planned" },
      { en: "Portfolio view: saved valuations against live prices", ar: "عرض المحفظة: التقييمات المحفوظة مقابل الأسعار المباشرة", status: "planned" },
    ],
  },
  {
    id: "supply-chain",
    code: "OPS",
    en: "Supply chain",
    ar: "سلاسل الإمداد",
    leadEn: "Inventory, planning, sourcing and Gulf logistics, costed to the riyal.",
    leadAr: "المخزون والتخطيط والتوريد واللوجستيات الخليجية، محسوبة حتى الريال.",
    bodyEn: "From an order quantity to a corridor across the Gulf: EOQ and safety stock, S&OP and MRP, landed cost and TCO, supplier risk, warehouse capacity and a real map of the region's ports and rail. Every output lands in the same currency the finance engines use.",
    bodyAr: "من حجم الطلب إلى ممر عبر الخليج: حجم الطلب الاقتصادي ومخزون الأمان وS&OP وMRP والتكلفة الواصلة وTCO ومخاطر الموردين وسعة المستودعات وخريطة حقيقية لموانئ المنطقة وسككها. كل مخرج يستقر بالعملة نفسها التي تستخدمها المحركات المالية.",
    icon: Ship,
    accent: "navy",
    clusters: ["inventory", "planning", "cost", "network"],
    flagships: ["eoq", "network_map", "landed_cost", "mrp"],
    entry: "operations_hub",
    roadmap: [
      { en: "Live freight and container indices on the corridor planner", ar: "مؤشرات شحن وحاويات مباشرة في مخطط الممرات", status: "next" },
      { en: "Port congestion and Hormuz / Red Sea disruption flags from the wire", ar: "تنبيهات ازدحام الموانئ واضطرابات هرمز والبحر الأحمر من الأخبار", status: "next" },
      { en: "Multi-echelon inventory optimisation across a hub network", ar: "تحسين المخزون متعدد المستويات عبر شبكة مراكز", status: "planned" },
      { en: "Carbon ledger per corridor for CBAM-style reporting", ar: "سجل كربون لكل ممر لتقارير على نمط CBAM", status: "planned" },
    ],
  },
];

export const DIVISION_MAP: Record<DivisionId, Division> = Object.fromEntries(DIVISIONS.map((d) => [d.id, d])) as Record<DivisionId, Division>;

export function isDivisionId(v: string): v is DivisionId {
  return v in DIVISION_MAP;
}

/** Engines of a division grouped by its clusters, in the division's order. */
export function divisionClusters(d: Division): { cluster: Cluster; tools: ToolDef[] }[] {
  return d.clusters
    .map((id) => ({ cluster: CLUSTERS[id], tools: ENGINES.filter((t) => t.cluster === id) }))
    .filter((g) => g.tools.length > 0);
}

export function divisionEngines(d: Division): ToolDef[] {
  return divisionClusters(d).flatMap((g) => g.tools);
}

export function divisionFlagships(d: Division): ToolDef[] {
  return d.flagships.map((id) => TOOL_MAP[id]).filter(Boolean);
}

/** The axis: engines that both halves share — working capital ties goods to cash. */
export const AXIS_CLUSTER: keyof typeof CLUSTERS = "working_capital";
export function axisEngines(): ToolDef[] {
  return CLUSTER_ORDER.includes(AXIS_CLUSTER) ? ENGINES.filter((t) => t.cluster === AXIS_CLUSTER) : [];
}

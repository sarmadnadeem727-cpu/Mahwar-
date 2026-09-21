// lib/operations/supplierScorecard.ts
import { ScorecardCriterion, SupplierCandidate, SupplierRankResult, AuditData } from './types';

export const DEFAULT_CRITERIA: ScorecardCriterion[] = [
  { id: "c1", name: "Price Competitiveness", nameAr: "تنافسية الأسعار", weightPct: 30 },
  { id: "c2", name: "Quality & Defect Rate", nameAr: "الجودة ونسبة العيوب", weightPct: 25 },
  { id: "c3", name: "On-Time Delivery Reliability", nameAr: "الالتزام بمواعيد التسليم", weightPct: 20 },
  { id: "c4", name: "Financial Stability", nameAr: "الاستقرار المالي للمورد", weightPct: 15 },
  { id: "c5", name: "Customer Service & Speed", nameAr: "سرعة الاستجابة وخدمة العملاء", weightPct: 10 },
];

export const DEFAULT_SUPPLIERS: SupplierCandidate[] = [
  {
    id: "sup-1",
    name: "Al-Fanar Industrial Supply",
    scores: { c1: 8.5, c2: 9.0, c3: 8.0, c4: 8.5, c5: 7.5 },
  },
  {
    id: "sup-2",
    name: "Red Sea Logistics & Trade",
    scores: { c1: 9.5, c2: 7.0, c3: 7.5, c4: 7.0, c5: 8.0 },
  },
  {
    id: "sup-3",
    name: "Gulf Global Procurement Corp",
    scores: { c1: 7.0, c2: 9.5, c3: 9.5, c4: 9.0, c5: 9.0 },
  },
];

export function computeSupplierRankings(
  suppliers: SupplierCandidate[],
  criteria: ScorecardCriterion[],
  scaleMax = 10
): {
  rankings: SupplierRankResult[];
  radarData: { criterion: string; [supplierName: string]: any }[];
  isWeightValid: boolean;
  totalWeight: number;
} {
  const totalWeight = criteria.reduce((acc, c) => acc + (c.weightPct || 0), 0);
  const isWeightValid = Math.abs(totalWeight - 100) < 0.01;

  const rankings: SupplierRankResult[] = suppliers.map((sup) => {
    let weightedScore = 0;
    const criterionBreakdown = criteria.map((crit) => {
      const rawScore = sup.scores[crit.id] ?? 0;
      const weightedContribution = (rawScore * (crit.weightPct || 0)) / 100;
      weightedScore += weightedContribution;
      return {
        criterionName: crit.name,
        rawScore,
        weightedContribution: Number(weightedContribution.toFixed(2)),
      };
    });

    const normalizedScorePct = scaleMax > 0 ? (weightedScore / scaleMax) * 100 : 0;

    return {
      supplierId: sup.id,
      supplierName: sup.name,
      weightedScore: Number(weightedScore.toFixed(2)),
      normalizedScorePct: Number(normalizedScorePct.toFixed(1)),
      rank: 1, // updated after sorting
      criterionBreakdown,
    };
  });

  // Sort descending by weighted score
  rankings.sort((a, b) => b.weightedScore - a.weightedScore);
  rankings.forEach((r, idx) => {
    r.rank = idx + 1;
  });

  // Transform for Recharts RadarChart: array of criteria with a key per supplier
  const radarData = criteria.map((crit) => {
    const row: any = { criterion: crit.name, fullMark: scaleMax };
    suppliers.forEach((sup) => {
      row[sup.name] = sup.scores[crit.id] ?? 0;
    });
    return row;
  });

  return {
    rankings,
    radarData,
    isWeightValid,
    totalWeight: Number(totalWeight.toFixed(1)),
  };
}

export function generateScorecardAudit(criteria: ScorecardCriterion[], rankings: SupplierRankResult[], scaleMax: number): AuditData {
  const topSupplier = rankings[0];
  return {
    toolName: "Supplier Multi-Criteria Scorecard",
    toolNameAr: "بطاقة تقييم ومقارنة الموردين متعددة المعايير",
    summary: `Structured multi-attribute evaluation ranking suppliers across weighted commercial, technical, and reliability dimensions.`,
    summaryAr: `تقييم منهجي مرجح لاختيار وترتيب الموردين الأفضل بناءً على الجودة والأسعار والموثوقية والخدمة.`,
    steps: [
      {
        title: "1. Weighted Scoring Formulation",
        formula: "Weighted Score = Σ (Criterion Score_i × Criterion Weight %_i)",
        substitution: `Evaluated across ${criteria.length} criteria (Scale 1 to ${scaleMax})`,
        result: `Weights Sum: 100%`,
        explanation: "Normalizes different evaluation factors into an objective composite rating.",
      },
      {
        title: "2. Top Ranked Supplier",
        formula: "Rank 1 = argmax(Weighted Score)",
        substitution: `${topSupplier?.supplierName || "N/A"}: Score ${topSupplier?.weightedScore}/${scaleMax} (${topSupplier?.normalizedScorePct}%)`,
        result: `Winner: ${topSupplier?.supplierName || "N/A"}`,
        explanation: "Achieves the best balance across price, quality standards, and fulfillment timeliness.",
      },
    ],
  };
}


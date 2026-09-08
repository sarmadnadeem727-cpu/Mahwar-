// lib/operations/facilityLocation.ts
import { DemandPoint, CandidateLocation, AuditData } from './types';

export const GCC_DEMAND_POINTS_PRESET: DemandPoint[] = [
  { id: "dp-1", name: "Riyadh (Central Hub)", x: 46.72, y: 24.69, volume: 45000 },
  { id: "dp-2", name: "Jeddah (Western Gateway)", x: 39.17, y: 21.54, volume: 32000 },
  { id: "dp-3", name: "Dammam / Khobar (Eastern)", x: 50.10, y: 26.42, volume: 28000 },
  { id: "dp-4", name: "Dubai (JAFZA Logistics)", x: 55.27, y: 25.20, volume: 35000 },
  { id: "dp-5", name: "Abu Dhabi (Industrial City)", x: 54.37, y: 24.45, volume: 22000 },
  { id: "dp-6", name: "Doha (Hamad Port Hub)", x: 51.53, y: 25.28, volume: 18000 },
  { id: "dp-7", name: "Kuwait City (Shuwaikh)", x: 47.98, y: 29.37, volume: 20000 },
  { id: "dp-8", name: "Muscat (Sultan Qaboos)", x: 58.40, y: 23.58, volume: 14000 },
  { id: "dp-9", name: "Manama (Bahrain Logistics)", x: 50.58, y: 26.22, volume: 12000 },
];

export function computeCenterOfGravity(
  demandPoints: DemandPoint[],
  candidates: CandidateLocation[] = []
): {
  cgX: number;
  cgY: number;
  totalVolume: number;
  evaluatedCandidates: CandidateLocation[];
  scatterPoints: {
    name: string;
    x: number;
    y: number;
    volume: number;
    type: 'demand' | 'cg' | 'candidate';
  }[];
} {
  const totalVolume = demandPoints.reduce((acc, p) => acc + (p.volume || 0), 0);

  let sumWeightedX = 0;
  let sumWeightedY = 0;

  demandPoints.forEach((p) => {
    sumWeightedX += p.x * (p.volume || 0);
    sumWeightedY += p.y * (p.volume || 0);
  });

  const cgX = totalVolume > 0 ? Number((sumWeightedX / totalVolume).toFixed(4)) : 0;
  const cgY = totalVolume > 0 ? Number((sumWeightedY / totalVolume).toFixed(4)) : 0;

  // Evaluate candidate sites with Euclidean weighted distance
  const evaluatedCandidates: CandidateLocation[] = candidates.map((cand) => {
    let totalDist = 0;
    demandPoints.forEach((dp) => {
      const dist = Math.sqrt(Math.pow(dp.x - cand.x, 2) + Math.pow(dp.y - cand.y, 2));
      totalDist += (dp.volume || 0) * dist;
    });

    return {
      ...cand,
      totalWeightedDistance: Math.round(totalDist),
    };
  });

  // Sort candidates by lowest weighted distance
  evaluatedCandidates.sort((a, b) => (a.totalWeightedDistance || 0) - (b.totalWeightedDistance || 0));
  evaluatedCandidates.forEach((c, idx) => {
    c.rank = idx + 1;
  });

  // Scatter plot points
  const scatterPoints = [
    ...demandPoints.map((p) => ({
      name: p.name,
      x: p.x,
      y: p.y,
      volume: p.volume,
      type: 'demand' as const,
    })),
    {
      name: "Calculated Optimal Center of Gravity",
      x: cgX,
      y: cgY,
      volume: totalVolume * 0.4,
      type: 'cg' as const,
    },
    ...evaluatedCandidates.map((c) => ({
      name: `${c.name} (Candidate #${c.rank})`,
      x: c.x,
      y: c.y,
      volume: totalVolume * 0.25,
      type: 'candidate' as const,
    })),
  ];

  return {
    cgX,
    cgY,
    totalVolume,
    evaluatedCandidates,
    scatterPoints,
  };
}

export function generateFacilityAudit(
  demandPoints: DemandPoint[],
  cgX: number,
  cgY: number,
  totalVolume: number
): AuditData {
  return {
    toolName: "Facility Location — Center of Gravity Model",
    toolNameAr: "تحديد موقع المنشأة — نموذج مركز الثقل الجغرافي",
    summary: `Calculates the optimal distribution warehouse coordinates minimizing total transportation ton-mileage across ${demandPoints.length} regional demand nodes.`,
    summaryAr: `حساب الإحداثيات الجغرافية المثلى لإنشاء مركز التوزيع الذي يقلل مسافات وتكاليف الشحن الإجمالية بين منافذ التوزيع.`,
    steps: [
      {
        title: "1. Weighted X Coordinate (Longitude / Horizontal)",
        formula: "X_cg = Σ (Volume_i × X_i) / Σ (Volume_i)",
        substitution: `Σ(Vol × X) / ${totalVolume.toLocaleString()}`,
        result: `X* = ${cgX}`,
        explanation: "Horizontal weighted balance point of regional freight volume.",
      },
      {
        title: "2. Weighted Y Coordinate (Latitude / Vertical)",
        formula: "Y_cg = Σ (Volume_i × Y_i) / Σ (Volume_i)",
        substitution: `Σ(Vol × Y) / ${totalVolume.toLocaleString()}`,
        result: `Y* = ${cgY}`,
        explanation: "Vertical weighted balance point of regional freight volume.",
      },
      {
        title: "3. Candidate Evaluation (Euclidean Metric)",
        formula: "Total Weighted Distance = Σ [ Volume_i × √((X_i - X_cand)² + (Y_i - Y_cand)²) ]",
        substitution: "Ranked by minimum transportation load-distance score",
        result: "Optimal Site Ranking",
        explanation: "Closest candidate site to the theoretical center of gravity minimizes annual delivery fuel & fleet expenditure.",
      },
    ],
  };
}

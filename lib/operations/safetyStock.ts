// lib/operations/safetyStock.ts
import { SafetyStockInputs, SafetyStockOutputs, AuditData } from './types';

/**
 * High-precision Inverse Normal Cumulative Distribution Function (normInv)
 * Based on Peter J. Acklam's rational approximation.
 * Relative error < 1.15 × 10^-9 across the entire domain (0, 1).
 */
export function normInv(p: number): number {
  if (p <= 0) return -Infinity;
  if (p >= 1) return Infinity;

  // Coefficients in rational approximations
  const a = [
    -3.969683028665376e+01,
     2.209460984245205e+02,
    -2.759285104469687e+02,
     1.383577518672690e+02,
    -3.066479806614716e+01,
     2.506628277459239e+00,
  ];

  const b = [
    -5.447609879822406e+01,
     1.615858368580409e+02,
    -1.556989798598866e+02,
     6.680131188771972e+01,
    -1.328068155288572e+01,
  ];

  const c = [
    -7.784894002430293e-03,
    -3.223964580411365e-01,
    -2.400758277161838e+00,
    -2.549732539343734e+00,
     4.374664141464968e+00,
     2.938163982698783e+00,
  ];

  const d = [
     7.784695709041462e-03,
     3.224671290700398e-01,
     2.445134137142996e+00,
     3.754408661907416e+00,
  ];

  const p_low = 0.02425;
  const p_high = 1 - p_low;

  let q: number;

  if (p < p_low) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= p_high) {
    // Rational approximation for central region
    q = p - 0.5;
    const r = q * q;
    return (
      (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
      q /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  }
}

export function computeSafetyStock(inputs: SafetyStockInputs): SafetyStockOutputs {
  const d = Math.max(0, inputs.dailyDemand);
  const sigmaD = Math.max(0, inputs.demandStdDev);
  const LT = Math.max(0.1, inputs.leadTimeDays);
  const sigmaLT = Math.max(0, inputs.leadTimeStdDev || 0);

  // Z-Score resolution
  let zScore = 1.645;
  if (inputs.useManualZ && inputs.customZScore !== undefined) {
    zScore = inputs.customZScore;
  } else {
    const p = Math.min(0.9999, Math.max(0.5, inputs.serviceLevelPct / 100));
    zScore = normInv(p);
  }

  // Combined std dev
  let combinedStdDev = 0;
  if (sigmaLT === 0) {
    // Constant lead time
    combinedStdDev = sigmaD * Math.sqrt(LT);
  } else {
    // Variable lead time
    combinedStdDev = Math.sqrt(LT * Math.pow(sigmaD, 2) + Math.pow(d, 2) * Math.pow(sigmaLT, 2));
  }

  const safetyStock = Math.ceil(zScore * combinedStdDev);
  const leadTimeDemand = Math.round(d * LT);
  const reorderPoint = leadTimeDemand + safetyStock;

  // Generate sensitivity points across common service levels
  const testLevels = [90, 92.5, 95, 97.5, 98, 99, 99.5, 99.9];
  const sensitivityPoints = testLevels.map((lvl) => {
    const z = normInv(lvl / 100);
    const ss = Math.ceil(z * combinedStdDev);
    return {
      serviceLevel: lvl,
      z: Number(z.toFixed(2)),
      safetyStock: ss,
      reorderPoint: leadTimeDemand + ss,
    };
  });

  return {
    zScore: Number(zScore.toFixed(3)),
    combinedStdDev: Number(combinedStdDev.toFixed(2)),
    safetyStock,
    reorderPoint,
    leadTimeDemand,
    sensitivityPoints,
  };
}

export function generateSafetyStockAudit(inputs: SafetyStockInputs, outputs: SafetyStockOutputs): AuditData {
  const isConstantLT = (inputs.leadTimeStdDev || 0) === 0;

  return {
    toolName: "Safety Stock & Reorder Point (ROP)",
    toolNameAr: "مخزون الأمان ونقطة إعادة الطلب",
    summary: `Computes stochastic buffer inventory required to protect customer order fulfillment at a ${inputs.serviceLevelPct}% service level.`,
    summaryAr: `حساب مخزون الأمان العشوائي اللازم لتلبية طلبات العملاء بنسبة خدمة مستهدفة تبلغ ${inputs.serviceLevelPct}%.`,
    steps: [
      {
        title: "1. Service Level Standard Score (Z)",
        formula: "Z = InverseNormalCDF(Target Service Level %)",
        substitution: `normInv(${inputs.serviceLevelPct / 100})`,
        result: `Z = ${outputs.zScore}`,
        explanation: "Statistical multiplier derived from the standard Gaussian distribution.",
      },
      {
        title: "2. Combined Demand & Lead Time Uncertainty (σ_combined)",
        formula: isConstantLT
          ? "σ_combined = σ_demand × √(Lead Time)"
          : "σ_combined = √((Lead Time × σ_demand²) + (Demand² × σ_LT²))",
        substitution: isConstantLT
          ? `${inputs.demandStdDev} × √(${inputs.leadTimeDays})`
          : `√(${inputs.leadTimeDays} × ${inputs.demandStdDev}² + ${inputs.dailyDemand}² × ${inputs.leadTimeStdDev}²)`,
        result: `${outputs.combinedStdDev} units`,
        explanation: isConstantLT
          ? "Lead time is assumed constant; volatility arises solely from daily demand variance."
          : "Dual-volatility model accounting for supplier transit delays coupled with customer demand fluctuations.",
      },
      {
        title: "3. Buffer Safety Stock (SS)",
        formula: "Safety Stock = Z × σ_combined",
        substitution: `${outputs.zScore} × ${outputs.combinedStdDev}`,
        result: `${outputs.safetyStock} units`,
        explanation: "Buffer volume reserved against stockouts during replenishment replenishment window.",
      },
      {
        title: "4. Trigger Reorder Point (ROP)",
        formula: "ROP = (Daily Demand × Lead Time) + Safety Stock",
        substitution: `(${inputs.dailyDemand} × ${inputs.leadTimeDays}) + ${outputs.safetyStock}`,
        result: `${outputs.reorderPoint} units`,
        explanation: `Whenever inventory drops to ${outputs.reorderPoint} units, immediately trigger a replenishment order.`,
      },
    ],
  };
}

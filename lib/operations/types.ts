// lib/operations/types.ts

export interface AuditStep {
  title: string;
  formula: string;
  substitution: string;
  result: string;
  explanation?: string;
}

export interface AuditData {
  toolName: string;
  toolNameAr: string;
  summary: string;
  summaryAr: string;
  steps: AuditStep[];
}

// Cash Conversion Cycle Types
export interface CCCPeriodInput {
  periodId: string;
  periodLabel: string;
  revenue: number;
  cogs: number;
  useBeginningEnding: boolean;
  beginningInventory?: number;
  endingInventory?: number;
  averageInventory: number;
  beginningAR?: number;
  endingAR?: number;
  averageAR: number;
  beginningAP?: number;
  endingAP?: number;
  averageAP: number;
  daysInPeriod: number; // 365 or 90 etc.
}

export interface CCCOutput {
  dio: number; // Days Inventory Outstanding
  dso: number; // Days Sales Outstanding
  dpo: number; // Days Payable Outstanding
  ccc: number; // Cash Conversion Cycle
  periodLabel: string;
}

// Working Capital Financing Cost Types
export interface WCFinancingInputs {
  inventory: number;
  accountsReceivable: number;
  accountsPayable: number;
  costOfCapitalRate: number; // in percentage e.g. 8.5%
  cogs: number;
  revenue: number;
  linkedCCC?: number;
  sensitivityReductionDays: number;
}

export interface WCFinancingOutputs {
  netWorkingCapital: number;
  annualFinancingCostOperating: number;
  dailyCogs: number;
  cashTiedUpCCC: number;
  annualFinancingCostCCC: number;
  savingsPerDayReduction: number;
  totalSensitivitySavings: number;
}

// EOQ Types
export interface EOQInputs {
  annualDemand: number; // D
  orderSetupCost: number; // S
  holdingCostMode: 'direct' | 'percentage';
  directHoldingCost: number; // H
  unitCost: number; // C
  holdingCostPct: number; // %
}

export interface EOQOutputs {
  effectiveHoldingCost: number;
  eoq: number;
  ordersPerYear: number;
  daysBetweenOrders: number;
  annualOrderingCost: number;
  annualHoldingCost: number;
  annualInventoryCost: number;
  annualPurchaseCost: number;
  totalAnnualCost: number;
  curveData: {
    q: number;
    orderingCost: number;
    holdingCost: number;
    totalCost: number;
    isOptimal?: boolean;
  }[];
}

// Safety Stock & ROP Types
export interface SafetyStockInputs {
  dailyDemand: number;
  demandStdDev: number;
  leadTimeDays: number;
  leadTimeStdDev: number; // optional, 0 if constant
  serviceLevelPct: number; // e.g. 95
  customZScore?: number;
  useManualZ: boolean;
}

export interface SafetyStockOutputs {
  zScore: number;
  combinedStdDev: number;
  safetyStock: number;
  reorderPoint: number;
  leadTimeDemand: number;
  sensitivityPoints: {
    serviceLevel: number;
    z: number;
    safetyStock: number;
    reorderPoint: number;
  }[];
}

// ABC / XYZ Classification Types
export interface SkuItem {
  id: string;
  name: string;
  unitCost: number;
  annualDemand: number;
  annualConsumptionValue: number;
  historicalDemand: number[]; // e.g. [100, 110, 95, 105, ...]
  meanDemand: number;
  demandStdDev: number;
  cv: number; // Coefficient of Variation
  abcClass: 'A' | 'B' | 'C';
  xyzClass: 'X' | 'Y' | 'Z';
  combinedClass: 'AX' | 'AY' | 'AZ' | 'BX' | 'BY' | 'BZ' | 'CX' | 'CY' | 'CZ';
  cumulativeValuePct?: number;
}

export interface AbcXyzMatrixSummary {
  cell: string;
  count: number;
  totalValue: number;
  valueSharePct: number;
  strategyKey: string;
}

// Demand Forecasting Types
export type ForecastMethod = 'SMA' | 'WMA' | 'SES';

export interface TimeSeriesPoint {
  period: number;
  periodLabel: string;
  actual: number;
  fitted?: number;
  forecast?: number;
}

export interface ForecastOutputs {
  method: ForecastMethod;
  horizon: number;
  forecasts: { period: number; periodLabel: string; forecastValue: number }[];
  mape: number;
  mad: number;
  bias: number;
  chartData: {
    period: number;
    label: string;
    actual: number | null;
    fitted: number | null;
    isForecast: boolean;
  }[];
  comparativeMetrics: {
    method: ForecastMethod;
    name: string;
    mape: number;
    mad: number;
    bias: number;
  }[];
}

// S&OP Balancing Worksheet Types
export interface SopPeriodRow {
  period: number;
  label: string;
  beginningInventory: number;
  plannedSupply: number;
  demand: number;
  endingInventory: number;
  targetSafetyStock: number;
  inventoryPositionVsTarget: number;
  status: 'HEALTHY' | 'BELOW_SAFETY_STOCK' | 'STOCKOUT';
}

// Landed Cost Types
export interface AdditionalFee {
  id: string;
  name: string;
  amount: number;
}

export interface SourcingScenario {
  id: string;
  name: string;
  origin: string;
  units: number;
  unitCostFob: number;
  freightCostTotal: number;
  insuranceCostTotal: number;
  dutyRatePct: number;
  includeInsuranceInCustomsValue: boolean;
  fees: AdditionalFee[];
}

export interface LandedCostCalculation {
  productCostTotal: number;
  customsValue: number;
  customsDutyTotal: number;
  otherFeesTotal: number;
  totalLandedCost: number;
  landedCostPerUnit: number;
  effectiveMarkupPct: number;
  breakdown: {
    name: string;
    amount: number;
    pct: number;
    color: string;
  }[];
}

// TCO Types
export interface TcoOption {
  id: string;
  name: string;
  purchasePrice: number;
  installationCost: number;
  annualOperatingCost: number;
  annualMaintenanceCost: number;
  usefulLifeYears: number;
  salvageValue: number;
  discountRatePct: number;
}

export interface TcoCalculation {
  pvAnnualOperating: number;
  pvAnnualMaintenance: number;
  pvAnnualTotal: number;
  pvSalvage: number;
  netTcoPv: number;
  undiscountedTotal: number;
  annualCashFlows: {
    year: number;
    operating: number;
    maintenance: number;
    totalCashCost: number;
    pvCost: number;
  }[];
}

// Supplier Scorecard Types
export interface ScorecardCriterion {
  id: string;
  name: string;
  nameAr?: string;
  weightPct: number;
}

export interface SupplierCandidate {
  id: string;
  name: string;
  scores: Record<string, number>; // criterionId -> score (1..scale)
}

export interface SupplierRankResult {
  supplierId: string;
  supplierName: string;
  weightedScore: number;
  normalizedScorePct: number;
  rank: number;
  criterionBreakdown: {
    criterionName: string;
    rawScore: number;
    weightedContribution: number;
  }[];
}

// Facility Location (Center of Gravity) Types
export interface DemandPoint {
  id: string;
  name: string;
  x: number; // longitude or relative X
  y: number; // latitude or relative Y
  volume: number; // demand weight
}

export interface CandidateLocation {
  id: string;
  name: string;
  x: number;
  y: number;
  totalWeightedDistance?: number;
  rank?: number;
}


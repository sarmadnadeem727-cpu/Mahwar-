// lib/operations/forecasting.ts
import { ForecastMethod, TimeSeriesPoint, ForecastOutputs, AuditData } from './types';

export const DEFAULT_DEMAND_SERIES: TimeSeriesPoint[] = [
  { period: 1, periodLabel: "M1", actual: 340 },
  { period: 2, periodLabel: "M2", actual: 365 },
  { period: 3, periodLabel: "M3", actual: 390 },
  { period: 4, periodLabel: "M4", actual: 410 },
  { period: 5, periodLabel: "M5", actual: 385 },
  { period: 6, periodLabel: "M6", actual: 420 },
  { period: 7, periodLabel: "M7", actual: 445 },
  { period: 8, periodLabel: "M8", actual: 430 },
  { period: 9, periodLabel: "M9", actual: 460 },
  { period: 10, periodLabel: "M10", actual: 480 },
  { period: 11, periodLabel: "M11", actual: 505 },
  { period: 12, periodLabel: "M12", actual: 520 },
];

export function computeForecasts(
  series: TimeSeriesPoint[],
  method: ForecastMethod,
  params: {
    smaWindow?: number;
    wmaWeights?: number[]; // should sum to 1
    sesAlpha?: number;
    horizon?: number;
  }
): ForecastOutputs {
  const horizon = Math.max(1, params.horizon || 3);
  const n = series.length;
  const actuals = series.map((s) => s.actual);

  const fitted: (number | null)[] = new Array(n).fill(null);
  let forecastValues: number[] = [];

  if (method === 'SMA') {
    const w = Math.max(2, Math.min(n - 1, params.smaWindow || 3));
    // Fitted values starting from index w
    for (let t = w; t < n; t++) {
      const windowSlice = actuals.slice(t - w, t);
      const sum = windowSlice.reduce((a, b) => a + b, 0);
      fitted[t] = Number((sum / w).toFixed(1));
    }
    // Forward projections: rolling SMA
    const extended = [...actuals];
    for (let h = 0; h < horizon; h++) {
      const windowSlice = extended.slice(extended.length - w);
      const nextF = windowSlice.reduce((a, b) => a + b, 0) / w;
      forecastValues.push(Number(nextF.toFixed(1)));
      extended.push(nextF);
    }
  } else if (method === 'WMA') {
    let weights = params.wmaWeights && params.wmaWeights.length > 0 ? [...params.wmaWeights] : [0.5, 0.3, 0.2];
    const weightSum = weights.reduce((a, b) => a + b, 0);
    // Normalize weights if not 1.0
    if (weightSum > 0 && Math.abs(weightSum - 1) > 0.001) {
      weights = weights.map((w) => w / weightSum);
    }
    const w = weights.length;

    for (let t = w; t < n; t++) {
      let sum = 0;
      for (let i = 0; i < w; i++) {
        sum += weights[i] * actuals[t - 1 - i];
      }
      fitted[t] = Number(sum.toFixed(1));
    }

    const extended = [...actuals];
    for (let h = 0; h < horizon; h++) {
      let sum = 0;
      for (let i = 0; i < w; i++) {
        sum += weights[i] * extended[extended.length - 1 - i];
      }
      forecastValues.push(Number(sum.toFixed(1)));
      extended.push(sum);
    }
  } else if (method === 'SES') {
    const alpha = Math.max(0.01, Math.min(0.99, params.sesAlpha ?? 0.3));
    // Seed initial forecast with average of first 3 periods (or first actual)
    const seed = n >= 3 ? (actuals[0] + actuals[1] + actuals[2]) / 3 : actuals[0];
    fitted[0] = Number(seed.toFixed(1));

    for (let t = 1; t < n; t++) {
      const prevF = fitted[t - 1]!;
      const prevA = actuals[t - 1];
      const nextF = alpha * prevA + (1 - alpha) * prevF;
      fitted[t] = Number(nextF.toFixed(1));
    }

    // Projections for SES are flat at the last fitted step
    const lastFitted = fitted[n - 1]!;
    const nextF = alpha * actuals[n - 1] + (1 - alpha) * lastFitted;
    forecastValues = new Array(horizon).fill(Number(nextF.toFixed(1)));
  }

  // Calculate Accuracy Metrics (MAPE, MAD, Bias) over indices where fitted is present
  let apeSum = 0;
  let adSum = 0;
  let biasSum = 0;
  let count = 0;

  for (let t = 0; t < n; t++) {
    if (fitted[t] !== null && actuals[t] > 0) {
      const diff = actuals[t] - fitted[t]!;
      apeSum += Math.abs(diff) / actuals[t];
      adSum += Math.abs(diff);
      biasSum += diff;
      count++;
    }
  }

  const mape = count > 0 ? Number(((apeSum / count) * 100).toFixed(2)) : 0;
  const mad = count > 0 ? Number((adSum / count).toFixed(2)) : 0;
  const bias = count > 0 ? Number((biasSum / count).toFixed(2)) : 0;

  // Build chart dataset
  const chartData: ForecastOutputs['chartData'] = [];
  for (let i = 0; i < n; i++) {
    chartData.push({
      period: series[i].period,
      label: series[i].periodLabel,
      actual: series[i].actual,
      fitted: fitted[i],
      isForecast: false,
    });
  }

  // Add forecast periods
  const forecasts = forecastValues.map((val, idx) => {
    const nextPeriod = n + idx + 1;
    const label = `F+${idx + 1}`;
    chartData.push({
      period: nextPeriod,
      label,
      actual: null,
      fitted: val,
      isForecast: true,
    });
    return {
      period: nextPeriod,
      periodLabel: label,
      forecastValue: val,
    };
  });

  // Calculate comparative metrics across all 3 methods on this same data
  const comparativeMetrics: ForecastOutputs['comparativeMetrics'] = [
    runMethodMetrics(actuals, 'SMA', { smaWindow: params.smaWindow || 3 }),
    runMethodMetrics(actuals, 'WMA', { wmaWeights: params.wmaWeights }),
    runMethodMetrics(actuals, 'SES', { sesAlpha: params.sesAlpha ?? 0.3 }),
  ];

  return {
    method,
    horizon,
    forecasts,
    mape,
    mad,
    bias,
    chartData,
    comparativeMetrics,
  };
}

function runMethodMetrics(actuals: number[], method: ForecastMethod, params: any): ForecastOutputs['comparativeMetrics'][0] {
  const dummySeries: TimeSeriesPoint[] = actuals.map((val, idx) => ({
    period: idx + 1,
    periodLabel: `P${idx + 1}`,
    actual: val,
  }));
  const res = computeForecasts(dummySeries, method, { ...params, horizon: 1 });
  const names = {
    SMA: "Simple Moving Average (SMA)",
    WMA: "Weighted Moving Average (WMA)",
    SES: "Simple Exponential Smoothing (SES)",
  };
  return {
    method,
    name: names[method],
    mape: res.mape,
    mad: res.mad,
    bias: res.bias,
  };
}

export function generateForecastAudit(method: ForecastMethod, outputs: ForecastOutputs): AuditData {
  return {
    toolName: "Demand Forecasting & Time Series",
    toolNameAr: "التنبؤ بالطلب والسلاسل الزمنية",
    summary: `Forecasts future operational requirements across ${outputs.horizon} periods using statistical time-series models with accuracy benchmarks.`,
    summaryAr: `توقع الطلب المستقبلي عبر ${outputs.horizon} فترات زمنية بنماذج إحصائية ومعايير دقة قياسية (MAPE/MAD).`,
    steps: [
      {
        title: "1. Time Series Smoothing Engine",
        formula: method === 'SMA'
          ? "F_t = (D_(t-1) + D_(t-2) + ... + D_(t-n)) / n"
          : method === 'WMA'
          ? "F_t = Σ (w_i × D_(t-i)), where Σ w_i = 1"
          : "F_t = α × D_(t-1) + (1 - α) × F_(t-1)",
        substitution: `Method: ${method} across historical series`,
        result: `${outputs.forecasts.length} periods projected`,
        explanation: "Generates rolling smoothed expectations without arbitrary guesswork.",
      },
      {
        title: "2. Mean Absolute Percentage Error (MAPE)",
        formula: "MAPE = (1/n) × Σ |Actual - Forecast| / Actual × 100%",
        substitution: `Computed over all one-step-ahead fitted periods`,
        result: `${outputs.mape}%`,
        explanation: outputs.mape < 10
          ? "Highly accurate forecasting model (<10% error)."
          : outputs.mape < 25
          ? "Acceptable forecasting precision for standard replenishment."
          : "Elevated variance; review promotions or consider seasonal adjustments.",
      },
      {
        title: "3. Mean Absolute Deviation (MAD) & Forecast Bias",
        formula: "MAD = (1/n) × Σ |Actual - Forecast| | Bias = (1/n) × Σ (Actual - Forecast)",
        substitution: `MAD: ${outputs.mad} units | Bias: ${outputs.bias} units`,
        result: `MAD = ${outputs.mad}, Bias = ${outputs.bias}`,
        explanation: outputs.bias > 0
          ? "Positive bias indicates systematic under-forecasting (risk of shortages)."
          : outputs.bias < 0
          ? "Negative bias indicates systematic over-forecasting (risk of excess stock)."
          : "Zero bias indicates well-calibrated balanced predictions.",
      },
    ],
  };
}


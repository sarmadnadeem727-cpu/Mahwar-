export interface PlanLimits {
  name: string;
  priceId: string | undefined;
  priceMonthly: number;
  aiReportLimit: number;
  savedModelsLimit: number;
  livePollingIntervalMs: number;
  features: string[];
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    name: "Free",
    priceId: undefined,
    priceMonthly: 0,
    aiReportLimit: 5,
    savedModelsLimit: 3,
    livePollingIntervalMs: 300000, // 5 minutes
    features: [
      "5 AI Research reports/month",
      "Up to 3 saved models total",
      "Delayed market data (5m refresh)",
      "Manual feed refreshes"
    ]
  },
  pro: {
    name: "Pro",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
    priceMonthly: 49,
    aiReportLimit: 100,
    savedModelsLimit: Infinity,
    livePollingIntervalMs: 30000, // 30 seconds
    features: [
      "100 AI Research reports/month",
      "Unlimited saved models",
      "Real-time Live Market feeds (30s refresh)",
      "Full Shariah screening and Screener access"
    ]
  },
  institutional: {
    name: "Institutional",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_INSTITUTIONAL,
    priceMonthly: 199,
    aiReportLimit: Infinity,
    savedModelsLimit: Infinity,
    livePollingIntervalMs: 10000, // 10 seconds (priority)
    features: [
      "Unlimited AI Research memos",
      "Unlimited saved models",
      "Priority data feeds",
      "Excel & PDF exports",
      "Future team seat support"
    ]
  }
};

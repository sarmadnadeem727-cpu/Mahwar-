export type Suite = "financial" | "operations";

/** Keys map 1:1 to a mini-visual in components/homepage/ToolVisuals.tsx */
export type VisualKey =
  | "dcf-sparkline"
  | "lbo-returns"
  | "compliance-ring"
  | "linked-statements"
  | "statement-flow"
  | "formula-grid"
  | "histogram"
  | "cost-stack"
  | "document"
  | "capital-structure"
  | "eoq-curve"
  | "service-level"
  | "pareto"
  | "demand-trend"
  | "inventory-trajectory"
  | "landed-cost"
  | "tco-compare"
  | "radar"
  | "scatter"
  | "cycle-days"
  | "financing-cost";

export interface Tool {
  id: string;
  suite: Suite;
  /** Short category tag rendered in mono */
  category: string;
  title: string;
  description: string;
  visual: VisualKey;
  /** Two-cell mono metric row shown under the visual */
  metrics: readonly [string, string];
  /** Featured tools get the larger card treatment */
  featured?: boolean;
  /**
   * Expected `?panel=` value on /dashboard.
   */
  panel: string | null;
  href: string;
}

export const financialTools: readonly Tool[] = [
  {
    id: "dcf",
    suite: "financial",
    category: "Valuation",
    title: "DCF Valuation Engine",
    description:
      "Five-year unlevered free cash flow build, WACC sensitivity matrix and a terminal-value bridge to intrinsic value per share.",
    visual: "dcf-sparkline",
    metrics: ["Intrinsic SAR 38.45", "Upside +18.4%"],
    featured: true,
    panel: "DCF",
    href: "/dashboard?panel=DCF",
  },
  {
    id: "lbo",
    suite: "financial",
    category: "Private equity",
    title: "LBO Deal Builder",
    description:
      "Senior, mezzanine and PIK debt waterfalls with sponsor IRR, MOIC and exit-multiple mapping over a five-year hold.",
    visual: "lbo-returns",
    metrics: ["Senior debt 55%", "Exit 10.0x"],
    featured: true,
    panel: "LBO",
    href: "/dashboard?panel=LBO",
  },
  {
    id: "shariah",
    suite: "financial",
    category: "Compliance",
    title: "AAOIFI Shariah Screening",
    description:
      "Balance-sheet audit against AAOIFI Standard No. 21 ratio thresholds, with purification per share computed on the same run.",
    visual: "compliance-ring",
    metrics: ["Debt / assets 14.2%", "Purification SAR 0.04"],
    featured: true,
    panel: "shariah",
    href: "/dashboard?panel=shariah",
  },
  {
    id: "fs",
    suite: "financial",
    category: "Accounting",
    title: "Linked 3-Statement Model",
    description: "Five-year income statement, balance sheet and cash flow, with a Saudi GAAP (2.5% Zakat) or IFRS toggle.",
    visual: "statement-flow",
    metrics: ["Rev CAGR +12.0%", "Net margin 24.5%"],
    panel: "FS",
    href: "/dashboard?panel=FS",
  },
  {
    id: "auto-statements",
    suite: "financial",
    category: "Guided form",
    title: "Auto-Generated Financial Statements",
    description: "Zero-formula path from core inputs to linked statements, with every tie-out verified.",
    visual: "linked-statements",
    metrics: ["3 statements tied", "NI → RE verified"],
    panel: "auto_statements",
    href: "/dashboard?panel=auto_statements",
  },
  {
    id: "custom-model",
    suite: "financial",
    category: "Spreadsheet",
    title: "Custom Model Builder",
    description: "Excel-style grid with live cascading formulas, chart projections and saved models.",
    visual: "formula-grid",
    metrics: ["GP SAR 4,500M", "NI SAR 2,150M"],
    panel: "custom_model",
    href: "/dashboard?panel=custom_model",
  },
  {
    id: "monte-carlo",
    suite: "financial",
    category: "Simulation",
    title: "Monte Carlo Valuation",
    description: "5,000–10,000 iterations over uncertain DCF inputs for P10 / P50 / P90 value ranges.",
    visual: "histogram",
    metrics: ["P10 SAR 32.1", "P90 SAR 46.2"],
    panel: "monte_carlo",
    href: "/dashboard?panel=monte_carlo",
  },
  {
    id: "acquisition-cost",
    suite: "financial",
    category: "Deal costs",
    title: "M&A Acquisition Cost Calculator",
    description: "Total acquisition burden: headline price, assumed debt, advisory fees, integration and earn-outs.",
    visual: "cost-stack",
    metrics: ["Headline 1,500M", "Total 2,045M"],
    panel: "acquisition_cost",
    href: "/dashboard?panel=acquisition_cost",
  },
  {
    id: "wacc",
    suite: "financial",
    category: "Cost of capital",
    title: "WACC & CAPM Builder",
    description: "Beta, market risk premium and after-Zakat cost of debt blended by target capital structure.",
    visual: "capital-structure",
    metrics: ["WACC 8.9%", "Ke 10.6%"],
    panel: "wacc",
    href: "/dashboard?panel=wacc",
  },
  {
    id: "bi-report",
    suite: "financial",
    category: "Reporting",
    title: "BI Report Engine",
    description: "Consolidates session outputs, tables and charts into client-ready PDF and Excel reports.",
    visual: "document",
    metrics: ["PDF · XLSX", "Report ready"],
    panel: "bi_report",
    href: "/dashboard?panel=bi_report",
  },
] as const;

export const operationsTools: readonly Tool[] = [
  {
    id: "ccc",
    suite: "operations",
    category: "Working capital",
    title: "Cash Conversion Cycle",
    description: "Inventory, receivable and payable days combined into the cash cycle and its trend.",
    visual: "cycle-days",
    metrics: ["CCC 69 days", "DPO 41 days"],
    panel: "ccc",
    href: "/dashboard?panel=ccc",
  },
  {
    id: "wc-financing",
    suite: "operations",
    category: "Cash cost",
    title: "Working Capital Financing Cost",
    description: "The cash cycle priced at your funding rate — what each day of working capital costs.",
    visual: "financing-cost",
    metrics: ["Rate 6.5%", "Cost SAR 152K"],
    panel: "wc_financing",
    href: "/dashboard?panel=wc_financing",
  },
  {
    id: "eoq",
    suite: "operations",
    category: "Inventory",
    title: "Economic Order Quantity",
    description: "Ordering versus holding cost curve with the cost-minimising order size and cycle length.",
    visual: "eoq-curve",
    metrics: ["EOQ 1,840 units", "Cycle 21 days"],
    panel: "eoq",
    href: "/dashboard?panel=eoq",
  },
  {
    id: "safety-stock",
    suite: "operations",
    category: "Service level",
    title: "Safety Stock & Reorder Point",
    description: "Demand and lead-time variability sized to a target service level, with the reorder trigger.",
    visual: "service-level",
    metrics: ["Service 95%", "ROP 2,310 units"],
    panel: "safety_stock",
    href: "/dashboard?panel=safety_stock",
  },
  {
    id: "abc-xyz",
    suite: "operations",
    category: "Pareto",
    title: "ABC / XYZ Classification",
    description: "Value and demand-volatility segmentation of the SKU base into nine control policies.",
    visual: "pareto",
    metrics: ["A-class 18% of SKUs", "78% of value"],
    panel: "abc_xyz",
    href: "/dashboard?panel=abc_xyz",
  },
  {
    id: "demand-forecast",
    suite: "operations",
    category: "Forecast",
    title: "Demand Forecasting",
    description: "Moving average, exponential smoothing and seasonal projection with error tracking.",
    visual: "demand-trend",
    metrics: ["MAPE 6.8%", "Horizon 12 mo"],
    panel: "demand_forecast",
    href: "/dashboard?panel=demand_forecast",
  },
  {
    id: "sop",
    suite: "operations",
    category: "S&OP",
    title: "S&OP Balancing Worksheet",
    description: "Demand, supply and inventory balanced month by month against capacity and target cover.",
    visual: "inventory-trajectory",
    metrics: ["Cover 6.2 wk", "Capacity 91%"],
    panel: "sop_worksheet",
    href: "/dashboard?panel=sop_worksheet",
  },
  {
    id: "landed-cost",
    suite: "operations",
    category: "Import",
    title: "Delivered Landed Cost",
    description: "FOB price through freight, insurance, customs duty and handling to true cost per unit at the door.",
    visual: "landed-cost",
    metrics: ["FOB SAR 412.00", "Landed SAR 517.40"],
    panel: "landed_cost",
    href: "/dashboard?panel=landed_cost",
  },
  {
    id: "tco",
    suite: "operations",
    category: "Lifecycle",
    title: "Total Cost of Ownership",
    description: "Acquisition, operating, maintenance and disposal cost compared across supplier options.",
    visual: "tco-compare",
    metrics: ["Option A 2.84M", "Option B 2.61M"],
    panel: "tco",
    href: "/dashboard?panel=tco",
  },
  {
    id: "supplier-scorecard",
    suite: "operations",
    category: "Sourcing",
    title: "Supplier Scorecard",
    description: "Weighted scoring on quality, delivery, cost, responsiveness and compliance.",
    visual: "radar",
    metrics: ["Score 82 / 100", "Tier 1"],
    panel: "supplier_scorecard",
    href: "/dashboard?panel=supplier_scorecard",
  },
  {
    id: "facility-location",
    suite: "operations",
    category: "Network",
    title: "Facility Location",
    description: "Centre-of-gravity siting from demand points and freight weights across the Gulf network.",
    visual: "scatter",
    metrics: ["Optimum: Dammam", "Freight −11%"],
    panel: "facility_location",
    href: "/dashboard?panel=facility_location",
  },
] as const;

export const allTools: readonly Tool[] = [...financialTools, ...operationsTools];

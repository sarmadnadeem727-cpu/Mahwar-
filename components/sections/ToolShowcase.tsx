// components/sections/ToolShowcase.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BarChart3, Layers, ShieldCheck, FileSpreadsheet, 
  FileText, ArrowRight, CheckCircle2, Download, TrendingUp, Sliders,
  RefreshCw, DollarSign, PackageCheck, ShieldAlert, Grid3X3, Ship, Coins, Award, MapPin
} from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function ToolShowcase() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';
  const [activeSuite, setActiveSuite] = useState<'financial' | 'operations'>('financial');

  const financialTools = [
    {
      id: "DCF",
      title: isAr ? "محرك تقييم التدفقات (DCF)" : "DCF Valuation Engine",
      tag: "VALUATION",
      desc: isAr 
        ? "نموذج تقييم القيمة الجوهرية لـ 5 سنوات مع افتراضات WACC ونسب النمو الحركية وحساسية المحاكاة."
        : "5-year Discounted Cash Flow valuation engine with WACC sensitivity matrix and Monte Carlo simulation.",
      icon: <BarChart3 className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>5Y FCF Trajectory</span>
            <span className="text-emerald font-bold">+18.4% Upside</span>
          </div>
          <div className="h-9 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path d="M 0 20 L 25 15 L 50 17 L 75 8 L 100 3" fill="none" stroke="#0E7C69" strokeWidth="2" />
              <circle cx="100" cy="3" r="3" fill="#0E7C69" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1.5">
            <span>FCF: SAR 1,250M</span>
            <span>Intrinsic: SAR 38.45</span>
          </div>
        </div>
      )
    },
    {
      id: "LBO",
      title: isAr ? "باني صفقات الاستحواذ (LBO)" : "LBO Deal Builder",
      tag: "PRIVATE EQUITY",
      desc: isAr 
        ? "تحليل صفقات الاستحواذ المدعوم بالديون، شلالات الديون متعددة الشرائح، وتوقعات معدل العائد الداخلي (IRR)."
        : "Leveraged buyout returns engine with senior, mezzanine & PIK debt waterfalls, MOIC, and exit IRR mapping.",
      icon: <Layers className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Projected Returns</span>
            <span className="text-emerald font-bold">2.65x MOIC</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-slate-body">
              <span>Sponsor IRR</span>
              <span className="font-bold text-emerald">24.8%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-emerald rounded-full w-[82%]" />
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1.5">
            <span>Senior Debt: 55%</span>
            <span>Exit Multiple: 10.0x</span>
          </div>
        </div>
      )
    },
    {
      id: "shariah",
      title: isAr ? "الفحص الشرعي (AAOIFI 21)" : "AAOIFI Shariah Screening",
      tag: "COMPLIANCE",
      desc: isAr 
        ? "تدقيق آلي للامتثال المالي وفق المعيار الشرعي رقم 21 لحساب نسب الديون والربا وحساب مبلغ التطهير."
        : "Automated balance sheet compliance audit against AAOIFI Standard No. 21 ratio thresholds and purification per share.",
      icon: <ShieldCheck className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-muted">AAOIFI Status</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald bg-emerald-dim border border-emerald-border">AAOIFI PASS</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="p-1.5 bg-white border border-surface-border rounded text-center">
              <span className="text-slate-muted block text-[9px]">Debt / Assets</span>
              <span className="font-bold text-emerald">14.2% &lt; 33%</span>
            </div>
            <div className="p-1.5 bg-white border border-surface-border rounded text-center">
              <span className="text-slate-muted block text-[9px]">Purification</span>
              <span className="font-bold text-emerald">SAR 0.04/sh</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "FS",
      title: isAr ? "القوائم المالية الثلاث المترابطة" : "Linked 3-Statement Model",
      tag: "ACCOUNTING",
      desc: isAr 
        ? "توقعات القوائم الثلاث (الأرباح، الميزانية، التدفقات) مع تبادل المعيار بين الزكاة السعودية 2.5% وضريبة IFRS."
        : "5-year linked income statement, balance sheet, and cash flow with Saudi GAAP (2.5% Zakat) vs. IFRS toggle.",
      icon: <FileSpreadsheet className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Accounting Standard</span>
            <span className="px-1.5 py-0.5 bg-white border border-surface-border text-emerald font-bold rounded text-[9px]">Saudi GAAP (Zakat 2.5%)</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading border-t border-surface-border pt-1.5 font-bold">
            <span>Rev CAGR: +12.0%</span>
            <span>Net Margin: 24.5%</span>
          </div>
        </div>
      )
    },
    {
      id: "custom_model",
      title: isAr ? "باني النماذج المخصصة" : "Custom Model Builder (Excel-Style)",
      tag: "SPREADSHEET",
      desc: isAr
        ? "جدول مالي مرن يدعم الصيغ الحسابية المباشرة (=Revenue - COGS)، المخططات البيانية التفاعلية، والتصدير."
        : "Spreadsheet grid with live cascading arithmetic formulas (=Revenue - COGS), Recharts projections, and model persistence.",
      icon: <FileSpreadsheet className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Live Formula Grid</span>
            <span className="text-emerald font-bold font-mono">=Revenue - COGS</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="p-1 bg-white border border-surface-border rounded flex justify-between">
              <span>Gross Profit</span>
              <span className="font-bold text-emerald">SAR 4,500M</span>
            </div>
            <div className="p-1 bg-emerald-dim border border-emerald-border rounded flex justify-between text-emerald">
              <span>Net Income</span>
              <span className="font-bold">SAR 2,150M</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "monte_carlo",
      title: isAr ? "محاكاة مونتي كارلو للتقييم" : "Monte Carlo Valuation Simulation",
      tag: "SIMULATION",
      desc: isAr
        ? "محاكاة 5,000–10,000 مسار عشوائي لقياس المخاطر وتوزيع الاحتمالات للتقييم."
        : "Run 5,000–10,000 probability iterations over uncertain DCF inputs for P10/P50/P90 percentile ranges.",
      icon: <Sliders className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Histogram Probability</span>
            <span className="text-emerald font-bold">5,000 Runs</span>
          </div>
          <div className="flex items-end gap-1 h-8 w-full pt-1">
            <div className="flex-1 bg-emerald/30 h-[30%] rounded-t" />
            <div className="flex-1 bg-emerald/50 h-[60%] rounded-t" />
            <div className="flex-1 bg-emerald h-[100%] rounded-t" />
            <div className="flex-1 bg-emerald/70 h-[75%] rounded-t" />
            <div className="flex-1 bg-emerald/40 h-[40%] rounded-t" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1">
            <span>P10: SAR 32.1</span>
            <span className="text-emerald">P50: SAR 38.5</span>
            <span>P90: SAR 46.2</span>
          </div>
        </div>
      )
    },
    {
      id: "acquisition_cost",
      title: isAr ? "حاسبة تكاليف الاستحواذ (M&A)" : "M&A Acquisition Cost Calculator",
      tag: "DEAL COSTS",
      desc: isAr
        ? "حساب التكلفة الفعلية للاستحواذ متضمنة الديون والأتعاب والاستشارات والدمج والمستحقات."
        : "Total acquisition burden breakdown including headline price, debt, advisory fees, integration, and earn-outs.",
      icon: <Download className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Enterprise Cost Stack</span>
            <span className="text-emerald font-bold">9.8x EV/EBITDA</span>
          </div>
          <div className="space-y-1 text-[10px]">
            <div className="p-1 bg-white border border-surface-border rounded flex justify-between">
              <span>Headline Price</span>
              <span className="font-bold">SAR 1,500M</span>
            </div>
            <div className="p-1 bg-emerald-dim border border-emerald-border rounded flex justify-between text-emerald font-bold">
              <span>Total M&A Burden</span>
              <span>SAR 2,045M</span>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "auto_statements",
      title: isAr ? "القوائم المالية التلقائية" : "Auto-Generated Financial Statements",
      tag: "GUIDED FORM",
      desc: isAr
        ? "توليد سريع للقوائم الثلاث المترابطة بإدخال البيانات الأساسية فقط بدون الحاجة لصيغ معقدة."
        : "Fastest zero-formula way to build linked Income, Balance Sheet, and Cash Flow statements from core inputs.",
      icon: <CheckCircle2 className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Auto-Link Status</span>
            <span className="px-1.5 py-0.5 bg-emerald-dim border border-emerald-border text-emerald font-bold rounded text-[9px]">3-Statements Tied</span>
          </div>
          <div className="p-1 bg-white border border-surface-border rounded text-[10px] text-slate-heading flex justify-between font-bold">
            <span>Net Income -&gt; Retained Earnings</span>
            <span className="text-emerald">VERIFIED</span>
          </div>
        </div>
      )
    },
    {
      id: "bi_report",
      title: isAr ? "محرك تقارير ذكاء الأعمال" : "BI Report Engine (PDF/Excel)",
      tag: "REPORTING",
      desc: isAr 
        ? "تجميع نتائج النمذجة والحسابات وتصدير تقارير رفيعة المستوى ببيانات Excel وبملفات PDF موجهة للطباعة."
        : "Consolidates session modeling outputs, custom calculations, tables, and graphs into client-ready PDF and Excel reports.",
      icon: <FileText className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Report Export Mode</span>
            <span className="flex items-center gap-1 text-emerald font-bold">
              <Download size={11} />
              <span>PDF & XLSX</span>
            </span>
          </div>
          <div className="p-1.5 bg-white border border-surface-border rounded text-[10px] text-slate-heading font-bold flex justify-between items-center">
            <span>MAHWAR_REPORT.pdf</span>
            <span className="text-emerald">READY</span>
          </div>
        </div>
      )
    }
  ];

  const operationsTools = [
    {
      id: "ccc",
      title: isAr ? "دورة التحويل النقدي (CCC)" : "Cash Conversion Cycle (CCC)",
      tag: "WORKING CAPITAL",
      desc: isAr
        ? "قياس سرعة تحويل المخزون والمبيعات إلى نقد فعلي (DIO + DSO - DPO) مع تتبع المسار التاريخي وتكامل القوائم."
        : "Measure liquidity tie-up duration: DIO, DSO, and DPO with multi-period trend visualization and statement linkage.",
      icon: <RefreshCw className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Operating Velocity</span>
            <span className="text-emerald font-bold">42.5 Days Net</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[9px] text-center">
            <div className="p-1 bg-white rounded border border-surface-border">DIO: 65d</div>
            <div className="p-1 bg-white rounded border border-surface-border">DSO: 48d</div>
            <div className="p-1 bg-emerald-dim text-emerald rounded border border-emerald-border font-bold">DPO: 70d</div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1">
            <span>CCC: 43 Days</span>
            <span className="text-emerald">-4.2d YoY Impr.</span>
          </div>
        </div>
      )
    },
    {
      id: "wc_financing",
      title: isAr ? "تكلفة تمويل رأس المال العامل" : "WC Financing Cost Calculator",
      tag: "FINANCING",
      desc: isAr
        ? "حساب التكلفة الفعلية للأموال المجمدة في المخزون والذمم المدينة مع محاكاة الوفر لكل يوم تخفيض في CCC."
        : "Quantify interest cost of operating working capital with day-reduction sensitivity slider.",
      icon: <DollarSign className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Carrying Cost @ 8.5%</span>
            <span className="text-emerald font-bold">SAR 68.8k/yr</span>
          </div>
          <div className="p-1.5 bg-emerald-dim border border-emerald-border rounded flex justify-between text-[10px] font-bold text-emerald">
            <span>Reduce CCC by 10 Days:</span>
            <span>Saves SAR 72.2k</span>
          </div>
        </div>
      )
    },
    {
      id: "eoq",
      title: isAr ? "حجم الطلب الاقتصادي (EOQ)" : "Economic Order Quantity (EOQ)",
      tag: "INVENTORY",
      desc: isAr
        ? "تحديد حجم الشحنة الأمثل الذي يقلل تكاليف الطلب والتخزين الإجمالية مع منحنى التكلفة الكلاسيكي."
        : "Find cost-minimizing order batch quantity with continuous ordering vs holding cost tradeoff curves.",
      icon: <PackageCheck className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-2">
          <div className="flex justify-between items-center text-slate-muted">
            <span>Optimal Lot Size</span>
            <span className="text-emerald font-bold">Q* = 1,054 Units</span>
          </div>
          <div className="h-8 w-full flex items-center justify-center">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 24">
              <path d="M 5 5 Q 50 20 95 6" fill="none" stroke="#0E7C69" strokeWidth="2" />
              <circle cx="50" cy="18" r="3" fill="#0E7C69" />
            </svg>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1">
            <span>Cadence: 9.5 Orders/yr</span>
            <span className="text-emerald">Min Cost</span>
          </div>
        </div>
      )
    },
    {
      id: "safety_stock",
      title: isAr ? "مخزون الأمان ونقطة الطلب" : "Safety Stock & Reorder Point",
      tag: "SERVICE LEVEL",
      desc: isAr
        ? "حساب المخزون الاحتياطي ونقطة إعادة الطلب مع تقلبات الموردين ومنحنى حساسية مستويات الخدمة 90%–99.9%."
        : "Statistical buffer inventory engine with lead-time volatility and inverse normal CDF service tradeoffs.",
      icon: <ShieldAlert className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Service Target 95% (Z=1.65)</span>
            <span className="text-emerald font-bold">198 Units SS</span>
          </div>
          <div className="p-1.5 bg-white border border-surface-border rounded flex justify-between text-[10px]">
            <span>Reorder Point (ROP):</span>
            <span className="font-bold text-emerald">1,878 Units</span>
          </div>
        </div>
      )
    },
    {
      id: "abc_xyz",
      title: isAr ? "تصنيف المخزون (ABC / XYZ)" : "ABC / XYZ Portfolio Matrix",
      tag: "PARETO SEGMENTATION",
      desc: isAr
        ? "مصفوفة 3×3 استراتيجية تجمع بين القيمة المالية السنوية (Pareto) ومعامل تقلب الطلب (CV)."
        : "3x3 strategic portfolio matrix combining Pareto monetary value with demand predictability coefficients.",
      icon: <Grid3X3 className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[10px] space-y-1">
          <div className="flex justify-between text-slate-muted">
            <span>Portfolio Grid</span>
            <span className="text-emerald font-bold">9 Cell Playbook</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-center font-bold">
            <div className="p-1 bg-emerald-dim text-emerald rounded">AX (JIT)</div>
            <div className="p-1 bg-white border rounded">AY</div>
            <div className="p-1 bg-rose-100 text-rose-700 rounded">AZ (Risk)</div>
          </div>
        </div>
      )
    },
    {
      id: "demand_forecast",
      title: isAr ? "محرك التنبؤ بالطلب" : "Demand Forecasting & Time Series",
      tag: "TIME SERIES",
      desc: isAr
        ? "توقع الطلب بنماذج SMA و WMA و SES الإحصائية مع مقارنة دقة التنبؤ MAPE و MAD جنباً إلى جنب."
        : "Moving averages and exponential smoothing with side-by-side MAPE/MAD accuracy tournament.",
      icon: <TrendingUp className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Accuracy Benchmark</span>
            <span className="text-emerald font-bold">MAPE: 4.8%</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1">
            <span>Horizon: 4 Periods</span>
            <span className="text-emerald">SMA Fit Optimal</span>
          </div>
        </div>
      )
    },
    {
      id: "sop_worksheet",
      title: isAr ? "جدول موازنة العرض والطلب" : "S&OP Balancing Worksheet",
      tag: "ROLLING S&OP",
      desc: isAr
        ? "موازنة متدحرجة لـ 12 شهراً تربط خطط التوريد بتوقعات المبيعات مع تنبيهات العجز ونفاذ المخزون."
        : "Rolling 12-month balance worksheet linking supply to forecasts, flagging stockouts and buffer alerts.",
      icon: <FileSpreadsheet className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>12M Rolling Balance</span>
            <span className="px-1 py-0.5 rounded text-[9px] font-bold bg-emerald-dim text-emerald">HEALTHY</span>
          </div>
          <div className="flex justify-between text-[10px] border-t border-surface-border pt-1 font-bold">
            <span>Stockouts: 0</span>
            <span>Avg Inv: 580 Units</span>
          </div>
        </div>
      )
    },
    {
      id: "landed_cost",
      title: isAr ? "حاسبة التكلفة الإجمالية الواصلة" : "Delivered Landed Cost (GCC)",
      tag: "IMPORT & LOGISTICS",
      desc: isAr
        ? "حساب التكلفة الفعلية للقطعة المستوردة متضمنة الشحن البحري والرسوم الجمركية والخدمات المينائية."
        : "Delivered import unit cost including FOB, ocean freight, insurance, GCC tariffs, and port fees.",
      icon: <Ship className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>FOB: SAR 65.00</span>
            <span className="text-emerald font-bold">Landed: SAR 77.20</span>
          </div>
          <div className="flex justify-between text-[10px] text-slate-heading font-bold border-t border-surface-border pt-1">
            <span>Customs Duty: 5.0%</span>
            <span className="text-emerald">+18.8% Markup</span>
          </div>
        </div>
      )
    },
    {
      id: "tco",
      title: isAr ? "حاسبة التكلفة الإجمالية للملكية" : "Total Cost of Ownership (TCO)",
      tag: "CAPITAL ASSETS",
      desc: isAr
        ? "مقارنة القرارات الاستثمارية على أساس القيمة الحالية المخصومة لكامل تكاليف التشغيل والصيانة والقيمة التخريدية."
        : "Discounted lifecycle present value model comparing CapEx vs. recurring OpEx and salvage values.",
      icon: <Coins className="text-emerald" size={20} />,
      visual: (
        <div className="bg-surface-subtle p-3 rounded-lg border border-surface-border font-mono text-[11px] space-y-1.5">
          <div className="flex justify-between items-center text-slate-muted mb-1">
            <span>Lifecycle PV (8 Yrs)</span>
            <span className="text-emerald font-bold">SAR 742k Net</span>
          </div>
          <div className="p-1 bg-white border border-surface-border rounded text-[10px] flex justify-between font-bold">
            <span>Option Alpha:</span>
            <span className="text-emerald">Saves SAR 128k</span>
          </div>
        </div>
      )
    }
  ];

  const currentTools = activeSuite === 'financial' ? financialTools : operationsTools;

  return (
    <section id="solution" className="py-20 bg-white relative border-b border-surface-border font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="label-pill label-pill-emerald mb-3">
            <span>{isAr ? "منظومة النماذج الكمية السيادية" : "THE SOVEREIGN COMPUTATIONAL ENGINE SUITE"}</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-slate-heading mb-4">
            {isAr ? "محركات مالية وعملياتية متكاملة لأسواق الخليج" : "Built for the Nuances of GCC Capital & Supply Markets"}
          </h2>

          <p className="text-slate-body text-body-sm leading-relaxed font-sans font-medium">
            {isAr
              ? "تحليل مالي متقدم، تدقيق شرعي، وهندسة سلاسل الإمداد والعمليات. حسابات دقيقة تعمل بالكامل من جانب العميل بدون خوادم خارجية مع سجل تدقيق رياضي وتصدير فوري."
              : "Institutional financial modeling and supply chain operations. Run intrinsic valuations, Shariah compliance audits, inventory optimization, landed cost stacks, and download verified synthesis reports."}
          </p>

          {/* SUITE SWITCHER TABS */}
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveSuite('financial')}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSuite === 'financial'
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-surface-subtle text-slate-600 hover:bg-slate-100 border border-surface-border"
              }`}
            >
              {isAr ? "حزمة النماذج المالية السيادية (10)" : "Financial Engine Suite (10)"}
            </button>
            <button
              onClick={() => setActiveSuite('operations')}
              className={`px-5 py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeSuite === 'operations'
                  ? "bg-emerald text-white shadow-xs"
                  : "bg-surface-subtle text-slate-600 hover:bg-slate-100 border border-surface-border"
              }`}
            >
              {isAr ? "حزمة سلاسل الإمداد والعمليات (11)" : "Supply Chain & Operations Suite (11)"}
            </button>
          </div>
        </div>

        {/* SHOWCASE GRID WITH REAL VISUAL PREVIEWS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentTools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="card-nav p-5 flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-2 rounded bg-[#F8FAFC] border border-[rgba(0,0,0,0.08)] group-hover:border-emerald-border group-hover:bg-emerald-dim transition-colors">
                    <span className="text-slate-500 block">{tool.icon}</span>
                  </div>
                  <span className="label-pill text-slate-muted">
                    {tool.tag}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-heading group-hover:text-emerald transition-colors mb-1">
                    {tool.title}
                  </h3>
                  <p className="text-slate-body text-xs leading-relaxed font-sans">
                    {tool.desc}
                  </p>
                </div>

                <div className="pt-2">
                  {tool.visual}
                </div>
              </div>

              <div className="border-t border-[rgba(0,0,0,0.07)] pt-4 mt-5 flex justify-between items-center">
                <Link
                  href={`/dashboard?panel=${tool.id}`}
                  className="btn-ghost"
                >
                  <span>{isAr ? "تشغيل النموذج" : "Launch Engine"}</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}

/**
 * documentIngestion.ts — Client-side financial statement text extraction & OCR.
 * 
 * Extracts income statement and balance sheet figures locally in the browser:
 * 1. Digital PDFs: Uses pdfjs-dist vector text layer (lossless, instant).
 * 2. Scanned PDFs & Images (PNG, JPG, WEBP): Runs Tesseract.js in a WebAssembly worker.
 * 
 * PRIVACY GUARANTEE:
 * 100% in-browser client execution. No documents, images, or extracted figures
 * ever leave the user's local machine.
 */

export interface ExtractedField {
  key: string;
  labelEn: string;
  labelAr: string;
  value: number | null;
  confidence: "high" | "medium" | "low" | "unconfident";
  rawMatch?: string;
  requiredFor?: ("FS" | "zscore" | "ratios")[];
}

export interface IngestionResult {
  fileName: string;
  fileSize: number;
  extractedAt: string;
  method: "pdf-text" | "tesseract-ocr";
  fields: Record<string, ExtractedField>;
  rawSnippet: string;
  warnings: string[];
}

const FIELD_DEFINITIONS: {
  key: string;
  labelEn: string;
  labelAr: string;
  patterns: RegExp[];
  requiredFor: ("FS" | "zscore" | "ratios")[];
}[] = [
  {
    key: "revenue",
    labelEn: "Revenue / Sales",
    labelAr: "الإيرادات / المبيعات",
    patterns: [
      /(?:total\s+)?(?:revenues?|sales|turnover|net\s+sales|المبيعات|الإيرادات|إجمالي\s+الإيرادات)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
      /(?:revenues?|sales|المبيعات)\s+([\(\)\d,\.]+)/i,
    ],
    requiredFor: ["FS", "zscore", "ratios"],
  },
  {
    key: "cogs",
    labelEn: "Cost of Goods Sold (COGS)",
    labelAr: "تكلفة المبيعات / البضاعة المباعة",
    patterns: [
      /(?:cost\s+of\s+(?:goods\s+sold|sales|revenues?)|cogs|تكلفة\s+(?:المبيعات|الإيرادات|البضاعة))[:\s–—\-]+([\(\)\d,\.\s]+)/i,
      /(?:cost\s+of\s+sales|cogs)\s+([\(\)\d,\.]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "grossProfit",
    labelEn: "Gross Profit",
    labelAr: "إجمالي الربح",
    patterns: [
      /(?:gross\s+profit|gross\s+margin|إجمالي\s+الربح)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "opex",
    labelEn: "Operating Expenses (Opex)",
    labelAr: "المصاريف التشغيلية",
    patterns: [
      /(?:operating\s+expenses?|opex|general\s+(?:and|&)\s+administrative|المصاريف\s+التشغيلية|مصاريف\s+عمومية)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "ebit",
    labelEn: "Operating Income / EBIT",
    labelAr: "الربح التشغيلي (EBIT)",
    patterns: [
      /(?:operating\s+income|operating\s+profit|ebit|الربح\s+التشغيلي|الدخل\s+التشغيلي)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
      /(?:income\s+from\s+operations)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore", "ratios"],
  },
  {
    key: "depreciation",
    labelEn: "Depreciation & Amortization",
    labelAr: "الإهلاك والاستهلاك (D&A)",
    patterns: [
      /(?:depreciation\s+(?:and|&)\s+amortization|d&a|depreciation|الإهلاك|الاستهلاك)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "interestExpense",
    labelEn: "Interest / Finance Expense",
    labelAr: "مصروف الفائدة / تكلفة التمويل",
    patterns: [
      /(?:interest\s+expense|finance\s+costs?|finance\s+expense|فوائد|تكلفة\s+التمويل)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["ratios"],
  },
  {
    key: "netIncome",
    labelEn: "Net Income / Profit",
    labelAr: "صافي الدخل / الربح",
    patterns: [
      /(?:net\s+income|net\s+profit|profit\s+for\s+the\s+(?:year|period)|صافي\s+(?:الدخل|الربح))[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "cash",
    labelEn: "Cash & Cash Equivalents",
    labelAr: "النقد وما في حكمه",
    patterns: [
      /(?:cash\s+and\s+cash\s+equivalents|cash\s+at\s+banks?|النقد\s+وما\s+في\s+حكمه|النقدية)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
      /(?:cash|نقد)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "receivables",
    labelEn: "Accounts Receivable",
    labelAr: "الذمم المدينة / العملاء",
    patterns: [
      /(?:accounts\s+receivable|trade\s+receivables?|receivables|الذمم\s+المدينة|المدينون)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "inventory",
    labelEn: "Inventory",
    labelAr: "المخزون السلعي",
    patterns: [
      /(?:inventor(?:y|ies)|stocks?|المخزون|البضاعة)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "currentAssets",
    labelEn: "Total Current Assets",
    labelAr: "إجمالي الأصول المتداولة",
    patterns: [
      /(?:total\s+current\s+assets|current\s+assets|الأصول\s+المتداولة|إجمالي\s+الأصول\s+المتداولة)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore", "ratios"],
  },
  {
    key: "totalAssets",
    labelEn: "Total Assets",
    labelAr: "إجمالي الأصول",
    patterns: [
      /(?:total\s+assets|إجمالي\s+الأصول|مجموع\s+الأصول)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore", "ratios"],
  },
  {
    key: "payables",
    labelEn: "Accounts Payable",
    labelAr: "الذمم الدائنة / الموردين",
    patterns: [
      /(?:accounts\s+payable|trade\s+payables?|payables|الذمم\s+الدائنة|الدائنون)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "currentLiabilities",
    labelEn: "Total Current Liabilities",
    labelAr: "إجمالي الالتزامات المتداولة",
    patterns: [
      /(?:total\s+current\s+liabilities|current\s+liabilities|الالتزامات\s+المتداولة|إجمالي\s+الالتزامات\s+المتداولة)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore", "ratios"],
  },
  {
    key: "totalDebt",
    labelEn: "Total Debt / Borrowings",
    labelAr: "إجمالي الديون / القروض",
    patterns: [
      /(?:total\s+debts?|short\s+and\s+long\s+term\s+debt|borrowings|loans|القروض|إجمالي\s+الدين)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "totalLiabilities",
    labelEn: "Total Liabilities",
    labelAr: "إجمالي الالتزامات",
    patterns: [
      /(?:total\s+liabilities|إجمالي\s+الالتزامات|مجموع\s+الخصوم)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore", "ratios"],
  },
  {
    key: "retainedEarnings",
    labelEn: "Retained Earnings",
    labelAr: "الأرباح المبقاة",
    patterns: [
      /(?:retained\s+earnings|accumulated\s+(?:losses|surplus)|الأرباح\s+المبقاة|الخسائر\s+المتراكمة)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore"],
  },
  {
    key: "equity",
    labelEn: "Total Shareholders' Equity",
    labelAr: "إجمالي حقوق الملكية / المساهمين",
    patterns: [
      /(?:total\s+(?:shareholders'?\s+)?equity|shareholders'?\s+equity|حقوق\s+المساهمين|حقوق\s+الملكية)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "zscore", "ratios"],
  },
  {
    key: "equityValue",
    labelEn: "Market Value of Equity",
    labelAr: "القيمة السوقية لحقوق الملكية",
    patterns: [
      /(?:market\s+value\s+of\s+equity|market\s+cap(?:italization)?|القيمة\s+السوقية)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["zscore"],
  },
  {
    key: "capex",
    labelEn: "Capital Expenditures (Capex)",
    labelAr: "الإنفاق الرأسمالي (Capex)",
    patterns: [
      /(?:capital\s+expenditures?|capex|purchase\s+of\s+property|additions\s+to\s+property|الإنفاق\s+الرأسمالي)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
  {
    key: "operatingCashFlow",
    labelEn: "Operating Cash Flow",
    labelAr: "التدفق النقدي التشغيلي",
    patterns: [
      /(?:net\s+cash\s+(?:generated\s+from|used\s+in)\s+operating|operating\s+cash\s+flow|التدفق\s+النقدي\s+من\s+الأنشطة\s+التشغيلية)[:\s–—\-]+([\(\)\d,\.\s]+)/i,
    ],
    requiredFor: ["FS", "ratios"],
  },
];

function cleanNumber(raw: string): number | null {
  if (!raw) return null;
  // Handle brackets e.g. (1,234.5) => -1234.5
  let isNeg = false;
  let str = raw.trim();
  if (str.startsWith("(") && str.endsWith(")")) {
    isNeg = true;
    str = str.slice(1, -1).trim();
  }
  // Replace commas and non-numeric except dot
  const numStr = str.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  if (!numStr) return null;
  let val = parseFloat(numStr[0]);
  if (isNaN(val)) return null;
  if (isNeg && val > 0) val = -val;
  return val;
}

/**
 * Extracts plain text from an uploaded PDF using pdfjs-dist.
 */
export async function extractPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  // Dynamic import of pdfjs-dist
  const pdfjsLib = await import("pdfjs-dist");

  // Set worker src if available in browser
  if (typeof window !== "undefined" && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = "";

  for (let i = 1; i <= Math.min(pdf.numPages, 10); i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const strings = content.items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((item: any) => item.str ?? "")
      .join(" ");
    fullText += `\n--- Page ${i} ---\n` + strings;
  }

  return fullText;
}

/**
 * Extracts text from an image or scanned document using Tesseract.js in a Web Worker.
 */
export async function extractImageOcr(
  imageSource: File | Blob | HTMLCanvasElement,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("eng");

  try {
    const ret = await worker.recognize(imageSource as any);
    await worker.terminate();
    return ret.data.text || "";
  } catch (err) {
    await worker.terminate();
    throw err;
  }
}

/**
 * Main ingestion entrypoint: determines file type, runs extraction,
 * regex parsing, and returns structured reviewed values.
 */
export async function ingestFinancialDocument(
  file: File,
  onProgress?: (status: string, pct: number) => void
): Promise<IngestionResult> {
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  let text = "";
  let method: "pdf-text" | "tesseract-ocr" = "pdf-text";

  if (isPdf) {
    onProgress?.("Extracting PDF vector text...", 20);
    try {
      text = await extractPdfText(file);
    } catch {
      text = "";
    }

    // If PDF has no digital text layer (< 50 chars), fallback to OCR
    if (!text || text.trim().length < 50) {
      onProgress?.("Scanned PDF detected. Running client-side OCR...", 40);
      method = "tesseract-ocr";
      text = await extractImageOcr(file, (p) => onProgress?.("OCR Processing...", 40 + p * 40));
    }
  } else {
    // Image file (PNG, JPG, WEBP)
    onProgress?.("Reading image & running client-side OCR...", 30);
    method = "tesseract-ocr";
    text = await extractImageOcr(file, (p) => onProgress?.("OCR Processing...", 30 + p * 60));
  }

  onProgress?.("Mapping extracted financial line items...", 90);

  // Line-by-line / pattern matching
  const fields: Record<string, ExtractedField> = {};
  const warnings: string[] = [];

  for (const def of FIELD_DEFINITIONS) {
    let matchedVal: number | null = null;
    let confidence: "high" | "medium" | "low" | "unconfident" = "unconfident";
    let rawMatch: string | undefined = undefined;

    for (const pat of def.patterns) {
      const match = text.match(pat);
      if (match && match[1]) {
        const val = cleanNumber(match[1]);
        if (val !== null && !isNaN(val)) {
          matchedVal = val;
          rawMatch = match[0].trim();
          confidence = "high";
          break;
        }
      }
    }

    // If not found or low confidence, leave blank (null) and mark unconfident
    if (matchedVal === null) {
      confidence = "unconfident";
      warnings.push(`Could not reliably detect "${def.labelEn}". Left blank for manual review.`);
    }

    fields[def.key] = {
      key: def.key,
      labelEn: def.labelEn,
      labelAr: def.labelAr,
      value: matchedVal,
      confidence,
      rawMatch,
      requiredFor: def.requiredFor,
    };
  }

  // Derive Working Capital if current assets & current liabilities exist but workingCapital is not matched
  if (fields.currentAssets?.value !== null && fields.currentLiabilities?.value !== null) {
    const derivedWC = (fields.currentAssets.value ?? 0) - (fields.currentLiabilities.value ?? 0);
    fields["workingCapital"] = {
      key: "workingCapital",
      labelEn: "Working Capital (Current Assets − Current Liab)",
      labelAr: "رأس المال العامل (الأصول المتداولة - الالتزامات المتداولة)",
      value: derivedWC,
      confidence: "medium",
      rawMatch: `Derived: ${fields.currentAssets.value} - ${fields.currentLiabilities.value}`,
      requiredFor: ["zscore"],
    };
  }

  onProgress?.("Extraction complete. Review figures before applying.", 100);

  return {
    fileName: file.name,
    fileSize: file.size,
    extractedAt: new Date().toISOString(),
    method,
    fields,
    rawSnippet: text.slice(0, 1000),
    warnings,
  };
}

// components/operations/shared/exportOperations.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { TERMINAL_CHART_THEME as T, cssToken } from "@/lib/chartTheme";

/**
 * Legacy screenshot export (html2canvas). Kept for the older panels; the engine
 * shell now uses exportRowsToPdf, which is vector, paginated and ~20× faster.
 */
export async function exportToPdf(elementId: string, filename: string): Promise<boolean> {
  const el = document.getElementById(elementId);
  if (!el) return false;
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(el, { scale: 1.6, backgroundColor: cssToken(T.colors.canvas), logging: false, useCORS: true });
    const img = canvas.toDataURL("image/jpeg", 0.9);
    const pdf = new jsPDF("p", "mm", "a4");
    const w = 210;
    const h = (canvas.height * w) / canvas.width;
    let y = 0;
    while (y < h) {
      pdf.addImage(img, "JPEG", 0, -y, w, h);
      y += 297;
      if (y < h) pdf.addPage();
    }
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF export failed:", err);
    return false;
  }
}

export interface PdfMeta { title: string; subtitle?: string; code?: string; currency?: string; author?: string; audit?: { title: string; formula: string; substitution: string; result: string }[] }

/** Branded tabular PDF: header band, KPI table, optional formula trace, footer with page numbers. */
export function exportRowsToPdf(rows: Record<string, string | number>[], filename: string, meta: PdfMeta): boolean {
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const now = new Date();
    pdf.setFillColor(9, 15, 18);
    pdf.rect(0, 0, 210, 30, "F");
    pdf.setTextColor(232, 241, 237);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(`${meta.code ? meta.code + "  ·  " : ""}${meta.title}`, 14, 13);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(167, 185, 178);
    if (meta.subtitle) pdf.text(pdf.splitTextToSize(meta.subtitle, 180), 14, 19);
    pdf.setTextColor(61, 219, 180);
    pdf.text(`MAHWAR TERMINAL  ·  ${meta.currency ?? ""}  ·  ${now.toISOString().slice(0, 16).replace("T", " ")}`, 14, 26);

    const keys = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
    autoTable(pdf, {
      startY: 36,
      head: [keys],
      body: rows.map((r) => keys.map((k) => { const v = r[k]; return typeof v === "number" ? v.toLocaleString("en-US", { maximumFractionDigits: 4 }) : v ?? ""; })),
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.2, textColor: [30, 40, 44] },
      headStyles: { fillColor: [23, 168, 138], textColor: [5, 9, 11], fontStyle: "bold" },
      alternateRowStyles: { fillColor: [243, 247, 245] },
      margin: { left: 14, right: 14 },
    });

    if (meta.audit && meta.audit.length) {
      const y = ((pdf as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 40) + 8;
      pdf.setTextColor(30, 40, 44);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("Formula trace", 14, y);
      autoTable(pdf, {
        startY: y + 3,
        head: [["Step", "Formula", "Substitution", "Result"]],
        body: meta.audit.map((s) => [s.title, s.formula, s.substitution, s.result]),
        styles: { font: "courier", fontSize: 7.5, cellPadding: 2 },
        headStyles: { fillColor: [217, 179, 110], textColor: [5, 9, 11] },
        columnStyles: { 1: { cellWidth: 48 }, 2: { cellWidth: 60 } },
        margin: { left: 14, right: 14 },
      });
    }

    const pages = pdf.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      pdf.setPage(p);
      pdf.setFontSize(7.5);
      pdf.setTextColor(120, 130, 126);
      pdf.text(`Computed in the browser by Mahwar. Not investment advice. ${meta.author ? "© " + meta.author : ""}`, 14, 291);
      pdf.text(`${p} / ${pages}`, 196, 291, { align: "right" });
    }
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF export failed:", err);
    return false;
  }
}

export function exportToExcel(sheets: { name: string; data: Record<string, unknown>[] | unknown[][] }[], filename: string): void {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, data }) => {
    const ws = Array.isArray(data) && data.length > 0 && Array.isArray(data[0])
      ? XLSX.utils.aoa_to_sheet(data as unknown[][])
      : XLSX.utils.json_to_sheet(data as Record<string, unknown>[]);
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

// components/operations/shared/exportOperations.ts
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPdf(elementId: string, filename: string): Promise<boolean> {
  const el = document.getElementById(elementId);
  if (!el) return false;

  try {
    const canvas = await html2canvas(el, {
      scale: 1.8,
      backgroundColor: "#FFFFFF",
      logging: false,
      useCORS: true,
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = 210;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(295, pdfHeight));
    pdf.save(`${filename}.pdf`);
    return true;
  } catch (err) {
    console.error("PDF Export failed:", err);
    return false;
  }
}

export function exportToExcel(
  sheets: { name: string; data: Record<string, any>[] | any[][] }[],
  filename: string
): void {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, data }) => {
    let ws: XLSX.WorkSheet;
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      ws = XLSX.utils.aoa_to_sheet(data as any[][]);
    } else {
      ws = XLSX.utils.json_to_sheet(data as Record<string, any>[]);
    }
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  XLSX.writeFile(wb, `${filename}.xlsx`);
}


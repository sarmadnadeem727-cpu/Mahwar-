# Architectural & Engineering Decisions

## DEC-001: Document Ingestion & OCR Architecture

### Context
Financial analysis in Mahwar requires entering figures from company financial statements (balance sheet, income statement, cash flow statements). Users frequently possess these statements in PDF format (audited annual reports, quarterly filings) or as scanned documents and screenshots (JPEG, PNG, WEBP).

### Decision
Implement client-side extraction using a hybrid pipeline:
1. **Digital PDFs:** Extracted losslessly via `pdfjs-dist` by traversing the PDF's text layer directly in the browser.
2. **Scanned Documents & Images:** Extracted using `tesseract.js` executing within a dedicated Web Worker via WebAssembly.
3. **Line-Item Mapping & Verification:** Financial regex patterns map raw text to core engine schemas (`FS`, `zscore`, `ratios`). Extracted items are classified into confidence tiers (`high`, `medium`, `unconfident`). Missing or unconfident fields are left blank and highlighted for explicit manual review. Extracted values are never auto-submitted without user confirmation.
4. **Provenance Tracking:** Ingested files inject a clear audit trail entry (`"populated from uploaded statement: [filename]"`) into formula traces and export summaries.

### Cost & Accuracy Tradeoff
| Approach | Cost | Privacy Guarantee | Accuracy / Latency Tradeoff |
| :--- | :--- | :--- | :--- |
| **Client-Side WASM (Chosen: PDF.js + Tesseract.js)** | **$0.00 (Free forever)** | **100% On-Device:** No documents, statements, or financial metrics leave the user's browser. | Instant (<100ms) for vector PDFs. Moderate (2–5s) for high-resolution images. Standard OCR accuracy on complex multi-column layouts, counterbalanced by mandatory human-in-the-loop verification before values are applied to calculations. |
| **Cloud OCR API (e.g. AWS Textract, Google Cloud Vision, Azure AI)** | $1.50 – $4.00 per 1,000 pages + infrastructure overhead | **Violates Privacy:** Financial statements must be transmitted over the internet to third-party servers, breaking the "nothing leaves your machine" privacy commitment. | Marginal gain in table boundary detection for low-quality physical scans, but creates regulatory, compliance, and privacy risks for confidential SME financial data. |

### Privacy Compliance
Because all ingestion runs client-side in the browser via WebAssembly:
- The local-first privacy statement on `/privacy` remains fully accurate and intact.
- An upload-time disclosure banner explicitly communicates to the user: *"100% Client-Side Privacy: Text extraction & OCR execute entirely inside your browser via WebAssembly. Your financial statements never leave your machine."*

"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, ArrowRight, Clock, Download, Upload, X, AlertTriangle, AlertOctagon, Sparkles, TerminalSquare } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal, staggerContainer, staggerItem } from "@/lib/motion";
import { APP, SUITES, TOOLS, getTool, toolsBySuite, type ToolDef } from "@/lib/registry";
import { deriveSignals } from "@/lib/signals";
import { downloadSession, pickSessionFile } from "@/lib/session";

/** Pick up to three numeric headline outputs from a saved analysis, generically. */
function headline(outputs: unknown): { k: string; v: string }[] {
  if (!outputs || typeof outputs !== "object") return [];
  const entries = Object.entries(outputs as Record<string, unknown>);
  return entries
    .filter(([, v]) => typeof v === "number" && Number.isFinite(v))
    .slice(0, 3)
    .map(([k, v]) => ({
      k: k.replace(/([A-Z])/g, " $1").replace(/_/g, " ").toLowerCase(),
      v: (v as number).toLocaleString("en-US", { maximumFractionDigits: 2 }),
    }));
}

function since(iso: string, isAr: boolean) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return isAr ? `قبل ${mins} د` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  return hrs < 24 ? (isAr ? `قبل ${hrs} س` : `${hrs}h ago`) : isAr ? `قبل ${Math.round(hrs / 24)} ي` : `${Math.round(hrs / 24)}d ago`;
}

export default function IntelligenceHub() {
  const { sessionAnalyses, setPanel, language, currency, clearSessionAnalyses, recentPanels, removeSessionAnalysis, importSession, toast } = useTerminalStore(
    useShallow((s) => ({
      sessionAnalyses: s.sessionAnalyses, setPanel: s.setPanel, language: s.language, currency: s.currency, clearSessionAnalyses: s.clearSessionAnalyses,
      recentPanels: s.recentPanels, removeSessionAnalysis: s.removeSessionAnalysis, importSession: s.importSession, toast: s.toast,
    }))
  );
  const isAr = language === "ar";
  const signals = useMemo(() => deriveSignals(sessionAnalyses), [sessionAnalyses]);

  const onImport = async () => {
    const file = await pickSessionFile();
    if (!file) return;
    const count = importSession(file, "merge");
    toast(count > 0 ? (isAr ? `تم استيراد ${count} تحليلاً` : `Imported ${count} analyses`) : (isAr ? "ملف جلسة غير صالح" : "Not a valid Mahwar session file"), count > 0 ? "ok" : "err");
  };

  const saved = useMemo(
    () =>
      TOOLS.filter((t) => t.sessionKey && sessionAnalyses[t.sessionKey]).map((t) => {
        const entry = sessionAnalyses[t.sessionKey!] as { outputs?: unknown; computedAt: string; models?: unknown[] };
        return { tool: t, entry };
      }),
    [sessionAnalyses]
  );

  const recent = recentPanels.map(getTool).filter(Boolean).slice(0, 6) as ToolDef[];

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      {/* Header strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">
            {APP.name.toUpperCase()} · {isAr ? "الجلسة" : "SESSION"}
          </p>
          <h1 className={`mt-2 font-serif text-3xl md:text-4xl text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "لوحة الجلسة" : "Session board"}
          </h1>
          <p className="mt-2 text-[13px] text-fg-3 max-w-xl">
            {isAr
              ? `${saved.length} تحليل محفوظ بعملة ${currency}. كل ما تحفظه هنا يدخل في تقرير واحد.`
              : `${saved.length} saved ${saved.length === 1 ? "analysis" : "analyses"} in ${currency}. Everything saved here lands in one report.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={onImport} className="btn-secondary" title={isAr ? "استيراد جلسة JSON" : "Import a session JSON"}>
            <Upload size={13} /> <span className="hidden sm:inline">{isAr ? "استيراد" : "Import"}</span>
          </button>
          <button onClick={() => { downloadSession(); toast(isAr ? "تم تنزيل الجلسة" : "Session downloaded"); }} className="btn-secondary" disabled={saved.length === 0} title={isAr ? "تنزيل الجلسة" : "Download session"}>
            <Download size={13} /> <span className="hidden sm:inline">{isAr ? "تنزيل" : "Export"}</span>
          </button>
          {saved.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(isAr ? "مسح كل التحليلات المحفوظة؟" : "Clear every saved analysis?")) clearSessionAnalyses();
              }}
              className="btn-secondary"
            >
              <Trash2 size={13} /> <span className="hidden sm:inline">{isAr ? "مسح" : "Clear"}</span>
            </button>
          )}
          <button onClick={() => setPanel("bi_report")} className="btn-primary" disabled={saved.length === 0}>
            <FileText size={13} /> {isAr ? "إنشاء التقرير" : "Build the report"}
          </button>
        </div>
      </div>

      {/* Signals */}
      {signals.length > 0 && (
        <section className="panel-data overflow-hidden">
          <div className="px-4 md:px-5 py-3 border-b border-line flex items-center justify-between font-mono text-[10.5px] text-fg-3">
            <span className="flex items-center gap-2"><Sparkles size={12} className="text-gold" /> {isAr ? "إشارات عبر المحركات" : "Cross-engine signals"}</span>
            <span>{signals.filter((x) => x.tone === "neg").length} {isAr ? "حرجة" : "critical"} · {signals.filter((x) => x.tone === "warn").length} {isAr ? "تنبيه" : "watch"}</span>
          </div>
          <ul className="divide-y divide-line">
            {signals.map((sig) => {
              const Icon = sig.tone === "neg" ? AlertOctagon : sig.tone === "warn" ? AlertTriangle : Sparkles;
              const color = sig.tone === "neg" ? "text-neg" : sig.tone === "warn" ? "text-warn" : "text-emerald-light";
              return (
                <li key={sig.id}>
                  <button onClick={() => setPanel(sig.panel)} className="w-full flex items-start gap-3 px-4 md:px-5 py-2.5 text-start hover:bg-ink-3/60 transition-colors">
                    <Icon size={14} className={`${color} shrink-0 mt-0.5`} />
                    <span className={`font-mono text-[10.5px] tracking-wider w-12 shrink-0 ${color}`}>{sig.code}</span>
                    <span className="text-[12.5px] text-fg-2 leading-snug">{isAr ? sig.ar : sig.en}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Saved analyses */}
      <section className="panel-data">
        <div className="px-5 py-3 border-b border-line flex items-center justify-between font-mono text-[10.5px] text-fg-3">
          <span>{isAr ? "التحليلات المحفوظة" : "Saved analyses"}</span>
          <span>{saved.length}</span>
        </div>
        {saved.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-fg-2">{isAr ? "لم يُحفظ أي تحليل بعد." : "Nothing saved yet."}</p>
            <p className="mt-1 text-[12px] text-fg-3">
              {isAr ? "افتح أي محرك أدناه، أدخل أرقامك، وسيظهر هنا تلقائياً." : "Open any engine below, enter your numbers, and it appears here automatically."}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button onClick={() => setPanel("ccc")} className="btn-ghost text-[11px]">
                {isAr ? "ابدأ بدورة التحويل النقدي" : "Start with the cash conversion cycle"} <ArrowRight size={12} className={isAr ? "rotate-180" : ""} />
              </button>
              <button onClick={() => setPanel("console")} className="btn-ghost text-[11px]">
                <TerminalSquare size={12} /> {isAr ? "أو افتح وحدة التحكم" : "or open the console"}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto"><table className="terminal-table min-w-[560px]">
            <thead>
              <tr>
                <th>{isAr ? "الكود" : "Code"}</th>
                <th>{isAr ? "المحرك" : "Engine"}</th>
                <th>{isAr ? "أبرز النتائج" : "Headline outputs"}</th>
                <th className="text-end">{isAr ? "آخر حساب" : "Computed"}</th>
                <th className="w-8" aria-label="Remove" />
              </tr>
            </thead>
            <tbody>
              {saved.map(({ tool, entry }) => {
                const outs = "models" in entry && Array.isArray(entry.models)
                  ? [{ k: isAr ? "نماذج" : "models", v: String(entry.models.length) }]
                  : headline(entry.outputs);
                return (
                  <tr key={tool.id} onClick={() => setPanel(tool.id)} className="cursor-pointer">
                    <td className="text-emerald-light">{tool.code}</td>
                    <td className="font-sans text-[13px]">{isAr ? tool.ar : tool.en}</td>
                    <td>
                      <span className="flex flex-wrap gap-x-4 gap-y-1">
                        {outs.length === 0 && <span className="text-fg-3">—</span>}
                        {outs.map((o) => (
                          <span key={o.k}><span className="text-fg-3">{o.k} </span><span className="text-fg">{o.v}</span></span>
                        ))}
                      </span>
                    </td>
                    <td className="text-end text-fg-3">
                      <span className="inline-flex items-center gap-1"><Clock size={11} />{since(entry.computedAt, isAr)}</span>
                    </td>
                    <td className="text-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSessionAnalysis(tool.sessionKey!); toast(isAr ? `أُزيل ${tool.code} من الجلسة` : `${tool.code} removed from session`, "warn"); }}
                        className="p-1 rounded text-fg-4 hover:text-neg hover:bg-ink-4"
                        aria-label={isAr ? "إزالة" : "Remove"}
                      >
                        <X size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table></div>
        )}
      </section>

      {/* Recent */}
      {recent.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
          <span className="text-fg-4">{isAr ? "الأخيرة" : "Recent"}</span>
          {recent.map((t) => (
            <button key={t.id} onClick={() => setPanel(t.id)} className="px-2.5 py-1 rounded border border-line text-fg-2 hover:border-emerald/40 hover:text-fg transition-colors">
              {t.code} <span className="text-fg-4 font-sans">{isAr ? t.ar : t.en}</span>
            </button>
          ))}
        </div>
      )}

      {/* Launcher */}
      {SUITES.filter((s) => s.id !== "platform").map((suite) => {
        const list = toolsBySuite(suite.id);
        return (
          <section key={suite.id}>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="font-serif text-2xl text-fg">{isAr ? suite.ar : suite.en}</h2>
              <span className="font-mono text-[11px] text-fg-3">{list.length} {isAr ? "محرك" : "engines"}</span>
            </div>
            <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              {list.map((tool) => {
                const Icon = tool.icon;
                const has = tool.sessionKey && sessionAnalyses[tool.sessionKey];
                return (
                  <motion.button
                    key={tool.id}
                    variants={staggerItem}
                    onClick={() => setPanel(tool.id)}
                    className="card-nav p-4 text-start flex flex-col gap-3 min-h-[140px] group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] tracking-wider text-emerald-light">{tool.code}</span>
                      <Icon size={15} className="text-fg-3 group-hover:text-emerald-light transition-colors" />
                    </div>
                    <div className="text-[14px] text-fg leading-snug">{isAr ? tool.ar : tool.en}</div>
                    <p className="text-[12px] text-fg-3 leading-relaxed flex-1 line-clamp-2">{isAr ? tool.descAr : tool.descEn}</p>
                    <div className="font-mono text-[10px] flex items-center justify-between">
                      <span className="text-fg-4">{tool.tag}</span>
                      <span className={has ? "text-emerald-light" : "text-fg-4"}>{has ? (isAr ? "محفوظ" : "saved") : (isAr ? "جاهز" : "ready")}</span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </section>
        );
      })}
    </motion.div>
  );
}


"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { FileText, Trash2, ArrowRight, Clock } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal, staggerContainer, staggerItem } from "@/lib/motion";
import { APP, SUITES, TOOLS, getTool, toolsBySuite, type ToolDef } from "@/lib/registry";

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
  const { sessionAnalyses, setPanel, language, currency, clearSessionAnalyses, recentPanels } = useTerminalStore();
  const isAr = language === "ar";

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
        <div className="flex items-center gap-2">
          {saved.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm(isAr ? "مسح كل التحليلات المحفوظة؟" : "Clear every saved analysis?")) clearSessionAnalyses();
              }}
              className="btn-secondary"
            >
              <Trash2 size={13} /> {isAr ? "مسح الجلسة" : "Clear session"}
            </button>
          )}
          <button onClick={() => setPanel("bi_report")} className="btn-primary" disabled={saved.length === 0}>
            <FileText size={13} /> {isAr ? "إنشاء التقرير" : "Build the report"}
          </button>
        </div>
      </div>

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
            <button onClick={() => setPanel("ccc")} className="btn-ghost mt-4 text-[11px]">
              {isAr ? "ابدأ بدورة التحويل النقدي" : "Start with the cash conversion cycle"} <ArrowRight size={12} className={isAr ? "rotate-180" : ""} />
            </button>
          </div>
        ) : (
          <table className="terminal-table">
            <thead>
              <tr>
                <th>{isAr ? "الكود" : "Code"}</th>
                <th>{isAr ? "المحرك" : "Engine"}</th>
                <th>{isAr ? "أبرز النتائج" : "Headline outputs"}</th>
                <th className="text-end">{isAr ? "آخر حساب" : "Computed"}</th>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
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

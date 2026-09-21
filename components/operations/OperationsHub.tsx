"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal, staggerContainer, staggerItem } from "@/lib/motion";
import { CLUSTERS, toolsBySuite } from "@/lib/registry";

/** Supply-chain suite launcher, grouped by cluster, straight from the registry. */
export default function OperationsHub() {
  const { setPanel, language, sessionAnalyses } = useTerminalStore();
  const isAr = language === "ar";
  const tools = toolsBySuite("operations");
  const clusters = Array.from(new Set(tools.map((t) => t.cluster!)));

  // The flow an analyst usually follows — order quantity feeds inventory, which feeds cash.
  const path = ["eoq", "safety_stock", "ccc", "wc_financing"] as const;

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="space-y-8" dir={isAr ? "rtl" : "ltr"}>
      <div>
        <p className="font-mono text-[11px] tracking-[0.2em] text-gold">OPS · {isAr ? "سلاسل الإمداد" : "SUPPLY CHAIN"}</p>
        <h1 className={`mt-2 font-serif text-3xl md:text-4xl text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
          {isAr ? "مجموعة العمليات" : "Operations suite"}
        </h1>
        <p className="mt-2 text-[13px] text-fg-3 max-w-2xl">
          {isAr
            ? `${tools.length} محركاً من حجم الطلب إلى موقع المستودع. المسار المعتاد: حجم الطلب ← مخزون الأمان ← الدورة النقدية ← تكلفة التمويل.`
            : `${tools.length} engines from order quantity to warehouse location. The usual path: EOQ → safety stock → cash cycle → financing cost.`}
        </p>
      </div>

      {/* Suggested path */}
      <div className="panel-data p-4 flex flex-wrap items-center gap-2 font-mono text-[11px]">
        <span className="text-fg-4 me-2">{isAr ? "المسار المقترح" : "Suggested path"}</span>
        {path.map((id, i) => {
          const t = tools.find((x) => x.id === id)!;
          return (
            <React.Fragment key={id}>
              <button onClick={() => setPanel(id)} className="px-2.5 py-1 rounded border border-line hover:border-gold/50 text-fg-2 hover:text-fg transition-colors">
                <span className="text-gold">{t.code}</span> <span className="font-sans">{isAr ? t.ar : t.en}</span>
              </button>
              {i < path.length - 1 && <ArrowRight size={12} className={`text-fg-4 ${isAr ? "rotate-180" : ""}`} />}
            </React.Fragment>
          );
        })}
      </div>

      {clusters.map((c) => (
        <section key={c}>
          <h2 className="font-serif text-2xl text-fg mb-3">{isAr ? CLUSTERS[c].ar : CLUSTERS[c].en}</h2>
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {tools.filter((t) => t.cluster === c).map((tool) => {
              const Icon = tool.icon;
              const has = tool.sessionKey && sessionAnalyses[tool.sessionKey];
              return (
                <motion.button key={tool.id} variants={staggerItem} onClick={() => setPanel(tool.id)} className="card-nav p-5 text-start flex flex-col gap-3 min-h-[150px] group">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wider text-gold">{tool.code}</span>
                    <Icon size={16} className="text-fg-3 group-hover:text-gold transition-colors" />
                  </div>
                  <div className="text-[15px] text-fg leading-snug">{isAr ? tool.ar : tool.en}</div>
                  <p className="text-[12.5px] text-fg-3 leading-relaxed flex-1">{isAr ? tool.descAr : tool.descEn}</p>
                  <div className="font-mono text-[10px] flex items-center justify-between">
                    <span className="text-fg-4">{tool.tag}</span>
                    <span className={has ? "text-emerald-light" : "text-fg-4"}>{has ? (isAr ? "محفوظ" : "saved") : (isAr ? "جاهز" : "ready")}</span>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>
      ))}
    </motion.div>
  );
}


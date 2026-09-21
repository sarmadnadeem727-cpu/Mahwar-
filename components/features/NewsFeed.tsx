"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, RefreshCw, Radio, Ship, Landmark } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { panelReveal } from "@/lib/motion";
import type { NewsArticle, NewsCategory, NewsLane } from "@/app/api/news/route";

type Filter = "ALL" | NewsLane | NewsCategory;

const LANES: { id: Filter; en: string; ar: string; icon?: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { id: "ALL", en: "All", ar: "الكل" },
  { id: "finance", en: "Finance", ar: "المالية", icon: Landmark },
  { id: "supply_chain", en: "Supply chain", ar: "سلاسل الإمداد", icon: Ship },
];

const CATEGORIES: Record<NewsLane, { id: NewsCategory; en: string; ar: string }[]> = {
  finance: [
    { id: "SAUDI", en: "Saudi", ar: "السعودية" },
    { id: "GCC", en: "GCC", ar: "الخليج" },
    { id: "ISLAMIC_FINANCE", en: "Islamic finance", ar: "التمويل الإسلامي" },
    { id: "MACRO", en: "Macro & energy", ar: "الاقتصاد الكلي" },
  ],
  supply_chain: [
    { id: "PORTS_SHIPPING", en: "Ports & shipping", ar: "الموانئ والشحن" },
    { id: "LOGISTICS", en: "Logistics", ar: "اللوجستيات" },
    { id: "PROCUREMENT", en: "Procurement", ar: "المشتريات" },
    { id: "INDUSTRY", en: "Industry", ar: "الصناعة" },
  ],
};

function timeAgo(iso: string, isAr: boolean) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return isAr ? `قبل ${mins} د` : `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return isAr ? `قبل ${hrs} س` : `${hrs}h`;
  return isAr ? `قبل ${Math.round(hrs / 24)} ي` : `${Math.round(hrs / 24)}d`;
}

export default function NewsFeed() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [provider, setProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lane, setLane] = useState<Filter>("ALL");
  const [category, setCategory] = useState<NewsCategory | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/news", { cache: "no-store" });
      const data = await res.json();
      setArticles(data.articles ?? []);
      setProvider(data.provider ?? null);
      setError(data.error ?? null);
      setUpdatedAt(new Date());
    } catch {
      setError(isAr ? "تعذر الوصول إلى خدمة الأخبار." : "The news service could not be reached.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = window.setInterval(load, 5 * 60 * 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visible = useMemo(
    () =>
      articles.filter((a) => {
        if (lane !== "ALL" && a.lane !== lane) return false;
        if (category && a.category !== category) return false;
        return true;
      }),
    [articles, lane, category]
  );

  const counts = useMemo(
    () => ({
      finance: articles.filter((a) => a.lane === "finance").length,
      supply_chain: articles.filter((a) => a.lane === "supply_chain").length,
    }),
    [articles]
  );

  return (
    <motion.div variants={panelReveal} initial="initial" animate="animate" exit="exit" className="space-y-5" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-5 border-b border-line">
        <div>
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light flex items-center gap-2">
            <Radio size={12} className={!loading && !error ? "animate-pulse" : ""} /> WIRE
          </p>
          <h1 className={`mt-1 font-serif text-3xl text-fg ${isAr ? "font-cairo font-bold" : ""}`}>{isAr ? "الأخبار المباشرة" : "Market & supply-chain wire"}</h1>
          <p className="mt-1 font-mono text-[11px] text-fg-3">
            {provider ? `${provider} · ` : ""}
            {counts.finance} {isAr ? "مالية" : "finance"} · {counts.supply_chain} {isAr ? "سلاسل إمداد" : "supply chain"}
            {updatedAt && ` · ${isAr ? "آخر تحديث" : "updated"} ${updatedAt.toLocaleTimeString(isAr ? "ar-SA-u-nu-latn" : "en-GB", { hour: "2-digit", minute: "2-digit" })}`}
          </p>
        </div>
        <button onClick={load} disabled={loading} className="btn-secondary">
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> {isAr ? "تحديث" : "Refresh"}
        </button>
      </div>

      {/* Lane tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {LANES.map((l) => {
          const active = lane === l.id;
          const Icon = l.icon;
          return (
            <button
              key={l.id}
              onClick={() => { setLane(l.id); setCategory(null); }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border font-mono text-[11px] transition-colors ${
                active ? "border-emerald/50 bg-emerald/10 text-emerald-light" : "border-line text-fg-2 hover:text-fg hover:border-line-strong"
              }`}
            >
              {Icon && <Icon size={12} />} {isAr ? l.ar : l.en}
            </button>
          );
        })}
        {(lane === "finance" || lane === "supply_chain") && (
          <span className="flex flex-wrap items-center gap-1.5 ms-2 ps-3 border-s border-line">
            {CATEGORIES[lane].map((c) => (
              <button
                key={c.id}
                onClick={() => setCategory(category === c.id ? null : c.id)}
                className={`px-2 py-1 rounded font-mono text-[10px] transition-colors ${category === c.id ? "bg-gold/15 text-gold" : "text-fg-3 hover:text-fg"}`}
              >
                {isAr ? c.ar : c.en}
              </button>
            ))}
          </span>
        )}
      </div>

      <div className="panel-data divide-y divide-line">
        {loading && articles.length === 0 &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 flex gap-5 animate-pulse"><span className="h-3 w-10 bg-ink-4 rounded" /><span className="h-3 flex-1 bg-ink-4 rounded" /></div>
          ))}

        {!loading && visible.length === 0 && (
          <div className="p-10 text-center">
            <p className="text-fg-2">{error ?? (isAr ? "لا توجد عناوين في هذا التصنيف." : "No headlines in this lane right now.")}</p>
            {error && <p className="mt-1 font-mono text-[11px] text-fg-3">{isAr ? "أضف MARKETAUX_API_KEY أو اسمح للخادم بالوصول إلى news.google.com" : "Set MARKETAUX_API_KEY or allow the server to reach news.google.com"}</p>}
          </div>
        )}

        {visible.map((a) => (
          <a key={a.id} href={a.url} target="_blank" rel="noreferrer" className="group p-4 grid grid-cols-[52px_1fr_auto] gap-4 items-start hover:bg-emerald/5 transition-colors">
            <span className="font-mono text-[10px] text-fg-3 pt-0.5">{timeAgo(a.publishedAt, isAr)}</span>
            <span>
              <span className="block text-[14px] text-fg leading-snug group-hover:text-emerald-light transition-colors">{isAr && a.titleAr ? a.titleAr : a.title}</span>
              <span className="mt-1 flex items-center gap-2 font-mono text-[10px] text-fg-3">
                <span className={a.lane === "supply_chain" ? "text-gold" : "text-emerald-light"}>{a.lane === "supply_chain" ? "SC" : "FIN"}</span>
                <span>{a.category.replace(/_/g, " ").toLowerCase()}</span>
                <span>·</span>
                <span>{a.source}</span>
              </span>
            </span>
            <ExternalLink size={13} className="text-fg-4 group-hover:text-emerald-light mt-1" />
          </a>
        ))}
      </div>
    </motion.div>
  );
}


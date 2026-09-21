"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight, Radio } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import type { NewsArticle } from "@/app/api/news/route";
import { reveal, viewportOnce } from "@/lib/motion";

function timeAgo(iso: string, isAr: boolean) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return isAr ? `قبل ${mins} د` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return isAr ? `قبل ${hrs} س` : `${hrs}h ago`;
  return isAr ? `قبل ${Math.round(hrs / 24)} ي` : `${Math.round(hrs / 24)}d ago`;
}

export default function NewsPreviewWidget() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [provider, setProvider] = useState<string>("");
  const [state, setState] = useState<"loading" | "ok" | "empty" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/news")
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => {
        if (cancelled) return;
        const list: NewsArticle[] = data.articles ?? [];
        setArticles(list.slice(0, 4));
        setProvider(data.provider ?? "");
        setState(list.length ? "ok" : "empty");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="wire" className="py-24 bg-ink-1" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light flex items-center gap-2">
              <Radio size={12} className={state === "ok" ? "animate-pulse" : ""} />
              {isAr ? "الأخبار" : "Wire"}
            </p>
            <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
              {isAr ? "ما تقوله الأسواق الخليجية الآن." : "What the Gulf markets are saying now."}
            </h2>
          </div>
          <Link href="/dashboard?panel=news" className="btn-secondary">
            {isAr ? "افتح الأخبار كاملة" : "Open the full wire"}
            <ArrowRight size={13} className={isAr ? "rotate-180" : ""} />
          </Link>
        </motion.div>

        <div className="mt-10 panel-data divide-y divide-line">
          {state === "loading" &&
            [0, 1, 2, 3].map((i) => (
              <div key={i} className="p-5 flex gap-6 animate-pulse">
                <div className="h-3 w-16 bg-ink-4 rounded" />
                <div className="h-3 flex-1 bg-ink-4 rounded" />
              </div>
            ))}

          {state === "ok" &&
            articles.map((a) => (
              <a
                key={a.id}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="group p-5 grid grid-cols-[auto_1fr_auto] gap-5 items-baseline hover:bg-emerald/5 transition-colors"
              >
                <span className="font-mono text-[10px] text-fg-3 w-16">{timeAgo(a.publishedAt, isAr)}</span>
                <span className="text-[15px] text-fg leading-snug group-hover:text-emerald-light transition-colors">
                  {isAr && a.titleAr ? a.titleAr : a.title}
                  <span className="block mt-1 font-mono text-[10px] text-fg-3">{a.source} · {a.category}</span>
                </span>
                <ExternalLink size={13} className="text-fg-4 group-hover:text-emerald-light" />
              </a>
            ))}

          {(state === "empty" || state === "error") && (
            <div className="p-8 text-center">
              <p className="text-fg-2">
                {isAr ? "لم يصل أي خبر بعد." : "No headlines came through."}
              </p>
              <p className="mt-1 font-mono text-[11px] text-fg-3">
                {isAr
                  ? "أضف MARKETAUX_API_KEY في ملف البيئة أو تحقق من اتصال الخادم بالإنترنت."
                  : "Set MARKETAUX_API_KEY in your environment, or check the server's outbound connection."}
              </p>
            </div>
          )}
        </div>
        {provider && <p className="mt-3 font-mono text-[10px] text-fg-4">{isAr ? "المصدر: " : "Source: "}{provider}</p>}
      </div>
    </section>
  );
}

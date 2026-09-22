"use client";

import React from "react";
import Link from "next/link";
import { Fingerprint, ExternalLink } from "lucide-react";
import { useTerminalStore, selectLanguage } from "@/store/useTerminalStore";
import DataControls from "@/components/privacy/DataControls";

/** PRIV — the privacy centre inside the terminal. */
export default function PrivacyPanel() {
  const language = useTerminalStore(selectLanguage);
  const isAr = language === "ar";

  const leaves = [
    { en: "Market wire (WIRE): your browser asks this server for headlines; the server asks Google News RSS or Marketaux. Your IP and identity are not forwarded upstream.", ar: "الأخبار (WIRE): يطلب متصفحك العناوين من هذا الخادم، والخادم يطلبها من Google News أو Marketaux. لا يُمرَّر عنوان IP أو هويتك." },
    { en: "DCF via API (/api/dcf): the inputs you submit are computed and returned, never stored or logged by the app.", ar: "DCF عبر الواجهة (/api/dcf): تُحسب المدخلات وتُعاد فوراً، ولا تُخزَّن أو تُسجَّل." },
    { en: "Google sign-in (optional): Google receives the sign-in request; this app receives your name, e-mail and avatar URL inside a signed cookie.", ar: "تسجيل الدخول عبر Google (اختياري): تتلقى Google طلب الدخول؛ ويتلقى التطبيق اسمك وبريدك وصورتك في ملف تعريف ارتباط موقّع." },
    { en: "Nothing else. No analytics, no error beacons, no fonts fetched at runtime (they are bundled at build).", ar: "لا شيء آخر. لا تحليلات ولا تقارير أخطاء ولا خطوط تُجلب وقت التشغيل (مضمّنة عند البناء)." },
  ];

  return (
    <div className="space-y-6" dir={isAr ? "rtl" : "ltr"}>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.2em] uppercase text-emerald-light"><Fingerprint size={13} /> PRIV · {isAr ? "الخصوصية والبيانات" : "Privacy & data"}</div>
          <h1 className={`mt-2 font-serif text-3xl text-fg ${isAr ? "font-cairo font-bold" : ""}`}>{isAr ? "ما يحتفظ به هذا الجهاز — وكيف تتخلص منه" : "What this device holds, and how to get rid of it"}</h1>
          <p className="mt-2 max-w-2xl text-[13px] text-fg-2 leading-relaxed">
            {isAr
              ? "كل ما في الجدول أدناه مقروء من متصفحك الآن. لا يخزّن الخادم أي تحليل، ولا يوجد تتبّع من أي نوع."
              : "Everything in the table below is read from your browser as you look at it. The server keeps no analysis, and there is no tracking of any kind."}
          </p>
        </div>
        <Link href="/privacy" className="btn-ghost text-[11px]">{isAr ? "السياسة الكاملة" : "Full policy"} <ExternalLink size={12} /></Link>
      </header>

      <DataControls isAr={isAr} />

      <section className="panel-data p-4">
        <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-fg-3">{isAr ? "ما الذي يغادر هذا الجهاز" : "What leaves this device"}</div>
        <ul className="mt-3 space-y-2 text-[12.5px] text-fg-2 leading-relaxed">
          {leaves.map((l) => (
            <li key={l.en} className="flex gap-3"><span className="text-emerald-light font-mono shrink-0">·</span><span>{isAr ? l.ar : l.en}</span></li>
          ))}
        </ul>
      </section>
    </div>
  );
}

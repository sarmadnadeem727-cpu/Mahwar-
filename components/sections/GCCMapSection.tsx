"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Anchor, Landmark, Building2, ArrowRight } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { reveal, viewportOnce } from "@/lib/motion";
import GulfMap from "@/components/ui/GulfMap";
import MarketClock from "@/components/ui/MarketClock";
import { HUBS, HUB_MAP, ROUTES } from "@/lib/geo/hubs";

export default function GCCMapSection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const [hover, setHover] = useState<string | null>(null);
  const hub = hover ? HUB_MAP[hover] : null;

  const legend = [
    { color: "var(--fg-3)", dashed: false, en: "Road & rail", ar: "طرق وسكك" },
    { color: "var(--gold)", dashed: true, en: "Sea lanes", ar: "خطوط بحرية" },
    { color: "var(--emerald-light)", dashed: true, en: "Capital flows", ar: "تدفقات رأس المال" },
  ];

  return (
    <section id="network" className="relative py-28 bg-ink-1 overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-3xl">
          <p className="font-mono text-[11px] tracking-[0.2em] text-emerald-light">{isAr ? "الشبكة" : "The network"}</p>
          <h2 className={`mt-4 font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
            {isAr ? "مبنيّة للخليج: موانئه وعواصمه وأسواقه." : "Built for the Gulf: its ports, capitals and exchanges."}
          </h2>
          <p className="mt-5 text-fg-2 leading-relaxed max-w-2xl">
            {isAr
              ? "خريطة حقيقية بسواحل من بيانات Natural Earth. السفن والشاحنات تتحرك على الممرات الفعلية، ومرّر فوق أي مركز لرؤية سوقه وعملته ومينائه."
              : "A real map with Natural Earth coastlines. Ships and trucks ride the actual corridors; hover any hub for its exchange, currency and port."}
          </p>
        </motion.div>

        <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="mt-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
          <div className="panel-data relative overflow-hidden">
            <GulfMap isAr={isAr} hover={hover} onHover={setHover} />
            <div className="relative border-t border-line px-5 py-3 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[10.5px] text-fg-3">
              {legend.map((l) => (
                <span key={l.en} className="flex items-center gap-2">
                  <span className="w-6 border-t" style={{ borderColor: l.color, borderStyle: l.dashed ? "dashed" : "solid" }} />
                  {isAr ? l.ar : l.en}
                </span>
              ))}
              <span className="flex items-center gap-2 ms-auto">
                <span className="w-2 h-2 rounded-full bg-gold" /> {isAr ? "ميناء" : "port"}
                <span className="w-2 h-2 rounded-full bg-emerald-light ms-3" /> {isAr ? "عاصمة / سوق" : "capital / exchange"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="panel-data p-5 min-h-[230px] flex flex-col">
              {hub ? (
                <>
                  <div className="flex items-center gap-2 font-mono text-[10.5px] text-fg-3 uppercase tracking-wider">
                    {hub.kind === "port" ? <Anchor size={12} className="text-gold" /> : hub.exchange ? <Landmark size={12} className="text-emerald-light" /> : <Building2 size={12} className="text-emerald-light" />}
                    {hub.kind}
                  </div>
                  <h3 className="mt-2 font-serif text-3xl text-fg">{isAr ? hub.ar : hub.en}</h3>
                  <dl className="mt-4 space-y-2 font-mono text-[12px]">
                    {hub.exchange && <div className="flex justify-between gap-3"><dt className="text-fg-3">{isAr ? "السوق" : "exchange"}</dt><dd className="text-fg text-end">{hub.exchange}</dd></div>}
                    <div className="flex justify-between gap-3"><dt className="text-fg-3">{isAr ? "العملة" : "currency"}</dt><dd className="text-fg">{hub.currency}</dd></div>
                    {hub.port && <div className="flex justify-between gap-3"><dt className="text-fg-3">{isAr ? "الميناء" : "port"}</dt><dd className="text-fg text-end">{hub.port}</dd></div>}
                    <div className="flex justify-between gap-3"><dt className="text-fg-3">{isAr ? "الممرات" : "corridors"}</dt><dd className="text-fg">{ROUTES.filter((r) => r.a === hub.id || r.b === hub.id).length}</dd></div>
                  </dl>
                  <p className="mt-4 text-[13px] text-fg-2 leading-relaxed">{isAr ? hub.noteAr : hub.note}</p>
                </>
              ) : (
                <div className="m-auto text-center">
                  <p className="text-fg-2">{isAr ? "مرّر فوق مركز على الخريطة." : "Hover a hub on the map."}</p>
                  <p className="mt-2 font-mono text-[11px] text-fg-4">{HUBS.length} {isAr ? "مراكز" : "hubs"} · {ROUTES.length} {isAr ? "ممر" : "corridors"}</p>
                  <Link href="/dashboard?panel=network_map" className="btn-ghost mt-4 text-[11px]">
                    {isAr ? "افتح مخطط الممرات" : "Open the corridor planner"} <ArrowRight size={12} className={isAr ? "rotate-180" : ""} />
                  </Link>
                </div>
              )}
            </div>
            <MarketClock isAr={isAr} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}


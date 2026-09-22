"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { animate, stagger } from "animejs";
import { ArrowRight, ChevronDown } from "lucide-react";
import FlowField from "@/components/ui/FlowField";
import LiveTerminal from "@/components/sections/LiveTerminal";
import { useTerminalStore } from "@/store/useTerminalStore";
import { APP, TOOLS, toolsBySuite } from "@/lib/registry";

const HEADLINE_EN = ["Capital moves.", "Goods move.", "One terminal reads both."];
const HEADLINE_AR = ["رأس المال يتحرك.", "البضائع تتحرك.", "محطة واحدة تقرأ الاثنين."];

export default function HeroSection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 120]);
  const copyOpacity = useTransform(scrollY, [0, 500], [1, 0]);

  // Pointer parallax for the terminal card and the compass behind it.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 120, damping: 20 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });
  const onPointer = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const financeCount = toolsBySuite("finance").length;
  const opsCount = toolsBySuite("operations").length;

  // One orchestrated entrance: lines rise, then the terminal window slides in.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lines = root.querySelectorAll<HTMLElement>("[data-hero-line]");
    const rest = root.querySelectorAll<HTMLElement>("[data-hero-rest]");
    if (reduced) {
      lines.forEach((el) => (el.style.opacity = "1"));
      rest.forEach((el) => (el.style.opacity = "1"));
      return;
    }
    animate(lines, {
      opacity: [0, 1],
      translateY: [36, 0],
      filter: ["blur(8px)", "blur(0px)"],
      delay: stagger(140, { start: 250 }),
      duration: 1100,
      ease: "outExpo",
    });
    animate(rest, {
      opacity: [0, 1],
      translateY: [18, 0],
      delay: stagger(90, { start: 750 }),
      duration: 900,
      ease: "outExpo",
    });
  }, [language]);

  const headline = isAr ? HEADLINE_AR : HEADLINE_EN;

  return (
    <section
      className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-ink-1 grain"
      dir={isAr ? "rtl" : "ltr"}
      onPointerMove={onPointer}
    >
      {/* Layer 0 — optional footage, kept very dark so it reads as atmosphere */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 pointer-events-none">
        {APP.heroVideo && (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="absolute inset-0 w-full h-full object-cover opacity-[0.14] mix-blend-screen"
            src={APP.heroVideo}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-1/40 via-ink-1/10 to-ink-1" />
      </motion.div>

      {/* Layer 1 — the flow network */}
      <div className="absolute inset-0">
        <FlowField density={1} fadeSide={isAr ? "right" : "left"} />
      </div>
      <div className="aurora absolute -top-[30%] left-1/2 -translate-x-1/2 w-[130vw] h-[90vh] pointer-events-none opacity-40" aria-hidden="true" />
      <div className="absolute inset-0 vignette pointer-events-none" />

      {/* Layer 2 — copy */}
      <div ref={rootRef} className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-36 pb-16 lg:pb-24">
        <motion.div style={{ opacity: copyOpacity }} className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-end">
          <div className="lg:col-span-7">
            <div data-hero-rest className="opacity-0 flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-emerald-light mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald animate-pulse-ring" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-light" />
              </span>
              <span>
                {APP.name.toUpperCase()} · {APP.nameAr} · v{APP.version}
              </span>
            </div>

            <h1 className={`font-serif font-medium text-fg text-display-xl ${isAr ? "font-cairo font-bold leading-[1.15]" : ""}`}>
              {headline.map((line, i) => (
                <span
                  key={line}
                  data-hero-line
                  className={`block opacity-0 ${i === 2 ? "text-emerald-light italic" : ""} ${isAr && i === 2 ? "not-italic" : ""}`}
                >
                  {line}
                </span>
              ))}
            </h1>

            <p data-hero-rest className="opacity-0 mt-8 max-w-xl text-base sm:text-lg text-fg-2 leading-relaxed">
              {isAr
                ? `منصة تحليل مؤسسية ثنائية اللغة لأسواق الخليج: ${financeCount} محركاً مالياً و${opsCount} محركاً لسلاسل الإمداد، من التقييم إلى دورة التحويل النقدي، في محطة واحدة بأسلوب بلومبرغ.`
                : `A bilingual analytics terminal for GCC markets. ${financeCount} financial engines and ${opsCount} supply-chain engines — from DCF to cash-conversion cycle — behind one Bloomberg-style command line.`}
            </p>

            <div data-hero-rest className="opacity-0 mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Link href="/dashboard" className="btn-primary px-7 py-3.5 text-[12px]">
                <span>{isAr ? "ادخل إلى المحطة" : "Enter the terminal"}</span>
                <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
              </Link>
              <a href="#modules" className="btn-secondary px-6 py-3.5 text-[12px]">
                {isAr ? "استعرض الوحدات" : "Browse the modules"}
              </a>
              <Link href="/login" className="btn-ghost px-2 py-3.5 text-[11px]">
                {isAr ? "الدخول بحساب Google" : "Sign in with Google"}
              </Link>
            </div>

            <dl data-hero-rest className="opacity-0 mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl border-t border-line pt-6">
              {[
                { v: TOOLS.length, k: isAr ? "محرك تحليلي" : "analytics engines" },
                { v: 2, k: isAr ? "لغة مع واجهة RTL" : "languages, full RTL" },
                { v: 7, k: isAr ? "عملات خليجية" : "GCC currencies" },
                { v: "PDF · XLSX", k: isAr ? "تصدير موثّق" : "audited exports" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-mono text-2xl text-fg num">{s.v}</dt>
                  <dd className="text-[11px] text-fg-3 mt-1">{s.k}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div data-hero-rest className="opacity-0 lg:col-span-5 lg:pb-2 relative" style={{ perspective: 1200 }}>
            {/* Compass rose — a nod to Gulf navigation, turning very slowly behind the card */}
            <svg viewBox="0 0 400 400" className="absolute -inset-16 w-[calc(100%+8rem)] h-auto pointer-events-none opacity-[0.28] animate-[spin_180s_linear_infinite]" aria-hidden="true">
              <circle cx="200" cy="200" r="190" fill="none" stroke="var(--emerald)" strokeWidth="0.5" strokeDasharray="2 6" />
              <circle cx="200" cy="200" r="150" fill="none" stroke="var(--gold)" strokeWidth="0.5" strokeDasharray="1 9" />
              {Array.from({ length: 32 }).map((_, k) => (
                <line key={k} x1="200" y1="10" x2="200" y2={k % 8 === 0 ? 34 : k % 4 === 0 ? 24 : 16} stroke={k % 8 === 0 ? "var(--gold)" : "var(--emerald)"} strokeWidth={k % 8 === 0 ? 1.2 : 0.6} transform={`rotate(${k * 11.25} 200 200)`} />
              ))}
              <path d="M200,40 L212,200 L200,360 L188,200 Z M40,200 L200,188 L360,200 L200,212 Z" fill="none" stroke="var(--emerald)" strokeWidth="0.6" />
            </svg>
            <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}>
              <LiveTerminal />
            </motion.div>
          </div>
        </motion.div>
      </div>

      <a
        href="#thesis"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-fg-3 hover:text-emerald-light transition-colors"
        aria-label={isAr ? "انتقل للأسفل" : "Scroll to content"}
      >
        <ChevronDown size={18} className="animate-bounce" />
      </a>
    </section>
  );
}


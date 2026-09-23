"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { reveal, viewportOnce } from "@/lib/motion";
import { timeline, addDraw, stagger, prefersReducedMotion, onceInView, DURATION } from "@/lib/anime";

/**
 * GulfSceneSection — a parallax illustration of the Gulf economy: dunes,
 * a port with cranes, a container ship and tanker moving through, and a
 * skyline of abstract towers. Every layer moves at its own speed on scroll
 * (Framer Motion), and the first time the scene is visible it builds itself:
 * towers rise from the ground line, the cranes draw on stroke by stroke, the
 * dunes settle and the windows flicker awake (anime.js). Pure SVG + CSS.
 */

const Tower = ({ x, w, h, cap = false }: { x: number; w: number; h: number; cap?: boolean }) => (
  <g data-tower style={{ transformOrigin: `${x + w / 2}px 420px` }}>
    <rect x={x} y={420 - h} width={w} height={h} fill="url(#towerGrad)" stroke="rgba(158,190,180,0.25)" strokeWidth="0.6" />
    {cap && <path d={`M${x},${420 - h} L${x + w / 2},${420 - h - w * 0.9} L${x + w},${420 - h} Z`} fill="var(--ink-4)" stroke="rgba(158,190,180,0.25)" strokeWidth="0.6" />}
    {Array.from({ length: Math.floor(h / 18) }).map((_, r) =>
      Array.from({ length: Math.max(1, Math.floor(w / 9)) }).map((__, c) => (
        <rect key={`${r}-${c}`} data-window={((r * 7 + c * 13 + x) % 5 === 0) ? "lit" : "dark"} x={x + 3 + c * 9} y={420 - h + 6 + r * 18} width={3} height={6} fill="var(--gold)" opacity={((r * 7 + c * 13 + x) % 5 === 0) ? 0.55 : 0.08} />
      ))
    )}
  </g>
);

const Crane = ({ x }: { x: number }) => (
  <g stroke="rgba(158,190,180,0.6)" strokeWidth="1.4" fill="none">
    <path data-crane d={`M${x},430 L${x},330 M${x + 22},430 L${x + 22},330`} />
    <path data-crane d={`M${x - 40},336 L${x + 70},336`} />
    <path data-crane d={`M${x - 40},336 L${x + 6},300 L${x + 70},336`} />
    <path data-crane d={`M${x},350 L${x + 22},370 M${x + 22},350 L${x},370 M${x},390 L${x + 22},410 M${x + 22},390 L${x},410`} strokeWidth="0.8" />
    <path data-crane-cable d={`M${x + 50},336 L${x + 50},395`} strokeDasharray="2 3" />
    <rect data-crane-load x={x + 42} y={395} width={16} height={10} fill="var(--gold)" opacity="0.8" stroke="none" />
  </g>
);

export default function GulfSceneSection() {
  const { language } = useTerminalStore();
  const isAr = language === "ar";
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const sky = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const far = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const mid = useTransform(scrollYProgress, [0, 1], [70, -70]);
  const near = useTransform(scrollYProgress, [0, 1], [110, -110]);
  const sun = useTransform(scrollYProgress, [0, 1], [60, -140]);
  const [built, setBuilt] = useState(() => prefersReducedMotion());

  // Build the scene once, the first time it is on screen.
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion()) return;
    let tl: ReturnType<typeof timeline> | null = null;
    const stop = onceInView(root, () => {
      tl = timeline();
      tl.add(root.querySelectorAll("[data-dune]"), { opacity: [0, 1], translateY: [40, 0], delay: stagger(160), duration: DURATION.slow }, 0);
      tl.add(root.querySelectorAll("[data-tower]"), { scaleY: [0, 1], opacity: [0, 1], delay: stagger(60, { from: "center" }), duration: DURATION.slow }, "-=1000");
      tl.add(root.querySelectorAll("[data-window='lit']"), { opacity: [0, 0.55], delay: stagger(12, { from: "random" }), duration: DURATION.fast }, "-=800");
      addDraw(tl, root, "[data-crane]", { duration: 1200, each: 90, position: "-=900" });
      tl.add(root.querySelectorAll("[data-crane-cable]"), { opacity: [0, 1], duration: DURATION.fast }, "-=300");
      tl.add(root.querySelectorAll("[data-crane-load]"), { opacity: [0, 0.8], translateY: [-40, 0], delay: stagger(140), duration: DURATION.base, ease: "outBounce" }, "-=200");
      tl.add(root.querySelectorAll("[data-quay]"), { opacity: [0, 1], duration: DURATION.base }, "-=900");
      tl.then(() => setBuilt(true));
    }, "-25% 0px");
    return () => { stop(); tl?.cancel(); };
  }, []);

  const facts = [
    { v: "6", en: "member states, one common tariff", ar: "دول أعضاء وتعرفة موحدة" },
    { v: "7", en: "exchanges the terminal speaks", ar: "أسواق تفهمها المحطة" },
    { v: "2.5%", en: "Zakat base, no tax shield", ar: "زكاة دون درع ضريبي" },
    { v: "Hormuz", en: "the chokepoint every landed-cost model respects", ar: "المضيق الذي يحترمه كل نموذج تكلفة واصلة" },
  ];

  return (
    <section ref={ref} className="relative overflow-hidden bg-ink-0 border-y border-line" dir={isAr ? "rtl" : "ltr"}>
      <div className="relative h-[520px] md:h-[600px]" dir="ltr">
        {/* Sky */}
        <motion.div style={{ y: sky }} className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(217,179,110,0.14),transparent_60%),linear-gradient(180deg,#05090b_0%,#0a1216_60%,#0e161a_100%)]" />
        <motion.div style={{ y: sun }} className="absolute left-[62%] top-[26%] w-28 h-28 rounded-full bg-gold/25 blur-2xl" />
        <motion.div style={{ y: sun }} className="absolute left-[64%] top-[30%] w-16 h-16 rounded-full border border-gold/50" />

        {/* Far: skyline */}
        <motion.svg style={{ y: far }} viewBox="0 0 1400 440" preserveAspectRatio="xMidYMax slice" className={`absolute inset-x-0 bottom-0 w-full h-[75%] opacity-70 ${built ? "" : "[&_[data-tower]]:opacity-0"}`}>
          <defs>
            <linearGradient id="towerGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--ink-3)" /><stop offset="100%" stopColor="var(--ink-1)" /></linearGradient>
          </defs>
          <Tower x={80} w={34} h={180} /><Tower x={130} w={22} h={120} /><Tower x={170} w={40} h={260} cap /><Tower x={230} w={26} h={150} />
          <Tower x={300} w={30} h={210} /><Tower x={350} w={48} h={330} cap /><Tower x={420} w={28} h={170} /><Tower x={470} w={36} h={240} />
          <Tower x={900} w={30} h={190} /><Tower x={950} w={44} h={290} cap /><Tower x={1010} w={26} h={140} /><Tower x={1060} w={38} h={230} /><Tower x={1120} w={28} h={170} /><Tower x={1170} w={52} h={360} cap /><Tower x={1240} w={30} h={200} />
          <rect x="0" y="420" width="1400" height="20" fill="var(--ink-1)" />
        </motion.svg>

        {/* Mid: dunes + port */}
        <motion.svg style={{ y: mid }} viewBox="0 0 1400 440" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-0 w-full h-[70%]">
          <path data-dune d="M0,300 C200,240 380,340 560,300 C720,265 860,330 1020,290 C1180,250 1300,320 1400,290 L1400,440 L0,440 Z" fill="var(--ink-2)" style={{ opacity: built ? 1 : 0 }} />
          <path data-dune d="M0,340 C180,300 320,370 520,340 C700,312 840,372 1040,335 C1220,300 1320,355 1400,330 L1400,440 L0,440 Z" fill="var(--ink-3)" style={{ opacity: built ? 1 : 0 }} />
          <g style={{ opacity: built ? 1 : undefined }} className={built ? "" : "[&_[data-crane-cable]]:opacity-0 [&_[data-crane-load]]:opacity-0"}>
            <Crane x={620} /><Crane x={720} /><Crane x={820} />
          </g>
          <rect data-quay x="560" y="430" width="340" height="10" fill="var(--ink-4)" style={{ opacity: built ? 1 : 0 }} />
        </motion.svg>

        {/* Near: water + vessels */}
        <motion.div style={{ y: near }} className="absolute inset-x-0 bottom-0 h-[26%]">
          <div className="absolute inset-0 bg-gradient-to-b from-ink-2 via-[var(--navy)] to-ink-1" />
          <div className="absolute inset-0 opacity-40 bg-[repeating-linear-gradient(180deg,transparent_0_6px,rgba(61,219,180,0.05)_6px_7px)]" />
          {/* Container ship */}
          <motion.svg animate={{ x: ["-30%", "130%"], y: [0, -3, 0] }} transition={{ x: { duration: 55, repeat: Infinity, ease: "linear" }, y: { duration: 4, repeat: Infinity, ease: "easeInOut" } }} viewBox="0 0 220 60" className="absolute top-[10%] w-[220px] h-[60px]">
            <path d="M6,40 L214,40 L200,56 L20,56 Z" fill="var(--ink-4)" stroke="rgba(158,190,180,0.5)" strokeWidth="1" />
            <rect x="24" y="20" width="150" height="20" fill="var(--ink-3)" />
            {Array.from({ length: 12 }).map((_, k) => <rect key={k} x={26 + k * 12.4} y={k % 3 === 0 ? 12 : 20} width="11" height={k % 3 === 0 ? 27 : 19} fill={k % 4 === 0 ? "var(--gold)" : k % 3 === 0 ? "var(--emerald)" : "var(--ink-5)"} opacity="0.9" />)}
            <rect x="180" y="16" width="16" height="24" fill="var(--ink-5)" stroke="rgba(158,190,180,0.5)" strokeWidth="0.8" />
            <rect x="186" y="10" width="4" height="6" fill="var(--gold)" />
          </motion.svg>
          {/* Tanker, other way */}
          <motion.svg animate={{ x: ["120%", "-40%"], y: [0, 2, 0] }} transition={{ x: { duration: 80, repeat: Infinity, ease: "linear" }, y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }} viewBox="0 0 220 50" className="absolute top-[48%] w-[180px] h-[42px] opacity-80">
            <path d="M8,32 L212,32 L196,46 L26,46 Z" fill="var(--ink-4)" stroke="rgba(158,190,180,0.45)" strokeWidth="1" />
            <rect x="30" y="24" width="140" height="8" rx="3" fill="var(--ink-5)" />
            <rect x="30" y="18" width="150" height="6" rx="3" fill="var(--ink-3)" />
            <rect x="18" y="12" width="18" height="20" fill="var(--ink-5)" stroke="rgba(158,190,180,0.45)" strokeWidth="0.8" />
            <rect x="24" y="6" width="3" height="6" fill="var(--emerald-light)" />
          </motion.svg>
        </motion.div>

        {/* Copy overlay */}
        <div className="absolute inset-0 flex items-start">
          <motion.div variants={reveal} initial="hidden" whileInView="show" viewport={viewportOnce} className="max-w-7xl mx-auto w-full px-6 pt-20" dir={isAr ? "rtl" : "ltr"}>
            <p className="font-mono text-[11px] tracking-[0.2em] text-gold">{isAr ? "الخليج في العمل" : "The Gulf at work"}</p>
            <h2 className={`mt-4 max-w-2xl font-serif text-display-lg text-fg ${isAr ? "font-cairo font-bold" : ""}`}>
              {isAr ? "ميناء، رافعة، سفينة، صك. الأرقام خلف كل منها في محطة واحدة." : "A port, a crane, a ship, a sukuk. The numbers behind each of them, in one terminal."}
            </h2>
          </motion.div>
        </div>
      </div>

      <div className="relative bg-ink-1 border-t border-line">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {facts.map((f) => (
            <div key={f.en}>
              <div className="font-serif text-3xl text-fg">{f.v}</div>
              <div className="mt-1 text-[12px] text-fg-3 leading-snug">{isAr ? f.ar : f.en}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


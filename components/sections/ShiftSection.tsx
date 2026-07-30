"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function ShiftSection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  return (
    <section className="relative py-24 flex items-center justify-center overflow-hidden bg-[#0A0B0D] border-t border-white/5">
      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <motion.div
          variants={staggerItem}
          className="w-[1px] h-[80px] bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent relative mb-6"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--gold)] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--gold)] rounded-full" />
        </motion.div>

        <motion.h3
          variants={staggerItem}
          className="font-garamond text-7xl md:text-9xl text-white/5 mb-4 select-none font-bold uppercase tracking-widest"
        >
          MAHWAR
        </motion.h3>

        <motion.h2
          variants={staggerItem}
          className="font-garamond text-3xl md:text-4xl font-light text-slate-100 mb-6 max-w-[500px] leading-tight"
        >
          {isAr ? "كل شيء يلتقي عند المحور." : "Everything converges at the axis."}
        </motion.h2>

        <motion.p
          variants={staggerItem}
          className="text-slate-400 font-sans text-xs md:text-sm max-w-md leading-relaxed"
        >
          {isAr 
            ? "منصة استخبارات موحدة. بيانات تداول حية. نماذج تقييم مؤسسية. تقارير ذكاء اصطناعي. صُممت للمحلل الذي يطلب الدقة والريادة."
            : "One unified terminal. Real-time data streams. Institutional-grade models. Generative AI memos. Built for the allocator who demands absolute precision."
          }
        </motion.p>
      </motion.div>
    </section>
  );
}

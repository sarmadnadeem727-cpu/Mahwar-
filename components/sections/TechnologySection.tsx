"use client";

import React from "react";
import { motion } from "framer-motion";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function TechnologySection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const techNames = [
    "Google Gemini 2.5",
    "Next.js 15",
    "Supabase DB",
    "Stripe Billing",
    "Tadawul Feed",
    "Framer Motion"
  ];

  return (
    <section id="tech" className="py-16 bg-[#0A0B0D] relative border-t border-white/5" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 text-center space-y-8">
        <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">
          {isAr ? "// البنية البرمجية والمزودون" : "// CORE STACK & INTEGRATIONS"}
        </span>

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="flex flex-wrap items-center justify-center gap-10 md:gap-14"
        >
          {techNames.map((name, idx) => (
            <motion.span
              key={idx}
              variants={staggerItem}
              className="font-mono text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none hover:text-white transition-colors duration-200"
            >
              {name}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Code, Zap, Database } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function TechnologySection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const techStack = [
    {
      name: "Google Gemini 2.5 Flash",
      role: isAr ? "محرك الذكاء الاصطناعي اللحظي" : "Streaming AI Intelligence Engine",
      desc: isAr ? "توليد مذكرات التقييم المالي والتحليل الائتماني مع الربط المباشر بمحرك البحث." : "SSE streaming institutional report generation with real-time web search grounding.",
      icon: <Zap className="text-[var(--gold)]" size={28} />
    },
    {
      name: "Next.js 15 & React 19",
      role: isAr ? "معمارية التطبيق فائقة السرعة" : "App Router & Server Infrastructure",
      desc: isAr ? "أداء لحظي وتوافق استثنائي مع متطلبات الأمان والتشفير للأعمال المالية." : "High-performance hybrid server components for sub-millisecond data rendering.",
      icon: <Server className="text-[var(--emerald)]" size={28} />
    },
    {
      name: "Yahoo Finance & EODHD",
      role: isAr ? "مزود بيانات السوق والأسعار" : "Market Data & Fundamentals API",
      desc: isAr ? "تأمين بيانات التداول والقوائم المالية التاريخية لأسواق الخليج العربي." : "Historical financials, balance sheets, dividend histories, and live quote pipelines.",
      icon: <Database className="text-[var(--gold)]" size={28} />
    },
    {
      name: "Framer Motion 12",
      role: isAr ? "محرك الحركة والانتقالات" : "Hardware Accelerated Motion Physics",
      desc: isAr ? "انتقالات انسيابية وتأثيرات بصرية تضفي هيبة واحترافية على واجهات التداول." : "Spring physics, cascading stagger lists, and dynamic chart draw-on animations.",
      icon: <Code className="text-[var(--emerald)]" size={28} />
    }
  ];

  return (
    <section id="tech" className="py-28 bg-[#0A0B0D] relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 text-[var(--emerald)] text-xs font-mono font-bold uppercase tracking-widest mb-4">
            <Cpu size={14} />
            <span>{isAr ? "النية البنائية والتقنيات" : "Architectural Powerhouse"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-garamond text-4xl md:text-6xl font-bold text-white mb-6">
            {isAr ? "بنية تقنية متطورة للأداء المالي الحرج" : "Built Upon Next-Generation AI & Financial Stack"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-400 text-base md:text-lg">
            {isAr 
              ? "استخدام أحدث النماذج المعتمدة في الذكاء الاصطناعي والبنية التحتية البرمجية لتقديم تحليل مؤسسي لا يضاهى."
              : "Leveraging cutting-edge generative AI, streaming web architecture, and institutional financial primitives."
            }
          </motion.p>
        </motion.div>

        {/* Tech Stack Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {techStack.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass-card p-8 rounded-2xl border border-white/10 flex flex-col justify-between bg-[#0F1113]/90"
            >
              <div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 w-fit mb-6">
                  {tech.icon}
                </div>
                <h3 className="font-mono text-lg font-bold text-white mb-2">
                  {tech.name}
                </h3>
                <div className="text-xs font-mono font-semibold text-[var(--gold)] mb-4">
                  {tech.role}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed">
                  {tech.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

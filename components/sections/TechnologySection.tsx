"use client";

import React from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Code, Zap, FileText } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { staggerContainer, staggerItem } from "@/lib/motion";

export default function TechnologySection() {
  const { language } = useTerminalStore();
  const isAr = language === 'ar';

  const techStack = [
    {
      name: "Google Gemini 2.5 Flash",
      role: isAr ? "محرك الذكاء الاصطناعي اللحظي" : "Streaming AI Intelligence Engine",
      desc: isAr ? "تحليل مالي متقدم وتوليد مذكرات الاستثمار الذكية للشركات والصفقات." : "SSE streaming institutional report generation using advanced context window analysis.",
      icon: <Zap className="text-[var(--emerald)]" size={28} />
    },
    {
      name: "Next.js 15 & React 19",
      role: isAr ? "معمارية التطبيق فائقة السرعة" : "App Router & Server Infrastructure",
      desc: isAr ? "أداء سريع للغاية مع استجابة تامة للهواتف وتصميمات الويب الحديثة." : "High-performance hybrid server components for sub-millisecond page rendering.",
      icon: <Server className="text-[var(--emerald)]" size={28} />
    },
    {
      name: "Client-Side Export Engine",
      role: isAr ? "تصدير التقارير وجداول المبيعات" : "PDF Synthesis & Excel Pipelines",
      desc: isAr ? "تصدير تقارير PDF وجداول بيانات Excel دون الحاجة لخوادم وسيطة لحماية خصوصيتك." : "High-fidelity exports via jsPDF, XLSX libraries, and local browser canvas generation.",
      icon: <FileText className="text-[var(--emerald)]" size={28} />
    },
    {
      name: "Framer Motion 12",
      role: isAr ? "محرك الحركة والانتقالات" : "Hardware Accelerated Motion Physics",
      desc: isAr ? "انتقالات انسيابية وتأثيرات بصرية تضفي هيبة واحترافية على واجهات النمذجة." : "Spring physics, cascading stagger lists, and clean chart draw-on animations.",
      icon: <Code className="text-[var(--emerald)]" size={28} />
    }
  ];

  return (
    <section id="tech" className="py-28 bg-white relative overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
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

          <motion.h2 variants={staggerItem} className="font-serif text-4xl md:text-6xl font-bold text-[#171717] mb-6">
            {isAr ? "بنية تقنية متطورة للأداء المالي الحرج" : "Built Upon Next-Generation Stack"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-650 text-base md:text-lg">
            {isAr 
              ? "استخدام أحدث النماذج المعتمدة في الذكاء الاصطناعي والبنية التحتية البرمجية لتقديم تحليل مؤسسي لا يضاهى."
              : "Leveraging cutting-edge generative AI, local browser execution, and institutional financial primitives."
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
              className="bg-[#F7F7F5] p-8 rounded-2xl border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 w-fit mb-6">
                  {tech.icon}
                </div>
                <h3 className="font-sans text-lg font-bold text-[#171717] mb-2">
                  {tech.name}
                </h3>
                <div className="text-xs font-mono font-bold text-[var(--emerald)] mb-4">
                  {tech.role}
                </div>
                <p className="text-slate-600 text-xs leading-relaxed font-sans">
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

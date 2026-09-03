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
      icon: <Zap className="text-terminal-emerald" size={26} />
    },
    {
      name: "Next.js 15 & React 19",
      role: isAr ? "معمارية التطبيق فائقة السرعة" : "App Router & Server Infrastructure",
      desc: isAr ? "أداء سريع للغاية مع استجابة تامة للهواتف وتصميمات الويب الحديثة." : "High-performance hybrid server components for sub-millisecond page rendering.",
      icon: <Server className="text-terminal-emerald" size={26} />
    },
    {
      name: "Client-Side Export Engine",
      role: isAr ? "تصدير التقارير وجداول المبيعات" : "PDF Synthesis & Excel Pipelines",
      desc: isAr ? "تصدير تقارير PDF وجداول بيانات Excel دون الحاجة لخوادم وسيطة لحماية خصوصيتك." : "High-fidelity exports via jsPDF, XLSX libraries, and local browser canvas generation.",
      icon: <FileText className="text-terminal-emerald" size={26} />
    },
    {
      name: "Framer Motion 12",
      role: isAr ? "محرك الحركة والانتقالات" : "Hardware Accelerated Motion Physics",
      desc: isAr ? "انتقالات انسيابية وتأثيرات بصرية تضفي هيبة واحترافية على واجهات النمذجة." : "Spring physics, cascading stagger lists, and clean chart draw-on animations.",
      icon: <Code className="text-terminal-emerald" size={26} />
    }
  ];

  return (
    <section id="tech" className="py-24 bg-[#0B0E14] relative overflow-hidden border-t border-[#1E293B]" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3.5 py-1 bg-terminal-emerald-dim border border-terminal-border-emerald text-terminal-emerald text-[10px] font-mono font-bold uppercase tracking-[0.2em] mb-4 rounded-sm shadow-md">
            <Cpu size={12} />
            <span>{isAr ? "النية البنائية والتقنيات" : "CORE TECHNICAL STACK"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-mono text-3xl md:text-5xl font-extrabold text-white mb-6 uppercase">
            {isAr ? "بنية تقنية متطورة للأداء المالي الحرج" : "Built Upon Next-Generation Stack"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-400 text-sm md:text-base font-mono">
            {isAr 
              ? "استخدام أحدث النماذج المعتمدة في الذكاء الاصطناعي والبنية التحتية البرمجية لتقديم تحليل مؤسسي لا يضاهى."
              : "Leveraging cutting-edge generative AI, local browser execution, and institutional financial primitives."
            }
          </motion.p>
        </motion.div>

        {/* Tech Stack Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {techStack.map((tech, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="bg-[#121721] p-6 border border-[#1E293B] flex flex-col justify-between rounded-sm shadow-lg group hover:border-terminal-emerald transition-all"
            >
              <div>
                <div className="p-2.5 bg-[#0B0E14] border border-[#1E293B] w-fit mb-5 rounded-sm group-hover:border-terminal-emerald transition-colors">
                  {tech.icon}
                </div>
                <h3 className="font-mono text-xs font-bold text-white mb-2 uppercase tracking-wide group-hover:text-terminal-emerald transition-colors">
                  {tech.name}
                </h3>
                <div className="text-[10px] font-mono font-bold text-terminal-emerald mb-4 uppercase tracking-wider">
                  {tech.role}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-mono">
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

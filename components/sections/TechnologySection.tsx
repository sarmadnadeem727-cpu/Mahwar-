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
    <section id="tech" className="py-24 bg-[#F8FAFC] relative overflow-hidden border-t border-[#E2E8F0] font-sans" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <motion.div variants={staggerItem} className="inline-flex items-center gap-2 px-3.5 py-1 bg-emerald-dim border border-emerald-border text-emerald text-xs font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <Cpu size={12} />
            <span>{isAr ? "النية البنائية والتقنيات" : "CORE TECHNICAL STACK"}</span>
          </motion.div>

          <motion.h2 variants={staggerItem} className="font-serif text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            {isAr ? "بنية تقنية متطورة للأداء المالي الحرج" : "Built Upon Next-Generation Stack"}
          </motion.h2>

          <motion.p variants={staggerItem} className="text-slate-600 text-base font-sans font-medium">
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
              className="bg-white p-6 border border-[#E2E8F0] flex flex-col justify-between rounded-lg shadow-sm hover:shadow-md group hover:border-emerald transition-all"
            >
              <div>
                <div className="p-3 bg-slate-50 border border-[#E2E8F0] w-fit mb-5 rounded-lg text-emerald group-hover:border-emerald transition-colors">
                  {tech.icon}
                </div>
                <h3 className="font-serif text-base font-bold text-slate-900 mb-2 tracking-wide group-hover:text-emerald transition-colors">
                  {tech.name}
                </h3>
                <div className="text-xs font-mono font-bold text-emerald mb-3 uppercase tracking-wider">
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

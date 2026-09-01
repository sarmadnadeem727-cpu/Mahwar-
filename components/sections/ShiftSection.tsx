"use client";

import React from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/motion";

const ShiftSection = () => {
  return (
    <section className="relative py-[160px] flex items-center justify-center overflow-hidden bg-white">
      {/* Orbiting Rings Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        {[
          { size: "300px", duration: 25, dir: 1 },
          { size: "500px", duration: 35, dir: -1 },
          { size: "700px", duration: 45, dir: 1 },
        ].map((ring, i) => (
          <motion.div
            key={i}
            animate={{ rotate: 360 * ring.dir }}
            transition={{
              duration: ring.duration,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop"
            }}
            className="absolute border border-[var(--emerald)]/20 rounded-full"
            style={{
              width: ring.size,
              height: ring.size,
              opacity: 0.1 - i * 0.03,
            }}
          >
            {/* Dot */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--emerald)] rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Content */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <motion.div
          variants={staggerItem}
          className="w-[1px] h-[120px] bg-gradient-to-b from-transparent via-[var(--emerald)] to-transparent relative mb-8"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--emerald)] rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[var(--emerald)] rounded-full" />
        </motion.div>

        <motion.h3
          variants={staggerItem}
          className="font-cairo text-8xl md:text-[120px] lg:text-[160px] text-[var(--emerald)]/20 opacity-30 mb-8 select-none"
        >
          محور
        </motion.h3>

        <motion.h2
          variants={staggerItem}
          className="font-serif text-4xl md:text-5xl font-light text-[#171717] mb-12 max-w-[600px] leading-tight"
        >
          Everything converges at the axis.
        </motion.h2>

        <motion.p
          variants={staggerItem}
          className="font-sans text-sm md:text-base text-slate-600 max-w-[500px] leading-relaxed"
        >
          One unified platform. Institutional deal models. Custom peer comparators. AI research. <br />
          Built for the GCC analyst who demands precision.
        </motion.p>
      </motion.div>
    </section>
  );
};

export default ShiftSection;

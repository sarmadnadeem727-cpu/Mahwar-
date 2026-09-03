"use client";

import React from "react";
import { motion } from "framer-motion";

interface MahwarSplashProps {
  onComplete?: () => void;
  className?: string;
}

export const MahwarSplash: React.FC<MahwarSplashProps> = ({ onComplete, className = "" }) => {
  // Tactical Dark CAD Palette
  const EMERALD = "#00FF9D";
  const NAVY = "#1E293B";
  const TEXT_WHITE = "#FFFFFF";

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0B0E14] select-none font-mono ${className}`}
    >
      {/* Background CAD Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.35)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-60 pointer-events-none" />

      {/* Target / Geometric Radar Icon */}
      <motion.div
        className="relative w-36 h-36 mb-8"
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full filter drop-shadow-[0_0_15px_rgba(0,255,157,0.4)]"
        >
          {/* SVG Glow Filter */}
          <defs>
            <filter id="emerald-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Outer Outer Circle */}
          <motion.circle
            cx="100"
            cy="100"
            r="88"
            stroke={EMERALD}
            strokeWidth="3"
            fill="none"
            filter="url(#emerald-glow)"
            initial={{ pathLength: 0, rotate: -90 }}
            animate={{ pathLength: 1, rotate: 0 }}
            transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Inner Grid / Orbital Rings */}
          <motion.circle
            cx="100"
            cy="100"
            r="65"
            stroke={EMERALD}
            strokeWidth="2.5"
            strokeDasharray="8 5"
            fill="none"
            initial={{ pathLength: 0, rotate: 45 }}
            animate={{ pathLength: 1, rotate: 360 }}
            transition={{ 
              pathLength: { duration: 1.2, ease: "easeOut", delay: 0.2 },
              rotate: { duration: 20, repeat: Infinity, ease: "linear" }
            }}
          />

          {/* Crosshair / Reticle Lines */}
          <motion.line
            x1="100"
            y1="10"
            x2="100"
            y2="190"
            stroke={NAVY}
            strokeWidth="2.5"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          />
          <motion.line
            x1="10"
            y1="100"
            x2="190"
            y2="100"
            stroke={NAVY}
            strokeWidth="2.5"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
          />

          {/* Core Eye / Target Center */}
          <motion.circle
            cx="100"
            cy="100"
            r="28"
            stroke={EMERALD}
            strokeWidth="3"
            fill="none"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "backOut" }}
          />

          {/* Center Target Dot */}
          <motion.circle
            cx="100"
            cy="100"
            r="10"
            fill={EMERALD}
            filter="url(#emerald-glow)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.4, delay: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          />
        </svg>
      </motion.div>

      {/* Brand Lockup: MAHWAR + محور */}
      <motion.div
        className="flex items-center gap-3 overflow-hidden z-10"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.85, ease: "easeOut" }}
      >
        <span className="font-mono text-3xl font-extrabold tracking-[0.25em] text-white">
          MAHWAR
        </span>
        <span className="text-slate-600 font-mono text-base">|</span>
        <span
          dir="rtl"
          lang="ar"
          className="text-3xl font-bold tracking-normal text-terminal-emerald font-cairo"
        >
          محور
        </span>
      </motion.div>

      {/* Terminal Tagline */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 0.85, y: 0 }}
        transition={{ duration: 0.5, delay: 1.3, ease: "easeOut" }}
        onAnimationComplete={() => {
          if (onComplete) {
            setTimeout(onComplete, 700);
          }
        }}
        className="mt-3 text-xs font-mono tracking-[0.3em] uppercase text-slate-400 flex items-center gap-2 z-10"
      >
        <span className="w-2 h-2 rounded-full bg-terminal-emerald animate-pulse" />
        GCC CAPITAL MARKETS ENGINE
      </motion.div>
    </div>
  );
};

/**
 * Animated Background Logo Watermark for Hero / Headers
 */
export const MahwarBackgroundLogo: React.FC<{ className?: string }> = ({ className = "" }) => {
  const EMERALD = "#00FF9D";
  const SLATE = "#1E293B";

  return (
    <div className={`relative pointer-events-none select-none ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-[0_0_25px_rgba(0,255,157,0.25)]"
      >
        <defs>
          <filter id="bg-emerald-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="radar-sweep" x1="100" y1="100" x2="188" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="rgba(0, 255, 157, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 255, 157, 0.0)" />
          </linearGradient>
        </defs>

        {/* Outer Pulsing Aura Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="92"
          stroke="rgba(0, 255, 157, 0.15)"
          strokeWidth="1.5"
          fill="none"
          animate={{ scale: [0.98, 1.03, 0.98], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Outer Solid Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="88"
          stroke={EMERALD}
          strokeWidth="2.5"
          strokeOpacity="0.4"
          fill="none"
          filter="url(#bg-emerald-glow)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Inner Counter-Rotating Dashed Orbit */}
        <motion.circle
          cx="100"
          cy="100"
          r="65"
          stroke={EMERALD}
          strokeWidth="2"
          strokeDasharray="10 6"
          strokeOpacity="0.6"
          fill="none"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        />

        {/* Tactical Degree Notch Ring */}
        <motion.circle
          cx="100"
          cy="100"
          r="45"
          stroke={SLATE}
          strokeWidth="1.5"
          strokeDasharray="3 3"
          strokeOpacity="0.8"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        />

        {/* Radar Scanner Line */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ originX: "100px", originY: "100px" }}
        >
          <line
            x1="100"
            y1="100"
            x2="188"
            y2="100"
            stroke={EMERALD}
            strokeWidth="2"
            strokeOpacity="0.7"
            filter="url(#bg-emerald-glow)"
          />
          <polygon points="100,100 188,100 170,140" fill="url(#radar-sweep)" opacity="0.3" />
        </motion.g>

        {/* Crosshair Axes */}
        <line x1="100" y1="5" x2="100" y2="195" stroke={SLATE} strokeWidth="1.5" strokeOpacity="0.6" />
        <line x1="5" y1="100" x2="195" y2="100" stroke={SLATE} strokeWidth="1.5" strokeOpacity="0.6" />

        {/* Center Target Eye */}
        <motion.circle
          cx="100"
          cy="100"
          r="24"
          stroke={EMERALD}
          strokeWidth="2.5"
          strokeOpacity="0.8"
          fill="rgba(11, 14, 20, 0.6)"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ originX: "100px", originY: "100px" }}
        />

        {/* Glowing Center Core Dot */}
        <circle
          cx="100"
          cy="100"
          r="8"
          fill={EMERALD}
          filter="url(#bg-emerald-glow)"
        />
      </svg>
    </div>
  );
};

export default MahwarSplash;

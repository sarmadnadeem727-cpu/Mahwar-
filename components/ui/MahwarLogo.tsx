"use client";

import React from "react";
import { motion } from "framer-motion";

interface MahwarLogoProps {
  size?: number;
  animate?: boolean;
  className?: string;
}

const MahwarLogo = ({ size = 120, animate = true, className = "" }: MahwarLogoProps) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id="quantumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--emerald)" />
            <stop offset="100%" stopColor="var(--navy)" />
          </linearGradient>
          <filter id="glass-effect">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circle with Gaps - Blueprint-esque */}
        <circle
          cx="200"
          cy="200"
          r="160"
          stroke="var(--emerald)"
          strokeWidth="12"
          strokeDasharray="240 40 240 40"
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Inner Circle */}
        <circle
          cx="200"
          cy="200"
          r="80"
          stroke="var(--emerald)"
          strokeWidth="8"
          strokeDasharray="40 20"
          opacity="0.3"
        />

        {/* Center Core */}
        <motion.circle
          cx="200"
          cy="200"
          r="24"
          fill="var(--emerald)"
          animate={animate ? { scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Quantum Orbits */}
        <g className="orbits">
          {/* Orbit 1 */}
          <motion.ellipse
            cx="200"
            cy="200"
            rx="140"
            ry="60"
            stroke="var(--gold-dim)"
            strokeWidth="4"
            transform="rotate(45 200 200)"
            animate={animate ? { rotate: [45, 405], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          {/* Orbit 2 */}
          <motion.ellipse
            cx="200"
            cy="200"
            rx="140"
            ry="60"
            stroke="var(--gold-dim)"
            strokeWidth="4"
            transform="rotate(-45 200 200)"
            animate={animate ? { rotate: [-45, -405], opacity: [0.3, 0.6, 0.3] } : {}}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          />
        </g>

        {/* Professional Nodes */}
        <motion.circle
          cx="200"
          cy="60"
          r="8"
          fill="var(--gold)"
          animate={animate ? { 
            rotate: [0, 360],
          } : {}}
          style={{ originX: "200px", originY: "200px" }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="200"
          cy="340"
          r="8"
          fill="var(--gold)"
          animate={animate ? { 
            rotate: [180, 540],
          } : {}}
          style={{ originX: "200px", originY: "200px" }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="60"
          cy="200"
          r="8"
          fill="var(--emerald)"
          animate={animate ? { 
            rotate: [90, 450],
          } : {}}
          style={{ originX: "200px", originY: "200px" }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="340"
          cy="200"
          r="8"
          fill="var(--emerald)"
          animate={animate ? { 
            rotate: [270, 630],
          } : {}}
          style={{ originX: "200px", originY: "200px" }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
        />

      </svg>
    </div>
  );
};

export default MahwarLogo;


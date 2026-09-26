"use client";

import React from "react";
import { motion } from "framer-motion";

interface AppleGaugeProps {
  value: number;
  min?: number;
  max?: number;
  thresholds?: { safe: number; warn: number };
  title: string;
  subtitle?: string;
  unit?: string;
  statusLabel?: string;
  variant?: "radial" | "linear";
  size?: number;
  className?: string;
}

/**
 * Apple HIG Financial Gauge & Metric Meter.
 * Inspired by watchOS and macOS Stocks & Activity gauges.
 * Features high-precision SVG arc, tabular figures, and dynamic color thresholds.
 * Reference: references/hig/gauges.md
 */
export default function AppleGauge({
  value,
  min = 0,
  max = 100,
  thresholds,
  title,
  subtitle,
  unit = "",
  statusLabel,
  variant = "radial",
  size = 140,
  className = "",
}: AppleGaugeProps) {
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (clampedValue - min) / (max - min);

  // Status tone based on thresholds
  let tone: "pos" | "warn" | "neg" = "pos";
  if (thresholds) {
    if (value <= thresholds.warn) tone = "neg";
    else if (value < thresholds.safe) tone = "warn";
    else tone = "pos";
  }

  const colorMap = {
    pos: "var(--pos)",
    warn: "var(--warn)",
    neg: "var(--neg)",
  };

  const strokeColor = colorMap[tone];

  if (variant === "linear") {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-fg-2">{title}</span>
          <span className="font-mono text-fg font-semibold num">
            {value.toFixed(2)}
            {unit}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-ink-4/60 overflow-hidden relative border border-line/40">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="h-full rounded-full"
            style={{ backgroundColor: strokeColor }}
          />
        </div>
        {subtitle && <p className="text-[10.5px] text-fg-3">{subtitle}</p>}
      </div>
    );
  }

  // Radial Gauge calculations
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // 240 degree arc gauge (Apple style with open bottom)
  const angle = 240;
  const arcLength = (angle / 360) * circumference;
  const strokeDashoffset = arcLength * (1 - percentage);

  return (
    <div
      className={`flex flex-col items-center justify-center relative p-3 rounded-2xl liquid-glass-subtle ${className}`}
      style={{ width: size + 20 }}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[150deg] transform origin-center"
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--line-strong)"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            className="opacity-40"
          />
          {/* Active progress arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            initial={{ strokeDashoffset: arcLength }}
            animate={{ strokeDashoffset }}
            transition={{ type: "spring", stiffness: 140, damping: 24, mass: 0.8 }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${strokeColor}40)` }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="font-mono text-xl font-bold tracking-tight text-fg num">
            {value.toFixed(1)}
            <span className="text-[11px] font-normal text-fg-3">{unit}</span>
          </span>
          {statusLabel && (
            <span
              className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full mt-0.5"
              style={{
                color: strokeColor,
                backgroundColor: `color-mix(in srgb, ${strokeColor} 12%, transparent)`,
              }}
            >
              {statusLabel}
            </span>
          )}
        </div>
      </div>

      <div className="text-center mt-1">
        <h4 className="text-[12px] font-medium text-fg">{title}</h4>
        {subtitle && <p className="text-[10px] text-fg-3 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

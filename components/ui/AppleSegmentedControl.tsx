"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string | number;
}

interface AppleSegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
}

/**
 * Apple HIG Segmented Control.
 * A sliding pill switcher with fluid spring physics, haptic-feeling feedback,
 * and high-contrast liquid glass backing.
 * Reference: references/hig/segmented-controls.md
 */
export default function AppleSegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  size = "md",
  className = "",
  ariaLabel = "Segmented control",
}: AppleSegmentedControlProps<T>) {
  const controlId = useId();

  const sizeClasses = {
    sm: "h-7 text-[11px] p-0.5",
    md: "h-9 text-[12.5px] p-1",
    lg: "h-11 text-[13.5px] p-1.5",
  }[size];

  const itemPadding = {
    sm: "px-2.5 py-0.5",
    md: "px-3.5 py-1",
    lg: "px-4.5 py-1.5",
  }[size];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex items-center rounded-full bg-ink-3/70 dark:bg-ink-4/50 border border-line/60 p-1 backdrop-blur-md shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)] relative select-none ${sizeClasses} ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            role="radio"
            aria-checked={isSelected}
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`relative flex items-center justify-center gap-1.5 font-medium rounded-full transition-colors z-10 ${itemPadding} ${
              isSelected ? "text-fg font-semibold" : "text-fg-3 hover:text-fg-2"
            }`}
          >
            {isSelected && (
              <motion.div
                layoutId={`apple-segmented-thumb-${controlId}`}
                className="absolute inset-0 rounded-full bg-white dark:bg-ink-1 shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.7)] border border-black/5 dark:border-white/10"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  mass: 0.6,
                }}
              />
            )}
            {Icon && (
              <Icon
                size={size === "sm" ? 12 : 14}
                className={`relative z-10 transition-colors ${
                  isSelected ? "text-emerald-light" : "text-fg-3"
                }`}
              />
            )}
            <span className="relative z-10 whitespace-nowrap">{option.label}</span>
            {option.badge !== undefined && (
              <span
                className={`relative z-10 ml-0.5 text-[9.5px] px-1.5 py-0.2 rounded-full font-mono ${
                  isSelected
                    ? "bg-emerald/15 text-emerald-light font-bold"
                    : "bg-ink-4 text-fg-4"
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

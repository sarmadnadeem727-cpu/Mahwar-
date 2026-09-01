"use client";

import React from "react";

interface SectionLabelProps {
  label: string;
  className?: string;
}

export default function SectionLabel({ label, className = "" }: SectionLabelProps) {
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--emerald)]/10 border border-[var(--emerald)]/20 text-[var(--emerald)] font-mono text-[10px] font-bold uppercase tracking-widest mb-4 ${className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--emerald)] animate-pulse" />
      <span>{label}</span>
    </div>
  );
}

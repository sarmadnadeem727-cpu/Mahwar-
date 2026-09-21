import React from "react";

export interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  scenarioDelta?: number;
  suffix?: string;
  prefix?: string;
  step?: string | number;
  disabled?: boolean;
  isAr?: boolean;
  className?: string;
  min?: number;
  max?: number;
}

export default function InputGroup({
  label,
  value,
  onChange,
  scenarioDelta = 0,
  suffix,
  prefix,
  step = "any",
  disabled = false,
  isAr = false,
  className = "",
  min,
  max,
}: InputGroupProps) {
  return (
    <div className={`flex justify-between items-center bg-ink-3 p-2.5 rounded border border-line ${className}`}>
      <span className="text-fg-2 font-bold text-xs font-sans">{label}</span>
      <div className="flex items-center gap-2">
        {scenarioDelta !== 0 && (
          <span className={`font-bold text-xs font-mono ${scenarioDelta > 0 ? "text-emerald" : "text-neg"}`}>
            ({scenarioDelta > 0 ? "+" : ""}{scenarioDelta}{suffix || ""})
          </span>
        )}
        <div className="relative flex items-center">
          {prefix && <span className="absolute left-2 text-fg-3 text-xs font-mono">{prefix}</span>}
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            step={step}
            min={min}
            max={max}
            disabled={disabled}
            className={`w-24 bg-ink-2 border border-line-strong text-fg rounded py-1 text-right focus:outline-none focus:border-emerald font-mono font-bold text-sm ${disabled ? 'opacity-60 cursor-not-allowed bg-ink-3' : ''} ${prefix ? 'pl-6' : 'px-2'} ${suffix ? 'pr-6' : 'pr-2'}`}
            dir="ltr" // Numbers should always be LTR even in Arabic UI
          />
          {suffix && <span className="absolute right-2 text-fg-3 text-xs font-mono">{suffix}</span>}
        </div>
      </div>
    </div>
  );
}


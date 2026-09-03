"use client";

import React, { useEffect, useState } from "react";
import { useSpring } from "framer-motion";

interface NumberCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function NumberCounter({
  value,
  decimals = 2,
  prefix = "",
  suffix = "",
  className = "",
}: NumberCounterProps) {
  const spring = useSpring(value, {
    stiffness: 120,
    damping: 18,
    mass: 0.8,
  });

  const [displayValue, setDisplayValue] = useState<string>(() => {
    const formatted = Number(value).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      const formatted = Number(latest).toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
      setDisplayValue(`${prefix}${formatted}${suffix}`);
    });
    return () => unsubscribe();
  }, [spring, decimals, prefix, suffix]);

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {displayValue}
    </span>
  );
}


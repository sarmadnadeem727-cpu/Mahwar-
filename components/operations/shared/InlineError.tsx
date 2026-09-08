// components/operations/shared/InlineError.tsx
import React from "react";
import { AlertTriangle } from "lucide-react";

interface InlineErrorProps {
  message: string;
  className?: string;
  isAr?: boolean;
}

export default function InlineError({ message, className = "", isAr = false }: InlineErrorProps) {
  if (!message) return null;
  return (
    <div
      className={`flex items-center gap-2 p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-700 text-xs font-mono font-medium ${className}`}
      dir={isAr ? "rtl" : "ltr"}
      role="alert"
    >
      <AlertTriangle size={15} className="shrink-0 text-rose-600" />
      <span>{message}</span>
    </div>
  );
}

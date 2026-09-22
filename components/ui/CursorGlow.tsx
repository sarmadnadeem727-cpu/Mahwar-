"use client";
import { useEffect } from "react";

/** Sets --mx / --my on <body> so `.cursor-glow::before` follows the pointer. Desktop only, passive, rAF-throttled. */
export default function CursorGlow() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const body = document.body;
    body.classList.add("cursor-glow");
    let raf = 0; let x = -999; let y = -999;
    const onMove = (e: PointerEvent) => {
      x = e.clientX; y = e.clientY;
      if (raf) return;
      raf = window.requestAnimationFrame(() => { body.style.setProperty("--mx", `${x}px`); body.style.setProperty("--my", `${y}px`); raf = 0; });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => { window.removeEventListener("pointermove", onMove); body.classList.remove("cursor-glow"); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return null;
}

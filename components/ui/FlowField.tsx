"use client";

import React, { useEffect, useRef } from "react";

/**
 * FlowField — the hero's signature visual.
 *
 * A network of hubs joined by curved corridors. Two kinds of particles ride
 * the corridors: emerald "capital" (fast, thin) and gold "goods" (slower,
 * heavier). Nothing here is decorative noise — the picture *is* the thesis:
 * finance and supply chain run on the same routes.
 *
 * Pure canvas 2D, DPR-aware, pauses when off-screen or hidden, and renders a
 * single still frame when the visitor prefers reduced motion.
 */

type Hub = { x: number; y: number; r: number };
type Corridor = { a: number; b: number; cx: number; cy: number; length: number };
type Particle = { c: number; t: number; speed: number; kind: 0 | 1; size: number; dir: 1 | -1 };

type RGB = readonly [number, number, number];

/** Parse `#rrggbb` / `#rgb` / `rgb(a)(…)` into a triple; canvas gradients need numbers, not var(). */
function parseColor(input: string, fallback: RGB): RGB {
  const s = input.trim();
  const hex = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) {
    const h = hex[1].length === 3 ? hex[1].split("").map((c) => c + c).join("") : hex[1];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  const rgb = s.match(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return fallback;
}

/** The palette is read from the live theme tokens so the field follows light / dark. */
function readPalette() {
  const cs = getComputedStyle(document.documentElement);
  const get = (name: string, fb: RGB) => parseColor(cs.getPropertyValue(name), fb);
  return {
    emerald: get("--emerald", [28, 139, 108]),
    gold: get("--gold", [176, 138, 46]),
    ink: get("--ink-1", [241, 248, 244]),
  };
}

function rgba(rgb: readonly number[], a: number) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;
}

function quad(p0: number, p1: number, p2: number, t: number) {
  const u = 1 - t;
  return u * u * p0 + 2 * u * t * p1 + t * t * p2;
}

interface FlowFieldProps {
  className?: string;
  /** Particle density multiplier (1 = default). */
  density?: number;
  /** Fades the field to the right so text on the left stays readable. */
  fadeSide?: "left" | "right" | "none";
}

export default function FlowField({ className = "", density = 1, fadeSide = "none" }: FlowFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let running = true;
    let visible = true;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let hubs: Hub[] = [];
    let corridors: Corridor[] = [];
    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999 };
    let palette = readPalette();
    let EMERALD: RGB = palette.emerald;
    let GOLD: RGB = palette.gold;

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Hubs on a loose 5×3 lattice with jitter — reads as a trade map, not a grid.
      hubs = [];
      const cols = width < 640 ? 3 : 5;
      const rows = 3;
      let seed = 7;
      const rand = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          hubs.push({
            x: ((c + 0.5) / cols) * width + (rand() - 0.5) * width * 0.12,
            y: ((r + 0.5) / rows) * height + (rand() - 0.5) * height * 0.22,
            r: 2 + rand() * 2.5,
          });
        }
      }

      // Corridors: each hub links to its two nearest neighbours.
      corridors = [];
      const seen = new Set<string>();
      hubs.forEach((h, i) => {
        const nearest = hubs
          .map((o, j) => ({ j, d: Math.hypot(o.x - h.x, o.y - h.y) }))
          .filter((n) => n.j !== i)
          .sort((p, q) => p.d - q.d)
          .slice(0, 2);
        nearest.forEach(({ j, d }) => {
          const key = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (seen.has(key)) return;
          seen.add(key);
          const o = hubs[j];
          const mx = (h.x + o.x) / 2;
          const my = (h.y + o.y) / 2;
          const nx = -(o.y - h.y) / d;
          const ny = (o.x - h.x) / d;
          const bend = (rand() - 0.5) * d * 0.6;
          corridors.push({ a: i, b: j, cx: mx + nx * bend, cy: my + ny * bend, length: d });
        });
      });

      particles = [];
      const count = Math.round(corridors.length * 6 * density);
      for (let k = 0; k < count; k++) {
        const kind: 0 | 1 = rand() > 0.35 ? 0 : 1;
        particles.push({
          c: Math.floor(rand() * corridors.length),
          t: rand(),
          speed: kind === 0 ? 0.0022 + rand() * 0.0025 : 0.0009 + rand() * 0.0009,
          kind,
          size: kind === 0 ? 1.1 + rand() * 0.8 : 1.8 + rand() * 1.2,
          dir: rand() > 0.5 ? 1 : -1,
        });
      }
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      // Corridors
      ctx.lineWidth = 1;
      corridors.forEach((cor) => {
        const A = hubs[cor.a];
        const B = hubs[cor.b];
        const grad = ctx.createLinearGradient(A.x, A.y, B.x, B.y);
        grad.addColorStop(0, rgba(EMERALD, 0.06));
        grad.addColorStop(0.5, rgba(EMERALD, 0.18));
        grad.addColorStop(1, rgba(EMERALD, 0.06));
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(A.x, A.y);
        ctx.quadraticCurveTo(cor.cx, cor.cy, B.x, B.y);
        ctx.stroke();
      });

      // Particles with trails
      particles.forEach((p) => {
        const cor = corridors[p.c];
        const A = hubs[cor.a];
        const B = hubs[cor.b];
        const rgb = p.kind === 0 ? EMERALD : GOLD;
        const x = quad(A.x, cor.cx, B.x, p.t);
        const y = quad(A.y, cor.cy, B.y, p.t);
        const tb = Math.max(0, Math.min(1, p.t - p.dir * 0.06));
        const xb = quad(A.x, cor.cx, B.x, tb);
        const yb = quad(A.y, cor.cy, B.y, tb);

        const near = Math.hypot(mouse.x - x, mouse.y - y) < 120 ? 1.8 : 1;
        const trail = ctx.createLinearGradient(xb, yb, x, y);
        trail.addColorStop(0, rgba(rgb, 0));
        trail.addColorStop(1, rgba(rgb, 0.55));
        ctx.strokeStyle = trail;
        ctx.lineWidth = p.size * 0.9;
        ctx.beginPath();
        ctx.moveTo(xb, yb);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = rgba(rgb, 0.95);
        ctx.shadowColor = rgba(rgb, 0.8);
        ctx.shadowBlur = 10 * near;
        ctx.beginPath();
        ctx.arc(x, y, p.size * near, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        if (!reduced) {
          p.t += p.speed * p.dir * (near > 1 ? 0.4 : 1);
          if (p.t > 1 || p.t < 0) {
            // Hop to a corridor that shares the hub we just reached.
            const reached = p.t > 1 ? cor.b : cor.a;
            const options = corridors
              .map((c, idx) => ({ c, idx }))
              .filter(({ c }) => c.a === reached || c.b === reached);
            const next = options[Math.floor(Math.random() * options.length)];
            p.c = next.idx;
            p.dir = next.c.a === reached ? 1 : -1;
            p.t = p.dir === 1 ? 0 : 1;
          }
        }
      });

      // Hubs with a slow breathing halo
      hubs.forEach((h, i) => {
        const pulse = reduced ? 0.5 : 0.5 + 0.5 * Math.sin(time / 1400 + i);
        ctx.fillStyle = rgba(EMERALD, 0.08 + pulse * 0.08);
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r * 5 + pulse * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = rgba(EMERALD, 0.9);
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rgba(EMERALD, 0.35);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(h.x, h.y, h.r * 2.6, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Optional side fade so headline copy stays legible.
      if (fadeSide !== "none") {
        const g = ctx.createLinearGradient(0, 0, width, 0);
        const ink = `rgba(${palette.ink[0]},${palette.ink[1]},${palette.ink[2]},`;
        if (fadeSide === "left") {
          g.addColorStop(0, ink + "0.92)");
          g.addColorStop(0.45, ink + "0.35)");
          g.addColorStop(1, ink + "0)");
        } else {
          g.addColorStop(0, ink + "0)");
          g.addColorStop(0.55, ink + "0.35)");
          g.addColorStop(1, ink + "0.92)");
        }
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, width, height);
      }
    };

    const loop = (time: number) => {
      if (!running) return;
      if (visible) draw(time);
      if (!reduced) raf = requestAnimationFrame(loop);
    };

    build();
    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    const onResize = () => {
      build();
      if (reduced) draw(0);
    };
    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onLeave = () => {
      mouse = { x: -9999, y: -9999 };
    };
    const onVisibility = () => {
      visible = document.visibilityState === "visible";
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting && document.visibilityState === "visible";
    });

    // Follow the live theme: next-themes flips the class on <html>.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette();
      EMERALD = palette.emerald;
      GOLD = palette.gold;
      if (reduced) draw(0);
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    io.observe(canvas);
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    canvas.parentElement?.addEventListener("pointermove", onMove);
    canvas.parentElement?.addEventListener("pointerleave", onLeave);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      themeObserver.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      canvas.parentElement?.removeEventListener("pointermove", onMove);
      canvas.parentElement?.removeEventListener("pointerleave", onLeave);
    };
  }, [density, fadeSide]);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} aria-hidden="true" />;
}


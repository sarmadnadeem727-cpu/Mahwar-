"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// GCC Financial Hubs with precise offsets to prevent text collision
const GCC_HUBS = [
  { 
    id: "riyadh",
    name: "Riyadh", 
    exchange: "TASI", 
    nameAr: "الرياض", 
    lat: 24.7136, 
    lon: 46.6753, 
    labelOffsetX: -10, 
    labelOffsetY: 18, 
    align: "center" as const
  },
  { 
    id: "kuwait",
    name: "Kuwait", 
    exchange: "BK", 
    nameAr: "الكويت", 
    lat: 29.3759, 
    lon: 47.9774, 
    labelOffsetX: -42, 
    labelOffsetY: -16, 
    align: "right" as const
  },
  { 
    id: "manama",
    name: "Manama", 
    exchange: "BHB", 
    nameAr: "المنامة", 
    lat: 26.2285, 
    lon: 50.5860, 
    labelOffsetX: -38, 
    labelOffsetY: 2, 
    align: "right" as const
  },
  { 
    id: "doha",
    name: "Doha", 
    exchange: "QSE", 
    nameAr: "الدوحة", 
    lat: 25.2854, 
    lon: 51.5310, 
    labelOffsetX: 16, 
    labelOffsetY: -12, 
    align: "left" as const
  },
  { 
    id: "abudhabi",
    name: "Abu Dhabi", 
    exchange: "ADX", 
    nameAr: "أبوظبي", 
    lat: 24.4539, 
    lon: 54.3773, 
    labelOffsetX: 18, 
    labelOffsetY: 8, 
    align: "left" as const
  },
  { 
    id: "dubai",
    name: "Dubai", 
    exchange: "DFM", 
    nameAr: "دبي", 
    lat: 25.2048, 
    lon: 55.2708, 
    labelOffsetX: 18, 
    labelOffsetY: -6, 
    align: "left" as const
  },
  { 
    id: "muscat",
    name: "Muscat", 
    exchange: "MSX", 
    nameAr: "مسقط", 
    lat: 23.5880, 
    lon: 58.3829, 
    labelOffsetX: 20, 
    labelOffsetY: 14, 
    align: "left" as const
  },
];

// Arcs connecting regional capitals
const GCC_ARCS = [
  { from: GCC_HUBS[0], to: GCC_HUBS[1] }, // Riyadh -> Kuwait
  { from: GCC_HUBS[0], to: GCC_HUBS[2] }, // Riyadh -> Manama
  { from: GCC_HUBS[0], to: GCC_HUBS[3] }, // Riyadh -> Doha
  { from: GCC_HUBS[0], to: GCC_HUBS[4] }, // Riyadh -> Abu Dhabi
  { from: GCC_HUBS[0], to: GCC_HUBS[5] }, // Riyadh -> Dubai
  { from: GCC_HUBS[0], to: GCC_HUBS[6] }, // Riyadh -> Muscat
  { from: GCC_HUBS[1], to: GCC_HUBS[2] }, // Kuwait -> Manama
  { from: GCC_HUBS[3], to: GCC_HUBS[4] }, // Doha -> Abu Dhabi
  { from: GCC_HUBS[4], to: GCC_HUBS[5] }, // Abu Dhabi -> Dubai
  { from: GCC_HUBS[5], to: GCC_HUBS[6] }, // Dubai -> Muscat
];

// Generate structured 3D Fibonacci sphere point-cloud
function generateGlobePoints(count: number = 850) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = phi * i;

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    // Convert to lat/lon to check if near GCC (lat ~14-32, lon ~38-60)
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = Math.atan2(z, x) * (180 / Math.PI);
    const isGCC = lat >= 14 && lat <= 32 && lon >= 38 && lon <= 60;

    points.push({ x, y, z, isGCC });
  }
  return points;
}

function latLonToVector3(lat: number, lon: number, radius: number = 1) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return { x, y, z };
}

export default function GccGlobe3D({ isAr = false }: { isAr?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [activeHub, setActiveHub] = useState<string | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handleMediaChange = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    const points = generateGlobePoints(820);
    
    // Light mode dimensions
    const GLOBE_RADIUS = 155;
    let rotationY = 0.85; // Focused on GCC region
    let rotationX = 0.32; // Slight downward 3D perspective
    let targetRotationY = rotationY;
    let targetRotationX = rotationX;
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startMouseX;
      const deltaY = e.clientY - startMouseY;
      targetRotationY += deltaX * 0.005;
      targetRotationX += deltaY * 0.005;
      targetRotationX = Math.max(-0.7, Math.min(0.7, targetRotationX));
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Render loop
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Auto-rotation (smooth subtle drift)
      if (!prefersReducedMotion && !isDragging) {
        targetRotationY += 0.0025;
      }

      rotationY += (targetRotationY - rotationY) * 0.08;
      rotationX += (targetRotationX - rotationX) * 0.08;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // 1. Draw 3D Shaded Sphere Surface (Gives clear spherical volume in Light Mode)
      const sphereGrad = ctx.createRadialGradient(
        centerX - GLOBE_RADIUS * 0.35, 
        centerY - GLOBE_RADIUS * 0.35, 
        GLOBE_RADIUS * 0.1,
        centerX, 
        centerY, 
        GLOBE_RADIUS
      );
      sphereGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
      sphereGrad.addColorStop(0.5, "rgba(247, 247, 245, 0.9)");
      sphereGrad.addColorStop(0.85, "rgba(235, 238, 237, 0.75)");
      sphereGrad.addColorStop(1, "rgba(203, 213, 225, 0.45)");

      ctx.beginPath();
      ctx.arc(centerX, centerY, GLOBE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Outer rim edge
      ctx.strokeStyle = "rgba(14, 124, 105, 0.2)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Atmospheric subtle emerald halo around perimeter
      const auraGrad = ctx.createRadialGradient(
        centerX, centerY, GLOBE_RADIUS * 0.9,
        centerX, centerY, GLOBE_RADIUS * 1.25
      );
      auraGrad.addColorStop(0, "rgba(14, 124, 105, 0.09)");
      auraGrad.addColorStop(1, "rgba(14, 124, 105, 0)");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GLOBE_RADIUS * 1.25, 0, Math.PI * 2);
      ctx.fill();

      // 2. Project & Render 3D Latitude/Longitude Graticule Rings
      const latitudes = [-45, -20, 0, 20, 45];
      latitudes.forEach((lat) => {
        const ringRadius = GLOBE_RADIUS * Math.cos((lat * Math.PI) / 180);
        const ringY = GLOBE_RADIUS * Math.sin((lat * Math.PI) / 180);
        
        // Tilt ring according to X rotation
        const projY = centerY - ringY * cosX;
        const scaleY = Math.abs(sinX);

        ctx.beginPath();
        ctx.ellipse(centerX, projY, ringRadius, ringRadius * scaleY + 1, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(14, 124, 105, 0.08)";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // 3. Project and draw rotating points cloud
      points.forEach((p) => {
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        let y1 = p.y;

        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        const scale = (z2 + 2) / 3;
        const projX = centerX + x2 * GLOBE_RADIUS;
        const projY = centerY - y2 * GLOBE_RADIUS;

        // Front-facing points
        if (z2 > -0.3) {
          const alpha = (z2 + 0.3) / 1.3;
          ctx.beginPath();
          if (p.isGCC) {
            // GCC highlight points (Rich emerald dots)
            ctx.fillStyle = `rgba(14, 124, 105, ${Math.min(1, alpha * 1.4)})`;
            ctx.arc(projX, projY, Math.max(1.2, 2.2 * scale), 0, Math.PI * 2);
          } else {
            // Global surface grid (Crisp slate dots)
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.45})`;
            ctx.arc(projX, projY, Math.max(0.8, 1.2 * scale), 0, Math.PI * 2);
          }
          ctx.fill();
        }
      });

      // 4. Project GCC Capital Hubs
      const projectedHubs = GCC_HUBS.map((hub) => {
        const v = latLonToVector3(hub.lat, hub.lon, 1);
        
        let x1 = v.x * cosY + v.z * sinY;
        let z1 = -v.x * sinY + v.z * cosY;
        let y1 = v.y;

        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        return {
          hub,
          x: centerX + x2 * GLOBE_RADIUS,
          y: centerY - y2 * GLOBE_RADIUS,
          z: z2,
          isFront: z2 > 0.05,
        };
      });

      // 5. Draw Flight-Path Data Arcs
      GCC_ARCS.forEach((arc) => {
        const p1 = projectedHubs.find((h) => h.hub.id === arc.from.id);
        const p2 = projectedHubs.find((h) => h.hub.id === arc.to.id);

        if (p1 && p2 && (p1.isFront || p2.isFront)) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(14, 124, 105, 0.45)";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([3, 2]);

          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - 14;
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // 6. Draw GCC Nodes with Leader Lines and Non-Overlapping Labels
      projectedHubs.forEach((item) => {
        if (item.isFront) {
          const { hub, x, y } = item;

          // Outer Glow
          ctx.beginPath();
          ctx.fillStyle = "rgba(14, 124, 105, 0.2)";
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fill();

          // Emerald Hub Node
          ctx.beginPath();
          ctx.fillStyle = "#0E7C69";
          ctx.arc(x, y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Center Hotspot
          ctx.beginPath();
          ctx.fillStyle = "#FFFFFF";
          ctx.arc(x, y, 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Target Label Position via dedicated offset
          const labelX = x + hub.labelOffsetX;
          const labelY = y + hub.labelOffsetY;

          // Subtle connecting leader line
          ctx.beginPath();
          ctx.strokeStyle = "rgba(14, 124, 105, 0.35)";
          ctx.lineWidth = 0.9;
          ctx.moveTo(x, y);
          ctx.lineTo(labelX, labelY + 2);
          ctx.stroke();

          // Draw Crisp Badge Background for Label
          const text = isAr 
            ? `${hub.nameAr} (${hub.exchange})` 
            : `${hub.name} (${hub.exchange})`;

          ctx.font = "bold 9.5px 'IBM Plex Mono', monospace";
          const textWidth = ctx.measureText(text).width;
          
          let boxX = labelX - 4;
          if (hub.align === "right") boxX = labelX - textWidth - 6;
          if (hub.align === "center") boxX = labelX - textWidth / 2 - 4;

          const boxY = labelY - 9;
          const boxWidth = textWidth + 8;
          const boxHeight = 14;

          // White rounded label pill
          ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
          ctx.strokeStyle = "rgba(14, 124, 105, 0.3)";
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 3);
          ctx.fill();
          ctx.stroke();

          // Text rendering
          ctx.fillStyle = "#171717";
          ctx.fillText(text, boxX + 4, boxY + 10);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [prefersReducedMotion, isAr]);

  return (
    <div className="relative w-full h-[400px] sm:h-[460px] md:h-[500px] flex items-center justify-center select-none overflow-hidden">
      {/* 3D Canvas Rendering */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing max-w-[620px] max-h-[500px]"
      />

      {/* Light-mode Sovereign Grid Status Tag */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="absolute bottom-2 sm:bottom-4 px-3.5 py-1.5 rounded-full bg-white/95 border border-terminal-border-strong shadow-xs flex items-center gap-2 font-mono text-[10px] text-slate-700 pointer-events-none"
      >
        <span className="w-2 h-2 rounded-full bg-terminal-emerald animate-pulse" />
        <span className="text-terminal-emerald font-bold uppercase tracking-wider">
          {isAr ? "شبكة الأسواق الخليجية" : "GCC Bourse Grid"}
        </span>
        <span className="text-slate-400">•</span>
        <span className="font-semibold text-slate-600">7 Bourses Active (TASI, ADX, DFM, QSE, BK, BHB, MSX)</span>
      </motion.div>
    </div>
  );
}

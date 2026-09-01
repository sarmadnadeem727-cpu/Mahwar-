"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Approximate 3D Spherical Coordinates (lat, lon) for GCC Hubs
const GCC_HUBS = [
  { name: "Riyadh (TASI)", nameAr: "الرياض", lat: 24.7136, lon: 46.6753, color: "#10B981" },
  { name: "Abu Dhabi (ADX)", nameAr: "أبوظبي", lat: 24.4539, lon: 54.3773, color: "#10B981" },
  { name: "Dubai (DFM)", nameAr: "دبي", lat: 25.2048, lon: 55.2708, color: "#10B981" },
  { name: "Doha (QSE)", nameAr: "الدوحة", lat: 25.2854, lon: 51.5310, color: "#10B981" },
  { name: "Kuwait City (BK)", nameAr: "الكويت", lat: 29.3759, lon: 47.9774, color: "#10B981" },
  { name: "Manama (BHB)", nameAr: "المنامة", lat: 26.2285, lon: 50.5860, color: "#10B981" },
  { name: "Muscat (MSX)", nameAr: "مسقط", lat: 23.5880, lon: 58.3829, color: "#10B981" },
];

// Arcs connecting regional capitals to depict financial flow network
const GCC_ARCS = [
  { from: GCC_HUBS[0], to: GCC_HUBS[1] }, // Riyadh -> Abu Dhabi
  { from: GCC_HUBS[0], to: GCC_HUBS[2] }, // Riyadh -> Dubai
  { from: GCC_HUBS[0], to: GCC_HUBS[3] }, // Riyadh -> Doha
  { from: GCC_HUBS[0], to: GCC_HUBS[4] }, // Riyadh -> Kuwait
  { from: GCC_HUBS[0], to: GCC_HUBS[5] }, // Riyadh -> Manama
  { from: GCC_HUBS[0], to: GCC_HUBS[6] }, // Riyadh -> Muscat
  { from: GCC_HUBS[2], to: GCC_HUBS[3] }, // Dubai -> Doha
  { from: GCC_HUBS[4], to: GCC_HUBS[5] }, // Kuwait -> Manama
];

// Generate structured Fibonacci sphere point-cloud with density around GCC region
function generateGlobePoints(count: number = 750) {
  const points = [];
  const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
    const radius = Math.sqrt(1 - y * y); // radius at y
    const theta = phi * i;

    const x = Math.cos(theta) * radius;
    const z = Math.sin(theta) * radius;

    // Convert to lat/lon to check if near Middle East / GCC (lat ~12-35, lon ~35-65)
    const lat = Math.asin(y) * (180 / Math.PI);
    const lon = Math.atan2(z, x) * (180 / Math.PI);
    const isGCC = lat >= 12 && lat <= 34 && lon >= 34 && lon <= 62;

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
  const [hoveredHub, setHoveredHub] = useState<string | null>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check reduced motion
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
    const points = generateGlobePoints(720);
    
    // Globe visual configuration
    const GLOBE_RADIUS = 150;
    let rotationY = 0.8; // Initial orientation pointing toward GCC
    let rotationX = 0.35; // Slight downward pitch for cinematic 3D angle
    let targetRotationY = rotationY;
    let targetRotationX = rotationX;
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;

    // Handle resize
    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Mouse drag handlers for interactive rotation
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
      targetRotationX = Math.max(-0.8, Math.min(0.8, targetRotationX));
      startMouseX = e.clientX;
      startMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Main 3D render loop
    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Auto-rotation (smooth cinematic drift if not reduced motion)
      if (!prefersReducedMotion && !isDragging) {
        targetRotationY += 0.003;
      }

      // Inertial damping
      rotationY += (targetRotationY - rotationY) * 0.08;
      rotationX += (targetRotationX - rotationX) * 0.08;

      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);

      // 1. Draw outer atmospheric aura glow
      const glowGrad = ctx.createRadialGradient(
        centerX, centerY, GLOBE_RADIUS * 0.7,
        centerX, centerY, GLOBE_RADIUS * 1.35
      );
      glowGrad.addColorStop(0, "rgba(14, 124, 105, 0.16)");
      glowGrad.addColorStop(0.6, "rgba(14, 124, 105, 0.04)");
      glowGrad.addColorStop(1, "rgba(7, 9, 13, 0)");
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GLOBE_RADIUS * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw subtle latitude/longitude wireframe circles
      ctx.strokeStyle = "rgba(14, 124, 105, 0.12)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, GLOBE_RADIUS, 0, Math.PI * 2);
      ctx.stroke();

      // 3. Project and draw rotating points cloud
      points.forEach((p) => {
        // Y-axis rotation
        let x1 = p.x * cosY + p.z * sinY;
        let z1 = -p.x * sinY + p.z * cosY;
        let y1 = p.y;

        // X-axis rotation (tilt)
        let y2 = y1 * cosX - z1 * sinX;
        let z2 = y1 * sinX + z1 * cosX;
        let x2 = x1;

        // Depth perspective
        const scale = (z2 + 2) / 3;
        const projX = centerX + x2 * GLOBE_RADIUS;
        const projY = centerY - y2 * GLOBE_RADIUS;

        // Only draw front and semi-back vertices with depth-based alpha
        if (z2 > -0.6) {
          const alpha = (z2 + 0.6) / 1.6;
          ctx.beginPath();
          if (p.isGCC) {
            // GCC highlight vertex (Emerald bright node)
            ctx.fillStyle = `rgba(16, 185, 129, ${Math.min(1, alpha * 1.5)})`;
            ctx.arc(projX, projY, Math.max(1, 2.2 * scale), 0, Math.PI * 2);
          } else {
            // Standard global vertex (Deep slate / graphite)
            ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.35})`;
            ctx.arc(projX, projY, Math.max(0.8, 1.2 * scale), 0, Math.PI * 2);
          }
          ctx.fill();
        }
      });

      // 4. Project and render GCC Capital Hub Nodes and Arcs
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
          isFront: z2 > 0,
        };
      });

      // Draw Arcs between hubs
      GCC_ARCS.forEach((arc) => {
        const p1 = projectedHubs.find((h) => h.hub.name === arc.from.name);
        const p2 = projectedHubs.find((h) => h.hub.name === arc.to.name);

        if (p1 && p2 && (p1.isFront || p2.isFront)) {
          ctx.beginPath();
          ctx.strokeStyle = "rgba(16, 185, 129, 0.45)";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([3, 3]);

          // Quadratic curve midpoint elevated above surface for 3D flight arc
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2 - 18;
          ctx.moveTo(p1.x, p1.y);
          ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw GCC Pulsing Nodes & Labels
      projectedHubs.forEach((item) => {
        if (item.isFront) {
          // Node Outer Glow Ring
          ctx.beginPath();
          ctx.fillStyle = "rgba(16, 185, 129, 0.25)";
          ctx.arc(item.x, item.y, 8, 0, Math.PI * 2);
          ctx.fill();

          // Node Core Solid Point
          ctx.beginPath();
          ctx.fillStyle = "#10B981";
          ctx.arc(item.x, item.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Node Center White Hotspot
          ctx.beginPath();
          ctx.fillStyle = "#FFFFFF";
          ctx.arc(item.x, item.y, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Text Label
          ctx.font = "bold 9px 'IBM Plex Mono', monospace";
          ctx.fillStyle = "rgba(241, 245, 249, 0.9)";
          const label = isAr ? item.hub.nameAr : item.hub.name;
          ctx.fillText(label, item.x + 8, item.y - 4);
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
    <div className="relative w-full h-[420px] sm:h-[480px] md:h-[540px] flex items-center justify-center select-none overflow-hidden">
      {/* Three-Dimensional Canvas Renderer */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing max-w-[640px] max-h-[540px]"
      />

      {/* Floating Status Pill over Globe */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="absolute bottom-4 sm:bottom-6 px-3 py-1.5 rounded-full bg-[#07090D]/85 border border-emerald-500/30 backdrop-blur-md flex items-center gap-2 font-mono text-[10px] text-slate-300 shadow-xl pointer-events-none"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-emerald-400 font-bold uppercase tracking-wider">
          {isAr ? "شبكة الأسواق الخليجية المتصلة" : "GCC Sovereign Data Grid"}
        </span>
        <span className="text-slate-500">• 7 Bourses Active</span>
      </motion.div>
    </div>
  );
}

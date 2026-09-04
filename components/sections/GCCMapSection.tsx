"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Globe, MapPin } from "lucide-react";

// Using standard world-atlas TopoJSON (110m resolution for fast loading)
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

// The six GCC countries we want to highlight
const GCC_COUNTRIES = [
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
  "Bahrain",
  "Oman"
];

// Key markers (cities) with hardcoded dx/dy offsets to prevent label overlap
const MARKERS = [
  { name: "Riyadh", coordinates: [46.7167, 24.6333], dx: -20, dy: -15 },
  { name: "Dubai", coordinates: [55.3047, 25.2048], dx: 15, dy: -15 },
  { name: "Abu Dhabi", coordinates: [54.3667, 24.4667], dx: 15, dy: 15 },
  { name: "Doha", coordinates: [51.5333, 25.2833], dx: -10, dy: 15 },
  { name: "Kuwait City", coordinates: [47.9774, 29.3759], dx: -15, dy: -20 },
  { name: "Manama", coordinates: [50.5833, 26.2333], dx: 25, dy: -5 },
  { name: "Muscat", coordinates: [58.4059, 23.5859], dx: 25, dy: 10 }
];

export default function GCCMapSection() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative w-full bg-[#f4f7fb] py-20 font-sans border-b border-surface-border overflow-hidden">
      {/* Background Soft Blue/Emerald Tint representing the sea */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 to-[#eef9f5] opacity-80 pointer-events-none" />
      
      {/* Subtle Animated Water Shimmer Effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at center, #10b981 1px, transparent 1px)',
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-white border border-surface-border text-slate-heading text-mono-caption font-mono font-bold uppercase tracking-wider mb-4 rounded-full shadow-2xs">
            <Globe size={13} className="text-emerald" />
            <span>GCC Market Coverage</span>
          </div>
          <h2 className="font-serif text-3xl font-extrabold text-slate-900 tracking-tight">
            Sovereign Regional Scale
          </h2>
          <p className="mt-4 text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Real-time equity coverage and institutional financial intelligence across all major GCC capital markets and regional bourses.
          </p>
        </div>

        {/* Map Container */}
        <div className="w-full max-w-5xl aspect-[16/9] relative bg-white/40 backdrop-blur-md rounded-2xl border border-white/60 shadow-lg overflow-hidden">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1800,
              center: [52, 24] // Centered perfectly on the GCC / Arabian Peninsula
            }}
            width={1200}
            height={600}
            style={{ width: "100%", height: "100%" }}
          >
            {/* Geographies (Land) */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo, index) => {
                  const isGCC = GCC_COUNTRIES.includes(geo.properties.name);
                  
                  return (
                    <motion.g key={geo.rsmKey}>
                      <Geography
                        geography={geo}
                        fill={isGCC ? "#10b981" : "#E2E8F0"}
                        stroke={isGCC ? "#047857" : "#CBD5E1"}
                        strokeWidth={isGCC ? 0.75 : 0.5}
                        style={{
                          default: { outline: "none" },
                          hover: { outline: "none", fill: isGCC ? "#059669" : "#E2E8F0" },
                          pressed: { outline: "none" },
                        }}
                      />
                    </motion.g>
                  );
                })
              }
            </Geographies>

            {/* City Markers with Radar Pulse */}
            {MARKERS.map(({ name, coordinates, dx, dy }, idx) => (
              <Marker key={name} coordinates={coordinates as [number, number]}>
                <motion.g
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: 0.6 + (idx * 0.1), type: "spring" }}
                >
                  {/* Radar Pulse */}
                  <circle r={6} fill="#059669" opacity={0.2} className="animate-ping" style={{ transformOrigin: "center" }} />
                  {/* Solid Inner Dot */}
                  <circle r={3} fill="#064e3b" />
                  
                  {/* Text Label */}
                  <text
                    textAnchor="middle"
                    x={dx}
                    y={dy}
                    className="font-mono text-[9px] font-bold fill-slate-900"
                    style={{ 
                      textShadow: "1px 1px 0px rgba(255,255,255,0.8), -1px -1px 0px rgba(255,255,255,0.8), 1px -1px 0px rgba(255,255,255,0.8), -1px 1px 0px rgba(255,255,255,0.8)" 
                    }}
                  >
                    {name}
                  </text>
                </motion.g>
              </Marker>
            ))}
          </ComposableMap>
        </div>
      </div>
    </section>
  );
}

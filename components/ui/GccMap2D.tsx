"use client";

import React, { useEffect, useState, memo } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

const GCC_COUNTRIES = ["SAU", "ARE", "QAT", "KWT", "BHR", "OMN", "682", "784", "634", "414", "048", "48", "512"];

const GCC_HUBS = [
  { name: "Riyadh (TASI)", coordinates: [46.6753, 24.7136], dx: -45, dy: -15, isAr: "الرياض (TASI)" },
  { name: "Kuwait (BK)", coordinates: [47.9774, 29.3759], dx: -45, dy: -25, isAr: "الكويت (BK)" },
  { name: "Manama (BHB)", coordinates: [50.5860, 26.2285], dx: -45, dy: 10, isAr: "المنامة (BHB)" },
  { name: "Doha (QSE)", coordinates: [51.5310, 25.2854], dx: 45, dy: -20, isAr: "الدوحة (QSE)" },
  { name: "Abu Dhabi (ADX)", coordinates: [54.3773, 24.4539], dx: 45, dy: 5, isAr: "أبوظبي (ADX)" },
  { name: "Dubai (DFM)", coordinates: [55.2708, 25.2048], dx: 55, dy: -10, isAr: "دبي (DFM)" },
  { name: "Muscat (MSX)", coordinates: [58.3829, 23.5880], dx: 45, dy: 25, isAr: "مسقط (MSX)" }
];

const MapChart = ({ isAr = false }: { isAr?: boolean }) => {
  const [mounted, setMounted] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Pre-check network fetch for geoUrl
    fetch(geoUrl)
      .then((res) => {
        if (!res.ok) setHasError(true);
      })
      .catch(() => setHasError(true));
  }, []);

  if (!mounted || hasError) {
    return (
      <div className="w-full h-[400px] sm:h-[460px] md:h-[500px] flex flex-col items-center justify-center bg-slate-50 border border-[#E2E8F0] rounded-lg shadow-sm font-mono text-xs text-slate-500 gap-3 p-6 text-center">
        <span className="font-bold text-emerald text-sm uppercase">GCC SOVEREIGN BOURSE GRID</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md w-full mt-2">
          {GCC_HUBS.map((h) => (
            <div key={h.name} className="p-2.5 bg-white border border-[#E2E8F0] rounded text-[11px] font-bold text-slate-700">
              {isAr ? h.isAr : h.name}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] sm:h-[460px] md:h-[500px] flex items-center justify-center relative overflow-hidden bg-white border border-[#E2E8F0] rounded-lg shadow-sm">
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{
          scale: 1800,
          center: [50, 24.5] // Center over GCC
        }}
        width={800}
        height={500}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const isGCC = GCC_COUNTRIES.includes(String(geo.id)) || GCC_COUNTRIES.includes(geo.properties?.ISO_A3) || GCC_COUNTRIES.includes(geo.properties?.iso_a3);
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={isGCC ? "rgba(14, 124, 105, 0.18)" : "#F1F5F9"}
                  stroke={isGCC ? "#0E7C69" : "#CBD5E1"}
                  strokeWidth={isGCC ? 1.2 : 0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isGCC ? "rgba(14, 124, 105, 0.35)" : "#E2E8F0" },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>

        {GCC_HUBS.map((hub) => (
          <Marker key={hub.name} coordinates={hub.coordinates as [number, number]}>
            <circle r={4} fill="#0E7C69" stroke="#FFFFFF" strokeWidth={1.5} />
            <line
              x1={0}
              y1={0}
              x2={hub.dx}
              y2={hub.dy}
              stroke="#0E7C69"
              strokeWidth={1}
              strokeDasharray="2,2"
            />
            <rect
              x={hub.dx > 0 ? hub.dx : hub.dx - 88}
              y={hub.dy - 9}
              width={88}
              height={18}
              fill="rgba(255, 255, 255, 0.95)"
              stroke="#0E7C69"
              strokeWidth={1}
              rx={4}
            />
            <text
              x={hub.dx > 0 ? hub.dx + 4 : hub.dx - 84}
              y={hub.dy + 3}
              textAnchor="start"
              className="font-mono text-[9px] font-bold fill-[#0E7C69]"
            >
              {isAr ? hub.isAr : hub.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {/* Status Panel overlay */}
      <div className="absolute bottom-4 right-4 bg-white/95 border border-[#E2E8F0] px-3 py-1.5 flex items-center gap-2 font-mono text-[10px] shadow-sm rounded-md">
        <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
        <span className="text-emerald font-bold tracking-wider uppercase">GCC Bourse Grid</span>
        <span className="text-slate-300">|</span>
        <span className="text-slate-700 font-bold">7 ACTIVE</span>
      </div>
    </div>
  );
};

export default memo(MapChart);

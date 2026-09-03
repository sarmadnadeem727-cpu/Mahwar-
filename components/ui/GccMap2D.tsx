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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center font-mono text-xs text-slate-500">
        LOADING MAP MODULE...
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] sm:h-[460px] md:h-[500px] flex items-center justify-center relative overflow-hidden bg-[#121721] border border-[#1E293B] rounded-sm">
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
                  fill={isGCC ? "rgba(0, 255, 157, 0.25)" : "#18202E"}
                  stroke={isGCC ? "#00FF9D" : "#2B374A"}
                  strokeWidth={isGCC ? 1.2 : 0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { outline: "none", fill: isGCC ? "rgba(0, 255, 157, 0.4)" : "#1F2B3E" },
                    pressed: { outline: "none" }
                  }}
                />
              );
            })
          }
        </Geographies>

        {GCC_HUBS.map((hub) => (
          <Marker key={hub.name} coordinates={hub.coordinates as [number, number]}>
            <circle r={3.5} fill="#00FF9D" stroke="#0B0E14" strokeWidth={1.5} />
            <line
              x1={0}
              y1={0}
              x2={hub.dx}
              y2={hub.dy}
              stroke="#00FF9D"
              strokeWidth={0.8}
              strokeDasharray="2,2"
            />
            <rect
              x={hub.dx > 0 ? hub.dx : hub.dx - 84}
              y={hub.dy - 8}
              width={84}
              height={16}
              fill="rgba(18, 23, 33, 0.95)"
              stroke="#00FF9D"
              strokeWidth={0.8}
              rx={2}
            />
            <text
              x={hub.dx > 0 ? hub.dx + 4 : hub.dx - 80}
              y={hub.dy + 3}
              textAnchor="start"
              className="font-mono text-[9px] font-bold fill-[#00FF9D]"
            >
              {isAr ? hub.isAr : hub.name}
            </text>
          </Marker>
        ))}
      </ComposableMap>

      {/* Status Panel overlay */}
      <div className="absolute bottom-4 right-4 bg-[#0B0E14]/90 border border-[#1E293B] px-3 py-1.5 flex items-center gap-2 font-mono text-[10px] shadow-lg">
        <span className="w-2 h-2 rounded-full bg-terminal-emerald animate-pulse" />
        <span className="text-terminal-emerald font-bold tracking-widest uppercase">GCC Bourse Grid</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-300 font-bold">7 ACTIVE</span>
      </div>
    </div>
  );
};

export default memo(MapChart);

"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import ThesisSection, { EngineTape } from "@/components/sections/ThesisSection";
import ToolShowcase from "@/components/sections/ToolShowcase";
import GCCMapSection from "@/components/sections/GCCMapSection";
import CapabilitiesBento from "@/components/sections/CapabilitiesBento";
import NewsPreviewWidget from "@/components/sections/NewsPreviewWidget";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/layout/Footer";
import { useTerminalStore } from "@/store/useTerminalStore";

export default function LandingPage() {
  const { language } = useTerminalStore();
  return (
    <div className={`min-h-screen bg-ink-1 text-fg flex flex-col ${language === "ar" ? "font-arabic" : "font-sans"}`}>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <EngineTape />
        <ThesisSection />
        <ToolShowcase />
        <GCCMapSection />
        <CapabilitiesBento />
        <NewsPreviewWidget />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}

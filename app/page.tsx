"use client";

import React from "react";
import Navbar from "@/components/layout/Navbar";
import ChapterNav from "@/components/sections/ChapterNav";
import IntroChapter from "@/components/sections/IntroChapter";
import EnginesChapter from "@/components/sections/EnginesChapter";
import FlagshipChapter from "@/components/sections/FlagshipChapter";
import NetworkChapter from "@/components/sections/NetworkChapter";
import TrustChapter from "@/components/sections/TrustChapter";
import WireChapter from "@/components/sections/WireChapter";
import StartChapter from "@/components/sections/StartChapter";
import Footer from "@/components/layout/Footer";
import { useTerminalStore } from "@/store/useTerminalStore";

/**
 * The landing page is a book of seven chapters (components/sections/chapters.ts):
 * INTRO → ENGINES (light) → FLAGSHIP ×6 → NETWORK → TRUST (light) → WIRE → START.
 * The full engine list appears once (ENGINES); the live elements are the
 * flagship demos, the Gulf map and the wire — nothing else moves.
 */
export default function LandingPage() {
  const { language } = useTerminalStore();
  return (
    <div className={`min-h-screen bg-ink-1 text-fg flex flex-col ${language === "ar" ? "font-arabic" : "font-sans"}`}>
      <Navbar />
      <ChapterNav />
      <main className="flex-1 landing-main">
        <IntroChapter />
        <EnginesChapter />
        <FlagshipChapter />
        <NetworkChapter />
        <TrustChapter />
        <WireChapter />
        <StartChapter />
      </main>
      <Footer />
    </div>
  );
}

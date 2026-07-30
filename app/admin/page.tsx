"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, ShieldAlert, Users, CreditCard, Activity, ArrowLeft, RefreshCw } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { useUserContext } from "@/components/providers/UserProvider";

interface AdminMetrics {
  totalUsers: number;
  subStats: {
    free: number;
    pro: number;
    institutional: number;
  };
  recentSignups: Array<{
    full_name: string | null;
    company_name: string | null;
    created_at: string;
  }>;
  usageToday: number;
}

export default function AdminPage() {
  const { language, setLanguage } = useTerminalStore();
  const { user, profile, isLoading: userLoading } = useUserContext();
  const isAr = language === 'ar';

  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/metrics");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to fetch metrics");
      }
    } catch (err) {
      setError("Network error fetching metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && profile?.role === "admin") {
      fetchMetrics();
    }
  }, [user, profile]);

  if (userLoading) {
    return (
      <div className="min-h-screen bg-[#0A0B0D] flex items-center justify-center text-slate-400 font-mono text-xs">
        <RefreshCw size={20} className="animate-spin" />
      </div>
    );
  }

  // Permission gate
  if (!user || profile?.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0A0B0D] flex flex-col items-center justify-center p-6 text-slate-200 font-mono text-xs text-center space-y-4">
        <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-full text-red-500">
          <ShieldAlert size={40} />
        </div>
        <div className="space-y-1">
          <h1 className="font-garamond text-2xl font-bold uppercase tracking-wider text-red-500">
            Access Denied
          </h1>
          <p className="text-slate-400 font-sans max-w-sm">
            This route is reserved for sovereign administrative accounts only.
          </p>
        </div>
        <Link 
          href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Terminal</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-[#0A0B0D] text-slate-100 font-mono text-xs flex flex-col selection:bg-[var(--emerald)] selection:text-white ${isAr ? "font-cairo" : ""}`} dir={isAr ? "rtl" : "ltr"}>
      {/* HEADER CONTROLS */}
      <header className="h-[64px] border-b border-white/5 flex items-center justify-between px-8 bg-[#0F1113]/50 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 bg-[#14171A] border border-white/10 hover:bg-white/5 text-slate-300 rounded-lg transition-colors cursor-pointer">
            <ArrowLeft size={13} />
            <span>Terminal</span>
          </Link>
          <span className="text-slate-500 font-mono">/</span>
          <span className="font-bold text-[var(--gold)] uppercase tracking-wider">ADMIN CORE</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setLanguage(isAr ? "en" : "ar")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#14171A] border border-white/10 hover:bg-white/5 text-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <Globe size={13} className="text-[var(--gold)]" />
            <span>{isAr ? "English" : "العربية"}</span>
          </button>
          
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-lg border border-white/10 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-[var(--emerald)]" : ""} />
          </button>
        </div>
      </header>

      {/* METRICS VIEW */}
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full space-y-8">
        <div className="pb-4 border-b border-white/5 space-y-1">
          <h1 className="font-garamond text-3xl font-extrabold tracking-wide text-white">
            SOVEREIGN ADMINISTRATION
          </h1>
          <p className="text-slate-400 font-sans text-xs">
            Real-time subscriber metrics, system logs, and total transactional volume.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs">
            {error}
          </div>
        )}

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <RefreshCw size={24} className="animate-spin text-[var(--emerald)]" />
          </div>
        ) : (
          metrics && (
            <div className="space-y-8">
              {/* TOP STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Total Accounts</span>
                    <Users size={14} className="text-[var(--emerald)]" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {metrics.totalUsers}
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Pro Plans</span>
                    <CreditCard size={14} className="text-[var(--gold)]" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {metrics.subStats.pro}
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Active Institutional</span>
                    <CreditCard size={14} className="text-[var(--gold)]" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {metrics.subStats.institutional}
                  </div>
                </div>

                <div className="glass-panel p-5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Today's API Requests</span>
                    <Activity size={14} className="text-sky-400 animate-pulse" />
                  </div>
                  <div className="text-3xl font-extrabold text-white font-mono">
                    {metrics.usageToday}
                  </div>
                </div>
              </div>

              {/* RECENT SIGNUPS */}
              <div className="glass-panel p-6 rounded-2xl border border-white/10">
                <h3 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users size={15} className="text-[var(--emerald)]" />
                  <span>Recent Signup Operations</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="terminal-table">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Organization / Firm</th>
                        <th>Registered Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.recentSignups.map((client, idx) => (
                        <tr key={idx} className="border-b border-white/5">
                          <td className="text-white font-bold">{client.full_name || "Anonymous Client"}</td>
                          <td className="text-slate-300">{client.company_name || "Independent"}</td>
                          <td className="text-slate-400">
                            {new Date(client.created_at).toLocaleDateString()} · {new Date(client.created_at).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )
        )}
      </main>
    </div>
  );
}

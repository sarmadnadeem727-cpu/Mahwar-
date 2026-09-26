"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Radar, RefreshCw, Search, X, ArrowUpDown, ArrowUp, ArrowDown, ShieldCheck, Zap, ZapOff, ExternalLink } from "lucide-react";
import EngineShell, { Card, Kpis, Toggle, fmt, pct } from "@/components/engines/EngineShell";
import { useTerminalStore } from "@/store/useTerminalStore";
import { useSessionSave } from "@/lib/useSessionSave";
import { EXCHANGES, SECTORS, REFERENCE_AS_OF, type Exchange, type Sector } from "@/lib/market/universe";
import type { QuotesResponse } from "@/lib/market/quotes";
import { EMPTY_FILTERS, PRESETS, applyFilters, buildRows, sortRows, summarise, type Range, type ScreenFilters, type ScreenRow, type SortKey } from "@/lib/finance/screener";
import AppleSheet from "@/components/ui/AppleSheet";
import AppleContextMenu from "@/components/ui/AppleContextMenu";
import SFSymbol from "@/components/ui/SFSymbol";

const POLL_MS = 15_000;

/** Column definition for the grid. */
interface Col { key: SortKey; en: string; ar: string; render: (r: ScreenRow) => React.ReactNode; align?: "start" | "end"; hideSm?: boolean }

export default function StockScreener() {
  const { language, setPanel, toast } = useTerminalStore();
  const isAr = language === "ar";

  const [filters, setFilters] = useState<ScreenFilters>(EMPTY_FILTERS);
  const [preset, setPreset] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "marketCapUsdB", dir: "desc" });
  const [selected, setSelected] = useState<string | null>(null);
  const [live, setLive] = useState(true);
  const [feed, setFeed] = useState<QuotesResponse | null>(null);
  const [fetching, setFetching] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [filtersSheetOpen, setFiltersSheetOpen] = useState(false);
  const timer = useRef<number | null>(null);

  // ---- live feed ----------------------------------------------------------
  const pull = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/quotes", { cache: "no-store" });
      if (res.ok) setFeed((await res.json()) as QuotesResponse);
    } catch { /* keep the last good feed */ }
    finally { setFetching(false); }
  }, []);

  useEffect(() => { pull(); }, [pull]);
  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (live && feed?.provider !== "none") {
      timer.current = window.setInterval(() => { if (document.visibilityState === "visible") pull(); }, POLL_MS);
    }
    return () => { if (timer.current) window.clearInterval(timer.current); };
  }, [live, feed?.provider, pull]);

  // ---- rows -----------------------------------------------------------------
  const allRows = useMemo(() => buildRows(feed?.quotes ?? {}), [feed]);
  const rows = useMemo(() => sortRows(applyFilters(allRows, filters), sort.key, sort.dir), [allRows, filters, sort]);
  const stats = useMemo(() => summarise(rows), [rows]);
  const sel = useMemo(() => rows.find((r) => r.sec.id === selected) ?? allRows.find((r) => r.sec.id === selected) ?? null, [rows, allRows, selected]);
  const keyed = !!feed && feed.provider !== "none";

  useSessionSave("screener", { filters, preset, sort }, { matches: rows.length, top: rows.slice(0, 10).map((r) => r.sec.id), provider: feed?.provider ?? "none" });

  // ---- filter helpers ------------------------------------------------------
  const setF = <K extends keyof ScreenFilters>(k: K, v: ScreenFilters[K]) => { setFilters((f) => ({ ...f, [k]: v })); setPreset(null); };
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const applyPreset = (id: string) => {
    const p = PRESETS.find((x) => x.id === id);
    if (!p) return;
    setFilters({ ...EMPTY_FILTERS, ...p.filters });
    setPreset(id);
  };
  const reset = () => { setFilters(EMPTY_FILTERS); setPreset(null); setSort({ key: "marketCapUsdB", dir: "desc" }); };
  const clickSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: key === "name" ? "asc" : "desc" }));

  const money = (v: number, d = 2) => (Number.isFinite(v) ? v.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—");
  const capUsd = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(2)}T` : v >= 1 ? `$${v.toFixed(1)}B` : `$${(v * 1000).toFixed(0)}M`);

  const cols: Col[] = [
    { key: "name", en: "Company", ar: "الشركة", render: (r) => (
      <div className="min-w-0">
        <div className="text-[12.5px] text-fg truncate font-sans">{isAr ? r.sec.nameAr : r.sec.name}</div>
        <div className="text-[10px] text-fg-3 truncate">{r.sec.code} · {r.sec.exchange}{r.sec.shariahIndicative ? " · ✓" : ""}</div>
      </div>
    ) },
    { key: "price", en: "Price", ar: "السعر", align: "end", render: (r) => <span>{money(r.price, r.price < 2 ? 3 : 2)} <span className="text-fg-4 text-[10px]">{r.currency}</span></span> },
    { key: "changePct", en: "Δ %", ar: "التغير %", align: "end", render: (r) => (
      <span className={r.changePct > 0 ? "text-pos" : r.changePct < 0 ? "text-neg" : "text-fg-3"}>{keyed ? `${r.changePct > 0 ? "+" : ""}${r.changePct.toFixed(2)}%` : "—"}</span>
    ) },
    { key: "marketCapUsdB", en: "Mkt cap", ar: "القيمة السوقية", align: "end", render: (r) => capUsd(r.marketCapUsdB) },
    { key: "pe", en: "P/E", ar: "مكرر الربحية", align: "end", render: (r) => (r.pe > 0 ? r.pe.toFixed(1) : "n/m") },
    { key: "pb", en: "P/B", ar: "سعر/دفتري", align: "end", hideSm: true, render: (r) => r.pb.toFixed(2) },
    { key: "divYield", en: "Yield", ar: "العائد", align: "end", render: (r) => pct(r.divYield) },
    { key: "roe", en: "ROE", ar: "ROE", align: "end", hideSm: true, render: (r) => pct(r.roe) },
    { key: "revenueGrowth", en: "Rev g", ar: "نمو الإيرادات", align: "end", hideSm: true, render: (r) => <span className={r.revenueGrowth < 0 ? "text-neg" : ""}>{pct(r.revenueGrowth)}</span> },
    { key: "score", en: "Score", ar: "الدرجة", align: "end", render: (r) => <ScoreBar v={r.score} /> },
  ];

  const audit = {
    toolName: "GCC stock screener", toolNameAr: "فاحص الأسهم الخليجية",
    summary: "Live price overlays a reference snapshot; price ratios are re-derived from the snapshot multiples so the grid stays consistent. Score = value + quality + income + growth, 25 points each.",
    summaryAr: "السعر المباشر يُركَّب فوق لقطة مرجعية؛ تُعاد النسب السعرية اشتقاقاً من مضاعفات اللقطة. الدرجة = قيمة + جودة + دخل + نمو، 25 نقطة لكل.",
    steps: [
      { title: "Price drift", formula: "k = live price ÷ reference price", substitution: "P/E′ = P/E × k · P/B′ = P/B × k · yield′ = yield ÷ k · cap′ = cap × k", result: keyed ? `provider: ${feed?.provider}` : "no provider — k = 1" },
      { title: "Value leg", formula: "25 × clamp(1 − (P/E − 8) / 32, 0, 1)", substitution: "P/E 8 → 25 pts, P/E 40 → 0 pts", result: "0 – 25" },
      { title: "Quality leg", formula: "25 × clamp(ROE / 25%, 0, 1)", substitution: "ROE 25% → 25 pts", result: "0 – 25" },
      { title: "Income leg", formula: "25 × clamp(yield / 7%, 0, 1)", substitution: "yield 7% → 25 pts", result: "0 – 25" },
      { title: "Growth leg", formula: "25 × clamp((g + 5%) / 25%, 0, 1)", substitution: "g −5% → 0 pts, g 20% → 25 pts", result: "0 – 25" },
      { title: "Matches", formula: "rows passing every active range", substitution: `${allRows.length} in universe`, result: String(rows.length) },
    ],
  };

  const exportRows = rows.map((r) => ({
    Company: r.sec.name, Code: r.sec.code, Exchange: r.sec.exchange, Sector: r.sec.sector, Currency: r.currency,
    Price: r.price, "Change %": r.changePct, "Mkt cap (USD bn)": +r.marketCapUsdB.toFixed(2), "P/E": +r.pe.toFixed(2), "P/B": +r.pb.toFixed(2),
    "Yield %": +r.divYield.toFixed(2), "ROE %": r.roe, "Revenue growth %": r.revenueGrowth, "Debt/assets %": r.debtToAssets, "Shariah (indicative)": r.sec.shariahIndicative ? "Y" : "N", Score: r.score,
  }));

  return (
    <EngineShell
      id="screener"
      icon={<Radar size={22} />}
      audit={audit}
      exportRows={exportRows}
      onReset={reset}
      inputsWidth={330}
      inputs={
        <>
          {/* Search */}
          <label className="relative block">
            <SFSymbol name="search" size={14} className="absolute top-1/2 -translate-y-1/2 start-3 text-fg-3" />
            <input
              value={filters.query}
              onChange={(e) => setF("query", e.target.value)}
              placeholder={isAr ? "اسم أو كود أو قطاع" : "Name, code or sector"}
              className="terminal-input w-full h-10 md:h-9 ps-8 font-sans"
            />
          </label>

          {/* Presets */}
          <div>
            <div className="text-[12px] text-fg-2 mb-1.5">{isAr ? "شاشات جاهزة" : "Ready-made screens"}</div>
            <div className="flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button key={p.id} type="button" onClick={() => (preset === p.id ? reset() : applyPreset(p.id))} title={isAr ? p.descAr : p.descEn}
                  className={`px-2.5 py-1 rounded text-[11px] border transition-colors ${preset === p.id ? "bg-emerald text-white dark:text-ink-0 border-emerald" : "border-line-strong text-fg-2 hover:border-emerald-border hover:text-fg"}`}>
                  {isAr ? p.ar : p.en}
                </button>
              ))}
            </div>
          </div>

          {/* Exchanges */}
          <ChipGroup label={isAr ? "السوق" : "Exchange"} items={EXCHANGES.map((e) => ({ id: e.id, label: e.id, title: isAr ? e.ar : e.en }))} active={filters.exchanges} onToggle={(id) => setF("exchanges", toggleIn(filters.exchanges, id as Exchange))} />
          {/* Sectors */}
          <ChipGroup label={isAr ? "القطاع" : "Sector"} items={SECTORS.map((s) => ({ id: s.id, label: isAr ? s.ar : s.id }))} active={filters.sectors} onToggle={(id) => setF("sectors", toggleIn(filters.sectors, id as Sector))} />

          <Toggle label={isAr ? "متوافقة مع الشريعة فقط (مبدئياً)" : "Indicatively Shariah-compliant only"} value={filters.shariahOnly} onChange={(v) => setF("shariahOnly", v)} />

          <div className="pt-2 border-t border-line space-y-2.5">
            <RangeField label={isAr ? "القيمة السوقية (مليار $)" : "Market cap ($bn)"} value={filters.marketCapUsdB} onChange={(v) => setF("marketCapUsdB", v)} />
            <RangeField label={isAr ? "مكرر الربحية" : "P/E"} value={filters.pe} onChange={(v) => setF("pe", v)} />
            <RangeField label={isAr ? "السعر إلى الدفتري" : "P/B"} value={filters.pb} onChange={(v) => setF("pb", v)} />
            <RangeField label={isAr ? "عائد التوزيعات %" : "Dividend yield %"} value={filters.divYield} onChange={(v) => setF("divYield", v)} />
            <RangeField label="ROE %" value={filters.roe} onChange={(v) => setF("roe", v)} />
            <RangeField label={isAr ? "نمو الإيرادات %" : "Revenue growth %"} value={filters.revenueGrowth} onChange={(v) => setF("revenueGrowth", v)} />
            <RangeField label={isAr ? "الدين / الأصول %" : "Debt / assets %"} value={filters.debtToAssets} onChange={(v) => setF("debtToAssets", v)} />
            {keyed && <RangeField label={isAr ? "التغير اليومي %" : "Day change %"} value={filters.changePct} onChange={(v) => setF("changePct", v)} />}
          </div>
        </>
      }
    >
      {/* Feed status */}
      <div className={`flex flex-wrap items-center gap-2 md:gap-3 rounded border px-3 py-2 text-[11px] font-mono ${keyed ? (feed?.live ? "border-emerald-border bg-emerald-dim" : "border-line-strong bg-ink-2") : "border-gold/40 bg-gold-dim"}`}>
        <span className="flex items-center gap-1.5">
          {keyed ? <Zap size={12} className={feed?.live ? "text-emerald-light" : "text-fg-3"} /> : <ZapOff size={12} className="text-gold" />}
          <span className={keyed ? "text-fg" : "text-gold"}>
            {!keyed
              ? (isAr ? `بيانات مرجعية · لقطة ${REFERENCE_AS_OF}` : `Reference snapshot · ${REFERENCE_AS_OF}`)
              : feed?.live ? (isAr ? "السوق مفتوح · أسعار مباشرة" : "Market open · live prices") : (isAr ? "آخر إغلاق" : "Last close")}
          </span>
        </span>
        {keyed && <span className="text-fg-3">{feed?.provider === "tradingview" ? (isAr ? "TradingView (مجاني)" : "TradingView (free)") : feed?.provider}</span>}
        {feed?.asOf && keyed && <span className="text-fg-3">{new Date(feed.asOf).toLocaleTimeString(isAr ? "ar-SA" : "en-GB")}</span>}
        {!keyed && <span className="text-fg-3 hidden md:inline">{feed?.note ?? (isAr ? "لا يوجد مزود بيانات" : "No market-data provider")}</span>}
        <span className="ms-auto flex items-center gap-2">
          {keyed && (
            <button type="button" onClick={() => setLive((v) => !v)} className={`px-2 py-0.5 rounded border ${live ? "border-emerald-border text-emerald-light" : "border-line-strong text-fg-3"}`} aria-pressed={live}>
              {live ? (isAr ? "تحديث تلقائي 15ث" : "Auto 15s") : (isAr ? "متوقف" : "Paused")}
            </button>
          )}
          <button type="button" onClick={pull} disabled={fetching} className="p-1 rounded text-fg-3 hover:text-fg disabled:opacity-50" aria-label={isAr ? "تحديث" : "Refresh"}>
            <RefreshCw size={12} className={fetching ? "animate-spin" : ""} />
          </button>
        </span>
      </div>

      <Kpis
        items={[
          { label: isAr ? "النتائج" : "Matches", value: `${stats.n}`, sub: isAr ? `من ${allRows.length}` : `of ${allRows.length}` },
          { label: isAr ? "القيمة السوقية" : "Combined cap", value: stats.n ? capUsd(stats.capUsdB) : "—", accent: "emerald" },
          { label: isAr ? "وسيط المكرر" : "Median P/E", value: Number.isFinite(stats.medianPe) ? stats.medianPe.toFixed(1) : "—" },
          { label: isAr ? "وسيط العائد" : "Median yield", value: Number.isFinite(stats.medianYield) ? pct(stats.medianYield) : "—", accent: "gold", sub: keyed ? (isAr ? `↑${stats.advancers} ↓${stats.decliners}` : `↑${stats.advancers} ↓${stats.decliners}`) : undefined },
        ]}
      />

      {/* Apple Actions Toolbar (Share, Bookmark, Filter, Inspector) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-1 py-1">
        <div className="flex items-center gap-2">
          {/* Share */}
          <button
            type="button"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${stats.n} GCC Stocks Screen`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard?.writeText(window.location.href);
                toast(isAr ? "تم نسخ رابط الشاشة إلى الحافظة" : "Screen link copied to clipboard", "ok");
              }
            }}
            className="btn-secondary text-[12px] px-3.5 py-1.5 apple-touch-target"
            title={isAr ? "مشاركة الشاشة" : "Share screener"}
          >
            <SFSymbol name="share" size={14} className="text-fg-3" />
            <span>{isAr ? "مشاركة" : "Share"}</span>
          </button>

          {/* Bookmark */}
          <button
            type="button"
            onClick={() => {
              setBookmarked((b) => !b);
              toast(
                !bookmarked
                  ? isAr
                    ? "تم حفظ الشاشة في الإشارات المرجعية"
                    : "Screen saved to bookmarks"
                  : isAr
                  ? "أزيلت الإشارة المرجعية"
                  : "Removed bookmark",
                "ok"
              );
            }}
            className={`btn-secondary text-[12px] px-3.5 py-1.5 apple-touch-target ${
              bookmarked ? "border-gold/50 bg-gold/10 text-gold" : ""
            }`}
            title={isAr ? "إشارة مرجعية" : "Bookmark screen"}
          >
            <SFSymbol
              name="bookmark"
              fill={bookmarked}
              size={14}
              className={bookmarked ? "text-gold" : "text-fg-3"}
            />
            <span>{isAr ? "إشارة مرجعية" : "Bookmark"}</span>
          </button>

          {/* Filter count badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-sans border border-line bg-ink-2/60 text-fg-3">
            <SFSymbol name="filter" size={12} className="text-emerald-light" />
            <span>
              {stats.n} {isAr ? "نتيجة نشطة" : "active filters"}
            </span>
          </div>
        </div>

        {/* Inspector Button */}
        <button
          type="button"
          onClick={() => {
            if (!selected && rows[0]) setSelected(rows[0].sec.id);
            else if (selected) setSelected(selected);
          }}
          className="btn-secondary text-[12px] px-3.5 py-1.5 apple-touch-target"
          title={isAr ? "فتح المفتش المالي" : "Open Financial Inspector"}
        >
          <SFSymbol name="sidebar.right" size={14} className="text-emerald-light" />
          <span>{isAr ? "المفتش المالي" : "Inspector"}</span>
        </button>
      </div>

      {/* Grid */}
      <div className="panel-data overflow-auto max-h-[62vh]">
        <table className="terminal-table min-w-[760px]">
          <thead>
            <tr>
              {cols.map((c) => (
                <th key={c.key} className={`${c.hideSm ? "hidden md:table-cell" : ""} ${c.align === "end" ? "text-end" : ""} cursor-pointer select-none whitespace-nowrap`} onClick={() => clickSort(c.key)} aria-sort={sort.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                  <span className="inline-flex items-center gap-1">
                    {isAr ? c.ar : c.en}
                    {sort.key === c.key ? (sort.dir === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />) : <ArrowUpDown size={10} className="opacity-40" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const contextItems = [
                {
                  id: "dcf",
                  label: isAr ? "تشغيل تقييم DCF" : "Run DCF Valuation",
                  shortcut: "DCF",
                  onClick: () => { setPanel("DCF"); toast(isAr ? `فُتح تقييم DCF لـ ${r.sec.code}` : `Opened DCF for ${r.sec.code}`); },
                },
                {
                  id: "shariah",
                  label: isAr ? "الفحص الشرعي AAOIFI" : "AAOIFI Shariah Audit",
                  shortcut: "AAOIFI",
                  onClick: () => { setPanel("shariah"); toast(isAr ? `فُتح الفحص الشرعي لـ ${r.sec.code}` : `Opened Shariah screen for ${r.sec.code}`); },
                },
                {
                  id: "comps",
                  label: isAr ? "الشركات المماثلة" : "Trading Comps",
                  shortcut: "COMPS",
                  onClick: () => { setPanel("comps"); toast(isAr ? `فُتحت المقارنات لـ ${r.sec.code}` : `Opened comps for ${r.sec.code}`); },
                },
                {
                  id: "ddm",
                  label: isAr ? "نموذج خصم التوزيعات" : "Dividend Discount Model",
                  shortcut: "DDM",
                  onClick: () => { setPanel("ddm"); toast(isAr ? `فُتح DDM لـ ${r.sec.code}` : `Opened DDM for ${r.sec.code}`); },
                  divider: true,
                },
                {
                  id: "copy",
                  label: isAr ? "نسخ رمز السهم" : "Copy Ticker Code",
                  onClick: () => {
                    navigator.clipboard?.writeText(r.sec.code);
                    toast(isAr ? `تم نسخ الرمز ${r.sec.code}` : `Copied ${r.sec.code}`);
                  },
                },
              ];

              return (
                <tr key={r.sec.id} onClick={() => setSelected(r.sec.id)} className={`cursor-pointer ${selected === r.sec.id ? "bg-emerald-dim" : ""}`}>
                  {cols.map((c, colIdx) => (
                    <td key={c.key} className={`${c.hideSm ? "hidden md:table-cell" : ""} ${c.align === "end" ? "text-end" : ""}`}>
                      {colIdx === 0 ? (
                        <AppleContextMenu items={contextItems}>
                          {c.render(r)}
                        </AppleContextMenu>
                      ) : (
                        c.render(r)
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={cols.length} className="text-center py-10 text-fg-3 font-sans">
                {isAr ? "لا توجد نتائج تطابق هذه الشاشة. وسّع نطاقاً أو أزل قطاعاً." : "Nothing matches this screen. Widen a range or drop a sector."}
                <button type="button" onClick={reset} className="btn-ghost ms-3">{isAr ? "إعادة الضبط" : "Reset"}</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Apple Sheet Detail Modal */}
      {sel && (
        <AppleSheet
          isOpen={!!sel}
          onClose={() => setSelected(null)}
          title={`${sel.sec.code} · ${sel.sec.exchange}`}
          subtitle={isAr ? sel.sec.nameAr : sel.sec.name}
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6">
            <div>
              <div className="font-display text-2xl text-fg font-semibold">{isAr ? sel.sec.nameAr : sel.sec.name}</div>
              <div className="text-[12.5px] text-fg-3 mt-1 font-sans">
                {isAr ? SECTORS.find((s) => s.id === sel.sec.sector)?.ar : sel.sec.sector} · {isAr ? EXCHANGES.find((e) => e.id === sel.sec.exchange)?.ar : EXCHANGES.find((e) => e.id === sel.sec.exchange)?.en}
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="font-mono text-3xl text-fg font-bold num">{money(sel.price, sel.price < 2 ? 3 : 2)}</span>
                <span className="font-mono text-[12px] text-fg-3">{sel.currency}</span>
                {keyed && <span className={`font-mono text-[13px] font-semibold ${sel.changePct > 0 ? "text-pos" : sel.changePct < 0 ? "text-neg" : "text-fg-3"}`}>{sel.changePct > 0 ? "+" : ""}{sel.change.toFixed(2)} ({sel.changePct.toFixed(2)}%)</span>}
              </div>
              {/* 52-week position */}
              <div className="mt-4 p-3 rounded-xl bg-ink-2/60 border border-line">
                <div className="flex justify-between font-mono text-[10px] text-fg-3"><span>{money(sel.low52, sel.low52 < 2 ? 3 : 2)}</span><span>{isAr ? "نطاق 52 أسبوعاً" : "52-week range"}</span><span>{money(sel.high52, sel.high52 < 2 ? 3 : 2)}</span></div>
                <div className="relative h-2 mt-1.5 rounded-full bg-ink-4">
                  <div className="absolute inset-y-0 start-0 rounded-full bg-emerald" style={{ width: `${sel.rangePos}%` }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-gold border-2 border-ink-2 shadow-sm" style={{ insetInlineStart: `calc(${sel.rangePos}% - 7px)` }} />
                </div>
              </div>
              <dl className="mt-5 grid grid-cols-3 gap-x-4 gap-y-3 font-mono text-[12px]">
                {[
                  [isAr ? "القيمة السوقية" : "Market cap", `${fmt(sel.marketCapB, 1)}bn ${sel.currency}`],
                  [isAr ? "بالدولار" : "In USD", capUsd(sel.marketCapUsdB)],
                  [isAr ? "مكرر الربحية" : "P/E", sel.pe > 0 ? sel.pe.toFixed(1) : "n/m"],
                  [isAr ? "سعر/دفتري" : "P/B", sel.pb.toFixed(2)],
                  [isAr ? "عائد التوزيعات" : "Dividend yield", pct(sel.divYield)],
                  ["ROE", pct(sel.roe)],
                  [isAr ? "نمو الإيرادات" : "Revenue growth", pct(sel.revenueGrowth)],
                  [isAr ? "الدين / الأصول" : "Debt / assets", pct(sel.debtToAssets, 0)],
                  [isAr ? "الحجم" : "Volume", sel.volume ? fmt(sel.volume) : "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="p-2 rounded-lg bg-ink-3/40 border border-line/40">
                    <dt className="text-[10px] text-fg-3 uppercase tracking-wider">{k}</dt>
                    <dd className="text-fg num font-semibold mt-0.5">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl liquid-glass-subtle border border-line">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] text-fg-3 uppercase tracking-wider font-medium">{isAr ? "الدرجة المركبة" : "Composite Score"}</span>
                  <span className="font-mono text-2xl text-emerald-light font-bold num">{sel.score}<span className="text-[12px] text-fg-3 font-normal">/100</span></span>
                </div>
                <ScoreBar v={sel.score} tall />
              </div>
              <div className={`flex items-center gap-2.5 rounded-xl border p-3 text-[12.5px] font-sans ${sel.sec.shariahIndicative ? "border-emerald/40 bg-emerald/10 text-emerald-light" : "border-line-strong bg-ink-3/30 text-fg-3"}`}>
                <ShieldCheck size={16} className="shrink-0" />
                <span>
                  {sel.sec.shariahIndicative
                    ? (isAr ? "متوافقة مبدئياً حسب النشاط — شغّل فحص أيوفي لاختبارات النسب" : "Indicatively compliant by activity — run the AAOIFI screen for the ratio tests")
                    : (isAr ? "نشاط غير متوافق مبدئياً (تمويل تقليدي)" : "Indicatively non-compliant activity (conventional finance)")}
                </span>
              </div>
              <div className="text-[11.5px] text-fg-3 font-sans font-medium">{isAr ? "افتح هذا السهم في محركات التحليل:" : "Open this name in analytics engines:"}</div>
              <div className="grid grid-cols-2 gap-2">
                {([["DCF", "DCF", isAr ? "تقييم DCF" : "DCF valuation"], ["comps", "COMPS", isAr ? "الشركات المماثلة" : "Trading comps"], ["ddm", "DDM", isAr ? "خصم التوزيعات" : "Dividend model"], ["shariah", "AAOIFI", isAr ? "الفحص الشرعي" : "Shariah screen"]] as const).map(([id, code, label]) => (
                  <button key={id} type="button" onClick={() => { setPanel(id); setSelected(null); toast(isAr ? `فُتح ${code}` : `Opened ${code}`); }} className="btn-secondary justify-between normal-case tracking-normal font-sans text-[12px] py-2 px-3 rounded-xl apple-touch-target">
                    <span>{label}</span><ExternalLink size={12} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AppleSheet>
      )}

      <p className="text-[11px] text-fg-4 font-sans leading-relaxed">
        {keyed
          ? (isAr ? "الأسعار والأساسيات من المزود؛ أي حقل لا يوفره يُملأ من اللقطة المرجعية. أداة فرز، وليست نصيحة استثمارية." : "Prices and fundamentals come from the provider; any field it does not supply is filled from the reference snapshot. A sorting tool, not investment advice.")
          : (isAr ? `الأساسيات المرجعية لقطة توضيحية (${REFERENCE_AS_OF}). أداة فرز، وليست نصيحة استثمارية.` : `Reference fundamentals are an illustrative snapshot (${REFERENCE_AS_OF}). A sorting tool, not investment advice.`)}
      </p>
    </EngineShell>
  );
}

// ---------------------------------------------------------------------------

function ScoreBar({ v, tall = false }: { v: number; tall?: boolean }) {
  return (
    <div className={`w-full ${tall ? "mt-3 h-2" : "h-1.5 min-w-[64px]"} rounded-full bg-ink-4 overflow-hidden`} title={`${v}/100`}>
      <div className={`h-full rounded-full ${v >= 65 ? "bg-emerald" : v >= 45 ? "bg-gold" : "bg-fg-4"}`} style={{ width: `${v}%` }} />
    </div>
  );
}

function ChipGroup({ label, items, active, onToggle }: { label: string; items: { id: string; label: string; title?: string }[]; active: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <div className="text-[12px] text-fg-2 mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {items.map((it) => {
          const on = active.includes(it.id);
          return (
            <button key={it.id} type="button" onClick={() => onToggle(it.id)} title={it.title} aria-pressed={on}
              className={`px-2 py-1 rounded text-[11px] border transition-colors ${on ? "bg-navy text-white border-navy dark:bg-emerald dark:border-emerald dark:text-ink-0" : "border-line-strong text-fg-2 hover:border-emerald-border hover:text-fg"}`}>
              {it.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function RangeField({ label, value, onChange }: { label: string; value: Range; onChange: (v: Range) => void }) {
  const parse = (s: string) => (s.trim() === "" ? undefined : Number(s));
  return (
    <div className="grid grid-cols-[1fr_64px_64px] items-center gap-2">
      <span className="text-[12px] text-fg-2 truncate">{label}</span>
      <input type="number" inputMode="decimal" placeholder="min" value={value.min ?? ""} onChange={(e) => onChange({ ...value, min: parse(e.target.value) })} className="terminal-input h-8 px-2 text-[11px]" dir="ltr" />
      <input type="number" inputMode="decimal" placeholder="max" value={value.max ?? ""} onChange={(e) => onChange({ ...value, max: parse(e.target.value) })} className="terminal-input h-8 px-2 text-[11px]" dir="ltr" />
    </div>
  );
}

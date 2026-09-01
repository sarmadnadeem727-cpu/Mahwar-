"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Filter, Trash2, Plus, ArrowUpDown, ChevronDown } from "lucide-react";
import { useTerminalStore } from "@/store/useTerminalStore";
import { t } from "@/lib/i18n";
import { panelReveal } from "@/lib/motion";

interface CompanyRow {
  ticker: string;
  name: string;
  nameAr: string;
  sector: string;
  price: number;
  pe: number;
  divYield: number;
  marketCap: number;
}

const INITIAL_ROWS: CompanyRow[] = [];

export default function CompanyComparator() {
  const { language, updateSessionAnalysis } = useTerminalStore();
  const isAr = language === 'ar';

  const [rows, setRows] = useState<CompanyRow[]>(INITIAL_ROWS);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [sortField, setSortField] = useState<keyof CompanyRow>("ticker");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Custom Row Insertion Form
  const [newTicker, setNewTicker] = useState("");
  const [newName, setNewName] = useState("");
  const [newNameAr, setNewNameAr] = useState("");
  const [newSector, setNewSector] = useState("Energy");
  const [newPrice, setNewPrice] = useState("");
  const [newPE, setNewPE] = useState("");
  const [newYield, setNewYield] = useState("");
  const [newCap, setNewCap] = useState("");

  const handleAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicker.trim() || !newName.trim()) return;

    const newRow: CompanyRow = {
      ticker: newTicker.toUpperCase(),
      name: newName,
      nameAr: newNameAr || newName,
      sector: newSector,
      price: Number(newPrice) || 0,
      pe: Number(newPE) || 0,
      divYield: Number(newYield) || 0,
      marketCap: Number(newCap) || 0
    };

    setRows([...rows, newRow]);
    
    // Clear inputs
    setNewTicker("");
    setNewName("");
    setNewNameAr("");
    setNewPrice("");
    setNewPE("");
    setNewYield("");
    setNewCap("");
  };

  const handleDeleteRow = (ticker: string) => {
    setRows(rows.filter((r) => r.ticker !== ticker));
  };

  // Sync rows to terminal store session analyses
  useEffect(() => {
    updateSessionAnalysis("comparator", {
      rows,
      computedAt: new Date().toISOString()
    });
  }, [rows]);

  const toggleSort = (field: keyof CompanyRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Unique Sectors list
  const sectors = ["ALL", ...Array.from(new Set(rows.map((r) => r.sector)))];

  // Filtering & Sorting math
  const filteredRows = rows
    .filter((r) => {
      const matchSearch = r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.nameAr.includes(searchTerm);
      const matchSector = selectedSector === "ALL" || r.sector === selectedSector;
      return matchSearch && matchSector;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

  return (
    <motion.div
      variants={panelReveal}
      initial="initial"
      animate="animate"
      exit="exit"
      className="grid grid-cols-12 gap-8 text-[#171717]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* LEFT COLUMN: FILTERS & ROW ADDER */}
      <div className="col-span-12 lg:col-span-4 space-y-6">
        {/* Filters */}
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-serif text-sm font-bold text-[#171717] pb-2 border-b border-slate-200 flex items-center gap-2">
            <Filter size={16} className="text-[var(--emerald)]" />
            <span>{isAr ? "فرز وتصفية البيانات" : "Filters & Queries"}</span>
          </h3>

          <div className="space-y-3 font-mono text-xs">
            <div className="space-y-1">
              <label className="text-slate-700">{isAr ? "البحث بالرمز أو الاسم" : "Search Symbol/Name"}</label>
              <input
                type="text"
                placeholder={isAr ? "مثال: 2222.SR..." : "e.g. 2222.SR..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700">{isAr ? "تصفية حسب القطاع" : "Sector Filter"}</label>
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value)}
                className="terminal-input w-full cursor-pointer bg-white"
              >
                {sectors.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add Row Form */}
        <div className="glass-panel p-6 rounded-xl border border-slate-200 space-y-4 shadow-sm">
          <h3 className="font-serif text-sm font-bold text-[#171717] pb-2 border-b border-slate-200 flex items-center gap-2">
            <Plus size={16} className="text-[var(--emerald)]" />
            <span>{isAr ? "إضافة شركة جديدة" : "Add Custom Company"}</span>
          </h3>

          <form onSubmit={handleAddRow} className="space-y-3 font-mono text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700">Ticker *</label>
                <input
                  type="text"
                  placeholder="e.g. 1120.SR"
                  required
                  value={newTicker}
                  onChange={(e) => setNewTicker(e.target.value)}
                  className="terminal-input w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">Sector</label>
                <select
                  value={newSector}
                  onChange={(e) => setNewSector(e.target.value)}
                  className="terminal-input w-full bg-white"
                >
                  <option value="Energy">Energy</option>
                  <option value="Financials">Financials</option>
                  <option value="Materials">Materials</option>
                  <option value="Telecommunication">Telecommunication</option>
                  <option value="Real Estate">Real Estate</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700">Name (EN) *</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="terminal-input w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700">Name (AR)</label>
              <input
                type="text"
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                className="terminal-input w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700">Price (SAR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="terminal-input w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">P/E Ratio</label>
                <input
                  type="number"
                  step="0.1"
                  value={newPE}
                  onChange={(e) => setNewPE(e.target.value)}
                  className="terminal-input w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700">Yield (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newYield}
                  onChange={(e) => setNewYield(e.target.value)}
                  className="terminal-input w-full"
                />
              </div>
              <div className="space-y-1">
                <label className="text-slate-700">Market Cap (M)</label>
                <input
                  type="number"
                  value={newCap}
                  onChange={(e) => setNewCap(e.target.value)}
                  className="terminal-input w-full"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[var(--emerald)] hover:bg-[#12A189] text-white font-bold transition-all cursor-pointer text-xs"
            >
              {isAr ? "إضافة السجل" : "Insert Profile"}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: COMPARATOR TABLE GRID */}
      <div className="col-span-12 lg:col-span-8 space-y-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="terminal-table">
            <thead>
              <tr>
                <th onClick={() => toggleSort("ticker")} className="cursor-pointer select-none">
                  <span className="flex items-center gap-1.5 hover:text-[#171717]">
                    Ticker <ArrowUpDown size={12} />
                  </span>
                </th>
                <th onClick={() => toggleSort("name")} className="cursor-pointer select-none">
                  <span className="flex items-center gap-1.5 hover:text-[#171717]">
                    {isAr ? "الشركة" : "Company"} <ArrowUpDown size={12} />
                  </span>
                </th>
                <th>Sector</th>
                <th onClick={() => toggleSort("price")} className="text-right cursor-pointer select-none">
                  <span className="flex items-center gap-1.5 justify-end hover:text-[#171717]">
                    Price <ArrowUpDown size={12} />
                  </span>
                </th>
                <th onClick={() => toggleSort("pe")} className="text-right cursor-pointer select-none">
                  <span className="flex items-center gap-1.5 justify-end hover:text-[#171717]">
                    P/E <ArrowUpDown size={12} />
                  </span>
                </th>
                <th onClick={() => toggleSort("divYield")} className="text-right cursor-pointer select-none">
                  <span className="flex items-center gap-1.5 justify-end hover:text-[#171717]">
                    Yield <ArrowUpDown size={12} />
                  </span>
                </th>
                <th onClick={() => toggleSort("marketCap")} className="text-right cursor-pointer select-none">
                  <span className="flex items-center gap-1.5 justify-end hover:text-[#171717]">
                    Cap (M) <ArrowUpDown size={12} />
                  </span>
                </th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-slate-500 py-10">
                    No matching companies found in session.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.ticker} className="hover:bg-slate-50">
                    <td className="font-bold text-[var(--emerald)]">{row.ticker}</td>
                    <td className="font-semibold text-slate-800">
                      {isAr ? row.nameAr : row.name}
                    </td>
                    <td>
                      <span className="px-2 py-0.5 rounded-full text-[9px] bg-slate-100 border border-slate-200 text-slate-600 font-mono uppercase font-bold">
                        {row.sector}
                      </span>
                    </td>
                    <td className="text-right text-[#171717] font-bold">SAR {row.price.toFixed(2)}</td>
                    <td className="text-right text-slate-700">{row.pe.toFixed(1)}x</td>
                    <td className="text-right text-green-700 font-bold">{row.divYield.toFixed(2)}%</td>
                    <td className="text-right text-slate-700">SAR {row.marketCap.toLocaleString()}</td>
                    <td className="text-center">
                      <button
                        onClick={() => handleDeleteRow(row.ticker)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded transition-colors cursor-pointer"
                        title="Delete Row"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

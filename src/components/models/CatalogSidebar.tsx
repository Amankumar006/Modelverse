"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { X, SlidersHorizontal, Search, Building2 } from "lucide-react";
import { getProviderLogo } from "@/lib/logos";

interface CatalogSidebarProps {
  providers: string[];
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSourceType: string;
  onSelectSourceType: (source: string) => void;
  totalActiveFilters: number;
  onClearFilters: () => void;
}

const SOURCE_TYPES = ["All", "Open Weights", "Proprietary"];

export default function CatalogSidebar({
  providers,
  selectedProvider,
  onSelectProvider,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedSourceType,
  onSelectSourceType,
  totalActiveFilters,
  onClearFilters,
}: CatalogSidebarProps) {
  const [labSearch, setLabSearch] = useState("");

  const filteredProviders = useMemo(() => {
    if (!labSearch.trim()) return providers;
    const q = labSearch.toLowerCase();
    return providers.filter((p) => p.toLowerCase().includes(q));
  }, [providers, labSearch]);

  return (
    <aside className="w-full space-y-6 text-xs select-none">
      {/* Header with Clear Action */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[var(--muted)]/10">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[var(--text)] text-xs">
          <SlidersHorizontal size={14} className="text-[var(--accent)] shrink-0" />
          <span>Filters</span>
          {totalActiveFilters > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-mono font-bold">
              {totalActiveFilters}
            </span>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <button
            onClick={onClearFilters}
            className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer font-medium btn-tactile"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Category / Modality Filter */}
      <div className="space-y-2.5">
        <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
          Domain Modality
        </span>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectCategory("All")}
            className={`text-left px-3.5 py-2 rounded-[var(--radius-control)] transition-all cursor-pointer text-xs ${
              selectedCategory === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            All Domains
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`text-left px-3.5 py-2 rounded-[var(--radius-control)] transition-all cursor-pointer text-xs ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* AI Lab / Provider Filter (Spacious & Breathable with Search) */}
      <div className="space-y-3 pt-4 border-t border-[var(--muted)]/10">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <Building2 size={12} className="text-[var(--accent)]" />
            AI Labs ({providers.length})
          </span>
        </div>

        {/* Mini Search for Labs */}
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Filter labs..."
            value={labSearch}
            onChange={(e) => setLabSearch(e.target.value)}
            className="w-full bg-[var(--bg)] text-xs text-[var(--text)] placeholder-[var(--muted)]/60 rounded-[var(--radius-control)] pl-7 pr-3 py-1.5 border border-[var(--muted)]/15 focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>

        {/* Breathable Labs Scroll Container */}
        <div className="flex flex-col gap-1 max-h-[320px] 2xl:max-h-[380px] overflow-y-auto pr-1.5 scrollbar-thin">
          <button
            onClick={() => onSelectProvider("All")}
            className={`text-left px-3.5 py-2 rounded-[var(--radius-control)] transition-all cursor-pointer text-xs ${
              selectedProvider === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
            }`}
          >
            All Labs ({providers.length})
          </button>
          {filteredProviders.map((p) => {
            const logo = getProviderLogo(p);
            const isSelected = selectedProvider.toLowerCase() === p.toLowerCase();
            return (
              <button
                key={p}
                onClick={() => onSelectProvider(p)}
                className={`flex items-center gap-2.5 text-left px-3.5 py-2 rounded-[var(--radius-control)] transition-all cursor-pointer text-xs truncate group ${
                  isSelected
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                }`}
              >
                <div className="w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-white/5 p-0.5 border border-[var(--muted)]/10">
                  <Image src={logo} alt={p} width={16} height={16} className="w-full h-full object-contain" />
                </div>
                <span className="truncate flex-1">{p}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* License / Distribution Filter */}
      <div className="space-y-2.5 pt-4 border-t border-[var(--muted)]/10">
        <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
          Distribution Type
        </span>
        <div className="flex flex-col gap-1">
          {SOURCE_TYPES.map((src) => (
            <button
              key={src}
              onClick={() => onSelectSourceType(src)}
              className={`text-left px-3.5 py-2 rounded-[var(--radius-control)] transition-all cursor-pointer text-xs ${
                selectedSourceType === src
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
              }`}
            >
              {src === "All" ? "All Formats" : src}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

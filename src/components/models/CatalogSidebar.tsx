"use client";

import React from "react";
import { X, SlidersHorizontal } from "lucide-react";

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
  return (
    <aside className="w-full space-y-6 text-xs">
      {/* Header with Clear Action */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--muted)]/10">
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[var(--text)]">
          <SlidersHorizontal size={13} className="text-[var(--accent)]" />
          <span>Filters</span>
          {totalActiveFilters > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--accent)] text-[var(--accent-contrast)] text-[10px] font-mono">
              {totalActiveFilters}
            </span>
          )}
        </div>
        {totalActiveFilters > 0 && (
          <button
            onClick={onClearFilters}
            className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-0.5 cursor-pointer font-medium"
          >
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Category / Modality Filter */}
      <div className="space-y-2">
        <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
          Domain Category
        </span>
        <div className="flex flex-col gap-1">
          <button
            onClick={() => onSelectCategory("All")}
            className={`text-left px-3 py-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]"
            }`}
          >
            All Domains
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`text-left px-3 py-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Provider / Lab Filter */}
      <div className="space-y-2 pt-3 border-t border-[var(--muted)]/10">
        <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
          AI Lab / Provider
        </span>
        <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
          <button
            onClick={() => onSelectProvider("All")}
            className={`text-left px-3 py-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
              selectedProvider === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]"
            }`}
          >
            All Labs
          </button>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => onSelectProvider(p)}
              className={`text-left px-3 py-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer truncate ${
                selectedProvider.toLowerCase() === p.toLowerCase()
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* License / Distribution Filter */}
      <div className="space-y-2 pt-3 border-t border-[var(--muted)]/10">
        <span className="font-bold text-[11px] uppercase tracking-wider text-[var(--muted)] block">
          Distribution
        </span>
        <div className="flex flex-col gap-1">
          {SOURCE_TYPES.map((src) => (
            <button
              key={src}
              onClick={() => onSelectSourceType(src)}
              className={`text-left px-3 py-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                selectedSourceType === src
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-bg)]"
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

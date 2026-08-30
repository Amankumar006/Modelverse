"use client";

import React from "react";
import { Search, X, LayoutGrid, List, SlidersHorizontal, ArrowUpDown } from "lucide-react";

interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortKey: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onToggleViewMode: (mode: "grid" | "list") => void;
  totalFiltered: number;
  onOpenMobileFilters: () => void;
}

const SORT_OPTIONS = [
  { key: "newest", label: "Release Date (Newest)" },
  { key: "context", label: "Context Window (Largest)" },
  { key: "name", label: "Model Name (A–Z)" },
];

export default function CatalogToolbar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  sortKey,
  onSortChange,
  viewMode,
  onToggleViewMode,
  totalFiltered,
  onOpenMobileFilters,
}: CatalogToolbarProps) {
  return (
    <div className="w-full space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search models, providers, or specs..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--card-bg)] border border-[var(--muted)]/15 rounded-[var(--radius-control)] pl-9 pr-8 py-2 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-[var(--shadow-card)] font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Controls: Filter Drawer Toggle + Sort Dropdown + View Switcher */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end">
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-[var(--muted)]/15 rounded-[var(--radius-control)] text-xs font-semibold text-[var(--text)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] cursor-pointer"
          >
            <SlidersHorizontal size={13} className="text-[var(--accent)]" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--muted)]/15 rounded-[var(--radius-control)] px-2.5 py-1.5 shadow-[var(--shadow-card)]">
            <ArrowUpDown size={12} className="text-[var(--muted)] shrink-0" />
            <select
              value={sortKey}
              onChange={(e) => onSortChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[var(--text)] focus:outline-none cursor-pointer pr-1"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.key} value={opt.key} className="bg-[var(--card-bg)] text-[var(--text)]">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-[var(--card-bg)] border border-[var(--muted)]/15 p-1 rounded-[var(--radius-control)] shadow-[var(--shadow-card)]">
            <button
              onClick={() => onToggleViewMode("grid")}
              className={`p-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                viewMode === "grid"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => onToggleViewMode("list")}
              className={`p-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)]"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="List View"
            >
              <List size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Chips Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onSelectCategory("All")}
          className={`px-3 py-1 rounded-[var(--radius-pill)] font-medium transition-all whitespace-nowrap cursor-pointer ${
            selectedCategory === "All"
              ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/20 shadow-sm"
              : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
          }`}
        >
          All Domains
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 rounded-[var(--radius-pill)] font-medium transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory.toLowerCase() === cat.toLowerCase()
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold border border-[var(--accent)]/20 shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Count Banner */}
      <div className="text-[11px] text-[var(--muted)] font-mono flex items-center justify-between pt-1">
        <span>Showing <strong className="text-[var(--text)] font-semibold">{totalFiltered}</strong> models</span>
      </div>
    </div>
  );
}

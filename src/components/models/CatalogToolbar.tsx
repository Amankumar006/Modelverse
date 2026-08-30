"use client";

import React from "react";
import {
  Search,
  X,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
  Brain,
  Code2,
  Eye,
  Video,
  Mic,
  Cpu,
  Layers,
} from "lucide-react";

interface CatalogToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
  selectedSourceType: string;
  onSelectSourceType: (source: string) => void;
  sortKey: string;
  onSortChange: (sort: string) => void;
  viewMode: "grid" | "list";
  onToggleViewMode: (mode: "grid" | "list") => void;
  totalFiltered: number;
  totalModels: number;
  onOpenMobileFilters: () => void;
  onClearAllFilters: () => void;
}

const SORT_OPTIONS = [
  { key: "newest", label: "Release Date (Newest)" },
  { key: "context", label: "Context Window (Largest)" },
  { key: "name", label: "Model Name (A–Z)" },
];

function getCategoryIcon(cat: string) {
  const c = cat.toLowerCase();
  if (c.includes("code")) return <Code2 size={12} className="text-blue-500" />;
  if (c.includes("reasoning")) return <Brain size={12} className="text-amber-500" />;
  if (c.includes("video")) return <Video size={12} className="text-purple-500" />;
  if (c.includes("multimodal") || c.includes("vision")) return <Eye size={12} className="text-emerald-500" />;
  if (c.includes("audio") || c.includes("speech")) return <Mic size={12} className="text-sky-500" />;
  if (c.includes("llm")) return <Cpu size={12} className="text-rose-500" />;
  return <Layers size={12} className="text-[var(--accent)]" />;
}

export default function CatalogToolbar({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  selectedProvider,
  onSelectProvider,
  selectedSourceType,
  onSelectSourceType,
  sortKey,
  onSortChange,
  viewMode,
  onToggleViewMode,
  totalFiltered,
  totalModels,
  onOpenMobileFilters,
  onClearAllFilters,
}: CatalogToolbarProps) {
  const hasActiveFilters =
    selectedCategory !== "All" ||
    selectedProvider !== "All" ||
    selectedSourceType !== "All" ||
    searchQuery.trim() !== "";

  return (
    <div className="w-full space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search 376+ foundation models by name, provider, or architecture..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[var(--card-bg)] border border-[var(--muted)]/15 rounded-[var(--radius-control)] pl-9 pr-8 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)]/70 focus:outline-none focus:border-[var(--accent)] transition-all shadow-[var(--shadow-card)] font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
              title="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right Controls: Mobile Filters + Sort Dropdown + View Switcher */}
        <div className="flex items-center gap-2.5 justify-between sm:justify-end shrink-0">
          <button
            onClick={onOpenMobileFilters}
            className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-[var(--muted)]/15 rounded-[var(--radius-control)] text-xs font-semibold text-[var(--text)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] cursor-pointer btn-tactile"
          >
            <SlidersHorizontal size={13} className="text-[var(--accent)]" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
            )}
          </button>

          <div className="flex items-center gap-1.5 bg-[var(--card-bg)] border border-[var(--muted)]/15 rounded-[var(--radius-control)] px-3 py-2 shadow-[var(--shadow-card)]">
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
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => onToggleViewMode("list")}
              className={`p-1.5 rounded-[var(--radius-control)] transition-all cursor-pointer ${
                viewMode === "list"
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="List View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Bar with Icons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none text-xs">
        <button
          onClick={() => onSelectCategory("All")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
            selectedCategory === "All"
              ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm"
              : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/15"
          }`}
        >
          <Layers size={12} />
          <span>All Modalities</span>
        </button>
        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.toLowerCase();
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
                isSelected
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm"
                  : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/15"
              }`}
            >
              {getCategoryIcon(cat)}
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Active Filter Pills and Results Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[var(--muted)]/10 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-[var(--muted)] font-mono">
            Showing <strong className="text-[var(--text)] font-bold">{totalFiltered}</strong> of {totalModels} models
          </span>

          {selectedCategory !== "All" && (
            <button
              onClick={() => onSelectCategory("All")}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold border border-[var(--accent)]/20 cursor-pointer"
            >
              <span>Domain: {selectedCategory}</span>
              <X size={10} />
            </button>
          )}

          {selectedProvider !== "All" && (
            <button
              onClick={() => onSelectProvider("All")}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold border border-[var(--accent)]/20 cursor-pointer"
            >
              <span>Lab: {selectedProvider}</span>
              <X size={10} />
            </button>
          )}

          {selectedSourceType !== "All" && (
            <button
              onClick={() => onSelectSourceType("All")}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold border border-[var(--accent)]/20 cursor-pointer"
            >
              <span>Format: {selectedSourceType}</span>
              <X size={10} />
            </button>
          )}

          {searchQuery.trim() && (
            <button
              onClick={() => onSearchChange("")}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold border border-[var(--accent)]/20 cursor-pointer"
            >
              <span>Query: &ldquo;{searchQuery}&rdquo;</span>
              <X size={10} />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearAllFilters}
            className="text-[11px] text-[var(--accent)] hover:underline font-medium cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>
    </div>
  );
}

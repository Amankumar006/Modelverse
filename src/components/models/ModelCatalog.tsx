"use client";

import React, { useState, useMemo } from "react";
import { Search, LayoutGrid, List, SlidersHorizontal, X } from "lucide-react";
import type { ModelRow } from "@/types/database";
import ModelCard from "./ModelCard";

interface ModelCatalogProps {
  initialModels: ModelRow[];
  providers?: string[];
  categories?: string[];
}

export default function ModelCatalog({
  initialModels,
  providers = [],
  categories = ["LLM", "Multimodal", "Code", "Embedding", "Vision"],
}: ModelCatalogProps) {
  const [search, setSearch] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredModels = useMemo(() => {
    return initialModels.filter((m) => {
      const matchSearch =
        !search ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase()) ||
        (m.description && m.description.toLowerCase().includes(search.toLowerCase()));

      const matchProvider =
        selectedProvider === "All" ||
        m.provider.toLowerCase() === selectedProvider.toLowerCase();

      const matchCategory =
        selectedCategory === "All" ||
        (m.category && m.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchSearch && matchProvider && matchCategory;
    });
  }, [initialModels, search, selectedProvider, selectedCategory]);

  const uniqueProviders = useMemo(() => {
    if (providers.length > 0) return providers;
    return Array.from(new Set(initialModels.map((m) => m.provider))).filter(Boolean);
  }, [initialModels, providers]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search & View Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Filter models by name, provider, or specs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--card-bg)] border border-[var(--muted)]/10 rounded-[var(--radius-control)] pl-10 pr-8 py-2 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-all shadow-[var(--shadow-card)]"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded-[var(--radius-control)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] self-end sm:self-auto">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === "grid"
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
            title="Grid View"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
              viewMode === "list"
                ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
            title="List View"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <button
          onClick={() => setSelectedCategory("All")}
          className={`px-3 py-1 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
            selectedCategory === "All"
              ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
              : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
          }`}
        >
          All Categories
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCategory(c)}
            className={`px-3 py-1 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
              selectedCategory === c
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Provider Filter Chips Bar */}
      {uniqueProviders.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[var(--muted)] text-[11px] font-medium mr-1 flex items-center gap-1">
            <SlidersHorizontal size={12} /> Provider:
          </span>
          <button
            onClick={() => setSelectedProvider("All")}
            className={`px-2.5 py-0.5 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
              selectedProvider === "All"
                ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
            }`}
          >
            All
          </button>
          {uniqueProviders.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-2.5 py-0.5 rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                selectedProvider === p
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
                  : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/10"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[var(--muted)] font-mono">
        <span>
          Showing <strong className="text-[var(--text)]">{filteredModels.length}</strong> models
        </span>
        {(search || selectedProvider !== "All" || selectedCategory !== "All") && (
          <button
            onClick={() => {
              setSearch("");
              setSelectedProvider("All");
              setSelectedCategory("All");
            }}
            className="text-[var(--accent)] hover:underline cursor-pointer font-sans text-xs"
          >
            Reset filters
          </button>
        )}
      </div>

      {/* Grid or List Display */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} variant="card" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} variant="row" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredModels.length === 0 && (
        <div className="py-16 text-center flex flex-col items-center justify-center bg-[var(--card-bg)]/60 rounded-[var(--radius-card)] border border-[var(--muted)]/10 p-8">
          <p className="text-sm font-semibold text-[var(--text)]">No matching models found</p>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">
            Try adjusting your search keywords or clearing active filters.
          </p>
          <button
            onClick={() => {
              setSearch("");
              setSelectedProvider("All");
              setSelectedCategory("All");
            }}
            className="mt-4 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}

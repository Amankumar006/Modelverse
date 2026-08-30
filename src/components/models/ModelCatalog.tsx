"use client";

import React, { useState, useMemo } from "react";
import { X, SearchX } from "lucide-react";
import type { ModelRow } from "@/types/database";
import ModelCard from "./ModelCard";
import CatalogSidebar from "./CatalogSidebar";
import CatalogToolbar from "./CatalogToolbar";

interface ModelCatalogProps {
  initialModels: ModelRow[];
  initialCategory?: string;
  initialProvider?: string;
  initialSearch?: string;
}

export default function ModelCatalog({
  initialModels,
  initialCategory = "All",
  initialProvider = "All",
  initialSearch = "",
}: ModelCatalogProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedProvider, setSelectedProvider] = useState(initialProvider);
  const [selectedSourceType, setSelectedSourceType] = useState("All");
  const [sortKey, setSortKey] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const categories = useMemo(() => Array.from(new Set(initialModels.map((m) => m.category))).filter(Boolean) as string[], [initialModels]);
  const providers = useMemo(() => Array.from(new Set(initialModels.map((m) => m.provider))).filter(Boolean) as string[], [initialModels]);

  const totalActiveFilters = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedProvider !== "All") count++;
    if (selectedSourceType !== "All") count++;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedProvider, selectedSourceType, searchQuery]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedProvider("All");
    setSelectedSourceType("All");
  };

  const filteredModels = useMemo(() => {
    let result = [...initialModels];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.provider.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.parameters && m.parameters.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== "All") result = result.filter((m) => m.category?.toLowerCase() === selectedCategory.toLowerCase());
    if (selectedProvider !== "All") result = result.filter((m) => m.provider.toLowerCase() === selectedProvider.toLowerCase());
    if (selectedSourceType !== "All") result = result.filter((m) => m.source_type && m.source_type.toLowerCase().includes(selectedSourceType.toLowerCase()));

    result.sort((a, b) => {
      if (sortKey === "newest") return (b.release_date ? new Date(b.release_date).getTime() : 0) - (a.release_date ? new Date(a.release_date).getTime() : 0);
      if (sortKey === "context") return (b.context_window || 0) - (a.context_window || 0);
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return 0;
    });
    return result;
  }, [initialModels, searchQuery, selectedCategory, selectedProvider, selectedSourceType, sortKey]);

  return (
    <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Desktop Sidebar (3 cols) */}
      <div className="hidden lg:block lg:col-span-3 sticky top-24 p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
        <CatalogSidebar
          providers={providers}
          selectedProvider={selectedProvider}
          onSelectProvider={setSelectedProvider}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedSourceType={selectedSourceType}
          onSelectSourceType={setSelectedSourceType}
          totalActiveFilters={totalActiveFilters}
          onClearFilters={clearAllFilters}
        />
      </div>

      {/* Main Catalog Area (9 cols) */}
      <div className="lg:col-span-9 space-y-6">
        <CatalogToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          sortKey={sortKey}
          onSortChange={setSortKey}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          totalFiltered={filteredModels.length}
          onOpenMobileFilters={() => setMobileDrawerOpen(true)}
        />

        {/* Models Grid / List */}
        {filteredModels.length > 0 ? (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5" : "flex flex-col gap-3"}>
            {filteredModels.map((model) => (
              <ModelCard key={model.id} model={model} variant={viewMode === "grid" ? "card" : "row"} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center border border-[var(--muted)]/10 bg-[var(--card-bg)] rounded-[var(--radius-card)] p-8 space-y-3">
            <div className="p-3 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] mb-1">
              <SearchX size={24} />
            </div>
            <p className="text-sm font-semibold text-[var(--text)]">No matching models found</p>
            <p className="text-xs text-[var(--muted)] max-w-sm">
              Try adjusting your search terms or clearing selected filter criteria to discover models.
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-2 bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold px-4 py-2 rounded-[var(--radius-control)] hover:opacity-90 transition-opacity btn-tactile cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="absolute inset-0" onClick={() => setMobileDrawerOpen(false)} />
          <div className="relative w-full max-h-[85vh] bg-[var(--bg)] border-t border-[var(--muted)]/20 rounded-t-3xl flex flex-col z-10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--muted)]/10 mb-4">
              <span className="text-sm font-bold uppercase tracking-wider text-[var(--text)]">Catalog Filters</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--text)]">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 pr-1 pb-4">
              <CatalogSidebar
                providers={providers}
                selectedProvider={selectedProvider}
                onSelectProvider={(p) => {
                  setSelectedProvider(p);
                  setMobileDrawerOpen(false);
                }}
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={(c) => {
                  setSelectedCategory(c);
                  setMobileDrawerOpen(false);
                }}
                selectedSourceType={selectedSourceType}
                onSelectSourceType={(s) => {
                  setSelectedSourceType(s);
                  setMobileDrawerOpen(false);
                }}
                totalActiveFilters={totalActiveFilters}
                onClearFilters={() => {
                  clearAllFilters();
                  setMobileDrawerOpen(false);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

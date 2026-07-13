"use client";

import { useState, useMemo } from "react";
import type { ModelIndex } from "@/lib/models";
import ModelCard from "@/components/models/ModelCard";
import { Search, SlidersHorizontal, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Filter pill button                                                 */
/* ------------------------------------------------------------------ */

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
        active
          ? "bg-brand-orange text-white"
          : "bg-white/[0.06] text-white/60 hover:bg-white/[0.1] hover:text-white/80 border border-white/[0.08]"
      }`}
    >
      {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Sort options                                                       */
/* ------------------------------------------------------------------ */

type SortKey = "newest" | "oldest" | "name";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "name", label: "A–Z" },
];

/* ------------------------------------------------------------------ */
/*  Type options                                                       */
/* ------------------------------------------------------------------ */

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "open-weights", label: "Open Weights" },
  { value: "closed-source", label: "Closed Source" },
  { value: "api-only", label: "API Only" },
  { value: "research-preview", label: "Research Preview" },
];

/* ------------------------------------------------------------------ */
/*  ModelCatalog                                                        */
/* ------------------------------------------------------------------ */

export default function ModelCatalog({
  models,
  developers,
}: {
  models: ModelIndex[];
  developers: string[];
}) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [developerFilter, setDeveloperFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilter =
    typeFilter !== "all" || developerFilter !== "all" || search !== "";

  const filtered = useMemo(() => {
    let result = [...models];

    /* Search */
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.developer.toLowerCase().includes(q)
      );
    }

    /* Type filter */
    if (typeFilter !== "all") {
      result = result.filter((m) => m.type === typeFilter);
    }

    /* Developer filter */
    if (developerFilter !== "all") {
      result = result.filter((m) => m.developer === developerFilter);
    }

    /* Sort */
    switch (sortKey) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() -
            new Date(a.releaseDate).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() -
            new Date(b.releaseDate).getTime()
        );
        break;
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return result;
  }, [models, search, typeFilter, developerFilter, sortKey]);

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("all");
    setDeveloperFilter("all");
  };

  return (
    <div className="space-y-6">
      {/* ── Controls bar ─────────────────────────────────────── */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Search models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-colors"
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden p-2.5 rounded-xl border transition-colors ${
              showFilters || hasActiveFilter
                ? "bg-brand-orange/10 border-brand-orange/30 text-brand-orange"
                : "bg-white/[0.04] border-white/[0.08] text-white/50"
            }`}
            aria-label="Toggle filters"
          >
            <SlidersHorizontal size={16} />
          </button>

          {/* Sort pills (desktop) */}
          <div className="hidden sm:flex items-center gap-1.5 ml-auto">
            {SORT_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.key}
                label={opt.label}
                active={sortKey === opt.key}
                onClick={() => setSortKey(opt.key)}
              />
            ))}
          </div>
        </div>

        {/* Filter row */}
        <div
          className={`flex flex-wrap items-center gap-2 ${
            showFilters ? "flex" : "hidden sm:flex"
          }`}
        >
          {/* Type pills */}
          {TYPE_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.value}
              label={opt.label}
              active={typeFilter === opt.value}
              onClick={() =>
                setTypeFilter(typeFilter === opt.value ? "all" : opt.value)
              }
            />
          ))}

          {/* Developer select */}
          <select
            value={developerFilter}
            onChange={(e) => setDeveloperFilter(e.target.value)}
            className="bg-white/[0.06] border border-white/[0.08] rounded-full px-3 py-1.5 text-xs font-medium text-white/60 focus:outline-none focus:border-white/20 appearance-none cursor-pointer"
          >
            <option value="all">All developers</option>
            {developers.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Sort (mobile) */}
          <div className="sm:hidden flex items-center gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <FilterPill
                key={opt.key}
                label={opt.label}
                active={sortKey === opt.key}
                onClick={() => setSortKey(opt.key)}
              />
            ))}
          </div>

          {/* Clear filters */}
          {hasActiveFilter && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-white/40 hover:text-white/70 transition-colors"
            >
              <X size={12} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Results count ────────────────────────────────────── */}
      <p className="text-xs text-white/30">
        {filtered.length} of {models.length} models
      </p>

      {/* ── Model list ───────────────────────────────────────── */}
      {/* Column headers (desktop) */}
      <div className="hidden sm:grid grid-cols-[1.4fr_0.8fr_0.6fr_0.5fr_auto] gap-4 px-4 pb-2 text-[11px] font-medium text-white/25 uppercase tracking-wider border-b border-white/[0.06]">
        <span>Model</span>
        <span>Developer</span>
        <span>Type</span>
        <span>Released</span>
        <span />
      </div>

      <div className="flex flex-col">
        {filtered.map((model) => (
          <ModelCard key={model.id} model={model} variant="row" />
        ))}

        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-white/40 text-sm">
              No models match your filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-3 text-brand-orange text-sm hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

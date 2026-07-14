"use client";

import { useState, useMemo, Suspense } from "react";
import type { ModelEntry } from "@/lib/models";
import ModelCard from "@/components/models/ModelCard";
import { Search, SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { useRouter } from "next/navigation";

/* ------------------------------------------------------------------ */
/*  Facet Filters Config                                               */
/* ------------------------------------------------------------------ */

const TASK_OPTIONS = [
  { value: "chat-reasoning", label: "Chat & Reasoning" },
  { value: "code-generation", label: "Code Generation" },
  { value: "image-generation", label: "Image Generation" },
  { value: "video-generation", label: "Video Generation" },
  { value: "audio-speech", label: "Audio & Speech" },
  { value: "embedding", label: "Embedding" },
  { value: "agentic", label: "Agentic" },
  { value: "multimodal-general", label: "Multimodal General" },
  { value: "translation", label: "Translation" },
  { value: "search-retrieval", label: "Search & Retrieval" },
  { value: "other", label: "Specialized/Other" },
];

const TYPE_OPTIONS = [
  { value: "open-weights", label: "Open Weights" },
  { value: "closed-source", label: "Closed Source" },
  { value: "api-only", label: "API Only" },
  { value: "research-preview", label: "Research Preview" },
];

const DEPLOYMENT_OPTIONS = [
  { value: "api-only", label: "API Only" },
  { value: "self-hostable", label: "Self-Hostable" },
  { value: "on-device", label: "On-Device" },
];

const SORT_OPTIONS = [
  { key: "newest", label: "Newest First" },
  { key: "oldest", label: "Oldest First" },
  { key: "name-asc", label: "Name A–Z" },
  { key: "developer-asc", label: "Developer A–Z" },
];

/* ------------------------------------------------------------------ */
/*  Faceted Filter & Search Calculations                              */
/* ------------------------------------------------------------------ */

interface FiltersState {
  q: string;
  type: string[];
  task: string[];
  modality: string[];
  developer: string[];
  license: string[];
  deployment: string[];
}

function filterModels(
  models: ModelEntry[],
  filters: FiltersState,
  excludeKey?: keyof FiltersState
): ModelEntry[] {
  return models.filter((model) => {
    // 1. Search Query
    if (excludeKey !== "q" && filters.q) {
      const q = filters.q.toLowerCase();
      const match =
        model.name.toLowerCase().includes(q) ||
        model.developer.toLowerCase().includes(q);
      if (!match) return false;
    }

    // 2. Type Filter
    if (excludeKey !== "type" && filters.type.length > 0) {
      if (!filters.type.includes(model.type)) return false;
    }

    // 3. Task Filter
    if (excludeKey !== "task" && filters.task.length > 0) {
      if (!filters.task.includes(model.primaryTask)) return false;
    }

    // 4. Modality Filter
    if (excludeKey !== "modality" && filters.modality.length > 0) {
      const intersect = model.modality.some((m) => filters.modality.includes(m));
      if (!intersect) return false;
    }

    // 5. Developer Filter
    if (excludeKey !== "developer" && filters.developer.length > 0) {
      if (!filters.developer.includes(model.developer)) return false;
    }

    // 6. License Filter
    if (excludeKey !== "license" && filters.license.length > 0) {
      if (!filters.license.includes(model.license)) return false;
    }

    // 7. Deployment Filter
    if (excludeKey !== "deployment" && filters.deployment.length > 0) {
      const intersect = model.deployment.some((d) => filters.deployment.includes(d));
      if (!intersect) return false;
    }

    return true;
  });
}

/* ------------------------------------------------------------------ */
/*  ModelCatalogContent client workspace                              */
/* ------------------------------------------------------------------ */

function ModelCatalogContent({
  models,
  developers,
  initialSearchParams,
}: {
  models: ModelEntry[];
  developers: string[];
  initialSearchParams?: Record<string, string | string[] | undefined>;
}) {
  const router = useRouter();

  // Helper to parse query arrays on load
  const parseQueryList = (key: string): string[] => {
    const val = initialSearchParams?.[key];
    if (!val) return [];
    if (Array.isArray(val)) return val.flatMap((v) => v.split(","));
    return val.split(",");
  };

  // State initialization hydrated from Server Search Params
  const [filters, setFilters] = useState<FiltersState>({
    q: (initialSearchParams?.q as string) || "",
    type: parseQueryList("type"),
    task: parseQueryList("task"),
    modality: parseQueryList("modality"),
    developer: parseQueryList("developer"),
    license: parseQueryList("license"),
    deployment: parseQueryList("deployment"),
  });

  const [sortKey, setSortKey] = useState<string>(
    (initialSearchParams?.sort as string) || "newest"
  );

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Dynamic facet value lists harvested from actual data entries
  const dynamicOptions = useMemo(() => {
    const licenses = [...new Set(models.map((m) => m.license))].sort();
    const modalities = [...new Set(models.flatMap((m) => m.modality))].sort();
    return { licenses, modalities };
  }, [models]);

  // Compute live option counts for each facet given currently-applied sibling criteria
  const facetCounts = useMemo(() => {
    const getCounts = (
      key: keyof FiltersState,
      options: string[],
      matchFn: (model: ModelEntry, opt: string) => boolean
    ) => {
      const modelsFiltered = filterModels(models, filters, key);
      const counts: Record<string, number> = {};
      for (const opt of options) {
        counts[opt] = modelsFiltered.filter((m) => matchFn(m, opt)).length;
      }
      return counts;
    };

    return {
      type: getCounts("type", TYPE_OPTIONS.map((o) => o.value), (m, opt) => m.type === opt),
      task: getCounts("task", TASK_OPTIONS.map((o) => o.value), (m, opt) => m.primaryTask === opt),
      modality: getCounts("modality", dynamicOptions.modalities, (m, opt) => m.modality.includes(opt)),
      developer: getCounts("developer", developers, (m, opt) => m.developer === opt),
      license: getCounts("license", dynamicOptions.licenses, (m, opt) => m.license === opt),
      deployment: getCounts(
        "deployment",
        DEPLOYMENT_OPTIONS.map((o) => o.value),
        (m, opt) => m.deployment.includes(opt as any)
      ),
    };
  }, [models, filters, dynamicOptions, developers]);

  // Calculate matching models with all active parameters applied
  const filtered = useMemo(() => {
    let result = filterModels(models, filters);

    // Apply sorting
    switch (sortKey) {
      case "newest":
        result.sort(
          (a, b) =>
            new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
        );
        break;
      case "oldest":
        result.sort(
          (a, b) =>
            new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
        );
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "developer-asc":
        result.sort((a, b) => a.developer.localeCompare(b.developer));
        break;
    }

    return result;
  }, [models, filters, sortKey]);

  type CatalogItem =
    | { type: "standalone"; model: ModelEntry }
    | {
        type: "family";
        familySlug: string;
        primaryModel: ModelEntry;
        variantCount: number;
        variants: ModelEntry[];
      };

  const groupedItems = useMemo(() => {
    const finalItems: CatalogItem[] = [];
    const seenFamilies = new Set<string>();

    for (const model of filtered) {
      if (model.family) {
        if (!seenFamilies.has(model.family)) {
          seenFamilies.add(model.family);
          const allVariants = models.filter((m) => m.family === model.family);
          
          if (allVariants.length === 1) {
            finalItems.push({ type: "standalone", model: allVariants[0] });
          } else {
            let primary = allVariants.find((v) => v.primaryTask === "chat-reasoning");
            if (!primary) primary = [...allVariants].sort((a, b) => b.boost - a.boost)[0];

            finalItems.push({
              type: "family",
              familySlug: model.family,
              primaryModel: primary || model,
              variantCount: allVariants.length,
              variants: allVariants,
            });
          }
        }
      } else {
        finalItems.push({ type: "standalone", model });
      }
    }
    return finalItems;
  }, [filtered, models]);

  const hasActiveFilters =
    filters.q !== "" ||
    filters.type.length > 0 ||
    filters.task.length > 0 ||
    filters.modality.length > 0 ||
    filters.developer.length > 0 ||
    filters.license.length > 0 ||
    filters.deployment.length > 0;

  // Sync state parameters to query parameters
  const updateUrl = (updatedFilters: FiltersState, updatedSort: string) => {
    const params = new URLSearchParams();

    if (updatedFilters.q) params.set("q", updatedFilters.q);
    if (updatedFilters.type.length > 0) params.set("type", updatedFilters.type.join(","));
    if (updatedFilters.task.length > 0) params.set("task", updatedFilters.task.join(","));
    if (updatedFilters.modality.length > 0) params.set("modality", updatedFilters.modality.join(","));
    if (updatedFilters.developer.length > 0) params.set("developer", updatedFilters.developer.join(","));
    if (updatedFilters.license.length > 0) params.set("license", updatedFilters.license.join(","));
    if (updatedFilters.deployment.length > 0) params.set("deployment", updatedFilters.deployment.join(","));
    if (updatedSort !== "newest") params.set("sort", updatedSort);

    const queryStr = params.toString();
    router.replace(`/models${queryStr ? `?${queryStr}` : ""}`, { scroll: false });
  };

  const toggleFilter = (key: keyof Omit<FiltersState, "q">, val: string) => {
    const current = filters[key] as string[];
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];

    const newFilters = { ...filters, [key]: next };
    setFilters(newFilters);
    updateUrl(newFilters, sortKey);
  };

  const handleSearchChange = (val: string) => {
    const newFilters = { ...filters, q: val };
    setFilters(newFilters);
    updateUrl(newFilters, sortKey);
  };

  const handleSortChange = (newSort: string) => {
    setSortKey(newSort);
    updateUrl(filters, newSort);
  };

  const clearAllFilters = () => {
    const blankFilters = {
      q: "",
      type: [],
      task: [],
      modality: [],
      developer: [],
      license: [],
      deployment: [],
    };
    setFilters(blankFilters);
    updateUrl(blankFilters, sortKey);
  };

  // Compile active pills
  const activeChips = useMemo(() => {
    const chips: { key: keyof Omit<FiltersState, "q">; val: string; label: string }[] = [];

    const addChips = (key: keyof Omit<FiltersState, "q">, labelMap?: Record<string, string>) => {
      for (const val of filters[key]) {
        const label = labelMap?.[val] || val;
        chips.push({ key, val, label });
      }
    };

    const taskLabels: Record<string, string> = {
      "chat-reasoning": "Chat & Reasoning",
      "code-generation": "Coding",
      "image-generation": "Image Gen",
      "video-generation": "Video Gen",
      "audio-speech": "Audio & Speech",
      "embedding": "Embedding",
      "agentic": "Agentic",
      "multimodal-general": "Multimodal",
      "translation": "Translation",
      "search-retrieval": "Search & RAG",
      "other": "Specialized",
    };

    const typeLabels: Record<string, string> = {
      "open-weights": "Open Weights",
      "closed-source": "Closed Source",
      "api-only": "API Only",
      "research-preview": "Research Preview",
    };

    const deploymentLabels: Record<string, string> = {
      "api-only": "API Only",
      "self-hostable": "Self-Hostable",
      "on-device": "On-Device",
    };

    addChips("type", typeLabels);
    addChips("task", taskLabels);
    addChips("modality");
    addChips("developer");
    addChips("license");
    addChips("deployment", deploymentLabels);

    return chips;
  }, [filters]);

  /* Sidebar Render Builder */
  const renderFacetGroup = <T,>(
    title: string,
    key: keyof Omit<FiltersState, "q">,
    options: T[],
    valFn: (opt: T) => string,
    labelFn: (opt: T) => string
  ) => {
    return (
      <div className="space-y-3">
        <h4 className="text-[10px] font-bold text-[#6f6f6f]/50 uppercase tracking-widest border-b border-black/5 pb-1.5">
          {title}
        </h4>
        <div className="space-y-1.5 flex flex-col max-h-48 overflow-y-auto pr-1 select-none scrollbar-thin">
          {options.map((opt) => {
            const val = valFn(opt);
            const label = labelFn(opt);
            const isChecked = filters[key].includes(val);
            const count = facetCounts[key][val] ?? 0;
            const isDisabled = count === 0 && !isChecked;

            return (
              <label
                key={val}
                className={`flex items-center justify-between text-xs cursor-pointer py-0.5 rounded transition-colors ${
                  isChecked
                    ? "text-brand-orange"
                    : isDisabled
                    ? "text-[#6f6f6f]/40 cursor-not-allowed"
                    : "text-[#6f6f6f] hover:text-[#0a0a0a]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    disabled={isDisabled}
                    onChange={() => toggleFilter(key, val)}
                    className="h-3.5 w-3.5 rounded border border-black/20 bg-transparent text-brand-orange focus:ring-offset-white focus:ring-1 focus:ring-brand-orange/50 accent-brand-orange cursor-pointer disabled:cursor-not-allowed"
                  />
                  <span className="truncate pr-1">{label}</span>
                </div>
                <span
                  className={`text-[10px] tabular-nums font-mono ${
                    isChecked ? "text-brand-orange" : "text-[#6f6f6f]/40"
                  }`}
                >
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSidebar = () => (
    <div className="space-y-8">
      {renderFacetGroup("Type", "type", TYPE_OPTIONS, (o) => o.value, (o) => o.label)}
      {renderFacetGroup("Primary Task", "task", TASK_OPTIONS, (o) => o.value, (o) => o.label)}
      {renderFacetGroup(
        "Modality",
        "modality",
        dynamicOptions.modalities.map((m) => ({ value: m, label: m.toUpperCase() })),
        (o) => o.value,
        (o) => o.label
      )}
      {renderFacetGroup(
        "Developer",
        "developer",
        developers.map((d) => ({ value: d, label: d })),
        (o) => o.value,
        (o) => o.label
      )}
      {renderFacetGroup(
        "License",
        "license",
        dynamicOptions.licenses.map((l) => ({ value: l, label: l })),
        (o) => o.value,
        (o) => o.label
      )}
      {renderFacetGroup(
        "Deployment",
        "deployment",
        DEPLOYMENT_OPTIONS,
        (o) => o.value,
        (o) => o.label
      )}
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start relative">
      {/* ── Desktop Sidebar Facets (z-10) ────────────────────── */}
      <aside className="hidden md:block w-64 shrink-0 space-y-6 sticky top-24 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2 scrollbar-thin">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6f6f6f]">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-[10px] text-brand-orange hover:text-[#e85a28] hover:underline"
            >
              Clear All
            </button>
          )}
        </div>
        {renderSidebar()}
      </aside>

      {/* ── Main Catalog Workspace ───────────────────────────── */}
      <div className="flex-1 w-full space-y-6">
        {/* Top-level Pill Tabs for Type */}
        <div className="flex flex-wrap items-center gap-2 border-b border-black/10 pb-4">
          <button
            onClick={() => setFilters(f => ({ ...f, type: [] }))}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
              filters.type.length === 0
                ? "bg-black/5 text-[#0a0a0a]"
                : "bg-black/[0.04] text-[#6f6f6f] hover:bg-black/[0.08] hover:text-[#0a0a0a]"
            }`}
          >
            All
          </button>
          {TYPE_OPTIONS.map((opt) => {
            const isActive = filters.type.includes(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setFilters((f) => {
                    const newType = isActive
                      ? f.type.filter((t) => t !== opt.value)
                      : [...f.type, opt.value];
                    return { ...f, type: newType };
                  });
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors ${
                  isActive
                    ? "bg-black/5 text-[#0a0a0a]"
                    : "bg-black/[0.04] text-[#6f6f6f] hover:bg-black/[0.08] hover:text-[#0a0a0a]"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Controls Panel */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-black/10 pb-4">
          {/* Search inputs */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]/50" />
            <input
              type="text"
              placeholder="Search by name or developer..."
              value={filters.q}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#fafaf8] border border-black/10 rounded-full pl-10 pr-4 py-2 text-sm text-[#0a0a0a] placeholder:text-[#6f6f6f] focus:outline-none focus:border-black/20 transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-start">
            {/* Mobile Filters Toggle Button */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 px-4 py-2 border border-black/10 rounded-full text-xs font-medium text-[#6f6f6f] hover:text-[#0a0a0a] bg-black/5"
            >
              <SlidersHorizontal size={14} />
              Filters
              {activeChips.length > 0 && (
                <span className="h-4 w-4 bg-brand-orange text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {activeChips.length}
                </span>
              )}
            </button>

            {/* Sort & Count */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#6f6f6f]/50 whitespace-nowrap hidden sm:block">Sort By</span>
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-[#fafaf8] border border-black/10 rounded-full px-4 py-2 pr-8 text-xs font-medium text-[#6f6f6f] focus:outline-none focus:border-black/20 appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key} className="bg-white text-[#0a0a0a]">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown size={12} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]/50 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-between">
          <p className="text-xs text-[#6f6f6f]">
            Showing <span className="text-[#0a0a0a] font-medium">{groupedItems.length}</span> cards (from {filtered.length} matching models)
          </p>

          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {activeChips.map((chip) => (
                <span
                  key={`${chip.key}-${chip.val}`}
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold bg-[#FF6B35]/10 border border-[#FF6B35]/15 text-[#FF6B35] px-2.5 py-1 rounded-full shrink-0"
                >
                  {chip.label}
                  <button
                    onClick={() => toggleFilter(chip.key, chip.val)}
                    className="hover:bg-[#FF6B35]/20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllFilters}
                className="text-[10px] font-semibold text-[#6f6f6f] hover:text-[#0a0a0a] transition-colors ml-1"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* ── Results Cards Grid ────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          {groupedItems.map((item) => {
            const model = item.type === "family" ? item.primaryModel : item.model;
            const featuredClass = model.featured ? "md:col-span-2 lg:col-span-2 row-span-2" : "";

            if (item.type === "family") {
              return (
                <div key={`family-${item.familySlug}`} className={featuredClass}>
                  <ModelCard
                    model={item.primaryModel}
                    variant="family"
                    familyVariantCount={item.variantCount}
                    familySlug={item.familySlug}
                    isFeatured={model.featured}
                  />
                </div>
              );
            }
            return (
              <div key={item.model.id} className={featuredClass}>
                <ModelCard 
                  model={item.model} 
                  variant="single" 
                  isFeatured={model.featured} 
                />
              </div>
            );
          })}
        </div>

        {groupedItems.length === 0 && (
          <div className="py-24 text-center flex flex-col items-center justify-center border border-black/5 bg-black/[0.02] rounded-3xl p-8">
            <p className="text-[#6f6f6f] text-sm">
              No models match these filters yet — try removing one
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 bg-brand-orange hover:bg-[#e85a28] text-white text-xs font-semibold px-6 py-2.5 rounded-full hover:scale-[1.03] active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* ── Mobile Filters Bottom Drawer (z-50) ──────────────── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setMobileFiltersOpen(false)} />

          <div className="relative w-full max-h-[85vh] bg-white border-t border-black/10 rounded-t-3xl flex flex-col z-10">
            {/* Drag Handle Bar Accent */}
            <div className="h-1.5 w-12 bg-black/20 rounded-full mx-auto my-3 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pb-4 border-b border-black/10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6f6f6f]">Filters</span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 hover:bg-black/5 rounded-full text-[#6f6f6f] hover:text-[#0a0a0a] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Facet Groups */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 scrollbar-thin">
              {renderSidebar()}
            </div>

            {/* Bottom Actions Row */}
            <div className="p-4 border-t border-black/10 bg-white flex gap-3 shrink-0">
              {hasActiveFilters && (
                <button
                  onClick={() => {
                    clearAllFilters();
                    setMobileFiltersOpen(false);
                  }}
                  className="flex-1 py-3.5 border border-black/10 hover:border-black/20 text-[#6f6f6f] hover:text-[#0a0a0a] rounded-2xl text-xs font-semibold transition-colors"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-3.5 bg-brand-orange hover:bg-[#e85a28] text-white rounded-2xl text-xs font-semibold transition-colors"
              >
                View {filtered.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ModelCatalog(props: {
  models: ModelEntry[];
  developers: string[];
  initialSearchParams?: Record<string, string | string[] | undefined>;
}) {
  return (
    <Suspense fallback={<div className="text-white/40 text-sm py-20 text-center">Loading catalog...</div>}>
      <ModelCatalogContent {...props} />
    </Suspense>
  );
}

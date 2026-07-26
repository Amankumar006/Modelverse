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
    if (excludeKey !== "q" && filters.q) {
      const q = filters.q.toLowerCase();
      const match =
        model.name.toLowerCase().includes(q) ||
        model.developer.toLowerCase().includes(q);
      if (!match) return false;
    }

    if (excludeKey !== "type" && filters.type.length > 0) {
      if (!filters.type.includes(model.type)) return false;
    }

    if (excludeKey !== "task" && filters.task.length > 0) {
      if (!filters.task.includes(model.primaryTask)) return false;
    }

    if (excludeKey !== "modality" && filters.modality.length > 0) {
      const intersect = model.modality.some((m) => filters.modality.includes(m));
      if (!intersect) return false;
    }

    if (excludeKey !== "developer" && filters.developer.length > 0) {
      if (!filters.developer.includes(model.developer)) return false;
    }

    if (excludeKey !== "license" && filters.license.length > 0) {
      if (!filters.license.includes(model.license)) return false;
    }

    if (excludeKey !== "deployment" && filters.deployment.length > 0) {
      const intersect = model.deployment.some((d) => filters.deployment.includes(d));
      if (!intersect) return false;
    }

    return true;
  });
}

function FacetGroupFilter<T>({
  title,
  options,
  valFn,
  labelFn,
  selectedValues,
  counts,
  onToggle,
}: {
  title: string;
  options: T[];
  valFn: (opt: T) => string;
  labelFn: (opt: T) => string;
  selectedValues: string[];
  counts: Record<string, number>;
  onToggle: (val: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const showSearch = options.length > 10;

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((opt) => {
      const val = valFn(opt).toLowerCase();
      const label = labelFn(opt).toLowerCase();
      return val.includes(q) || label.includes(q);
    });
  }, [options, searchQuery, valFn, labelFn]);

  return (
    <div className="space-y-2.5">
      <h4 className="text-xs font-semibold text-[#90908F] uppercase tracking-wider border-b border-[#282828] pb-1.5">
        {title}
      </h4>
      {showSearch && (
        <div className="relative mb-2">
          <input
            type="text"
            placeholder={`Search ${title.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1C1C1E] border border-[#282828] rounded-md px-2.5 py-1 text-xs text-white placeholder:text-[#90908F] focus:outline-none focus:border-[#D97757] transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#90908F] hover:text-white p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>
      )}
      <div className="space-y-1 flex flex-col max-h-44 overflow-y-auto pr-1 select-none no-scrollbar">
        {filteredOptions.map((opt) => {
          const val = valFn(opt);
          const label = labelFn(opt);
          const isChecked = selectedValues.includes(val);
          const count = counts[val] ?? 0;
          const isDisabled = count === 0 && !isChecked;

          return (
            <label
              key={val}
              className={`flex items-center justify-between text-xs cursor-pointer py-1 px-2 rounded transition-colors ${
                isChecked
                  ? "text-white font-medium bg-[#242426]"
                  : isDisabled
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-[#90908F] hover:text-white hover:bg-[#1E1E1E]"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 pr-1">
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isDisabled}
                  onChange={() => onToggle(val)}
                  className="h-3.5 w-3.5 rounded border border-[#333333] bg-[#1C1C1E] text-[#D97757] focus:ring-0 accent-[#D97757] cursor-pointer disabled:cursor-not-allowed shrink-0"
                />
                <span className="truncate">{label}</span>
              </div>
              <span
                className={`text-[10px] tabular-nums font-mono px-1.5 py-0.2 rounded ${
                  isChecked ? "bg-[#2E2E2E] text-white" : "text-[#90908F]"
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
}

function ModelCatalogContent({
  models,
  developers,
  initialSearchParams = {},
  hideDeveloperPrefix = false,
}: {
  models: ModelEntry[];
  developers: string[];
  initialSearchParams?: Record<string, string | string[] | undefined>;
  hideDeveloperPrefix?: boolean;
}) {
  const router = useRouter();

  const parseParamArray = (param?: string | string[]) => {
    if (!param) return [];
    if (Array.isArray(param)) return param;
    return param.split(",").filter(Boolean);
  };

  const [filters, setFilters] = useState<FiltersState>({
    q: (initialSearchParams.q as string) || "",
    type: parseParamArray(initialSearchParams.type),
    task: parseParamArray(initialSearchParams.task),
    modality: parseParamArray(initialSearchParams.modality),
    developer: parseParamArray(initialSearchParams.developer),
    license: parseParamArray(initialSearchParams.license),
    deployment: parseParamArray(initialSearchParams.deployment),
  });

  const [sortKey, setSortKey] = useState<string>(
    (initialSearchParams.sort as string) || "newest"
  );
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const dynamicOptions = useMemo(() => {
    const modalities = new Set<string>();
    const licenses = new Set<string>();
    for (const m of models) {
      m.modality.forEach((mod) => modalities.add(mod));
      if (m.license && m.license !== "Other/Custom") licenses.add(m.license);
    }
    return {
      modalities: Array.from(modalities).sort(),
      licenses: Array.from(licenses).sort(),
    };
  }, [models]);

  const facetCounts = useMemo(() => {
    const calculateCounts = (
      options: string[],
      key: keyof FiltersState,
      modelValFn: (m: ModelEntry) => string | string[]
    ) => {
      const filtered = filterModels(models, filters, key);
      const counts: Record<string, number> = {};
      options.forEach((opt) => (counts[opt] = 0));
      for (const m of filtered) {
        const val = modelValFn(m);
        if (Array.isArray(val)) {
          val.forEach((v) => {
            if (counts[v] !== undefined) counts[v]++;
          });
        } else {
          if (counts[val] !== undefined) counts[val]++;
        }
      }
      return counts;
    };

    return {
      type: calculateCounts(
        TYPE_OPTIONS.map((o) => o.value),
        "type",
        (m) => m.type
      ),
      task: calculateCounts(
        TASK_OPTIONS.map((o) => o.value),
        "task",
        (m) => m.primaryTask
      ),
      modality: calculateCounts(dynamicOptions.modalities, "modality", (m) => m.modality),
      developer: calculateCounts(developers, "developer", (m) => m.developer),
      license: calculateCounts(dynamicOptions.licenses, "license", (m) => m.license),
      deployment: calculateCounts(
        DEPLOYMENT_OPTIONS.map((o) => o.value),
        "deployment",
        (m) => m.deployment
      ),
    };
  }, [models, filters, dynamicOptions, developers]);

  const filtered = useMemo(() => {
    let result = filterModels(models, filters);

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

    const shouldGroup =
      filters.q === "" &&
      filters.type.length === 0 &&
      filters.task.length === 0 &&
      filters.modality.length === 0 &&
      filters.license.length === 0 &&
      filters.deployment.length === 0;

    for (const model of filtered) {
      if (model.family && shouldGroup) {
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
  }, [filtered, models, filters]);

  const hasActiveFilters =
    filters.q !== "" ||
    filters.type.length > 0 ||
    filters.task.length > 0 ||
    filters.modality.length > 0 ||
    filters.developer.length > 0 ||
    filters.license.length > 0 ||
    filters.deployment.length > 0;

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

  const renderSidebar = () => (
    <div className="space-y-6">
      <FacetGroupFilter
        title="Type"
        options={TYPE_OPTIONS}
        valFn={(o) => o.value}
        labelFn={(o) => o.label}
        selectedValues={filters.type}
        counts={facetCounts.type}
        onToggle={(val) => toggleFilter("type", val)}
      />
      <FacetGroupFilter
        title="Primary Task"
        options={TASK_OPTIONS}
        valFn={(o) => o.value}
        labelFn={(o) => o.label}
        selectedValues={filters.task}
        counts={facetCounts.task}
        onToggle={(val) => toggleFilter("task", val)}
      />
      <FacetGroupFilter
        title="Modality"
        options={dynamicOptions.modalities.map((m) => ({ value: m, label: m.toUpperCase() }))}
        valFn={(o) => o.value}
        labelFn={(o) => o.label}
        selectedValues={filters.modality}
        counts={facetCounts.modality}
        onToggle={(val) => toggleFilter("modality", val)}
      />
      {!hideDeveloperPrefix && (
        <FacetGroupFilter
          title="Developer"
          options={developers.map((d) => ({ value: d, label: d }))}
          valFn={(o) => o.value}
          labelFn={(o) => o.label}
          selectedValues={filters.developer}
          counts={facetCounts.developer}
          onToggle={(val) => toggleFilter("developer", val)}
        />
      )}
      <FacetGroupFilter
        title="License"
        options={dynamicOptions.licenses.map((l) => ({ value: l, label: l }))}
        valFn={(o) => o.value}
        labelFn={(o) => o.label}
        selectedValues={filters.license}
        counts={facetCounts.license}
        onToggle={(val) => toggleFilter("license", val)}
      />
      <FacetGroupFilter
        title="Deployment"
        options={DEPLOYMENT_OPTIONS}
        valFn={(o) => o.value}
        labelFn={(o) => o.label}
        selectedValues={filters.deployment}
        counts={facetCounts.deployment}
        onToggle={(val) => toggleFilter("deployment", val)}
      />
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start relative w-full max-w-full overflow-hidden">
      {/* ── Desktop Sidebar Facets ───────────────────────────── */}
      <aside className="hidden lg:block w-64 shrink-0 space-y-5 sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2 no-scrollbar border-r border-[#282828]">
        <div className="flex items-center justify-between pr-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#90908F]">Filters</span>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-[#D97757] hover:underline font-medium"
            >
              Clear All
            </button>
          )}
        </div>
        {renderSidebar()}
      </aside>

      {/* ── Main Catalog Workspace ───────────────────────────── */}
      <div className="flex-1 min-w-0 w-full space-y-6">
        {/* Horizontal Filter Task & Type Bar */}
        <div className="space-y-3 border-b border-[#282828] pb-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#90908F] shrink-0 mr-1">Task:</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, task: [] }))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filters.task.length === 0
                  ? "bg-white text-[#141414] font-semibold"
                  : "bg-[#242426] text-[#90908F] hover:text-white border border-[#333333]"
              }`}
            >
              All Tasks ({models.length})
            </button>
            {TASK_OPTIONS.map((opt) => {
              const isActive = filters.task.includes(opt.value);
              const count = facetCounts.task[opt.value] || 0;
              return (
                <button
                  key={opt.value}
                  onClick={() => {
                    setFilters((f) => {
                      const newTasks = isActive
                        ? f.task.filter((t) => t !== opt.value)
                        : [...f.task, opt.value];
                      return { ...f, task: newTasks };
                    });
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#141414] font-semibold"
                      : "bg-[#242426] text-[#90908F] hover:text-white border border-[#333333]"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-black/20 text-[#141414]" : "bg-[#1E1E1E] text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#90908F] shrink-0 mr-1">Type:</span>
            <button
              onClick={() => setFilters((f) => ({ ...f, type: [] }))}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                filters.type.length === 0
                  ? "bg-white text-[#141414] font-semibold"
                  : "bg-[#242426] text-[#90908F] hover:text-white border border-[#333333]"
              }`}
            >
              All Types
            </button>
            {TYPE_OPTIONS.map((opt) => {
              const isActive = filters.type.includes(opt.value);
              const count = facetCounts.type[opt.value] || 0;
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
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isActive
                      ? "bg-white text-[#141414] font-semibold"
                      : "bg-[#242426] text-[#90908F] hover:text-white border border-[#333333]"
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? "bg-black/20 text-[#141414]" : "bg-[#1E1E1E] text-gray-400"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Input & Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b border-[#282828] pb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#90908F]" />
            <input
              type="text"
              placeholder="Search by name or developer..."
              value={filters.q}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full bg-[#1C1C1E] border border-[#282828] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder:text-[#90908F] focus:outline-none focus:border-[#D97757] transition-colors font-sans"
            />
            {filters.q && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#90908F] hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 justify-between sm:justify-start">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 px-3 py-1.5 border border-[#282828] rounded-lg text-xs font-medium text-[#90908F] hover:text-white bg-[#1C1C1E]"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#90908F] whitespace-nowrap hidden sm:block">Sort By</span>
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="bg-[#1C1C1E] border border-[#282828] rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-[#E1E1E0] focus:outline-none focus:border-[#D97757] appearance-none cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.key} value={opt.key} className="bg-[#1C1C1E] text-white">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ArrowUpDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#90908F] pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <p className="text-xs text-[#90908F]">
            Showing <span className="text-white font-medium">{groupedItems.length}</span> cards (from {filtered.length} matching models)
          </p>
        </div>

        {/* Results Model Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 auto-rows-fr">
          {groupedItems.map((item) => {
            const model = item.type === "family" ? item.primaryModel : item.model;
            const featuredClass = model.featured ? "md:col-span-2 row-span-2" : "";

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
                  hideDeveloperPrefix={hideDeveloperPrefix}
                />
              </div>
            );
          })}
        </div>

        {groupedItems.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center border border-[#282828] bg-[#1C1C1E] rounded-xl p-8">
            <p className="text-[#90908F] text-xs">
              No models match these filters yet — try removing a filter
            </p>
            <button
              onClick={clearAllFilters}
              className="mt-4 bg-[#D97757] text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setMobileFiltersOpen(false)} />
          <div className="relative w-full max-h-[85vh] bg-[#141414] border-t border-[#282828] rounded-t-2xl flex flex-col z-10 p-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#282828]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#90908F]">Filters</span>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1 text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto py-4 space-y-6 flex-1">{renderSidebar()}</div>
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
  hideDeveloperPrefix?: boolean;
}) {
  return (
    <Suspense fallback={<div className="text-gray-400 text-xs py-20 text-center">Loading catalog...</div>}>
      <ModelCatalogContent {...props} />
    </Suspense>
  );
}

"use client";

import React, { useState } from "react";
import {
  BarChart3,
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { normalizeBenchmarks, BenchmarkItem } from "@/lib/benchmarks";

interface BenchmarksSectionProps {
  benchmarks: unknown;
}

export default function BenchmarksSection({ benchmarks }: BenchmarksSectionProps) {
  const items = normalizeBenchmarks(benchmarks);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isExpanded, setIsExpanded] = useState(false);

  // Derive categories with counts
  const categoryCounts: Record<string, number> = { All: items.length };
  for (const item of items) {
    const cat = item.category || "General / Other";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }
  const availableCategories = ["All", ...Object.keys(categoryCounts).filter((c) => c !== "All")];

  // Identify top headline / spotlight benchmarks (up to 4)
  const headlines = items.filter((i) => i.is_headline);
  const headlineItems =
    headlines.length > 0
      ? headlines.slice(0, 4)
      : [...items]
          .sort((a, b) => {
            const numA = typeof a.score === "number" ? a.score : parseFloat(String(a.score)) || 0;
            const numB = typeof b.score === "number" ? b.score : parseFloat(String(b.score)) || 0;
            return numB - numA;
          })
          .slice(0, 4);

  // Filtered items based on search and category
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.metric && item.metric.toLowerCase().includes(search.toLowerCase())) ||
      (item.category && item.category.toLowerCase().includes(search.toLowerCase()));

    const matchesCat =
      selectedCategory === "All" ||
      item.category === selectedCategory ||
      (!item.category && selectedCategory === "General / Other");

    return matchesSearch && matchesCat;
  });

  // Pagination / Expand limit (default 8 items unless expanded or searching)
  const isFiltering = search !== "" || selectedCategory !== "All";
  const displayedItems = isExpanded || isFiltering ? filteredItems : filteredItems.slice(0, 8);
  const remainingCount = filteredItems.length - 8;

  if (items.length === 0) return null;

  return (
    <section className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--muted)]/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              <BarChart3 size={18} />
            </span>
            <h3 className="text-base sm:text-lg font-bold tracking-tight text-[var(--text)]">
              Verified Performance Benchmarks
            </h3>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-semibold">
              {items.length} Tested
            </span>
          </div>
          <p className="text-xs text-[var(--muted)]">
            Standardized evaluation results across reasoning, agentic coding, computer use, and alignment.
          </p>
        </div>

        {/* Controls: Search + View Mode */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter metrics..."
              className="w-36 sm:w-44 pl-8 pr-3 py-1.5 text-xs bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] text-[var(--text)] focus:outline-none focus:border-[var(--accent)] placeholder:text-[var(--muted)]/60 font-mono transition-colors"
            />
          </div>

          <div className="flex items-center p-0.5 bg-[var(--bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)]">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "grid"
                  ? "bg-[var(--card-bg)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="Card Grid View"
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded transition-colors ${
                viewMode === "table"
                  ? "bg-[var(--card-bg)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
              title="Dense Table View"
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Spotlight Hero Cards: Flagship Headline Benchmarks (Shown if no active search) */}
      {!isFiltering && headlineItems.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-[var(--accent)] font-semibold">
              <Award size={13} />
              Flagship Headline Metrics
            </span>
            <span>Industry SOTA Standard</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {headlineItems.map((item, idx) => (
              <HeadlineSpotlightCard key={`headline-${item.name}-${idx}`} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* Category Tab Filters */}
      {availableCategories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {availableCategories.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setIsExpanded(false);
                }}
                className={`px-3 py-1.5 rounded-full font-mono text-xs whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? "bg-[var(--accent)] text-white border-[var(--accent)] font-medium shadow-sm"
                    : "bg-[var(--bg)] border-[var(--muted)]/15 text-[var(--muted)] hover:text-[var(--text)] hover:border-[var(--muted)]/30"
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected ? "bg-black/20 text-white" : "bg-[var(--muted)]/15 text-[var(--muted)]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Evaluated Metrics Display: Grid or Table */}
      {displayedItems.length === 0 ? (
        <div className="p-8 text-center rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 text-xs text-[var(--muted)] font-mono">
          No benchmarks matching &ldquo;{search}&rdquo; in category &ldquo;{selectedCategory}&rdquo;.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {displayedItems.map((item, idx) => (
            <BenchmarkCard key={`${item.name}-${idx}`} item={item} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[var(--muted)]/15 bg-[var(--bg)]">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[var(--muted)]/15 bg-[var(--card-bg)] text-[var(--muted)] uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-4 font-semibold">Benchmark Name</th>
                <th className="py-2.5 px-3 font-semibold">Category</th>
                <th className="py-2.5 px-3 font-semibold">Metric</th>
                <th className="py-2.5 px-4 font-semibold text-right">Score / Retention</th>
                <th className="py-2.5 px-3 text-center">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10">
              {displayedItems.map((item, idx) => (
                <BenchmarkTableRow key={`table-${item.name}-${idx}`} item={item} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expand / Collapse Drawer Button */}
      {!isFiltering && remainingCount > 0 && (
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--bg)] border border-[var(--muted)]/20 hover:border-[var(--accent)]/40 text-xs font-mono text-[var(--text)] transition-all hover-lift shadow-sm"
          >
            {isExpanded ? (
              <>
                <span>Collapse to Key Benchmarks</span>
                <ChevronUp size={14} className="text-[var(--accent)]" />
              </>
            ) : (
              <>
                <span>Show All {filteredItems.length} Evaluated Metrics ({remainingCount} more)</span>
                <ChevronDown size={14} className="text-[var(--accent)]" />
              </>
            )}
          </button>
        </div>
      )}
    </section>
  );
}

/**
 * Headline Spotlight Card: Flagship Hero representation for key industry standards.
 */
function HeadlineSpotlightCard({ item }: { item: BenchmarkItem }) {
  const { numScore, isPercentage, formattedScore } = parseBenchmarkScore(item);

  return (
    <div className="p-4 rounded-[var(--radius-control)] bg-gradient-to-br from-[var(--bg)] to-[var(--card-bg)] border border-[var(--accent)]/25 shadow-sm space-y-3 relative overflow-hidden group hover:border-[var(--accent)]/50 transition-all">
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="px-2 py-0.5 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] font-semibold uppercase tracking-wider">
          {item.category || "Frontier"}
        </span>
        {item.source && (
          <a
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors p-1"
            title="View official benchmark source"
          >
            <ExternalLink size={12} />
          </a>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="font-bold text-xs text-[var(--text)] tracking-tight truncate" title={item.name}>
          {item.name}
        </h4>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-extrabold font-mono text-[var(--accent)] tracking-tight">
            {formattedScore}
            {isPercentage && !String(formattedScore).includes("%") ? "%" : ""}
          </span>
          {item.metric && (
            <span className="text-[10px] font-mono text-[var(--muted)]">
              {item.metric}
            </span>
          )}
        </div>
      </div>

      {/* Refined Slim Gauge */}
      {isPercentage && (
        <div className="space-y-1">
          <div className="w-full bg-[var(--muted)]/15 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                item.lower_is_better
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-orange-500 via-[var(--accent)] to-amber-400"
              }`}
              style={{
                width: `${Math.min(item.lower_is_better ? Math.max(100 - numScore, 0) : numScore, 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-mono text-[var(--muted)]/60">
            <span>0%</span>
            <span>{item.lower_is_better ? "Low is better" : "100%"}</span>
          </div>
        </div>
      )}

      {item.conditions && (
        <p className="text-[10px] text-[var(--muted)] font-mono truncate" title={item.conditions}>
          {item.conditions}
        </p>
      )}
    </div>
  );
}

/**
 * Compact Detailed Benchmark Card: Sleek, non-intrusive card layout with inline micro-bar.
 */
function BenchmarkCard({ item }: { item: BenchmarkItem }) {
  const { numScore, isPercentage, formattedScore } = parseBenchmarkScore(item);

  return (
    <div className="p-3.5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 hover:border-[var(--accent)]/30 transition-all space-y-2.5">
      <div className="flex items-start justify-between gap-2 text-xs">
        <div className="min-w-0 space-y-0.5">
          <span className="font-semibold text-[var(--text)] tracking-wide font-mono truncate block text-[11px] sm:text-xs">
            {item.name.replace(/_/g, " ")}
          </span>
          <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono">
            {item.metric && <span>{item.metric}</span>}
            {item.lower_is_better && (
              <span className="text-emerald-500 font-semibold">· Lower is better</span>
            )}
            {item.category && item.category !== "General / Other" && (
              <span className="hidden md:inline text-[var(--muted)]/70">· {item.category}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`font-bold text-xs sm:text-sm font-mono tabular-nums px-2 py-0.5 rounded ${
              item.lower_is_better
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                : "bg-[var(--accent)]/10 text-[var(--accent)]"
            }`}
          >
            {formattedScore}
            {isPercentage && !String(formattedScore).includes("%") ? "%" : ""}
          </span>
          {item.source && (
            <a
              href={item.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors p-1"
              title="View benchmark source"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {/* Refined Inline Micro-Bar (Slim 1.5px, smooth track, never chunky) */}
      {isPercentage && (
        <div className="w-full bg-[var(--muted)]/10 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              item.lower_is_better
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-orange-500/80 to-[var(--accent)]"
            }`}
            style={{
              width: `${Math.min(Math.max(numScore, 0), 100)}%`,
            }}
          />
        </div>
      )}

      {item.conditions && (
        <p className="text-[10px] text-[var(--muted)]/80 font-mono truncate" title={item.conditions}>
          {item.conditions}
        </p>
      )}
    </div>
  );
}

/**
 * Table Row View: High-density compact tabular layout for power users.
 */
function BenchmarkTableRow({ item }: { item: BenchmarkItem }) {
  const { numScore, isPercentage, formattedScore } = parseBenchmarkScore(item);

  return (
    <tr className="hover:bg-[var(--card-bg)]/80 transition-colors">
      <td className="py-2.5 px-4">
        <div className="font-semibold text-[var(--text)] truncate max-w-[200px] sm:max-w-[280px]">
          {item.name}
        </div>
        {item.conditions && (
          <div className="text-[10px] text-[var(--muted)] truncate max-w-[220px]">
            {item.conditions}
          </div>
        )}
      </td>
      <td className="py-2.5 px-3 text-[var(--muted)] text-[11px] whitespace-nowrap">
        {item.category || "General"}
      </td>
      <td className="py-2.5 px-3 text-[var(--muted)] text-[11px]">
        {item.metric || "score"}
        {item.lower_is_better && (
          <span className="text-emerald-500 text-[10px] block">lower is better</span>
        )}
      </td>
      <td className="py-2.5 px-4 text-right whitespace-nowrap">
        <div className="inline-flex items-center gap-2 justify-end">
          {isPercentage && (
            <div className="w-16 bg-[var(--muted)]/15 h-1.5 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full rounded-full ${
                  item.lower_is_better ? "bg-emerald-500" : "bg-[var(--accent)]"
                }`}
                style={{
                  width: `${Math.min(Math.max(numScore, 0), 100)}%`,
                }}
              />
            </div>
          )}
          <span
            className={`font-bold font-mono text-xs ${
              item.lower_is_better ? "text-emerald-500" : "text-[var(--accent)]"
            }`}
          >
            {formattedScore}
            {isPercentage && !String(formattedScore).includes("%") ? "%" : ""}
          </span>
        </div>
      </td>
      <td className="py-2.5 px-3 text-center">
        {item.source ? (
          <a
            href={item.source}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--muted)] hover:text-[var(--accent)] inline-block transition-colors"
            title="View source"
          >
            <ExternalLink size={12} />
          </a>
        ) : (
          <span className="text-[var(--muted)]/30">—</span>
        )}
      </td>
    </tr>
  );
}

/**
 * Helper to determine if a score is percentage-compatible or arbitrary numeric/text.
 */
function parseBenchmarkScore(item: BenchmarkItem) {
  const metricLower = (item.metric || "").toLowerCase();
  const numScore = typeof item.score === "number" ? item.score : parseFloat(String(item.score));

  // Determine if this is an absolute non-percentage metric (e.g. ELO rating, NED error count)
  // Use exact regex boundaries so "misaligned_outcome_rate" is NOT falsely matched by "ned"!
  const isNonPercentageMetric =
    numScore > 100 ||
    /\b(elo|rating)\b/i.test(metricLower) ||
    metricLower === "omr-ned" ||
    metricLower.endsWith("-ned") ||
    (metricLower.includes("index") && numScore > 100);

  const isPercentage = !isNaN(numScore) && numScore <= 100 && numScore >= 0 && !isNonPercentageMetric;
  const formattedScore = typeof item.score === "number" ? item.score : String(item.score);

  return { numScore, isPercentage, formattedScore };
}

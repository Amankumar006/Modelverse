"use client";

import React, { useState, useMemo } from "react";
import { type Benchmark } from "@/lib/models";
import { Award, ArrowUpRight, ArrowUpDown, ChevronDown, ChevronUp, ShieldCheck, Activity } from "lucide-react";

interface BenchmarksSectionProps {
  benchmarks?: Benchmark[];
  visibleCols?: Record<string, boolean>;
  benchmarkColumns?: { id: string; label: string }[];
  developer?: string;
}

type SortField = "name" | "score" | "category" | "metricType" | "sourceType";
type SortDirection = "asc" | "desc";
type MetricTypeFilter = "all" | "performance" | "technical" | "economic" | "ranking" | "availability";

const METRIC_TYPES: { id: MetricTypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "performance", label: "Performance" },
  { id: "technical", label: "Technical" },
  { id: "economic", label: "Economic" },
  { id: "ranking", label: "Ranking" },
  { id: "availability", label: "Availability" },
];

const METRIC_BADGES: Record<string, { label: string; className: string }> = {
  performance: { label: "Performance", className: "bg-violet-500/15 text-violet-400 border-violet-500/25" },
  technical: { label: "Technical", className: "bg-sky-500/15 text-sky-400 border-sky-500/25" },
  economic: { label: "Economic", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" },
  ranking: { label: "Ranking", className: "bg-amber-500/15 text-amber-400 border-amber-500/25" },
  availability: { label: "Availability", className: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/25" },
};

export default function BenchmarksSection({ benchmarks = [] }: BenchmarksSectionProps) {
  const [selectedMetricType, setSelectedMetricType] = useState<MetricTypeFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (name: string) => {
    setExpandedNotes((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const metricTypeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: benchmarks.length };
    for (const b of benchmarks) {
      const type = String(b.metricType || "performance").toLowerCase().trim();
      counts[type] = (counts[type] || 0) + 1;
    }
    return counts;
  }, [benchmarks]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const b of benchmarks) {
      if (b.category) cats.add(b.category);
    }
    return Array.from(cats);
  }, [benchmarks]);

  const sortedBenchmarks = useMemo(() => {
    let filtered = [...benchmarks];

    // Filter by Metric Type
    if (selectedMetricType !== "all") {
      filtered = filtered.filter((b) => {
        const type = String(b.metricType || "performance").toLowerCase().trim();
        return type === selectedMetricType;
      });
    }

    // Filter by Category
    if (selectedCategory !== "all") {
      filtered = filtered.filter((b) => (b.category || "General") === selectedCategory);
    }

    filtered.sort((a, b) => {
      let res = 0;
      if (sortField === "score") {
        const numA = typeof a.score === "number" ? a.score : parseFloat(String(a.score).replace(/[%,$]/g, ""));
        const numB = typeof b.score === "number" ? b.score : parseFloat(String(b.score).replace(/[%,$]/g, ""));
        if (!isNaN(numA) && !isNaN(numB)) {
          res = numA - numB;
        } else {
          res = String(a.score || "").localeCompare(String(b.score || ""));
        }
      } else if (sortField === "name") {
        res = a.name.localeCompare(b.name);
      } else if (sortField === "metricType") {
        const typeA = String(a.metricType || "performance");
        const typeB = String(b.metricType || "performance");
        res = typeA.localeCompare(typeB);
      } else if (sortField === "category") {
        res = (a.category || "General").localeCompare(b.category || "General");
      } else if (sortField === "sourceType") {
        res = (a.sourceType || "").localeCompare(b.sourceType || "");
      }

      return sortDir === "asc" ? res : -res;
    });

    return filtered;
  }, [benchmarks, selectedMetricType, selectedCategory, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  if (!benchmarks || benchmarks.length === 0) {
    return (
      <section id="benchmarks" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Award size={14} />
          <span>Evaluation Suite</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
          Verified Benchmarks
        </h2>
        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-center space-y-2">
          <p className="text-sm text-[var(--muted)] font-medium">No verified benchmark scores published or recorded yet.</p>
          <p className="text-xs text-[var(--muted)]/70">
            Modelverse indexes standardized evaluations from official research papers, vendor system cards, and independent academic leaderboards.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="benchmarks" className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Award size={14} />
            <span>Standardized Evaluation</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Verified Benchmarks &amp; Metrics
          </h2>
        </div>

        {/* Metric Type Filter: All | Performance | Technical | Economic | Ranking | Availability */}
        <div className="flex flex-wrap gap-1 p-1 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
          {METRIC_TYPES.map((t) => {
            const count = metricTypeCounts[t.id] || 0;
            const isSelected = selectedMetricType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedMetricType(t.id)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-[var(--radius-pill)] transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
                }`}
              >
                <span>{t.label}</span>
                {t.id === "all" ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-[var(--muted)]/10 text-[var(--muted)]"}`}>
                    {count}
                  </span>
                ) : count > 0 ? (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? "bg-white/20 text-white" : "bg-[var(--muted)]/10 text-[var(--muted)]"}`}>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[var(--muted)]">
        <p className="leading-relaxed">
          Curated and verified performance scores, technical specifications, and economic metrics recorded with provenance citations.
        </p>

        {/* Secondary Category Filter if present */}
        {categories.length > 1 && (
          <div className="flex items-center gap-1.5 self-start sm:self-auto shrink-0">
            <span className="text-xs font-medium">Domain:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs bg-[var(--card-bg)] border border-[var(--muted)]/20 rounded-[var(--radius-control)] px-2 py-1 text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
            >
              <option value="all">All Domains ({benchmarks.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Sortable Benchmarks Table */}
      <div className="overflow-x-auto rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
            <tr>
              <th
                onClick={() => handleSort("name")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Benchmark / Metric</span>
                  <ArrowUpDown size={12} className={sortField === "name" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("score")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Score / Value</span>
                  <ArrowUpDown size={12} className={sortField === "score" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("metricType")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)] hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Type</span>
                  <ArrowUpDown size={12} className={sortField === "metricType" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("category")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)] hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  <ArrowUpDown size={12} className={sortField === "category" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("sourceType")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)] hidden lg:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Evaluator</span>
                  <ArrowUpDown size={12} className={sortField === "sourceType" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th className="p-3.5 text-right font-bold uppercase tracking-wider text-[11px] pr-4">
                Provenance
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--muted)]/10 font-normal">
            {sortedBenchmarks.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-sm text-[var(--muted)]">
                  No metrics match the selected &quot;{selectedMetricType}&quot; filter.
                </td>
              </tr>
            ) : (
              sortedBenchmarks.map((b, idx) => {
                const citationUrl = b.source || (typeof b.citation === "string" && b.citation.startsWith("http") ? b.citation : null);
                const hasNotes = Boolean(b.notes || (b.citation && !b.citation.startsWith("http")));
                const isExpanded = Boolean(expandedNotes[b.name]);
                const metricTypeKey = String(b.metricType || "performance").toLowerCase().trim();
                const metricBadge = METRIC_BADGES[metricTypeKey] || { label: metricTypeKey, className: "bg-[var(--bg)] text-[var(--muted)] border-[var(--muted)]/20" };

                return (
                  <React.Fragment key={`${b.name}-${idx}`}>
                    <tr className="hover:bg-[var(--bg)]/50 transition-colors">
                      {/* Benchmark Name & Subcategory */}
                      <td className="p-3.5">
                        <div className="flex items-start gap-2">
                          {b.verified ? (
                            <span title="Verified provenance citation">
                              <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                            </span>
                          ) : (
                            <span title="Unverified metric">
                              <Activity size={14} className="text-[var(--muted)] shrink-0 mt-0.5" />
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-[var(--text)] block">{b.name}</span>
                            {b.subCategory && b.subCategory !== "None" && (
                              <span className="text-[11px] text-[var(--muted)] font-mono">{b.subCategory}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Numeric Score */}
                      <td className="p-3.5 font-mono tabular-nums font-extrabold text-[var(--accent)] text-sm sm:text-base">
                        {b.score !== undefined && b.score !== null && b.score !== "" ? String(b.score) : "—"}
                      </td>

                      {/* Metric Type Badge */}
                      <td className="p-3.5 text-xs hidden sm:table-cell">
                        <span className={`px-2 py-0.5 rounded-[var(--radius-pill)] border text-[11px] font-semibold uppercase tracking-wider ${metricBadge.className}`}>
                          {metricBadge.label}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="p-3.5 text-xs text-[var(--muted)] hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/10">
                          {b.category || "General"}
                        </span>
                      </td>

                      {/* Source Type */}
                      <td className="p-3.5 text-xs hidden lg:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              b.sourceType === "vendor-reported" ? "bg-amber-500" : "bg-[var(--accent)]"
                            }`}
                          />
                          {b.sourceType === "vendor-reported" ? "Vendor-reported" : "Independent"}
                        </span>
                      </td>

                      {/* Provenance Link & Note Toggle */}
                      <td className="p-3.5 text-right pr-4">
                        <div className="inline-flex items-center gap-2 justify-end">
                          {citationUrl && (
                            <a
                              href={citationUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-[var(--radius-control)] bg-[var(--bg)] text-[var(--accent)] hover:underline border border-[var(--muted)]/10 text-xs font-medium"
                              title={b.citation || "View primary source"}
                            >
                              <span>Source</span>
                              <ArrowUpRight size={11} />
                            </a>
                          )}
                          {hasNotes && (
                            <button
                              type="button"
                              onClick={() => toggleNote(b.name)}
                              className="text-xs text-[var(--muted)] hover:text-[var(--text)] p-1 rounded hover:bg-[var(--bg)] transition-colors"
                              title="Toggle evaluation notes"
                            >
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Notes Row */}
                    {hasNotes && isExpanded && (
                      <tr className="bg-[var(--bg)]/40">
                        <td colSpan={6} className="p-3.5 pl-8 text-xs text-[var(--muted)] space-y-1">
                          {b.notes && (
                            <p className="leading-relaxed">
                              <strong className="text-[var(--text)] font-semibold">Evaluation Notes:</strong> {b.notes}
                            </p>
                          )}
                          {b.citation && !b.citation.startsWith("http") && (
                            <p className="text-[11px] font-mono text-[var(--muted)]">
                              <strong className="text-[var(--text)]">Citation:</strong> {b.citation}
                            </p>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}


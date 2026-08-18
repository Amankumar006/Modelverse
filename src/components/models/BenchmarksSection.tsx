"use client";

import React, { useState, useMemo } from "react";
import { type Benchmark } from "@/lib/models";
import { Award, ArrowUpRight, ArrowUpDown, ChevronDown, ChevronUp, ShieldCheck } from "lucide-react";

interface BenchmarksSectionProps {
  benchmarks?: Benchmark[];
  visibleCols?: Record<string, boolean>;
  benchmarkColumns?: { id: string; label: string }[];
  developer?: string;
}

type SortField = "name" | "score" | "category" | "sourceType";
type SortDirection = "asc" | "desc";

export default function BenchmarksSection({ benchmarks = [] }: BenchmarksSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>("score");
  const [sortDir, setSortDir] = useState<SortDirection>("desc");
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  const toggleNote = (name: string) => {
    setExpandedNotes((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const b of benchmarks) {
      if (b.category) cats.add(b.category);
    }
    return Array.from(cats);
  }, [benchmarks]);

  const sortedBenchmarks = useMemo(() => {
    let filtered = [...benchmarks];
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
      } else if (sortField === "category") {
        res = (a.category || "General").localeCompare(b.category || "General");
      } else if (sortField === "sourceType") {
        res = (a.sourceType || "").localeCompare(b.sourceType || "");
      }

      return sortDir === "asc" ? res : -res;
    });

    return filtered;
  }, [benchmarks, selectedCategory, sortField, sortDir]);

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
            Verified Benchmarks
          </h2>
        </div>

        {/* Category Filter Pills */}
        {categories.length > 1 && (
          <div className="flex flex-wrap gap-1.5 p-1 rounded-[var(--radius-pill)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1 text-xs font-bold rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                selectedCategory === "all"
                  ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              All ({benchmarks.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-bold rounded-[var(--radius-pill)] transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Curated and verified benchmark metrics recorded with primary source citations and provenance classification.
      </p>

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
                  <span>Benchmark</span>
                  <ArrowUpDown size={12} className={sortField === "name" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("score")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Score</span>
                  <ArrowUpDown size={12} className={sortField === "score" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("category")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)] hidden sm:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Category</span>
                  <ArrowUpDown size={12} className={sortField === "category" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th
                onClick={() => handleSort("sourceType")}
                className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] cursor-pointer select-none hover:text-[var(--accent)] hidden md:table-cell"
              >
                <div className="flex items-center gap-1.5">
                  <span>Evaluator</span>
                  <ArrowUpDown size={12} className={sortField === "sourceType" ? "text-[var(--accent)]" : "text-[var(--muted)]"} />
                </div>
              </th>

              <th className="p-3.5 text-right font-bold uppercase tracking-wider text-[11px] pr-4">
                Provenance &amp; Citation
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--muted)]/10 font-normal">
            {sortedBenchmarks.map((b, idx) => {
              const citationUrl = b.source || (typeof b.citation === "string" && b.citation.startsWith("http") ? b.citation : null);
              const hasNotes = Boolean(b.notes || (b.citation && !b.citation.startsWith("http")));
              const isExpanded = Boolean(expandedNotes[b.name]);

              return (
                <React.Fragment key={`${b.name}-${idx}`}>
                  <tr className="hover:bg-[var(--bg)]/50 transition-colors">
                    {/* Benchmark Name & Subcategory */}
                    <td className="p-3.5">
                      <div className="flex items-start gap-2">
                        {b.verified && (
                          <span title="Verified provenance">
                            <ShieldCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
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

                    {/* Category */}
                    <td className="p-3.5 text-xs text-[var(--muted)] hidden sm:table-cell">
                      <span className="px-2 py-0.5 rounded-[var(--radius-pill)] bg-[var(--bg)] border border-[var(--muted)]/10">
                        {b.category || "General"}
                      </span>
                    </td>

                    {/* Source Type */}
                    <td className="p-3.5 text-xs hidden md:table-cell">
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
                      <td colSpan={5} className="p-3.5 pl-8 text-xs text-[var(--muted)] space-y-1">
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
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

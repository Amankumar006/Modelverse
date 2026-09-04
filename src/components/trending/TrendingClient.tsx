"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Info, ArrowUpRight, Cpu } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface TrendingClientProps {
  initialModels: ModelRow[];
}

export default function TrendingClient({ initialModels }: TrendingClientProps) {
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <div className="w-full space-y-6">
      {/* Score Explainer Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--muted)]/10">
        <span className="text-xs text-[var(--muted)]">
          Ranked by TheModelverse Benchmark Performance & Context Capacity Index
        </span>
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline font-semibold self-start sm:self-auto cursor-pointer"
        >
          <Info size={14} />
          <span>How ranking works</span>
        </button>
      </div>

      {/* Explainer Popover */}
      {showExplainer && (
        <div className="p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs text-[var(--muted)] leading-relaxed space-y-1.5 border border-[var(--muted)]/10">
          <p className="font-bold text-[var(--text)]">Trending Score Algorithm:</p>
          <p>
            Rankings evaluate a weighted blend of verified benchmark evaluations (MMLU, GPQA, MATH), context window capacity, active developer support, and release recency.
          </p>
        </div>
      )}

      {/* List Container */}
      <div className="w-full divide-y divide-[var(--muted)]/10">
        {initialModels.map((model, index) => {
          const rankNum = String(index + 1).padStart(2, "0");
          return (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              className="grid grid-cols-[48px_1fr_auto] sm:grid-cols-[64px_1fr_auto] items-center py-5 sm:py-6 hover:bg-[var(--accent-soft)]/20 px-4 rounded-[var(--radius-control)] group transition-all"
            >
              {/* Rank Number */}
              <div className="text-base sm:text-lg font-bold text-[var(--muted)] font-mono tabular-nums">
                {rankNum}
              </div>

              {/* Title & Developer */}
              <div className="min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-xl tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {model.name}
                  </h3>
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium uppercase shrink-0">
                    {model.category || "LLM"}
                  </span>
                </div>
                <p className="text-xs text-[var(--muted)] truncate mt-0.5">{model.provider}</p>
              </div>

              {/* Specs & Link Icon */}
              <div className="flex items-center gap-4 text-xs text-[var(--muted)] font-mono">
                {model.context_window && (
                  <span className="hidden sm:flex items-center gap-1">
                    <Cpu size={12} className="text-[var(--accent)]" />
                    {model.context_window >= 1000000
                      ? `${(model.context_window / 1000000).toFixed(0)}M ctx`
                      : `${Math.round(model.context_window / 1000)}k ctx`}
                  </span>
                )}
                <ArrowUpRight
                  size={16}
                  className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { BarChart3 } from "lucide-react";

interface BenchmarksSectionProps {
  benchmarks: Record<string, number | string>;
}

export default function BenchmarksSection({ benchmarks }: BenchmarksSectionProps) {
  const entries = Object.entries(benchmarks || {});
  if (entries.length === 0) return null;

  return (
    <section className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <BarChart3 size={16} />
        <span>Verified Performance Benchmarks</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {entries.map(([bench, score]) => {
          const numScore = typeof score === "number" ? score : parseFloat(String(score));
          const isPercentage = !isNaN(numScore) && numScore <= 100 && numScore > 0;

          return (
            <div
              key={bench}
              className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-2"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)] uppercase tracking-wider font-mono">
                  {bench.replace(/_/g, " ")}
                </span>
                <span className="font-bold text-sm text-[var(--accent)] font-mono tabular-nums">
                  {String(score)}
                  {isPercentage && !String(score).includes("%") ? "%" : ""}
                </span>
              </div>

              {isPercentage && (
                <div className="w-full bg-[var(--muted)]/15 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[var(--accent)] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(numScore, 100)}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

import React from "react";
import { BarChart3, ExternalLink } from "lucide-react";
import { normalizeBenchmarks } from "@/lib/benchmarks";

interface BenchmarksSectionProps {
  benchmarks: unknown;
}

export default function BenchmarksSection({ benchmarks }: BenchmarksSectionProps) {
  const items = normalizeBenchmarks(benchmarks);
  if (items.length === 0) return null;

  return (
    <section className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <BarChart3 size={16} />
          <span>Verified Performance Benchmarks</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--muted)]">{items.length} Evaluated Metrics</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((item, idx) => {
          const numScore = typeof item.score === "number" ? item.score : parseFloat(String(item.score));
          const isPercentage = !isNaN(numScore) && numScore <= 100 && numScore > 0;
          const formattedScore = typeof item.score === "number" ? item.score : String(item.score);

          return (
            <div
              key={`${item.name}-${idx}`}
              className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-2 hover:border-[var(--accent)]/20 transition-all hover-lift"
            >
              <div className="flex items-start justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-[var(--text)] uppercase tracking-wider font-mono truncate block">
                    {item.name.replace(/_/g, " ")}
                  </span>
                  {item.metric && (
                    <span className="text-[10px] text-[var(--muted)] font-mono">
                      metric: {item.metric}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="font-bold text-sm text-[var(--accent)] font-mono tabular-nums">
                    {formattedScore}
                    {isPercentage && !String(formattedScore).includes("%") ? "%" : ""}
                  </span>
                  {item.source && (
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--muted)] hover:text-[var(--accent)] transition-colors p-0.5"
                      title="View benchmark source / evaluation"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
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

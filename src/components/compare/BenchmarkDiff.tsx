"use client";

import React from "react";
import { ModelRow } from "@/types/models";

const BENCHMARKS = [
  { key: "mmlu_pro", label: "MMLU-Pro" },
  { key: "math_500", label: "MATH-500" },
  { key: "swe_bench", label: "SWE-bench" },
  { key: "gpqa_diamond", label: "GPQA Diamond" },
];

export function BenchmarkDiff({
  models,
}: {
  models: (ModelRow | null)[];
}) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  if (activeModels.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-[var(--muted)]/10 bg-[var(--card-bg)]">
      <h3 className="text-lg font-bold text-[var(--text)]">Benchmark Showdown</h3>
      <div className="flex flex-col gap-5">
        {BENCHMARKS.map((bench) => {
          // Find max value to scale the bars
          const values = activeModels.map((m) => {
            const benchMap = m.benchmarks as Record<string, unknown> | null;
            const val = benchMap?.[bench.key];
            return typeof val === "number" ? val : 0;
          });
          const maxVal = Math.max(100, ...values);

          return (
            <div key={bench.key} className="flex flex-col gap-2">
              <div className="text-xs font-semibold text-[var(--muted)]">{bench.label}</div>
              {activeModels.map((m, idx) => {
                const benchMap = m.benchmarks as Record<string, unknown> | null;
                const val = benchMap?.[bench.key];
                const numVal = typeof val === "number" ? val : 0;
                const pct = Math.max(0, Math.min(100, (numVal / maxVal) * 100));
                
                return (
                  <div key={m.slug} className="flex items-center gap-3">
                    <div className="w-24 text-[10px] sm:text-xs font-medium truncate text-[var(--text)]">
                      {m.name}
                    </div>
                    <div className="flex-1 h-4 bg-[var(--muted)]/10 rounded-full overflow-hidden relative">
                      <div 
                        className="absolute top-0 left-0 h-full bg-[var(--accent)] transition-all duration-500 ease-out rounded-full"
                        style={{ width: `${pct}%`, opacity: 1 - idx * 0.2 }}
                      />
                    </div>
                    <div className="w-10 text-right text-xs font-mono font-bold text-[var(--text)]">
                      {numVal > 0 ? numVal.toFixed(1) : "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

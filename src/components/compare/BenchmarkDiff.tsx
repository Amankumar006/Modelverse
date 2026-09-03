"use client";

import React from "react";
import { Award } from "lucide-react";
import { ModelRow } from "@/types/models";
import { normalizeBenchmarks } from "@/lib/benchmarks";

interface BenchmarkDef {
  key: string;
  label: string;
  aliases: string[];
}

const BENCHMARK_DEFS: BenchmarkDef[] = [
  { key: "swe_bench", label: "SWE-bench (Coding)", aliases: ["swe", "swe-bench", "swe_bench", "swe_bench_verified"] },
  { key: "gpqa_diamond", label: "GPQA Diamond (Hard Reasoning)", aliases: ["gpqa", "gpqa_diamond", "gpqa-diamond"] },
  { key: "math_500", label: "MATH-500 (Mathematics)", aliases: ["math", "math_500", "math-500", "aime"] },
  { key: "mmlu_pro", label: "MMLU-Pro (Multitask Knowledge)", aliases: ["mmlu_pro", "mmlu-pro", "mmlu"] },
  { key: "human_eval", label: "HumanEval (Python Code)", aliases: ["humaneval", "human_eval", "eval"] },
];

function extractScore(model: ModelRow, def: BenchmarkDef): number | null {
  // First check raw map if benchmarks is an object
  if (typeof model.benchmarks === "object" && model.benchmarks !== null && !Array.isArray(model.benchmarks)) {
    const rawMap = model.benchmarks as Record<string, unknown>;
    for (const alias of def.aliases) {
      const direct = rawMap[alias];
      if (typeof direct === "number") return direct;
      if (typeof direct === "string") {
        const parsed = parseFloat(direct);
        if (!isNaN(parsed)) return parsed;
      }
    }
  }

  // Next check normalized benchmarks list
  const list = normalizeBenchmarks(model.benchmarks);
  for (const item of list) {
    const itemName = item.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const alias of def.aliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (itemName.includes(cleanAlias) || cleanAlias.includes(itemName)) {
        const parsed = typeof item.score === "number" ? item.score : parseFloat(String(item.score));
        if (!isNaN(parsed)) return parsed;
      }
    }
  }

  return null;
}

export function BenchmarkDiff({
  models,
}: {
  models: (ModelRow | null)[];
}) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  if (activeModels.length === 0) return null;

  // Filter benchmarks that at least one model has a score for
  const visibleBenchmarks = BENCHMARK_DEFS.map((def) => {
    const scores = activeModels.map((m) => extractScore(m, def));
    const hasAnyScore = scores.some((s) => s !== null && s > 0);
    return { def, scores, hasAnyScore };
  }).filter((b) => b.hasAnyScore);

  if (visibleBenchmarks.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-[var(--muted)]/15 bg-[var(--card-bg)] shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Award size={15} />
        <span>Standardized Benchmarks</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[var(--muted)]/10">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
            Benchmark Showdown & Head-to-Head Deltas
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Normalized evaluation scores across code generation, advanced reasoning, mathematics, and multidisciplinary exams.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {visibleBenchmarks.map(({ def, scores }) => {
          const validScores = scores.filter((s): s is number => s !== null && s > 0);
          const maxVal = Math.max(100, ...validScores);
          const bestScore = validScores.length > 0 ? Math.max(...validScores) : 0;

          return (
            <div key={def.key} className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[var(--muted)]">
                <span>{def.label}</span>
                <span className="text-[10px] font-mono font-medium text-[var(--muted)]">
                  Score % / Points
                </span>
              </div>

              <div className="flex flex-col gap-2">
                {activeModels.map((m, idx) => {
                  const score = scores[idx];
                  const hasScore = score !== null && score > 0;
                  const pct = hasScore ? Math.max(5, Math.min(100, (score / maxVal) * 100)) : 0;
                  const isBest = hasScore && score === bestScore && validScores.length > 1;

                  // Compute delta vs second model if exactly 2 models
                  let deltaBadge = null;
                  if (activeModels.length === 2 && hasScore) {
                    const otherScore = scores[idx === 0 ? 1 : 0];
                    if (otherScore !== null && otherScore > 0 && score !== otherScore) {
                      const diff = score - otherScore;
                      if (diff > 0) {
                        deltaBadge = (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            +{diff.toFixed(1)} pts
                          </span>
                        );
                      }
                    }
                  }

                  return (
                    <div key={m.slug} className="flex items-center gap-3">
                      <div className="w-28 sm:w-36 text-xs font-semibold truncate text-[var(--text)]">
                        {m.name}
                      </div>

                      <div className="flex-1 h-5 bg-[var(--muted)]/10 rounded-lg overflow-hidden relative p-0.5">
                        <div
                          className={`h-full rounded-md transition-all duration-500 ease-out flex items-center justify-end pr-2 ${
                            isBest
                              ? "bg-[var(--accent)]"
                              : "bg-[var(--accent)]/60"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="w-24 text-right flex items-center justify-end gap-1.5 shrink-0">
                        {deltaBadge}
                        <span className="text-xs font-mono font-bold text-[var(--text)]">
                          {hasScore ? score.toFixed(1) : "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

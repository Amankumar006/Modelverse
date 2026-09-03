"use client";

import React from "react";
import { Trophy, Award, Zap, DollarSign, Cpu } from "lucide-react";
import { ModelRow } from "@/types/models";
import { computeExecutiveVerdict, VerdictItem } from "@/lib/compare";

interface CompareVerdictProps {
  model1: ModelRow;
  model2: ModelRow;
}

export function CompareVerdict({ model1, model2 }: CompareVerdictProps) {
  const verdicts = computeExecutiveVerdict(model1, model2);

  const getCategoryIcon = (cat: VerdictItem["category"]) => {
    switch (cat) {
      case "reasoning":
        return <Award className="text-purple-400" size={16} />;
      case "coding":
        return <Zap className="text-amber-400" size={16} />;
      case "economics":
        return <DollarSign className="text-emerald-400" size={16} />;
      case "hardware":
        return <Cpu className="text-blue-400" size={16} />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6 sm:p-8 rounded-2xl border border-[var(--muted)]/15 bg-gradient-to-br from-[var(--card-bg)] to-[var(--muted)]/5 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Trophy size={16} />
        <span>Executive Showdown & Winner Breakdown</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <h3 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
          Who Wins Where: {model1.name} vs {model2.name}
        </h3>
        <span className="text-xs text-[var(--muted)] font-medium">
          Verified across benchmarks, pricing & local VRAM footprint
        </span>
      </div>

      {/* Verdict Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        {verdicts.map((v, i) => (
          <div
            key={i}
            className="flex flex-col gap-2.5 p-4 rounded-xl border border-[var(--muted)]/10 bg-[var(--card-bg)]/80 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--muted)] uppercase tracking-wide">
                {getCategoryIcon(v.category)}
                <span>{v.title}</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-mono">
                {v.deltaText}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-[var(--muted)]">Leader:</span>
              <span className="text-sm font-extrabold text-[var(--text)]">
                {v.winnerName}
              </span>
              <span className="text-xs font-mono text-[var(--muted)] ml-auto">
                ({v.metric})
              </span>
            </div>

            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {v.rationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

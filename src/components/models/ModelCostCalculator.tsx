"use client";

import React, { useState } from "react";
import { Calculator, Cpu } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface ModelCostCalculatorProps {
  model: ModelRow;
}

export default function ModelCostCalculator({ model }: ModelCostCalculatorProps) {
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));

  const inputRate = typeof pricing.input_per_1m === "number" ? pricing.input_per_1m : parseFloat(String(pricing.input_per_1m || "0")) || 0;
  const outputRate = typeof pricing.output_per_1m === "number" ? pricing.output_per_1m : parseFloat(String(pricing.output_per_1m || "0")) || 0;

  const [inputMillions, setInputMillions] = useState<number>(5);
  const [outputMillions, setOutputMillions] = useState<number>(2);

  const inputCost = (inputMillions * inputRate);
  const outputCost = (outputMillions * outputRate);
  const totalCost = inputCost + outputCost;

  return (
    <div className="p-6 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15 space-y-5">
      <div className="flex items-center justify-between border-b border-[var(--muted)]/10 pb-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <Calculator size={15} />
          <span>Interactive Inference Cost Estimator</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--muted)]">Simulate Monthly Budget</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-4 text-xs">
          {/* Input Tokens Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text)]">Prompt / Input Volume:</span>
              <span className="font-mono font-bold text-[var(--accent)]">{inputMillions}M Tokens / mo</span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              step="1"
              value={inputMillions}
              aria-label="Prompt and input token volume in millions per month"
              onChange={(e) => setInputMillions(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--muted)]/20"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
              <span>1M</span>
              <span>25M</span>
              <span>50M</span>
              <span>100M</span>
            </div>
          </div>

          {/* Output Tokens Slider */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[var(--text)]">Generated / Output Volume:</span>
              <span className="font-mono font-bold text-[var(--accent)]">{outputMillions}M Tokens / mo</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              value={outputMillions}
              aria-label="Generated output token volume in millions per month"
              onChange={(e) => setOutputMillions(Number(e.target.value))}
              className="w-full h-1.5 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--muted)]/20"
            />
            <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
              <span>0.5M</span>
              <span>10M</span>
              <span>25M</span>
              <span>50M</span>
            </div>
          </div>
        </div>

        {/* Cost Summary Box */}
        <div className="lg:col-span-5 p-5 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/15 space-y-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">
            Estimated Monthly Spend
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-[var(--text)] font-mono">
              ${totalCost.toFixed(2)}
            </span>
            <span className="text-xs text-[var(--muted)] font-mono">/ month</span>
          </div>

          <div className="pt-2 border-t border-[var(--muted)]/10 space-y-1 text-[11px] text-[var(--muted)]">
            <div className="flex justify-between">
              <span>Input ({inputMillions}M @ ${inputRate}/1M):</span>
              <span className="font-mono text-[var(--text)]">${inputCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Output ({outputMillions}M @ ${outputRate}/1M):</span>
              <span className="font-mono text-[var(--text)]">${outputCost.toFixed(2)}</span>
            </div>
            {isOpenWeights && (
              <div className="pt-1.5 flex items-center gap-1 text-[10px] text-emerald-500 font-semibold">
                <Cpu size={12} />
                <span>Self-hosted compute: $0 API token charge</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

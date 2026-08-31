"use client";

import React, { useState } from "react";
import { Calculator, Cpu, Zap, Layers, Server, HardDrive, ToggleLeft, ToggleRight, Edit3 } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface ModelCostCalculatorProps {
  model: ModelRow;
}

const PRESETS = [
  { name: "RAG / Q&A", input: 200, output: 20, icon: Layers },
  { name: "Agentic Coding", input: 100, output: 100, icon: Cpu },
  { name: "Customer Support", input: 50, output: 10, icon: Zap },
  { name: "Doc OCR", input: 500, output: 50, icon: HardDrive },
];

function getBaselineRates(model: ModelRow): { input: number; output: number; isEstimated: boolean } {
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, unknown>;
  const rawIn = typeof pricing.input_per_1m === "number" ? pricing.input_per_1m : parseFloat(String(pricing.input_per_1m || "0")) || 0;
  const rawOut = typeof pricing.output_per_1m === "number" ? pricing.output_per_1m : parseFloat(String(pricing.output_per_1m || "0")) || 0;

  if (rawIn > 0 || rawOut > 0) {
    return { input: rawIn, output: rawOut, isEstimated: false };
  }

  const params = model.parameters || "";
  const num = parseFloat(params.replace(/[^0-9.]/g, "")) || 0;
  const isB = params.toLowerCase().includes("b") || num > 0;
  const paramInB = isB ? num : num / 1000;

  if (paramInB > 0 && paramInB <= 14) return { input: 0.15, output: 0.60, isEstimated: true };
  if (paramInB > 14 && paramInB <= 72) return { input: 0.80, output: 2.40, isEstimated: true };
  if (paramInB > 72) return { input: 2.00, output: 6.00, isEstimated: true };
  return { input: 1.50, output: 5.00, isEstimated: true };
}

export default function ModelCostCalculator({ model }: ModelCostCalculatorProps) {
  const baseline = getBaselineRates(model);
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  const modelName = model.name?.toLowerCase() || "";
  const provider = model.provider ? String(model.provider).toLowerCase() : "";
  const isAnthropic = provider.includes("anthropic") || modelName.includes("claude");
  const isDeepseek = provider.includes("deepseek") || modelName.includes("deepseek");

  const [inputRate, setInputRate] = useState<number>(baseline.input);
  const [outputRate, setOutputRate] = useState<number>(baseline.output);
  const [isEditingRates, setIsEditingRates] = useState<boolean>(false);
  const [inputMillions, setInputMillions] = useState<number>(50);
  const [outputMillions, setOutputMillions] = useState<number>(10);
  const [useCaching, setUseCaching] = useState<boolean>(false);
  const [useBatch, setUseBatch] = useState<boolean>(false);

  const cacheDiscount = isAnthropic || isDeepseek ? 0.9 : 0.5;
  const effectiveInputRate = useCaching ? inputRate * (1 - cacheDiscount) : inputRate;
  
  let inputCost = inputMillions * effectiveInputRate;
  let outputCost = outputMillions * outputRate;
  if (useBatch) {
    inputCost *= 0.5;
    outputCost *= 0.5;
  }
  const totalCost = inputCost + outputCost;

  const GPU_4090_COST = 316;
  const GPU_H100_COST = 1800;
  const rtxEquiv = totalCost / GPU_4090_COST;
  const h100Equiv = totalCost / GPU_H100_COST;

  return (
    <div className="p-6 rounded-[var(--radius-card)] bg-[var(--bg)] border border-[var(--muted)]/15 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--muted)]/10 pb-4 gap-3">
        <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[var(--accent)]">
          <Calculator size={16} />
          <span>Inference Cost &amp; ROI Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${baseline.isEstimated ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
            {baseline.isEstimated ? "Market Cloud Rate" : "Official API Rate"}
          </span>
          <button onClick={() => setIsEditingRates(!isEditingRates)} className="text-[11px] text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1 font-medium transition-colors">
            <Edit3 size={12} />
            <span>{isEditingRates ? "Hide Rate Editor" : "Customize Rates"}</span>
          </button>
        </div>
      </div>

      {isEditingRates && (
        <div className="p-4 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--accent)]/30 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-[var(--muted)] font-medium block mb-1">Custom Input Rate ($ / 1M tokens):</label>
            <input type="number" step="0.01" min="0" value={inputRate} onChange={(e) => setInputRate(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-2 bg-[var(--bg)] rounded border border-[var(--muted)]/20 text-[var(--text)] font-mono font-bold" />
          </div>
          <div>
            <label className="text-[var(--muted)] font-medium block mb-1">Custom Output Rate ($ / 1M tokens):</label>
            <input type="number" step="0.01" min="0" value={outputRate} onChange={(e) => setOutputRate(Math.max(0, parseFloat(e.target.value) || 0))} className="w-full p-2 bg-[var(--bg)] rounded border border-[var(--muted)]/20 text-[var(--text)] font-mono font-bold" />
          </div>
        </div>
      )}

      {/* Workload Presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PRESETS.map((p) => (
          <button key={p.name} onClick={() => { setInputMillions(p.input); setOutputMillions(p.output); }} className="flex items-center gap-2 p-2.5 rounded-[var(--radius-control)] border border-[var(--muted)]/20 bg-[var(--card-bg)] hover:bg-[var(--muted)]/10 transition-colors text-xs text-left cursor-pointer">
            <p.icon size={14} className="text-[var(--accent)] shrink-0" />
            <span className="font-semibold text-[var(--text)]">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sliders Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)]">Prompt / Input Volume:</span>
                <span className="font-mono font-bold text-[var(--accent)]">{inputMillions}M Tokens / mo</span>
              </div>
              <input type="range" min="1" max="1000" step="1" value={inputMillions} onChange={(e) => setInputMillions(Number(e.target.value))} aria-label="Input tokens" className="w-full h-1.5 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--muted)]/20" />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono"><span>1M</span><span>500M</span><span>1,000M</span></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)]">Generated / Output Volume:</span>
                <span className="font-mono font-bold text-[var(--accent)]">{outputMillions}M Tokens / mo</span>
              </div>
              <input type="range" min="1" max="500" step="1" value={outputMillions} onChange={(e) => setOutputMillions(Number(e.target.value))} aria-label="Output tokens" className="w-full h-1.5 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--muted)]/20" />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono"><span>1M</span><span>250M</span><span>500M</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setUseCaching(!useCaching)} className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${useCaching ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--muted)]/20 bg-[var(--card-bg)]"}`}>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text)]">Prompt Caching</span>
                <span className="text-[10px] text-[var(--muted)]">~{cacheDiscount * 100}% off cached prompts</span>
              </div>
              {useCaching ? <ToggleRight size={18} className="text-[var(--accent)]" /> : <ToggleLeft size={18} className="text-[var(--muted)]" />}
            </button>
            <button onClick={() => setUseBatch(!useBatch)} className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${useBatch ? "border-[var(--accent)] bg-[var(--accent)]/5" : "border-[var(--muted)]/20 bg-[var(--card-bg)]"}`}>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text)]">Batch Queue (24h)</span>
                <span className="text-[10px] text-[var(--muted)]">50% offpeak discount</span>
              </div>
              {useBatch ? <ToggleRight size={18} className="text-[var(--accent)]" /> : <ToggleLeft size={18} className="text-[var(--muted)]" />}
            </button>
          </div>
        </div>

        {/* Cost Summary */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">Estimated Monthly Spend</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-[var(--text)] font-mono">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-[var(--muted)] font-mono">/ mo</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--muted)]/10 space-y-1.5 text-[11px] text-[var(--muted)] font-mono">
              <div className="flex justify-between">
                <span>Input ({inputMillions}M @ ${effectiveInputRate.toFixed(2)}/1M):</span>
                <span className="text-[var(--text)] font-bold">${inputCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Output ({outputMillions}M @ ${outputRate.toFixed(2)}/1M):</span>
                <span className="text-[var(--text)] font-bold">${outputCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--muted)]/10 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <Server size={14} /><span>Cloud GPU Breakeven Ratio</span>
              </div>
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center bg-[var(--bg)] p-2 rounded border border-[var(--muted)]/10">
                  <span className="text-[var(--text)] font-medium">RunPod RTX 4090 ($316/mo)</span>
                  <span className={`font-mono font-bold ${rtxEquiv >= 1 ? "text-orange-500" : "text-emerald-500"}`}>{rtxEquiv.toFixed(2)}x spend</span>
                </div>
                <div className="flex justify-between items-center bg-[var(--bg)] p-2 rounded border border-[var(--muted)]/10">
                  <span className="text-[var(--text)] font-medium">Lambda 1x H100 ($1,800/mo)</span>
                  <span className={`font-mono font-bold ${h100Equiv >= 1 ? "text-red-500" : "text-emerald-500"}`}>{h100Equiv.toFixed(2)}x spend</span>
                </div>
              </div>

              {isOpenWeights && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
                  {h100Equiv >= 1 
                    ? "🚀 API spend exceeds a dedicated H100 GPU. Self-hosting this open-weights model on dedicated cloud compute will deliver massive cost savings."
                    : "💡 Open-weights model. You can self-host for $0 token API charge or consume via managed serverless endpoints at the rates shown above."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

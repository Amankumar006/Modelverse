"use client";

import React, { useState } from "react";
import { Calculator, Cpu, Zap, Layers, Server, HardDrive, ToggleLeft, ToggleRight } from "lucide-react";
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

export default function ModelCostCalculator({ model }: ModelCostCalculatorProps) {
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  
  const modelName = model.name?.toLowerCase() || "";
  const provider = model.provider ? String(model.provider).toLowerCase() : "";
  const isAnthropic = provider.includes("anthropic") || modelName.includes("claude");
  const isDeepseek = provider.includes("deepseek") || modelName.includes("deepseek");

  const inputRate = typeof pricing.input_per_1m === "number" ? pricing.input_per_1m : parseFloat(String(pricing.input_per_1m || "0")) || 0;
  const outputRate = typeof pricing.output_per_1m === "number" ? pricing.output_per_1m : parseFloat(String(pricing.output_per_1m || "0")) || 0;

  const [inputMillions, setInputMillions] = useState<number>(50);
  const [outputMillions, setOutputMillions] = useState<number>(10);
  const [useCaching, setUseCaching] = useState(false);
  const [useBatch, setUseBatch] = useState(false);

  // Caching discount logic (Anthropic 90% read / DeepSeek 90% disk / OpenAI 50%)
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
          <span>Inference Cost & ROI Engine</span>
        </div>
        <span className="text-[11px] font-mono text-[var(--muted)] bg-[var(--muted)]/10 px-2 py-1 rounded">Enterprise Scale Simulator</span>
      </div>

      {/* Workload Presets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {PRESETS.map(p => (
          <button 
            key={p.name}
            onClick={() => { setInputMillions(p.input); setOutputMillions(p.output); }}
            className="flex items-center gap-2 p-2 rounded-md border border-[var(--muted)]/20 bg-[var(--card-bg)] hover:bg-[var(--muted)]/10 transition-colors text-xs text-left"
          >
            <p.icon size={14} className="text-[var(--accent)]" />
            <span className="font-semibold text-[var(--text)]">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Area */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            {/* Input Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)]">Prompt / Input Volume:</span>
                <span className="font-mono font-bold text-[var(--accent)]">{inputMillions}M Tokens / mo</span>
              </div>
              <input type="range" min="1" max="1000" step="1" value={inputMillions}
                onChange={(e) => setInputMillions(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--muted)]/20"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>1M</span><span>500M</span><span>1B</span>
              </div>
            </div>

            {/* Output Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[var(--text)]">Generated / Output Volume:</span>
                <span className="font-mono font-bold text-[var(--accent)]">{outputMillions}M Tokens / mo</span>
              </div>
              <input type="range" min="1" max="500" step="1" value={outputMillions}
                onChange={(e) => setOutputMillions(Number(e.target.value))}
                className="w-full h-1.5 bg-[var(--card-bg)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] border border-[var(--muted)]/20"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono">
                <span>1M</span><span>250M</span><span>500M</span>
              </div>
            </div>
          </div>

          {/* Pricing Mechanics Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => setUseCaching(!useCaching)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${useCaching ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--muted)]/20 bg-[var(--card-bg)]'}`}
            >
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text)]">Prompt Caching</span>
                <span className="text-[10px] text-[var(--muted)]">~{cacheDiscount * 100}% off read input</span>
              </div>
              {useCaching ? <ToggleRight size={18} className="text-[var(--accent)]" /> : <ToggleLeft size={18} className="text-[var(--muted)]" />}
            </button>
            <button onClick={() => setUseBatch(!useBatch)}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${useBatch ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'border-[var(--muted)]/20 bg-[var(--card-bg)]'}`}
            >
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-[var(--text)]">Batch API (24h)</span>
                <span className="text-[10px] text-[var(--muted)]">50% off total</span>
              </div>
              {useBatch ? <ToggleRight size={18} className="text-[var(--accent)]" /> : <ToggleLeft size={18} className="text-[var(--muted)]" />}
            </button>
          </div>
        </div>

        {/* Cost & ROI Summary Box */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/20 shadow-sm space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] block">Estimated API Spend</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-extrabold text-[var(--text)] font-mono">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                <span className="text-xs text-[var(--muted)] font-mono">/ mo</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--muted)]/10 space-y-1.5 text-[11px] text-[var(--muted)] font-mono">
              <div className="flex justify-between">
                <span>Input ({inputMillions}M):</span>
                <span className="text-[var(--text)]">${inputCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between">
                <span>Output ({outputMillions}M):</span>
                <span className="text-[var(--text)]">${outputCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            {/* Cloud Rent Breakeven */}
            <div className="pt-4 border-t border-[var(--muted)]/10 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                <Server size={14} /><span>{isOpenWeights ? "Cloud GPU Hosting Benchmark" : "Cloud Rent Breakeven"}</span>
              </div>
              
              <div className="space-y-2 text-[11px]">
                <div className="flex justify-between items-center bg-[var(--bg)] p-2 rounded border border-[var(--muted)]/10">
                  <span className="text-[var(--text)] font-semibold">RunPod RTX 4090 <span className="text-[var(--muted)]">($316/mo)</span></span>
                  <span className={`font-mono font-bold ${rtxEquiv > 1 ? 'text-orange-500' : 'text-[var(--muted)]'}`}>
                    {totalCost > 0 ? `${rtxEquiv.toFixed(1)}x` : "$0.44/hr"}
                  </span>
                </div>
                <div className="flex justify-between items-center bg-[var(--bg)] p-2 rounded border border-[var(--muted)]/10">
                  <span className="text-[var(--text)] font-semibold">Lambda H100 <span className="text-[var(--muted)]">($1,800/mo)</span></span>
                  <span className={`font-mono font-bold ${h100Equiv > 1 ? 'text-red-500' : 'text-[var(--muted)]'}`}>
                    {totalCost > 0 ? `${h100Equiv.toFixed(1)}x` : "$2.50/hr"}
                  </span>
                </div>
              </div>
              
              {isOpenWeights && (
                <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-600 font-medium leading-relaxed">
                  {h100Equiv >= 1 
                    ? "API spend exceeds an H100 instance. Deploying this open-weights model on dedicated infrastructure is likely highly ROI positive."
                    : "Open weights distribution: Zero API token fees. Hardware compute cost is governed by your provisioned GPU cloud instance."}
                </div>
              )}
              {!isOpenWeights && h100Equiv >= 1 && (
                <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-600 font-medium leading-relaxed">
                  High API spend detected. Consider exploring open-weights alternatives on dedicated H100s for substantial cost savings.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

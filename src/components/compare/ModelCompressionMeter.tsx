"use client";

import React, { useState } from "react";
import { Cpu, HardDrive, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { ModelRow } from "@/types/models";
import {
  QuantTier,
  QUANT_TIERS,
  HARDWARE_TIERS,
  calculateModelMemoryAndCompression,
  ModelMemoryStats,
} from "@/lib/compare";

interface ModelCompressionMeterProps {
  models: (ModelRow | null)[];
}

export function ModelCompressionMeter({ models }: ModelCompressionMeterProps) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  const [selectedQuant, setSelectedQuant] = useState<QuantTier>("int4");
  const [contextLength, setContextLength] = useState<number>(8192);

  if (activeModels.length === 0) return null;

  const currentQuantInfo = QUANT_TIERS[selectedQuant];

  // Calculate memory stats for each active model
  const modelStats: { model: ModelRow; stats: ModelMemoryStats }[] = activeModels.map((m) => ({
    model: m,
    stats: calculateModelMemoryAndCompression(m, selectedQuant, contextLength),
  }));

  const maxVram = Math.max(
    32,
    ...modelStats.map((ms) => ms.stats.totalVramGb)
  );

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-[var(--muted)]/15 bg-[var(--card-bg)] shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--muted)]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <Cpu size={15} />
            <span>Hardware Math & Model Compression</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
            Quantization Sizing & VRAM Requirement
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Simulate weight compression levels and dynamic KV-cache expansion to verify whether these models fit on your local hardware or cloud GPU cluster.
          </p>
        </div>

        {/* Quantization Stepper */}
        <div className="flex flex-col gap-1.5 self-start md:self-auto">
          <span className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider">
            Quantization Level
          </span>
          <div className="inline-flex rounded-xl bg-[var(--muted)]/10 p-1 border border-[var(--muted)]/10">
            {(Object.keys(QUANT_TIERS) as QuantTier[]).map((tierKey) => {
              const info = QUANT_TIERS[tierKey];
              const isSelected = selectedQuant === tierKey;
              return (
                <button
                  key={tierKey}
                  onClick={() => setSelectedQuant(tierKey)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[var(--accent)] text-white shadow-sm"
                      : "text-[var(--muted)] hover:text-[var(--text)]"
                  }`}
                >
                  {info.label.split(" ")[0]}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quantization Metadata Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[var(--muted)]/5 border border-[var(--muted)]/10 text-xs">
        <div>
          <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Active Precision</div>
          <div className="font-mono font-bold text-[var(--text)] mt-0.5">
            {currentQuantInfo.bits} bits / parameter
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-[var(--muted)]">VRAM Reduction</div>
          <div className="font-mono font-bold text-emerald-500 mt-0.5">
            {currentQuantInfo.compressionPercent > 0
              ? `-${currentQuantInfo.compressionPercent}% vs FP16`
              : "Baseline (0%)"}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Benchmark Retention</div>
          <div className="font-mono font-bold text-[var(--text)] mt-0.5">
            {currentQuantInfo.retention}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase font-bold text-[var(--muted)]">Context Simulator</div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {[4096, 8192, 32768, 131072].map((ctx) => (
              <button
                key={ctx}
                onClick={() => setContextLength(ctx)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold transition-colors ${
                  contextLength === ctx
                    ? "bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/40"
                    : "text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {ctx >= 1000 ? `${(ctx / 1000).toFixed(0)}k` : ctx}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Side-by-Side Model VRAM Footprint Gauges */}
      <div className="flex flex-col gap-5 pt-2">
        <div className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
          Total VRAM Footprint @ {contextLength >= 1000 ? `${(contextLength / 1000).toFixed(0)}k` : contextLength} Context ({currentQuantInfo.label})
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modelStats.map(({ model, stats }, idx) => {
            const barPct = stats.isOpenWeights
              ? Math.min(100, (stats.totalVramGb / maxVram) * 100)
              : 0;

            return (
              <div
                key={model.slug}
                className="flex flex-col gap-3.5 p-5 rounded-xl border border-[var(--muted)]/15 bg-[var(--muted)]/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--muted)]">
                        Model {idx + 1}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[var(--muted)]/10 text-[var(--muted)]">
                        {stats.isOpenWeights ? "Open Weights" : "Cloud Hosted"}
                      </span>
                    </div>
                    <h4 className="text-base sm:text-lg font-bold text-[var(--text)] mt-0.5">
                      {model.name}
                    </h4>
                  </div>

                  <div className="text-right">
                    {stats.isOpenWeights ? (
                      <div>
                        <span className="text-2xl font-black font-mono text-[var(--accent)]">
                          {stats.totalVramGb}
                        </span>
                        <span className="text-xs font-bold text-[var(--muted)] ml-1">GB</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
                        Zero Local VRAM
                      </span>
                    )}
                  </div>
                </div>

                {/* Footprint Bar */}
                {stats.isOpenWeights ? (
                  <div className="space-y-1.5">
                    <div className="h-3 w-full bg-[var(--muted)]/10 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-[var(--accent)] transition-all duration-500 rounded-full"
                        style={{ width: `${barPct}%` }}
                        title={`Weights: ${stats.weightVramGb}GB, KV Cache: ${stats.kvCacheVramGb}GB`}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-[var(--muted)]">
                      <span>Weights: ~{stats.weightVramGb} GB</span>
                      <span>KV Cache: ~{stats.kvCacheVramGb} GB</span>
                      <span>+15% CUDA Buffer</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[var(--muted)]/10 text-xs text-[var(--muted)] flex items-center gap-2">
                    <Info size={14} className="shrink-0 text-blue-400" />
                    <span>Inference runs fully on provider cloud infrastructure. Zero GPU required locally.</span>
                  </div>
                )}

                {/* Specs List */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[var(--muted)]/10">
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Total Params:</span>
                    <div className="font-mono font-bold text-[var(--text)]">
                      {model.parameters || "Proprietary"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Active Compute:</span>
                    <div className="font-mono font-bold text-[var(--text)]">
                      {stats.isMoE ? `${model.active_parameters} (Sparse MoE)` : "Dense"}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Attention Scheme:</span>
                    <div className="font-medium text-[var(--text)]">
                      {stats.attentionType}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--muted)] uppercase font-semibold">Max Context:</span>
                    <div className="font-mono font-bold text-[var(--text)]">
                      {model.context_window ? `${(model.context_window / 1000).toFixed(0)}k tokens` : "N/A"}
                    </div>
                  </div>
                </div>

                {/* Hardware Recommendation */}
                <div className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10 text-xs flex items-center gap-2">
                  <HardDrive size={14} className="shrink-0 text-[var(--accent)]" />
                  <span className="text-[11px] text-[var(--muted)]">
                    Target Hardware:{" "}
                    <strong className="text-[var(--text)] font-semibold">
                      {stats.recommendedHardware}
                    </strong>
                    {stats.recommendedTp > 1 && ` (TP=${stats.recommendedTp})`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hardware Target Matrix Table */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="text-xs font-bold text-[var(--text)] uppercase tracking-wider">
          GPU & Hardware Tier Compatibility Matrix
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--muted)]/10">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--muted)]/10 bg-[var(--muted)]/5 text-[var(--muted)]">
                <th className="py-3 px-4 font-semibold">Hardware Configuration</th>
                <th className="py-3 px-4 font-semibold">Available VRAM</th>
                {modelStats.map(({ model }) => (
                  <th key={model.slug} className="py-3 px-4 font-bold text-[var(--text)]">
                    {model.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--muted)]/10 font-medium">
              {HARDWARE_TIERS.map((tier) => (
                <tr key={tier.id} className="hover:bg-[var(--muted)]/5 transition-colors">
                  <td className="py-3 px-4 text-[var(--text)] font-semibold">
                    <div>{tier.name}</div>
                    <div className="text-[10px] text-[var(--muted)] font-normal">{tier.examples}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[var(--muted)]">
                    {tier.vramGb} GB
                  </td>
                  {modelStats.map(({ model, stats }) => {
                    const status = stats.hardwareFit[tier.id];
                    let badge = (
                      <span className="inline-flex items-center gap-1 text-emerald-500 font-semibold">
                        <CheckCircle size={13} /> Optimal
                      </span>
                    );

                    if (status === "tight") {
                      badge = (
                        <span className="inline-flex items-center gap-1 text-amber-500 font-semibold">
                          <AlertTriangle size={13} /> Tight (Low Ctx)
                        </span>
                      );
                    } else if (status === "oom") {
                      badge = (
                        <span className="inline-flex items-center gap-1 text-rose-500/70">
                          ✕ OOM
                        </span>
                      );
                    } else if (status === "cloud") {
                      badge = (
                        <span className="text-blue-400 font-medium">
                          Cloud API
                        </span>
                      );
                    }

                    return (
                      <td key={model.slug} className="py-3 px-4">
                        {badge}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

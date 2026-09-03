"use client";

import React, { useState } from "react";
import { DollarSign, Server } from "lucide-react";
import { ModelRow } from "@/types/models";

export function InferenceEconomics({
  models,
}: {
  models: (ModelRow | null)[];
}) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  const [monthlyQueries, setMonthlyQueries] = useState<number>(100000); // 100k queries default
  const [avgInputTokens, setAvgInputTokens] = useState<number>(1000); // 1k tokens
  const [avgOutputTokens, setAvgOutputTokens] = useState<number>(300); // 300 tokens

  if (activeModels.length === 0) return null;

  // Monthly token totals
  const totalInputTokensM = (monthlyQueries * avgInputTokens) / 1000000;
  const totalOutputTokensM = (monthlyQueries * avgOutputTokens) / 1000000;

  // Self-hosting estimated GPU cost (e.g. 1x RTX 4090 / L40S at ~$1.20/hr = ~$864/mo)
  const selfHostedGpuCostPerMonth = 864;

  return (
    <div className="flex flex-col gap-6 p-6 sm:p-8 rounded-2xl border border-[var(--muted)]/15 bg-[var(--card-bg)] shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[var(--muted)]/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <DollarSign size={15} />
            <span>Inference Economics & Cost Simulator</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[var(--text)] tracking-tight">
            Token Pricing & Scale Economics
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Calculate estimated monthly cloud API spend and evaluate the breakeven point vs self-hosted GPU hardware.
          </p>
        </div>
      </div>

      {/* Simulator Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[var(--muted)]/5 border border-[var(--muted)]/10 text-xs">
        <div>
          <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
            Monthly Queries: <strong className="text-[var(--text)] font-mono">{monthlyQueries.toLocaleString()}</strong>
          </label>
          <input
            type="range"
            min={10000}
            max={1000000}
            step={10000}
            value={monthlyQueries}
            onChange={(e) => setMonthlyQueries(Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-[var(--muted)] font-mono mt-0.5">
            <span>10k</span>
            <span>500k</span>
            <span>1M</span>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
            Avg Prompt Tokens: <strong className="text-[var(--text)] font-mono">{avgInputTokens}</strong>
          </label>
          <div className="flex items-center gap-1.5 mt-1.5">
            {[500, 1000, 2500, 5000].map((inVal) => (
              <button
                key={inVal}
                onClick={() => setAvgInputTokens(inVal)}
                className={`text-[10px] px-2 py-1 rounded font-mono font-bold transition-colors ${
                  avgInputTokens === inVal
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {inVal}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider block mb-1">
            Avg Output Tokens: <strong className="text-[var(--text)] font-mono">{avgOutputTokens}</strong>
          </label>
          <div className="flex items-center gap-1.5 mt-1.5">
            {[150, 300, 800, 1500].map((outVal) => (
              <button
                key={outVal}
                onClick={() => setAvgOutputTokens(outVal)}
                className={`text-[10px] px-2 py-1 rounded font-mono font-bold transition-colors ${
                  avgOutputTokens === outVal
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)]/10 text-[var(--muted)] hover:text-[var(--text)]"
                }`}
              >
                {outVal}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Matrix Table */}
      <div className="overflow-x-auto rounded-xl border border-[var(--muted)]/10">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[var(--muted)]/10 bg-[var(--muted)]/5 text-[var(--muted)]">
              <th className="py-3 px-4 font-semibold">Pricing Metric</th>
              {activeModels.map((m) => (
                <th key={m.slug} className="py-3 px-4 font-bold text-[var(--text)]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--muted)]/10 font-medium">
            <tr>
              <td className="py-3 px-4 text-[var(--muted)]">Input Cost (/1M tokens)</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const val = priceMap?.input_per_1m;
                return (
                  <td key={m.slug} className="py-3 px-4 font-mono font-semibold text-[var(--text)]">
                    {typeof val === "number" ? `$${val.toFixed(2)}` : typeof val === "string" ? `$${val}` : "Free / Open"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[var(--muted)]">Cached Input (/1M tokens)</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const val = priceMap?.input_cached_per_1m;
                return (
                  <td key={m.slug} className="py-3 px-4 font-mono text-[var(--muted)]">
                    {typeof val === "number" ? `$${val.toFixed(2)}` : typeof val === "string" ? `$${val}` : "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[var(--muted)]">Output Cost (/1M tokens)</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const val = priceMap?.output_per_1m;
                return (
                  <td key={m.slug} className="py-3 px-4 font-mono font-semibold text-[var(--text)]">
                    {typeof val === "number" ? `$${val.toFixed(2)}` : typeof val === "string" ? `$${val}` : "Free / Open"}
                  </td>
                );
              })}
            </tr>
            <tr className="bg-[var(--accent)]/5">
              <td className="py-3 px-4 font-bold text-[var(--accent)]">
                Simulated Monthly Bill ({monthlyQueries.toLocaleString()} calls)
              </td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const inPrice = typeof priceMap?.input_per_1m === "number" ? priceMap.input_per_1m : 0;
                const outPrice = typeof priceMap?.output_per_1m === "number" ? priceMap.output_per_1m : 0;
                const hasPricing = inPrice > 0 || outPrice > 0;
                const monthlyTotal = inPrice * totalInputTokensM + outPrice * totalOutputTokensM;

                return (
                  <td key={m.slug} className="py-3 px-4">
                    {hasPricing ? (
                      <div>
                        <div className="font-mono text-base font-black text-[var(--accent)]">
                          ${monthlyTotal.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">
                          ~${((monthlyTotal / monthlyQueries) * 1000).toFixed(2)} / 1k queries
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="font-mono text-sm font-bold text-emerald-500">
                          $0 API Cost
                        </div>
                        <div className="text-[10px] text-[var(--muted)]">
                          Open Weights
                        </div>
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 px-4 text-[var(--muted)] flex items-center gap-1.5">
                <Server size={14} className="text-[var(--muted)]" />
                <span>Self-Hosted Breakeven vs $864/mo GPU</span>
              </td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const inPrice = typeof priceMap?.input_per_1m === "number" ? priceMap.input_per_1m : 0;
                const outPrice = typeof priceMap?.output_per_1m === "number" ? priceMap.output_per_1m : 0;
                const hasPricing = inPrice > 0 || outPrice > 0;
                const monthlyTotal = inPrice * totalInputTokensM + outPrice * totalOutputTokensM;

                if (!hasPricing) {
                  return (
                    <td key={m.slug} className="py-3 px-4 text-emerald-500 font-semibold">
                      Self-Hostable Day 1
                    </td>
                  );
                }

                const isCheaperSelfHosting = monthlyTotal > selfHostedGpuCostPerMonth;

                return (
                  <td key={m.slug} className="py-3 px-4">
                    {isCheaperSelfHosting ? (
                      <span className="text-amber-500 font-semibold">
                        Self-hosting cheaper at this volume
                      </span>
                    ) : (
                      <span className="text-[var(--muted)] font-normal">
                        Cloud API is more cost effective
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { ModelRow } from "@/types/models";

export function InferenceEconomics({
  models,
}: {
  models: (ModelRow | null)[];
}) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  if (activeModels.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-[var(--muted)]/10 bg-[var(--card-bg)]">
      <h3 className="text-lg font-bold text-[var(--text)]">Inference Economics</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--muted)]/10 text-[var(--muted)] text-xs">
              <th className="pb-3 font-semibold w-1/4">Metric ($/1M tokens)</th>
              {activeModels.map((m) => (
                <th key={m.slug} className="pb-3 font-bold text-[var(--text)]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--muted)]/10">
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Input</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const val = priceMap?.input_per_1m;
                return (
                  <td key={m.slug} className="py-3 font-mono">
                    {typeof val === "number" || typeof val === "string" ? `$${val}` : "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Cached Input</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const val = priceMap?.input_cached_per_1m;
                return (
                  <td key={m.slug} className="py-3 font-mono">
                    {typeof val === "number" || typeof val === "string" ? `$${val}` : "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Output</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const val = priceMap?.output_per_1m;
                return (
                  <td key={m.slug} className="py-3 font-mono">
                    {typeof val === "number" || typeof val === "string" ? `$${val}` : "—"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--accent)]">Est. 50M In / 10M Out</td>
              {activeModels.map((m) => {
                const priceMap = m.pricing as Record<string, unknown> | null;
                const inCost = typeof priceMap?.input_per_1m === "number" ? priceMap.input_per_1m : 0;
                const outCost = typeof priceMap?.output_per_1m === "number" ? priceMap.output_per_1m : 0;
                const total = inCost * 50 + outCost * 10;
                return (
                  <td key={m.slug} className="py-3 font-mono font-bold text-[var(--accent)]">
                    {total > 0 ? `$${total.toFixed(2)}` : "—"}
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

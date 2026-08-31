"use client";

import React from "react";
import { ModelRow } from "@/types/models";

export function HardwareMath({
  models,
}: {
  models: (ModelRow | null)[];
}) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  if (activeModels.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-[var(--muted)]/10 bg-[var(--card-bg)]">
      <h3 className="text-lg font-bold text-[var(--text)]">Hardware & Math</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--muted)]/10 text-[var(--muted)] text-xs">
              <th className="pb-3 font-semibold w-1/4">Metric</th>
              {activeModels.map((m) => (
                <th key={m.slug} className="pb-3 font-bold text-[var(--text)]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--muted)]/10">
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Context Window</td>
              {activeModels.map((m) => (
                <td key={m.slug} className="py-3 font-mono">
                  {m.context_window ? `${(m.context_window / 1000).toFixed(0)}k` : "N/A"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Parameters</td>
              {activeModels.map((m) => (
                <td key={m.slug} className="py-3 font-mono">
                  {m.parameters || "Proprietary"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Est. VRAM (FP16)</td>
              {activeModels.map((m) => {
                let vram = "—";
                if (m.parameters && m.parameters.includes("B")) {
                  const num = parseFloat(m.parameters.replace(/[^0-9.]/g, ""));
                  if (!isNaN(num)) vram = `~${(num * 2).toFixed(1)} GB`;
                }
                return <td key={m.slug} className="py-3 font-mono">{vram}</td>;
              })}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">KV Cache (128k ctx)</td>
              {activeModels.map((m) => {
                let kv = "—";
                if (m.parameters && m.parameters.includes("B")) {
                  const num = parseFloat(m.parameters.replace(/[^0-9.]/g, ""));
                  if (!isNaN(num)) {
                    kv = `~${(num * 0.05).toFixed(1)} GB (est.)`;
                  }
                }
                return <td key={m.slug} className="py-3 font-mono text-xs">{kv}</td>;
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

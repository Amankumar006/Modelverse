"use client";

import React from "react";
import { ModelRow } from "@/types/models";

export function ArchitectureMatrix({
  models,
}: {
  models: (ModelRow | null)[];
}) {
  const activeModels = models.filter((m): m is ModelRow => m !== null);
  if (activeModels.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl border border-[var(--muted)]/10 bg-[var(--card-bg)]">
      <h3 className="text-lg font-bold text-[var(--text)]">Architecture Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--muted)]/10 text-[var(--muted)] text-xs">
              <th className="pb-3 font-semibold w-1/4">Feature</th>
              {activeModels.map((m) => (
                <th key={m.slug} className="pb-3 font-bold text-[var(--text)]">
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--muted)]/10">
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Release Date</td>
              {activeModels.map((m) => (
                <td key={m.slug} className="py-3">
                  {m.release_date ? new Date(m.release_date).toLocaleDateString() : "—"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Routing / MoE</td>
              {activeModels.map((m) => {
                const isMoE = m.active_parameters && m.active_parameters !== m.parameters;
                return (
                  <td key={m.slug} className="py-3">
                    {isMoE ? "Sparse MoE" : "Dense"}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Attention Mechanism</td>
              {activeModels.map((m) => {
                // Heuristic based on description or name
                const text = ((m.description || "") + (m.name || "")).toLowerCase();
                let attn = "Standard / GQA";
                if (text.includes("mla") || text.includes("multi-head latent")) attn = "MLA (Multi-Head Latent)";
                else if (text.includes("mha")) attn = "MHA";
                
                return (
                  <td key={m.slug} className="py-3">
                    {attn}
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="py-3 font-medium text-[var(--muted)]">Source Type</td>
              {activeModels.map((m) => (
                <td key={m.slug} className="py-3">
                  {m.source_type || "Proprietary"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

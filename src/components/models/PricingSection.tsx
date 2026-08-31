"use client";

import React from "react";
import { DollarSign } from "lucide-react";
import type { ModelRow } from "@/types/database";
import ModelCostCalculator from "@/components/models/ModelCostCalculator";

interface PricingSectionProps {
  model: ModelRow;
}

export default function PricingSection({ model }: PricingSectionProps) {
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const isOpenWeights = model.source_type && model.source_type.toLowerCase().includes("open");
  const hasPricing = pricing.input_per_1m !== undefined || pricing.output_per_1m !== undefined;

  return (
    <section id="pricing" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <DollarSign size={14} />
        <span>Commercial Rates &amp; Inference Costs</span>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-4">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
            API &amp; Deployment Pricing
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            {isOpenWeights
              ? "Open-weights model available for local and private cloud deployment. Compute costs depend on the target GPU hardware instance."
              : "Standard API consumption rates per million tokens as indexed from official laboratory pricing documentation."}
          </p>
        </div>

        {hasPricing ? (
          <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[var(--muted)]/10 bg-[var(--bg)]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-[var(--muted)]/10 bg-[var(--accent-soft)]/20 text-[var(--text)] font-bold">
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Usage Tier</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Rate / Unit</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] hidden sm:table-cell">Billing Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]/10">
                {pricing.input_per_1m !== undefined && (
                  <tr className="hover:bg-[var(--card-bg)] transition-colors">
                    <td className="p-3.5 font-semibold text-[var(--text)]">Prompt / Input Tokens</td>
                    <td className="p-3.5 font-mono font-bold text-[var(--accent)] text-sm">
                      ${pricing.input_per_1m} <span className="text-xs font-normal text-[var(--muted)]">/ 1M tokens</span>
                    </td>
                    <td className="p-3.5 text-xs text-[var(--muted)] hidden sm:table-cell">Standard Context Window Input</td>
                  </tr>
                )}
                {pricing.output_per_1m !== undefined && (
                  <tr className="hover:bg-[var(--card-bg)] transition-colors">
                    <td className="p-3.5 font-semibold text-[var(--text)]">Completion / Output Tokens</td>
                    <td className="p-3.5 font-mono font-bold text-[var(--accent)] text-sm">
                      ${pricing.output_per_1m} <span className="text-xs font-normal text-[var(--muted)]">/ 1M tokens</span>
                    </td>
                    <td className="p-3.5 text-xs text-[var(--muted)] hidden sm:table-cell">Generated Output Response</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-control)] border border-[var(--muted)]/10 bg-[var(--bg)]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-[var(--muted)]/10 bg-[var(--accent-soft)]/20 text-[var(--text)] font-bold">
                <tr>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Deployment Tier</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px]">Pricing Structure</th>
                  <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] hidden sm:table-cell">Distribution Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]/10">
                <tr className="hover:bg-[var(--card-bg)] transition-colors">
                  <td className="p-3.5 font-semibold text-[var(--text)]">
                    {isOpenWeights ? "Open Checkpoint Weights" : "Managed Vendor API"}
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-500 text-sm">
                    {isOpenWeights ? "$0.00 (Free Download)" : "Enterprise Quota"}
                  </td>
                  <td className="p-3.5 text-xs text-[var(--muted)] hidden sm:table-cell">
                    {isOpenWeights ? "Self-hosted on private GPU instances" : "Available via vendor developer console"}
                  </td>
                </tr>
                <tr className="hover:bg-[var(--card-bg)] transition-colors">
                  <td className="p-3.5 font-semibold text-[var(--text)]">Inference Token Consumption</td>
                  <td className="p-3.5 font-mono font-bold text-[var(--accent)] text-sm">
                    {isOpenWeights ? "$0.00 / Token" : "Volume-Based SLA"}
                  </td>
                  <td className="p-3.5 text-xs text-[var(--muted)] hidden sm:table-cell">
                    {isOpenWeights ? "Zero per-token billing; compute costs governed by GPU hardware" : "Custom volume licensing from provider"}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Embedded Interactive Cost Calculator */}
        <ModelCostCalculator model={model} />
      </div>
    </section>
  );
}

"use client";

import React from "react";
import { normalizePricing, type NormalizedPricingItem } from "@/lib/model-normalization";
import { DollarSign, Clock } from "lucide-react";

interface PricingSectionProps {
  pricing: unknown;
  pricingLastVerified?: string | null;
  costTiers?: { id: string; label: string; description?: string }[];
  modelType?: string;
}

export default function PricingSection({ pricing, pricingLastVerified, costTiers, modelType }: PricingSectionProps) {
  const items: NormalizedPricingItem[] = normalizePricing(pricing);
  const isOpenWeights = modelType === "open-source" || modelType === "open-weights";

  return (
    <section id="pricing" className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
            <DollarSign size={14} />
            <span>Commercial Rates &amp; Token Costs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
            API Pricing
          </h2>
        </div>

        {pricingLastVerified && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted)] bg-[var(--card-bg)] px-2.5 py-1 rounded-[var(--radius-control)] border border-[var(--muted)]/10">
            <Clock size={12} />
            <span>Last verified: {new Date(pricingLastVerified).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-center space-y-2">
          <p className="text-sm font-semibold text-[var(--text)]">
            {isOpenWeights ? "Open Weights / Self-Hostable" : "Pricing not publicly listed."}
          </p>
          <p className="text-xs text-[var(--muted)]">
            {isOpenWeights
              ? "This model is available for local and self-hosted inference. Compute costs depend on the target hardware deployment format."
              : "No public pay-per-token API rates have been officially published or indexed for this model."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)] leading-relaxed">
            Standard inference rates, prompt caching discounts, and long-context surcharges as published in official developer pricing schedules.
          </p>

          {/* Structured Pricing Table */}
          <div className="overflow-x-auto rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
                <tr>
                  <th className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px]">Usage Tier</th>
                  <th className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px]">Rate / Unit</th>
                  <th className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] hidden md:table-cell">Price (USD)</th>
                  <th className="p-3.5 text-left font-bold uppercase tracking-wider text-[11px] pr-4">Details &amp; Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]/10 font-normal">
                {items.map((item, idx) => {
                  return (
                    <tr key={idx} className="hover:bg-[var(--bg)]/50 transition-colors">
                      {/* Tier */}
                      <td className="p-3.5">
                        <span className="font-bold text-[var(--text)] capitalize block">
                          {item.tier || "Standard API"}
                        </span>
                        <span className="text-[11px] text-[var(--muted)] font-mono">{item.unit}</span>
                      </td>

                      {/* Rate */}
                      <td className="p-3.5 font-mono tabular-nums font-extrabold text-[var(--accent)] text-sm sm:text-base">
                        ${item.amount.toFixed(item.amount < 0.01 ? 4 : 2)} <span className="text-xs font-normal text-[var(--muted)]">{item.currency}</span>
                      </td>

                      {/* Formatted Text */}
                      <td className="p-3.5 font-mono text-xs text-[var(--muted)] hidden md:table-cell">
                        ${item.amount} / {item.unit}
                      </td>

                      {/* Notes */}
                      <td className="p-3.5 text-xs text-[var(--muted)] pr-4">
                        {item.notes ? (
                          <span>{item.notes}</span>
                        ) : (
                          <span className="text-[var(--muted)]/60">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cost Tiers Description (if provided) */}
          {costTiers && costTiers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {costTiers.map((tier) => (
                <div key={tier.id} className="p-3 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-1 text-xs">
                  <span className="font-bold text-[var(--text)] block">{tier.label}</span>
                  {tier.description && <p className="text-[11px] text-[var(--muted)] leading-relaxed">{tier.description}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

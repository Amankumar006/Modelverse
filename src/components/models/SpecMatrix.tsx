"use client";

import React from "react";
import { Cpu, Layers, DollarSign, Globe, HardDrive, Sparkles } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface SpecMatrixProps {
  model: ModelRow;
}

export default function SpecMatrix({ model }: SpecMatrixProps) {
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const modalities = Array.isArray(model.modalities) ? model.modalities : ["text"];

  const cards = [
    {
      icon: Cpu,
      label: "Context Window",
      value: model.context_window ? `${model.context_window.toLocaleString("en-US")} tokens` : "Standard",
      subtext: model.context_window && model.context_window >= 1_000_000 ? "Frontier 1M+ Buffer" : "Input Capacity",
    },
    {
      icon: Layers,
      label: "Total Parameters",
      value: model.parameters || "Proprietary",
      subtext: "Architecture Size",
    },
    {
      icon: Sparkles,
      label: "Active Parameters",
      value: model.active_parameters || model.parameters || "Dense",
      subtext: model.active_parameters ? "MoE Sparse Routing" : "Dense Execution",
    },
    {
      icon: HardDrive,
      label: "Weights Size",
      value: model.weights_size || "Cloud Hosted API",
      subtext: model.weights_size ? "Storage Footprint" : "Serverless API",
    },
    {
      icon: DollarSign,
      label: "API Pricing (1M in)",
      value: pricing.input_per_1m !== undefined ? `$${pricing.input_per_1m}` : "Open / Free",
      subtext: pricing.output_per_1m !== undefined ? `$${pricing.output_per_1m} / 1M out` : "Self-Hosted",
    },
    {
      icon: Globe,
      label: "Supported Modalities",
      value: modalities.join(", "),
      subtext: `${modalities.length} Modalities`,
    },
  ];

  return (
    <section id="specifications" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Sparkles size={14} />
        <span>Technical Architecture &amp; Lineage Specifications</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.label}
              className="p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 flex flex-col justify-between space-y-2 hover:border-[var(--accent)]/30 transition-colors"
            >
              <div>
                <div className="flex items-center gap-1.5 text-[var(--muted)] text-[11px] font-medium mb-1">
                  <Icon size={13} className="text-[var(--accent)]" />
                  <span>{c.label}</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[var(--text)] font-mono capitalize truncate">
                  {c.value}
                </p>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono">{c.subtext}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

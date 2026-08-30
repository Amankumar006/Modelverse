"use client";

import React from "react";
import { Cpu, Layers, HardDrive, ShieldCheck, Sparkles, DollarSign } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface LineageSpecSectionProps {
  model: ModelRow;
}

export default function LineageSpecSection({ model }: LineageSpecSectionProps) {
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const modalities = Array.isArray(model.modalities) ? model.modalities : ["text"];
  const formattedContext = model.context_window
    ? `${model.context_window.toLocaleString("en-US")} tokens`
    : "Standard";

  return (
    <section id="specifications" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Sparkles size={14} />
        <span>Technical Architecture &amp; Execution Specifications</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Overview & Lineage */}
        <div className="lg:col-span-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--muted)]/10 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] block">
              Architecture Overview
            </span>
            <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
              {model.name}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed font-normal">
              {model.description || `Technical profile and hardware execution specifications for ${model.name} by ${model.provider}.`}
            </p>
          </div>

          <div className="space-y-3 pt-4 border-t border-[var(--muted)]/10 text-xs">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[var(--muted)] block">
              Supported Modalities
            </span>
            <div className="flex flex-wrap gap-1.5">
              {modalities.map((m) => (
                <span
                  key={String(m)}
                  className="px-2.5 py-1 rounded-[var(--radius-pill)] bg-[var(--bg)] text-[var(--text)] border border-[var(--muted)]/15 font-mono text-[11px] capitalize font-medium"
                >
                  {String(m)}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Specifications Table */}
        <div className="lg:col-span-7 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-6 border border-[var(--muted)]/10 space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-bold text-[var(--muted)] border-b border-[var(--muted)]/10 pb-3 flex items-center justify-between">
            <span>Hardware &amp; Execution Parameters</span>
            <span className="text-[11px] font-mono text-[var(--accent)] font-semibold">
              {model.category || "LLM"}
            </span>
          </h3>

          <div className="space-y-3.5 text-xs">
            {/* Total Parameters */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-2">
                <Layers size={14} className="text-[var(--accent)]" />
                Total Parameter Count
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                {model.parameters || "Proprietary"}
              </span>
            </div>

            {/* Active Parameters (MoE) */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-2">
                <Sparkles size={14} className="text-[var(--accent)]" />
                Active Parameters (MoE)
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                {model.active_parameters ? `${model.active_parameters} per token` : "Dense Architecture"}
              </span>
            </div>

            {/* Context Window */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-2">
                <Cpu size={14} className="text-[var(--accent)]" />
                Context Window Capacity
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                {formattedContext}
              </span>
            </div>

            {/* Weights Size */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-2">
                <HardDrive size={14} className="text-[var(--accent)]" />
                Model Weights Footprint
              </span>
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                {model.weights_size || "Cloud Hosted API"}
              </span>
            </div>

            {/* License & Source */}
            <div className="flex items-center justify-between py-2 border-b border-[var(--muted)]/10">
              <span className="text-[var(--muted)] font-medium flex items-center gap-2">
                <ShieldCheck size={14} className="text-[var(--accent)]" />
                Distribution License
              </span>
              <span className="font-bold text-xs text-[var(--text)]">
                {model.source_type || "Proprietary Commercial"}
              </span>
            </div>

            {/* API Pricing Summary */}
            <div className="flex items-center justify-between py-2">
              <span className="text-[var(--muted)] font-medium flex items-center gap-2">
                <DollarSign size={14} className="text-[var(--accent)]" />
                Standard API Pricing (1M Tokens)
              </span>
              <span className="font-mono font-bold text-xs text-[var(--accent)]">
                {pricing.input_per_1m !== undefined
                  ? `$${pricing.input_per_1m} in / $${pricing.output_per_1m ?? "—"} out`
                  : "Free / Self-Hosted"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

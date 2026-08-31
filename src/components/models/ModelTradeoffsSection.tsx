"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Scale, ShieldAlert, Sparkles } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { normalizeBenchmarks } from "@/lib/benchmarks";

interface ModelTradeoffsSectionProps {
  model: ModelRow;
}

export default function ModelTradeoffsSection({ model }: ModelTradeoffsSectionProps) {
  const isMoE = Boolean(model.active_parameters);
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  const contextNum = model.context_window || 8192;
  const isLongContext = contextNum >= 128000;
  const benchmarks = normalizeBenchmarks(model.benchmarks);
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;

  // Dynamically derive key strengths
  const strengths: string[] = [];
  if (isLongContext) {
    strengths.push(`Extensive ${contextNum.toLocaleString()}-token context window enabling full codebase and long document ingestion.`);
  } else {
    strengths.push(`Optimized ${contextNum.toLocaleString()}-token context window designed for low-latency interactive agent loops.`);
  }

  if (isMoE) {
    strengths.push(`Sparse Mixture-of-Experts routing (${model.active_parameters} active) delivers frontier knowledge at reduced compute cost.`);
  } else {
    strengths.push(`Dense transformer architecture ensures high parameter coherence and deterministic mathematical representations.`);
  }

  if (isOpenWeights) {
    strengths.push("Open weights distribution permits on-premise hosting, fine-tuning, private VPC execution, and full data sovereignty.");
  } else {
    strengths.push("Managed cloud API infrastructure provides elastic auto-scaling, high concurrency SLAs, and zero infrastructure maintenance.");
  }

  if (benchmarks.length > 0) {
    const topBench = benchmarks[0];
    strengths.push(`Demonstrated ${topBench.name} evaluation score of ${topBench.score}${typeof topBench.score === "number" ? "%" : ""} in verified benchmarks.`);
  }

  if (pricing.input_per_1m !== undefined && Number(pricing.input_per_1m) < 1.0) {
    strengths.push(`Cost-effective inference economics at $${pricing.input_per_1m}/1M input tokens for high-volume production throughput.`);
  }

  // Dynamically derive key considerations / production trade-offs
  const tradeOffs: string[] = [];
  if (isOpenWeights) {
    tradeOffs.push("Requires dedicated GPU VRAM provisioning, Kubernetes/vLLM orchestration, and self-managed uptime monitoring.");
  } else {
    tradeOffs.push("Subject to third-party vendor rate limits, external API network latency, and platform terms of service.");
  }

  if (isLongContext) {
    tradeOffs.push("Full-context attention passes increase KV cache memory consumption exponentially without PagedAttention or chunked prefill.");
  }

  if (isMoE) {
    tradeOffs.push("Sparse routing requires high memory bandwidth and all-to-all communication primitives across distributed GPU clusters.");
  }

  if (!isOpenWeights && pricing.output_per_1m !== undefined && Number(pricing.output_per_1m) >= 5.0) {
    tradeOffs.push(`Premium completion tier at $${pricing.output_per_1m}/1M output tokens requires output token budgeting for agent loops.`);
  }

  if (tradeOffs.length < 3) {
    tradeOffs.push("Non-deterministic reasoning chains require validation checks or schema enforcement for safety-critical pipelines.");
  }

  return (
    <section id="tradeoffs" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Scale size={14} />
        <span>Production Trade-Offs &amp; Capability Balance</span>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Architectural Strengths vs. Considerations
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            An objective balance sheet analyzing the operational advantages and production constraints of deploying <strong>{model.name}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Strengths Column */}
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-emerald-500/20 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-500">
              <Sparkles size={16} />
              <h4>Key Architectural Strengths</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--muted)]">
              {strengths.slice(0, 4).map((str, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-[var(--text)]">{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Trade-offs Column */}
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-amber-500/20 space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-500">
              <ShieldAlert size={16} />
              <h4>Operational Considerations</h4>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--muted)]">
              {tradeOffs.slice(0, 4).map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 leading-relaxed">
                  <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[var(--text)]">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

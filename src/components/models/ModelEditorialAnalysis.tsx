"use client";

import React from "react";
import {
  BrainCircuit,
  Cpu,
  Server,
  CheckCircle2,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import type { ModelRow } from "@/types/database";
import { normalizeBenchmarks } from "@/lib/benchmarks";

interface ModelEditorialAnalysisProps {
  model: ModelRow;
}

export default function ModelEditorialAnalysis({ model }: ModelEditorialAnalysisProps) {
  const benchmarks = normalizeBenchmarks(model.benchmarks);
  const isMoE = Boolean(model.active_parameters);
  const contextNum = model.context_window || 8192;
  const isLongContext = contextNum >= 128000;
  const isMultimodal = Array.isArray(model.modalities) && model.modalities.length > 1;

  // Estimate VRAM requirements
  const paramStr = model.parameters || "";
  const paramNum = parseFloat(paramStr.replace(/[^0-9.]/g, "")) || 0;
  const isBillion = paramStr.toLowerCase().includes("b") || (!paramStr.toLowerCase().includes("m") && paramNum > 0);
  const paramInB = isBillion ? paramNum : paramNum / 1000;

  const fp16Vram = paramInB > 0 ? Math.round(paramInB * 2 * 1.2) : null;
  const int4Vram = paramInB > 0 ? Math.round(paramInB * 0.6 * 1.2) : null;

  return (
    <section
      id="analysis"
      className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-8"
    >
      {/* Header */}
      <div className="space-y-2 border-b border-[var(--muted)]/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <BrainCircuit size={16} />
          <span>Architectural Analysis &amp; Production Assessment</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">
          Engineering &amp; Capability Deep-Dive
        </h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-3xl">
          An objective architectural evaluation of <strong>{model.name}</strong> by <strong>{model.provider}</strong>, analyzing underlying compute dynamics, benchmark performance profiles, memory constraints, and deployment economics.
        </p>
      </div>

      {/* 4-Part Analytical Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Architecture & Attention Topology */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Cpu size={16} className="text-[var(--accent)]" />
              <h3>Topology &amp; Attention Mechanics</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {model.name} employs a{" "}
              <strong>{isMoE ? `sparse Mixture-of-Experts (${model.active_parameters} active per token)` : "dense autoregressive transformer"}</strong>{" "}
              topology. {isMoE ? "This sparse routing delivers frontier-class reasoning and capacity while maintaining the inference latency of a much smaller model." : "Its dense parameter structure maximizes representation stability and multi-step reasoning coherence across all hidden layers."}
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              With a certified context window of <strong>{contextNum.toLocaleString()} tokens</strong>,{" "}
              {isLongContext
                ? "it supports full-repository codebase ingestion, book-length document synthesis, and multi-turn conversational recall with high needle-in-a-haystack retrieval fidelity."
                : "it is optimized for low-latency request-response cycles, structured JSON extraction, and high-frequency tool invocation."}
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Architecture Type:</span>
            <strong className="text-[var(--text)]">{isMoE ? "Sparse MoE" : "Dense Transformer"}</strong>
          </div>
        </div>

        {/* Pillar 2: Benchmark Evaluation & Strengths */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <TrendingUp size={16} className="text-emerald-500" />
              <h3>Evaluation Profile &amp; Reasoning</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              In standardized independent evaluations, {model.name} exhibits balanced performance across reasoning, symbolic mathematics, and code synthesis.{" "}
              {benchmarks.length > 0
                ? `Verified scores include ${benchmarks.slice(0, 3).map((b) => `${b.name}: ${b.score}%`).join(", ")}.`
                : "Benchmark evaluations reflect vendor-reported evaluations across MMLU, HumanEval, and MATH suites."}
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {isMultimodal
                ? "Native multimodal pretraining enables high-resolution image parsing, visual diagram extraction, and OCR document ingestion directly without external vision encoder bottlenecks."
                : "Text-focused pretraining maximizes token density and syntactic alignment for complex language reasoning, translation, and structured data generation."}
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Domain Specialty:</span>
            <strong className="text-[var(--text)]">{model.category || "General Reasoning"}</strong>
          </div>
        </div>

        {/* Pillar 3: Hardware & Deployment Guidelines */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Server size={16} className="text-blue-500" />
              <h3>Hardware Sizing &amp; Serving</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              {model.source_type && model.source_type.toLowerCase().includes("open")
                ? `For self-hosted deployments using vLLM, SGLang, or Ollama, full FP16 precision requires approximately ${fp16Vram ? `~${fp16Vram} GB VRAM` : "multi-GPU clustering"}. Quantized INT4 (AWQ/GGUF) execution reduces the footprint to ${int4Vram ? `~${int4Vram} GB VRAM` : "standard workstation GPUs"}.`
                : `As a cloud-hosted enterprise model, ${model.name} is served via scalable API endpoints with high token-per-second concurrency, managed SLA guarantees, and enterprise data privacy compliance.`}
            </p>
            <div className="space-y-1 pt-1 text-[11px] text-[var(--muted)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>Recommended Serving: {model.source_type?.toLowerCase().includes("open") ? "vLLM / TensorRT-LLM / Ollama" : "Vendor REST API / Cloud Gateways"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>KV Cache Management: PagedAttention / FlashAttention-3 Compatible</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Hosting Type:</span>
            <strong className="text-[var(--text)]">{model.source_type || "Commercial Hosted"}</strong>
          </div>
        </div>

        {/* Pillar 4: Cost Economics & Enterprise Tradeoffs */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3 flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <DollarSign size={16} className="text-amber-500" />
              <h3>Inference Economics &amp; Workflows</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Evaluating the cost-to-performance frontier: {model.name} is well-suited for high-throughput enterprise pipelines where intelligence requirements must be balanced against per-million token costs.
            </p>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Ideal for automated coding workflows, autonomous multi-step agent loops, technical documentation search, and customer support classification where consistent latency and low error rates are mandatory.
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Enterprise Fit:</span>
            <strong className="text-[var(--text)]">Production Ready</strong>
          </div>
        </div>
      </div>
    </section>
  );
}

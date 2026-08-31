"use client";

import React from "react";
import { CheckCircle2, AlertCircle, Scale, ShieldAlert, Sparkles } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { normalizeBenchmarks } from "@/lib/benchmarks";

interface ModelTradeoffsSectionProps {
  model: ModelRow;
}

export default function ModelTradeoffsSection({ model }: ModelTradeoffsSectionProps) {
  const name = model.name.toLowerCase();
  const provider = (model.provider || "").toLowerCase();
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const benchmarks = normalizeBenchmarks(model.benchmarks);

  // Detect Architectures
  const isDeepSeek = name.includes("deepseek");
  const isClaude = name.includes("claude");
  const isOpenAI = provider.includes("openai") || name.includes("gpt") || name.includes("o1") || name.includes("o3");
  const isLlama = name.includes("llama");
  const isQwen = name.includes("qwen");
  const isMistral = name.includes("mistral") || name.includes("mixtral");

  const strengths: string[] = [];
  const tradeOffs: string[] = [];

  // 1. DeepSeek
  if (isDeepSeek) {
    strengths.push("Multi-Head Latent Attention (MLA) with 512-dim compressed KV vector reduces cache footprint dramatically.");
    strengths.push("DeepSeekMoE (256 routed experts, 8 active) and GRPO optimize reasoning performance per watt.");
    tradeOffs.push("Complex MoE topology demands sophisticated all-to-all communication primitives across GPU clusters.");
  }
  // 2. Claude
  else if (isClaude) {
    strengths.push("Hybrid reasoning mode with toggleable thinking budget excels at high-density code and agentic tool synthesis.");
    strengths.push("Native computer use capabilities and precise JSON generation streamline autonomous agent loops.");
    tradeOffs.push("Advanced agentic capabilities (e.g. computer use) mandate rigorous sandbox isolation and strict IAM boundaries.");
  }
  // 3. OpenAI
  else if (isOpenAI) {
    strengths.push("Omni multimodal unified encoder with test-time compute scaling (CoT reasoning tokens) maxes out complex problem solving.");
    strengths.push("Exceptional adherence to structured JSON schemas accelerates integration into deterministic enterprise pipelines.");
    tradeOffs.push("Autoregressive CoT reasoning tokens can increase Time-to-First-Byte (TTFB) and inflate output token budgets unpredictably.");
  }
  // 4. Llama
  else if (isLlama) {
    strengths.push("Dense Grouped-Query Attention (GQA 8:1) and 128k RoPE scaling ensures robust multi-step coherence.");
    strengths.push("Trained on a massive 15T+ token corpus, offering premier baseline intelligence for open weights.");
    tradeOffs.push("Dense attention footprint saturates memory bandwidth heavily during large-batch autoregressive decoding.");
  }
  // 5. Qwen
  else if (isQwen) {
    strengths.push("Specialized Code & Math synthesis backed by a highly efficient 152k multi-lingual tokenization vocabulary.");
    tradeOffs.push("Extensive vocabulary embedding tables increase static parameter VRAM overhead before KV cache allocation.");
  }
  // 6. Mistral / Mixtral
  else if (isMistral) {
    strengths.push("Sliding Window Attention (SWA) and byte-fallback BPE optimize unpadded token batching for extreme throughput.");
    tradeOffs.push("SWA limits exact dense attention past the sliding window size, slightly affecting ultra-long context exact retrieval.");
  }

  // General Fallbacks
  if (model.context_window && model.context_window >= 128000) {
    strengths.push(`Massive ${model.context_window.toLocaleString()}-token context allows full-repository and book-length ingestion.`);
    tradeOffs.push("128k+ token prefill stages become heavily compute-bound and balloon KV cache without PagedAttention chunking.");
  }
  if (pricing.input_per_1m !== undefined && Number(pricing.input_per_1m) < 0.5) {
    strengths.push(`Ultra cost-effective inference at $${pricing.input_per_1m}/1M input tokens enables high-frequency agent loops.`);
  }

  if (benchmarks.length > 0) {
    const topBench = benchmarks[0];
    strengths.push(`Demonstrated ${topBench.name} evaluation score of ${topBench.score}${typeof topBench.score === "number" ? "%" : ""} in verified benchmarks.`);
  }

  // Ensure minimums
  if (strengths.length === 0) strengths.push("Optimized architecture balances multi-turn conversational recall with low-latency generation.");
  if (tradeOffs.length === 0) tradeOffs.push("Non-deterministic reasoning chains require schema validation in safety-critical deployments.");

  return (
    <section id="tradeoffs" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Scale size={14} />
        <span>Production Trade-Offs & Capability Balance</span>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">Architectural Strengths vs. Considerations</h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            An objective balance sheet analyzing the operational advantages and production constraints of deploying <strong>{model.name}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

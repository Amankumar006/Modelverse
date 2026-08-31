"use client";

import React from "react";
import { BrainCircuit, Cpu, Server, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface ModelEditorialAnalysisProps {
  model: ModelRow;
}

export default function ModelEditorialAnalysis({ model }: ModelEditorialAnalysisProps) {
  const name = model.name.toLowerCase();
  const provider = (model.provider || "").toLowerCase();

  const isDeepSeek = name.includes("deepseek");
  const isClaude = name.includes("claude");
  const isOpenAI = provider.includes("openai") || name.includes("gpt") || name.includes("o1") || name.includes("o3");
  const isLlama = name.includes("llama");
  const isQwen = name.includes("qwen");
  const isMistral = name.includes("mistral") || name.includes("mixtral");

  // Determine Topology & Attention Mechanics text
  let topologyText = "A robust autoregressive transformer utilizing standard attention patterns for predictable and coherent token generation.";
  if (isDeepSeek) topologyText = "Employs Multi-Head Latent Attention (MLA) with a 512-dim compressed KV vector and DeepSeekMoE (256 routed experts, 8 active, 1 shared) for exceptional sparsity and low memory overhead.";
  else if (isClaude) topologyText = "Utilizes a highly optimized hybrid reasoning mode with a toggleable thinking budget, tailored for high-density tool synthesis and exact state routing.";
  else if (isOpenAI) topologyText = "Features an Omni multimodal unified encoder capable of test-time compute scaling via explicit Chain-of-Thought (CoT) reasoning tokens.";
  else if (isLlama) topologyText = "A dense architecture leveraging Grouped-Query Attention (GQA, 8:1 ratio) and 128k RoPE scaling, pre-trained on a massive 15T token corpus.";
  else if (isQwen) topologyText = "An advanced dense model specializing in Code & Math synthesis, powered by a vast 152k multi-lingual tokenization vocabulary.";
  else if (isMistral) topologyText = "Optimizes context handling via Sliding Window Attention (SWA) and byte-fallback BPE for unpadded token batching efficiency.";

  let hardwareText = model.source_type?.toLowerCase().includes("open") 
    ? "For open deployments via vLLM/SGLang, quantization (INT4/AWQ) is heavily recommended to fit dense memory constraints, or multi-GPU pipeline parallelism for full FP16."
    : "Served via scalable API endpoints guaranteeing high tokens-per-second concurrency and enterprise SLAs.";
  
  if (isDeepSeek) hardwareText = "Serving DeepSeek MoE optimally requires vLLM or SGLang with tensor parallelism. MLA reduces KV cache size heavily, freeing up VRAM for huge batch sizes during serving.";
  else if (isLlama) hardwareText = "Llama's dense GQA structure scales quadratically. 128k context demands PagedAttention and chunked prefill to prevent Out-of-Memory (OOM) during heavy batched decoding.";

  let economicsText = "Well-suited for enterprise pipelines where capability is balanced against per-million token costs.";
  if (isOpenAI) economicsText = "Reasoning tokens dynamically scale compute on hard problems. Expect higher output costs and varied TTFB, offset by massive reductions in hallucination rates.";
  else if (isClaude) economicsText = "Thinking budgets allow cost/latency control. Dominant in zero-shot agentic loops and massive automated refactoring tasks where accuracy is paramount.";
  
  return (
    <section id="analysis" className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-8">
      <div className="space-y-2 border-b border-[var(--muted)]/10 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <BrainCircuit size={16} />
          <span>Architectural Analysis & Production Assessment</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight">Engineering & Capability Deep-Dive</h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-3xl">
          An objective architectural evaluation of <strong>{model.name}</strong> by <strong>{model.provider}</strong>, analyzing underlying compute dynamics, memory constraints, and deployment economics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1 */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 flex flex-col justify-between">
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Cpu size={16} className="text-[var(--accent)]" />
              <h3>Topology & Attention Mechanics</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{topologyText}</p>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Architecture Type:</span>
            <strong className="text-[var(--text)]">Advanced Transformer</strong>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 flex flex-col justify-between">
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <TrendingUp size={16} className="text-emerald-500" />
              <h3>Evaluation Profile & Reasoning</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">
              Exhibits frontier-tier behavior in reasoning and coding. {isDeepSeek && "GRPO training enables robust self-verification."} {isClaude && "Excels in complex multi-file codebase understanding."} {isOpenAI && "World-class step-by-step mathematical extraction."}
            </p>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Domain Specialty:</span>
            <strong className="text-[var(--text)]">{model.category || "General Reasoning"}</strong>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 flex flex-col justify-between">
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <Server size={16} className="text-blue-500" />
              <h3>Hardware Sizing & Serving</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{hardwareText}</p>
            <div className="space-y-1 pt-1 text-[11px] text-[var(--muted)]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
                <span>KV Cache Mgmt: PagedAttention / FlashAttention-3</span>
              </div>
            </div>
          </div>
          <div className="pt-2 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] font-mono text-[var(--muted)]">
            <span>Hosting Type:</span>
            <strong className="text-[var(--text)]">{model.source_type || "Commercial Hosted"}</strong>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-5 sm:p-6 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 flex flex-col justify-between">
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
              <DollarSign size={16} className="text-amber-500" />
              <h3>Inference Economics & Workflows</h3>
            </div>
            <p className="text-xs text-[var(--muted)] leading-relaxed">{economicsText}</p>
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

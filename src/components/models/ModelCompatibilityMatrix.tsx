"use client";

import React from "react";
import { Server, Cpu, Check, Layers, Zap } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface ModelCompatibilityMatrixProps {
  model: ModelRow;
}

export default function ModelCompatibilityMatrix({ model }: ModelCompatibilityMatrixProps) {
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  const paramStr = model.parameters || "";
  const paramNum = parseFloat(paramStr.replace(/[^0-9.]/g, "")) || 0;
  const isBillion = paramStr.toLowerCase().includes("b") || (!paramStr.toLowerCase().includes("m") && paramNum > 0);
  const paramInB = isBillion ? paramNum : paramNum / 1000;

  // Calculate VRAM tier
  let hardwareTier = "Cloud Hosted API (Zero Local VRAM)";
  let hardwareColor = "text-[var(--accent)]";
  if (isOpenWeights) {
    if (paramInB <= 8) {
      hardwareTier = "Consumer GPU (< 16 GB VRAM — RTX 4070/4080/Mac M-series)";
      hardwareColor = "text-emerald-500";
    } else if (paramInB <= 32) {
      hardwareTier = "Prosumer GPU (24–48 GB VRAM — RTX 4090 / 2x 3090 / Mac M3 Max)";
      hardwareColor = "text-blue-500";
    } else if (paramInB <= 72) {
      hardwareTier = "Datacenter GPU (80–160 GB VRAM — 1x/2x NVIDIA A100/H100)";
      hardwareColor = "text-amber-500";
    } else {
      hardwareTier = "Multi-Node Cluster (8x H100/A100 with Tensor Parallelism)";
      hardwareColor = "text-purple-500";
    }
  }

  const runtimes = isOpenWeights
    ? [
        { name: "vLLM", status: "Supported", desc: "High-throughput PagedAttention server" },
        { name: "Ollama", status: "Supported", desc: "One-click CLI & local desktop serving" },
        { name: "SGLang", status: "Supported", desc: "Fast multi-turn structured decoding" },
        { name: "TensorRT-LLM", status: "Supported", desc: "NVIDIA optimized GPU kernels" },
        { name: "Llama.cpp", status: "Supported", desc: "GGUF CPU/Apple Silicon execution" },
      ]
    : [
        { name: "Vendor REST API", status: "Official", desc: "Primary managed cloud endpoint" },
        { name: "OpenRouter", status: "Supported", desc: "Unified multi-provider gateway" },
        { name: "Amazon Bedrock / GCP", status: "Enterprise", desc: "Private cloud enterprise integration" },
        { name: "OpenAI SDK", status: "Compatible", desc: "Standard chat completions client" },
      ];

  const precisionFormats = isOpenWeights
    ? [
        { format: "BF16 / FP16", label: "Full Precision", suitable: "Maximum accuracy & zero quantization degradation" },
        { format: "FP8 (E4M3)", label: "Native FP8", suitable: "Ada Lovelace / Hopper 2x throughput speedup" },
        { format: "AWQ / GPTQ (4-bit)", label: "Activation-Aware", suitable: "70% VRAM reduction with near-lossless perplexity" },
        { format: "GGUF (Q4_K_M)", label: "Quantized Binary", suitable: "Optimized for local Ollama and CPU RAM offload" },
      ]
    : [
        { format: "Cloud Precision", label: "Managed Serving", suitable: "Vendor-optimized floating point precision (FP8/BF16)" },
        { format: "Prompt Caching", label: "Prefix Cache", suitable: "Up to 50–90% cost reduction on repeated system prompts" },
      ];

  return (
    <section id="compatibility" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <Server size={14} />
        <span>Hardware Sizing &amp; Runtime Compatibility</span>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Inference Runtimes &amp; Hardware Tiering
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            Deployment targets, inference engines, and memory requirements for <strong>{model.name}</strong>.
          </p>
        </div>

        {/* Hardware Class Alert */}
        <div className="p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Cpu size={16} className={hardwareColor} />
            <span className="font-semibold text-[var(--text)]">Recommended Hardware Profile:</span>
          </div>
          <span className={`font-mono font-bold text-xs ${hardwareColor}`}>
            {hardwareTier}
          </span>
        </div>

        {/* 2-Column Grid: Runtimes & Formats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Inference Engines */}
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              <Zap size={14} className="text-[var(--accent)]" />
              <span>Supported Inference Engines</span>
            </div>
            <div className="space-y-2 text-xs">
              {runtimes.map((rt) => (
                <div key={rt.name} className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[var(--text)]">{rt.name}</span>
                    <p className="text-[11px] text-[var(--muted)]">{rt.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                    <Check size={10} /> {rt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Precision & Quantization */}
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              <Layers size={14} className="text-[var(--accent)]" />
              <span>Precision &amp; Quantization Formats</span>
            </div>
            <div className="space-y-2 text-xs">
              {precisionFormats.map((pf) => (
                <div key={pf.format} className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[var(--text)] text-xs">{pf.format}</span>
                    <span className="text-[10px] font-mono text-[var(--accent)] font-semibold">{pf.label}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">{pf.suitable}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

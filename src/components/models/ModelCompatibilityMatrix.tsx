"use client";

import React from "react";
import { Server, Cpu, Check, Layers, Zap, Terminal } from "lucide-react";
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

  // Exact VRAM footprint calculation
  // FP16 = 2B, FP8 = 1B, INT4 = 0.55B per billion params (including scale/zero overhead)
  const memFp16 = paramInB * 2;
  const memInt4 = paramInB * 0.55;
  
  // Approximate KV Cache + Activation buffer overhead (typically ~20%)
  const totalMemFp16 = memFp16 * 1.2;
  const totalMemInt4 = memInt4 * 1.2;

  // Calculate GPU mapping & Tensor Parallelism
  let hardwareTier = "Cloud Hosted API (Zero Local VRAM)";
  let hardwareColor = "text-[var(--accent)]";
  let recommendedGpu = "Cloud Inference";
  let tpSize = 1;

  if (isOpenWeights) {
    if (totalMemInt4 <= 16) {
      hardwareTier = "Consumer GPU (< 16 GB VRAM)";
      recommendedGpu = "1x RTX 4070 / 4080 (16GB) or Mac M-Series (16GB Unified)";
      hardwareColor = "text-emerald-500";
    } else if (totalMemInt4 <= 24) {
      hardwareTier = "High-End Consumer GPU (24 GB VRAM)";
      recommendedGpu = "1x RTX 3090 / 4090 (24GB) or Mac M-Series (32GB+)";
      hardwareColor = "text-blue-500";
    } else if (totalMemFp16 <= 48) {
      hardwareTier = "Prosumer / Entry Datacenter (48 GB VRAM)";
      recommendedGpu = "1x L40S (48GB) / 2x RTX 4090 (TP=2)";
      hardwareColor = "text-amber-500";
      tpSize = totalMemFp16 > 24 ? 2 : 1;
    } else if (totalMemFp16 <= 80) {
      hardwareTier = "Datacenter GPU (80 GB VRAM)";
      recommendedGpu = "1x H100 / A100 (80GB)";
      hardwareColor = "text-amber-600";
    } else if (totalMemFp16 <= 160) {
      hardwareTier = "Multi-GPU Node (160 GB VRAM)";
      recommendedGpu = "2x H100 (TP=2) / 4x L40S / Apple M Ultra (128GB+)";
      hardwareColor = "text-purple-500";
      tpSize = 2;
    } else {
      hardwareTier = "Multi-Node / Multi-GPU Cluster (>160 GB)";
      recommendedGpu = "4x-8x H100 (80GB) with Tensor Parallelism";
      hardwareColor = "text-purple-600";
      // ensure power of 2 for TP
      tpSize = Math.max(4, Math.pow(2, Math.ceil(Math.log2(totalMemFp16 / 80))));
    }
  }

  const runtimes = isOpenWeights
    ? [
        { name: "vLLM", status: "Supported", desc: "High-throughput PagedAttention server" },
        { name: "Ollama", status: "Supported", desc: "One-click CLI & local desktop serving" },
        { name: "SGLang", status: "Supported", desc: "Fast multi-turn structured decoding" },
        { name: "TGI", status: "Supported", desc: "Text Generation Inference" },
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
        { format: "BF16 / FP16", label: "Full Precision", suitable: `~${totalMemFp16.toFixed(1)} GB VRAM required` },
        { format: "FP8 (E4M3)", label: "Native FP8", suitable: `~${(totalMemFp16/2).toFixed(1)} GB VRAM (Hopper speedup)` },
        { format: "AWQ / GPTQ (4-bit)", label: "Activation-Aware", suitable: `~${totalMemInt4.toFixed(1)} GB VRAM` },
        { format: "GGUF (Q4_K_M)", label: "Quantized Binary", suitable: "CPU RAM / Apple Silicon optimized" },
      ]
    : [
        { format: "Cloud Precision", label: "Managed Serving", suitable: "Vendor-optimized floating point precision (FP8/BF16)" },
        { format: "Prompt Caching", label: "Prefix Cache", suitable: "Up to 50–90% cost reduction on repeated system prompts" },
      ];

  const servingRecipes = isOpenWeights
    ? [
        { name: "vLLM Production", command: `python3 -m vllm.entrypoints.openai.api_server --model ${model.name || "model_id"} --tensor-parallel-size ${tpSize} --gpu-memory-utilization 0.95 --max-model-len 4096 --enable-chunked-prefill` },
        { name: "Ollama / llama.cpp", command: `ollama run ${model.name?.toLowerCase() || "model_id"}` },
        { name: "SGLang Structured", command: `python3 -m sglang.launch_server --model-path ${model.name || "model_id"} --tp ${tpSize} --trust-remote-code` },
        { name: "TGI Serving", command: `text-generation-launcher --model-id ${model.name || "model_id"} --num-shard ${tpSize} --max-batch-prefill-tokens 32000` },
      ]
    : [];

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
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Cpu size={16} className={hardwareColor} />
              <span className="font-semibold text-[var(--text)]">Recommended Hardware Profile:</span>
            </div>
            {isOpenWeights && <span className="text-[var(--muted)] ml-6">{recommendedGpu}</span>}
          </div>
          <span className={`font-mono font-bold text-xs ${hardwareColor} text-right`}>
            {hardwareTier}
            {isOpenWeights && <div className="text-[10px] text-[var(--muted)] font-sans mt-0.5">Est. {totalMemFp16.toFixed(1)} GB (FP16) / {totalMemInt4.toFixed(1)} GB (INT4)</div>}
          </span>
        </div>

        {/* Serving Recipes (if open weights) */}
        {isOpenWeights && (
          <div className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              <Terminal size={14} className="text-[var(--accent)]" />
              <span>Production Serving Recipes</span>
            </div>
            <div className="space-y-2 text-xs">
              {servingRecipes.map((recipe) => (
                <div key={recipe.name} className="p-2.5 rounded-lg bg-[var(--card-bg)] border border-[var(--muted)]/10">
                  <div className="font-bold text-[var(--text)] mb-1">{recipe.name}</div>
                  <code className="block w-full overflow-x-auto text-[10px] text-[var(--accent)] bg-black/5 p-2 rounded whitespace-nowrap font-mono border border-[var(--muted)]/10">
                    {recipe.command}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}

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


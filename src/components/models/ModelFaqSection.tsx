"use client";

import React, { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { normalizeBenchmarks } from "@/lib/benchmarks";

interface ModelFaqSectionProps {
  model: ModelRow;
}

export default function ModelFaqSection({ model }: ModelFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const benchmarks = normalizeBenchmarks(model.benchmarks);
  
  const isOpenWeights = Boolean(model.source_type?.toLowerCase().includes("open"));
  const isCommercial = !model.source_type?.toLowerCase().includes("non-commercial");
  const isReasoning = model.category?.toLowerCase().includes("reasoning") || model.name.toLowerCase().includes("o1") || model.name.toLowerCase().includes("r1");
  const parameters = model.parameters || "Unknown";
  const contextNum = model.context_window || 8192;
  const isMoE = Boolean(model.active_parameters);
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;

  let vramEstimate = "Depends on quantization";
  if (parameters.includes("8B") || parameters.includes("7B")) vramEstimate = "8-12 GB VRAM (4-bit to 8-bit)";
  else if (parameters.includes("70B") || parameters.includes("72B")) vramEstimate = "40-80 GB VRAM (4-bit to 8-bit)";
  else if (parameters.includes("400B") || parameters.includes("314B") || parameters.includes("671B")) vramEstimate = "Multiple 80GB GPUs (e.g., 4-8x H100)";

  const reasoningBenchmarks = benchmarks.filter(b => ["MMLU-Pro", "MATH-500", "GPQA Diamond"].includes(b.name));
  const codingBenchmarks = benchmarks.filter(b => ["SWE-bench Verified", "HumanEval", "LiveCodeBench"].includes(b.name));
  const chatBenchmarks = benchmarks.filter(b => ["LMSYS Arena Elo", "Arena-Hard-Auto", "MT-Bench"].includes(b.name));

  const formatBenchmarks = (arr: { name: string; score: string | number }[]) => arr.map(b => `${b.name}: ${b.score}${typeof b.score === "number" ? "%" : ""}`).join(", ");

  const faqs = [
    {
      q: `What are the VRAM requirements to run ${model.name} locally?`,
      a: isOpenWeights 
        ? `To run ${model.name} (${parameters}) locally, you generally need ${vramEstimate}. We recommend using quantized GGUF/AWQ formats with Ollama or vLLM to optimize memory footprint.`
        : `${model.name} is a proprietary API model and cannot be run locally. It requires no local VRAM.`
    },
    {
      q: `Does ${model.name} support commercial use?`,
      a: isCommercial 
        ? `Yes, ${model.name} is available for commercial use. Please review the official ${model.provider} license terms for any specific restrictions on acceptable use.`
        : `No, ${model.name} is released under a non-commercial or research-only license. You cannot use it for commercial applications without explicit permission from ${model.provider}.`
    },
    {
      q: `Is fine-tuning supported for ${model.name}?`,
      a: isOpenWeights
        ? `Yes, as an open-weights model, ${model.name} can be fine-tuned using LoRA/QLoRA on local hardware or via cloud platforms like Modal, RunPod, or Together AI.`
        : `Fine-tuning availability depends on ${model.provider}'s API offerings. Many providers offer managed fine-tuning through their developer consoles.`
    },
    {
      q: `Does ${model.name} support prompt caching?`,
      a: `Prompt caching is increasingly standard across frontier models. If using the official API, check ${model.provider}'s documentation for prefix caching support, which can reduce costs and latency for repetitive system prompts.`
    },
    ...(isReasoning ? [{
      q: `How do I configure the reasoning budget for ${model.name}?`,
      a: `For reasoning models like ${model.name}, you typically configure the reasoning budget via the 'max_completion_tokens' or specific thinking parameters in the API, allowing the model more time to generate chain-of-thought pathways before responding.`
    }] : []),
    ...(reasoningBenchmarks.length > 0 ? [{
      q: `How does ${model.name} perform on advanced reasoning benchmarks?`,
      a: `On advanced reasoning evaluations, ${model.name} scored: ${formatBenchmarks(reasoningBenchmarks)}.`
    }] : []),
    ...(codingBenchmarks.length > 0 ? [{
      q: `What are ${model.name}'s coding capabilities?`,
      a: `For agentic and coding tasks, ${model.name} achieved: ${formatBenchmarks(codingBenchmarks)}.`
    }] : []),
    ...(chatBenchmarks.length > 0 ? [{
      q: `How does ${model.name} rank in instruction following and chat?`,
      a: `On chat evaluations, ${model.name} scored: ${formatBenchmarks(chatBenchmarks)}.`
    }] : []),
    {
      q: `What is ${model.name}'s context window capacity and architecture?`,
      a: `${model.name} was created by ${model.provider} with a ${
        isMoE ? `Sparse Mixture-of-Experts (${model.active_parameters} active per token)` : "Dense Transformer"
      } architecture and a certified context window of ${contextNum.toLocaleString()} tokens. ${
        contextNum >= 128000
          ? "This allows for extensive full-codebase repository indexing, multi-hour audio processing, and book-length document ingestion."
          : "It is optimized for low-latency interactive conversations, API tool calls, and high-frequency structured JSON generation."
      }`
    },
    {
      q: `How much does ${model.name} cost per million tokens?`,
      a: pricing.input_per_1m !== undefined
        ? `Standard API rates for ${model.name} are $${pricing.input_per_1m} per 1M input tokens and $${pricing.output_per_1m ?? "—"} per 1M output tokens.`
        : `${model.name} is available under open weights distribution for free direct checkpoint download, with compute costs depending on self-hosted GPU provisioning.`
    }
  ].filter(Boolean) as { q: string; a: string }[];

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="space-y-4">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
        <HelpCircle size={14} />
        <span>Frequently Asked Questions</span>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Frequently Asked Questions about {model.name}
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            Essential facts, architectural specs, hardware constraints, and pricing answers for <strong>{model.name}</strong>.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-[var(--radius-control)] border border-[var(--muted)]/15 bg-[var(--bg)] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-bold text-[var(--text)] hover:text-[var(--accent)] transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="leading-snug">{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-[var(--muted)] transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[var(--accent)]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[var(--muted)] leading-relaxed border-t border-[var(--muted)]/10">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

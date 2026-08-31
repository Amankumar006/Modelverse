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
  const isMoE = Boolean(model.active_parameters);
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  const contextNum = model.context_window || 8192;
  const benchmarks = normalizeBenchmarks(model.benchmarks);
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;

  const faqs = [
    {
      q: `What is ${model.name}'s context window capacity?`,
      a: `${model.name} provides a certified context window of ${contextNum.toLocaleString()} tokens. ${
        contextNum >= 128000
          ? "This allows for extensive full-codebase repository indexing, multi-hour audio processing, and book-length document ingestion."
          : "It is optimized for low-latency interactive conversations, API tool calls, and high-frequency structured JSON generation."
      }`,
    },
    {
      q: `Who developed ${model.name} and what is its neural architecture?`,
      a: `${model.name} was created by ${model.provider}. It features a ${
        isMoE ? `Sparse Mixture-of-Experts (${model.active_parameters} active parameters per token)` : "Dense Transformer"
      } architecture with a total parameter capacity of ${model.parameters || "proprietary scale"}.`,
    },
    {
      q: `Can ${model.name} be run locally on private hardware?`,
      a: isOpenWeights
        ? `Yes. ${model.name} is an open-weights model compatible with local inference frameworks such as vLLM, Ollama, SGLang, and Llama.cpp for private VPC and on-premise execution.`
        : `No. ${model.name} is a proprietary cloud-hosted model accessible via official vendor REST API endpoints and cloud gateways with managed SLA guarantees.`,
    },
    {
      q: `How much does ${model.name} cost per million tokens?`,
      a: pricing.input_per_1m !== undefined
        ? `Standard API rates for ${model.name} are $${pricing.input_per_1m} per 1M input tokens and $${pricing.output_per_1m ?? "—"} per 1M output tokens.`
        : `${model.name} is available under open distribution licenses for free direct checkpoint download, with compute costs depending on self-hosted GPU provisioning.`,
    },
    benchmarks.length > 0
      ? {
          q: `What are ${model.name}'s verified benchmark scores?`,
          a: `In standardized evaluations, ${model.name} achieved: ${benchmarks
            .slice(0, 4)
            .map((b) => `${b.name}: ${b.score}${typeof b.score === "number" ? "%" : ""}`)
            .join(", ")}.`,
        }
      : null,
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

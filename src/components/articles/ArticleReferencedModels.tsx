import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface ArticleReferencedModelsProps {
  models: ModelRow[];
}

export default function ArticleReferencedModels({ models }: ArticleReferencedModelsProps) {
  if (!models || models.length === 0) return null;

  return (
    <section className="w-full max-w-[728px] mx-auto my-8 p-6 sm:p-7 rounded-2xl bg-[var(--card-bg)] border border-[var(--accent)]/30 shadow-md">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
        <Sparkles size={14} />
        <span>{models.length > 1 ? "Referenced Foundation Models" : "Primary Foundation Model"}</span>
      </div>

      <p className="text-xs sm:text-sm text-[var(--muted)] mb-5 leading-relaxed">
        This technical digest directly references verified architecture specifications documented in the Modelverse catalog.
      </p>

      <div className="space-y-4">
        {models.map((model) => {
          const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
          const formattedCtx = model.context_window
            ? `${Math.round(model.context_window / 1000)}k tokens`
            : "Standard";

          return (
            <div
              key={model.id}
              className="p-5 rounded-xl bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                    {model.provider}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--card-bg)] border border-[var(--muted)]/15 font-mono text-[var(--muted)]">
                    {model.category || "LLM"}
                  </span>
                  {model.source_type && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-medium">
                      {model.source_type}
                    </span>
                  )}
                </div>

                <Link href={`/models/${model.slug}`} className="block">
                  <h4 className="text-base sm:text-lg font-extrabold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {model.name}
                  </h4>
                </Link>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--muted)] pt-1 font-mono">
                  <span>Params: <strong className="text-[var(--text)]">{model.parameters || "Proprietary"}</strong></span>
                  <span>•</span>
                  <span>Context: <strong className="text-[var(--text)]">{formattedCtx}</strong></span>
                  {pricing.input_per_1m !== undefined && (
                    <>
                      <span>•</span>
                      <span>Rate: <strong className="text-[var(--accent)]">${pricing.input_per_1m}/1M</strong></span>
                    </>
                  )}
                </div>
              </div>

              <Link
                href={`/models/${model.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] hover:opacity-90 text-[var(--accent-contrast)] text-xs font-bold transition-all shrink-0 shadow-sm"
              >
                <span>View Full Specs &amp; Benchmarks</span>
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}

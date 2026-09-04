"use client";

import React from "react";
import Link from "next/link";
import { GitCompare, ArrowRight, Layers, Cpu, DollarSign, Swords } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { getCanonicalCompareSlug, getPopularComparisonsForModel } from "@/lib/compare";

interface ModelAlternativesSectionProps {
  currentModel: ModelRow;
  allModels: ModelRow[];
}

export default function ModelAlternativesSection({
  currentModel,
  allModels,
}: ModelAlternativesSectionProps) {
  const popularPairs = getPopularComparisonsForModel(currentModel.slug);
  const getTier = (pricing: Record<string, unknown> | null, params: string) => {
    const input = typeof pricing?.input_per_1m === "number" ? pricing.input_per_1m : parseFloat(String(pricing?.input_per_1m || "0")) || 0;
    if (input > 10) return "frontier";
    if (input > 2 || (params && params.includes("70B"))) return "heavy";
    if (input > 0.5 || (params && params.includes("30B"))) return "mid";
    return "lite";
  };

  const getModality = (m: ModelRow) => m.category || "LLM";

  const curPricing = (typeof currentModel.pricing === "object" && currentModel.pricing !== null ? currentModel.pricing : {}) as Record<string, number | string>;
  const curTier = getTier(curPricing, currentModel.parameters || "");
  const curModality = getModality(currentModel);

  const candidates = allModels
    .filter((m) => m.id !== currentModel.id)
    .sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      const aPricing = (typeof a.pricing === "object" && a.pricing !== null ? a.pricing : {}) as Record<string, number | string>;
      const bPricing = (typeof b.pricing === "object" && b.pricing !== null ? b.pricing : {}) as Record<string, number | string>;

      // 1. Same Capability Tier (Price-performance matching)
      if (getTier(aPricing, a.parameters || "") === curTier) scoreA += 4;
      if (getTier(bPricing, b.parameters || "") === curTier) scoreB += 4;

      // 2. Same Modality
      if (getModality(a) === curModality) scoreA += 3;
      if (getModality(b) === curModality) scoreB += 3;

      // 3. Cross-provider alternatives (diversity)
      if (a.provider !== currentModel.provider) scoreA += 2;
      if (b.provider !== currentModel.provider) scoreB += 2;

      // 4. Release Date fallback
      const dateA = new Date(a.release_date || a.created_at || "1970-01-01").getTime();
      const dateB = new Date(b.release_date || b.created_at || "1970-01-01").getTime();

      if (scoreA !== scoreB) return scoreB - scoreA;
      return dateB - dateA;
    })
    .slice(0, 3);

  if (candidates.length === 0) {
    return null;
  }

  return (
    <section id="alternatives" className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <GitCompare size={14} />
          <span>Similar Frontier Models &amp; Alternatives</span>
        </div>
        <Link
          href={`/compare?m1=${currentModel.slug}`}
          className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium"
        >
          <span>Explore All Comparisons</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Comparable Foundation Architectures
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            Alternative models in the <strong>{currentModel.category || "LLM"}</strong> class with similar capabilities, context windows, or deployment profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((alt) => {
            const altPricing = (typeof alt.pricing === "object" && alt.pricing !== null ? alt.pricing : {}) as Record<string, number | string>;
            const formattedCtx = alt.context_window
              ? `${Math.round(alt.context_window / 1000)}k ctx`
              : "Standard ctx";

            return (
              <div
                key={alt.id}
                className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] transition-all flex flex-col justify-between space-y-4 group shadow-sm hover:shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold uppercase tracking-wider text-[var(--accent)]">
                      {alt.provider}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[var(--card-bg)] border border-[var(--muted)]/15 font-mono text-[var(--muted)]">
                      {alt.category || "LLM"}
                    </span>
                  </div>

                  <Link href={`/models/${alt.slug}`} className="block">
                    <h4 className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                      {alt.name}
                    </h4>
                  </Link>

                  <div className="space-y-1.5 text-xs text-[var(--muted)] pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Cpu size={12} className="text-[var(--accent)]" />
                        <span>Context:</span>
                      </span>
                      <strong className="text-[var(--text)] font-mono">{formattedCtx}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <Layers size={12} className="text-[var(--accent)]" />
                        <span>Parameters:</span>
                      </span>
                      <strong className="text-[var(--text)] font-mono">{alt.parameters || "Proprietary"}</strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5">
                        <DollarSign size={12} className="text-[var(--accent)]" />
                        <span>Input Rate:</span>
                      </span>
                      <strong className="text-[var(--accent)] font-mono">
                        {altPricing.input_per_1m !== undefined ? `$${altPricing.input_per_1m}/1M` : "Free / Self-Host"}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[var(--muted)]/10 flex items-center gap-2">
                  <Link
                    href={`/compare/${getCanonicalCompareSlug(currentModel.slug, alt.slug)}`}
                    className="flex-1 text-center py-1.5 px-2 rounded-md bg-[var(--accent-soft)] hover:bg-[var(--accent)] text-[var(--accent)] hover:text-[var(--accent-contrast)] text-[11px] font-bold transition-colors"
                  >
                    Compare Side-by-Side
                  </Link>
                  <Link
                    href={`/models/${alt.slug}`}
                    className="p-1.5 rounded-md bg-[var(--card-bg)] hover:bg-[var(--accent-soft)] text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    title={`View ${alt.name} specs`}
                  >
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {popularPairs.length > 0 && (
          <div className="pt-5 border-t border-[var(--muted)]/10 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              <Swords size={13} className="text-[var(--accent)]" />
              <span>Direct Head-to-Head Comparisons</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {popularPairs.map(([s1, s2]) => {
                const canonicalSlug = getCanonicalCompareSlug(s1, s2);
                const otherSlug = s1.toLowerCase() === currentModel.slug.toLowerCase() ? s2 : s1;
                const otherModel = allModels.find(
                  (m) => m.slug.toLowerCase() === otherSlug.toLowerCase()
                );
                const otherName = otherModel?.name || otherSlug;

                return (
                  <Link
                    key={canonicalSlug}
                    href={`/compare/${canonicalSlug}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs font-semibold text-[var(--text)] border border-[var(--muted)]/15 transition-all shadow-sm group"
                  >
                    <span>{currentModel.name}</span>
                    <span className="text-[var(--muted)] text-[10px] font-mono font-normal">vs</span>
                    <span>{otherName}</span>
                    <ArrowRight size={11} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition-all" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

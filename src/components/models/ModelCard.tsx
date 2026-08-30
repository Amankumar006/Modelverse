"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { getProviderLogo } from "@/lib/logos";

interface ModelCardProps {
  model: ModelRow;
  variant?: "card" | "row";
}

function formatContextWindow(tokens: number | null): string {
  if (!tokens) return "";
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(tokens % 1_000_000 === 0 ? 0 : 1)}M ctx`;
  if (tokens >= 1_000) return `${Math.round(tokens / 1_000)}k ctx`;
  return `${tokens} ctx`;
}

export default function ModelCard({ model, variant = "card" }: ModelCardProps) {
  const formattedContext = formatContextWindow(model.context_window);
  const modalities = Array.isArray(model.modalities) ? model.modalities : ["text"];
  const providerLogo = getProviderLogo(model.provider);

  if (variant === "row") {
    return (
      <Link
        href={`/models/${model.slug}`}
        className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_0.8fr_0.6fr_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-[14px] bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--muted)]/10 hover:border-[var(--accent)]/40 hover:bg-[var(--accent-soft)]/10 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer hover-lift"
      >
        <div className="min-w-0 flex items-center gap-3">
          <div className="relative w-6 h-6 rounded-full overflow-hidden shrink-0 bg-[var(--bg)] border border-[var(--muted)]/15 flex items-center justify-center p-0.5 group-hover:scale-105 transition-transform">
            <Image src={providerLogo} alt={model.provider} width={18} height={18} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
              {model.name}
            </p>
            <p className="text-xs text-[var(--muted)] truncate">{model.provider}</p>
          </div>
        </div>

        <p className="hidden sm:block text-xs font-mono text-[var(--muted)] truncate">
          {formattedContext}
        </p>

        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium uppercase tracking-wider">
          {model.category || "LLM"}
        </span>

        <ArrowUpRight size={14} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
      </Link>
    );
  }

  return (
    <Link
      href={`/models/${model.slug}`}
      className="group relative flex flex-col justify-between rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:border-[var(--accent)]/40 hover-lift p-5 text-xs text-left overflow-hidden cursor-pointer"
    >
      {/* Ambient hover glow gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/8 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header Row: Provider Logo & Category Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 bg-[var(--bg)] border border-[var(--muted)]/15 flex items-center justify-center p-0.5 group-hover:scale-110 transition-transform">
                <Image src={providerLogo} alt={model.provider} width={16} height={16} className="w-full h-full object-contain" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)] truncate">
                {model.provider}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase tracking-wider shrink-0">
                {model.category || "LLM"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-glow shrink-0" title="Verified model specs" />
            </div>
          </div>

          {/* Model Name & Arrow */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors text-base md:text-lg leading-snug truncate">
              {model.name}
            </h3>
            <ArrowUpRight size={15} className="text-[var(--muted)]/40 group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5" />
          </div>

          {/* Description */}
          {model.description && (
            <p className="text-[var(--muted)] text-xs line-clamp-2 leading-relaxed mb-4 font-normal">
              {model.description}
            </p>
          )}

          {/* Modalities Chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {modalities.slice(0, 3).map((m) => (
              <span
                key={String(m)}
                className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--bg)] text-[var(--muted)] border border-[var(--muted)]/15 group-hover:border-[var(--accent)]/20 transition-colors"
              >
                {String(m)}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta: Context Window & Parameters / Weights */}
        <div className="pt-3 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] text-[var(--muted)] font-mono tabular-nums">
          <span className="truncate">{formattedContext || model.weights_size || "Standard"}</span>
          <span className="shrink-0 font-medium text-[var(--text)]/80">
            {model.active_parameters ? `${model.active_parameters} act` : model.parameters || "Proprietary"}
          </span>
        </div>
      </div>
    </Link>
  );
}

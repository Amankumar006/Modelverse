"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ModelRow } from "@/types/database";

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

  if (variant === "row") {
    return (
      <Link
        href={`/models/${model.slug}`}
        className="group grid grid-cols-[1fr_auto_auto_auto] sm:grid-cols-[1.4fr_0.8fr_0.6fr_auto] items-center gap-3 sm:gap-4 px-4 py-3.5 rounded-[14px] bg-[var(--card-bg)]/80 backdrop-blur-md border border-[var(--muted)]/10 hover:border-[var(--accent)]/30 hover:bg-[var(--accent-soft)]/5 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text)] truncate group-hover:text-[var(--accent)] transition-colors">
            {model.name}
          </p>
          <p className="text-xs text-[var(--muted)] truncate">{model.provider}</p>
        </div>

        <p className="hidden sm:block text-xs font-mono text-[var(--muted)] truncate">
          {formattedContext}
        </p>

        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium uppercase tracking-wider">
          {model.category || "LLM"}
        </span>

        <ArrowUpRight
          size={14}
          className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors"
        />
      </Link>
    );
  }

  return (
    <Link
      href={`/models/${model.slug}`}
      className="group relative flex flex-col justify-between rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-400 p-5.5 text-xs text-left overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div>
          {/* Header Row: Provider & Category Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
              {model.provider}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase tracking-wider">
              {model.category || "LLM"}
            </span>
          </div>

          {/* Model Name */}
          <h3 className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors text-base md:text-lg leading-snug truncate mb-2">
            {model.name}
          </h3>

          {/* Description */}
          {model.description && (
            <p className="text-[var(--muted)] text-xs line-clamp-2 leading-relaxed mb-4">
              {model.description}
            </p>
          )}

          {/* Modalities Chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            {modalities.slice(0, 3).map((m) => (
              <span
                key={String(m)}
                className="text-[9px] px-2 py-0.5 rounded-full bg-[var(--card-bg)] text-[var(--muted)] border border-[var(--muted)]/20"
              >
                {String(m)}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta: Context Window & Parameters */}
        <div className="pt-3 border-t border-[var(--muted)]/10 flex items-center justify-between text-[11px] text-[var(--muted)] font-mono tabular-nums">
          <span>{formattedContext || "Standard"}</span>
          {model.parameters && <span>{model.parameters}</span>}
        </div>
      </div>
    </Link>
  );
}

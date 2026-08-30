"use client";

import React from "react";
import Link from "next/link";
import { ExternalLink, Calendar, ShieldCheck, ChevronRight } from "lucide-react";
import type { ModelRow } from "@/types/database";

interface ModelHeaderProps {
  model: ModelRow;
}

export default function ModelHeader({ model }: ModelHeaderProps) {
  const links = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;
  const dateStr = model.release_date
    ? new Date(model.release_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  return (
    <header className="space-y-6">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--muted)] font-medium">
        <Link href="/" className="hover:text-[var(--text)] transition-colors">
          Home
        </Link>
        <ChevronRight size={12} />
        <Link href="/models" className="hover:text-[var(--text)] transition-colors">
          Models
        </Link>
        <ChevronRight size={12} />
        <span className="text-[var(--accent)] font-semibold truncate">{model.name}</span>
      </nav>

      {/* Hero Header Card */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Provider & Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              {model.provider}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] font-semibold uppercase tracking-wider">
              {model.category || "LLM"}
            </span>
            {model.source_type && (
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-semibold border border-[var(--accent)]/20">
                {model.source_type}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
              <ShieldCheck size={11} /> Verified Specs
            </span>
          </div>

          {/* Release Date */}
          {dateStr && (
            <div className="flex items-center gap-1 text-xs text-[var(--muted)] font-mono">
              <Calendar size={13} className="text-[var(--accent)]" />
              <span>{dateStr}</span>
            </div>
          )}
        </div>

        {/* Model Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          {model.name}
        </h1>

        {/* Description */}
        {model.description && (
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl font-normal">
            {model.description}
          </p>
        )}

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5">
          {model.announcement_url && (
            <a
              href={model.announcement_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity"
            >
              <span>Announcement Blog</span>
              <ExternalLink size={13} />
            </a>
          )}
          {links.huggingface && (
            <a
              href={links.huggingface}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              <span>Hugging Face</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
          )}
          {links.ollama && (
            <a
              href={links.ollama}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              <span>Ollama</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
          )}
          {links.website && !model.announcement_url && (
            <a
              href={links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors"
            >
              <span>Official Website</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

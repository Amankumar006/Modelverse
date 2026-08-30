"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, Calendar, ShieldCheck, ChevronRight, Copy, Check, Scale } from "lucide-react";
import type { ModelRow } from "@/types/database";
import { getProviderLogo } from "@/lib/logos";

interface ModelHeaderProps {
  model: ModelRow;
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ModelHeader({ model }: ModelHeaderProps) {
  const [copied, setCopied] = useState(false);
  const links = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;
  const dateStr = model.release_date
    ? new Date(model.release_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  const providerLogo = getProviderLogo(model.provider);

  const handleCopySlug = async () => {
    await navigator.clipboard.writeText(model.slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-5 relative overflow-hidden">
        {/* Subtle ambient light gradient */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[var(--accent)]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Provider Logo & Badges */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--muted)]/15 shadow-sm">
              <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
                <Image
                  src={providerLogo}
                  alt={model.provider}
                  width={16}
                  height={16}
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
                {model.provider}
              </span>
            </div>

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

          {/* Quick Utility Actions (Copy Slug & Release Date) */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleCopySlug}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] text-[11px] text-[var(--muted)] hover:text-[var(--text)] transition-all font-mono btn-tactile cursor-pointer"
              title="Copy model slug / API ID"
            >
              {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
              <span>{copied ? "Copied ID!" : model.slug}</span>
            </button>

            {dateStr && (
              <div className="hidden sm:flex items-center gap-1 text-xs text-[var(--muted)] font-mono pl-1">
                <Calendar size={13} className="text-[var(--accent)]" />
                <span>{dateStr}</span>
              </div>
            )}
          </div>
        </div>

        {/* Model Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[var(--text)] tracking-tight relative z-10">
          {model.name}
        </h1>

        {/* Description */}
        {model.description && (
          <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed max-w-3xl font-normal relative z-10">
            {model.description}
          </p>
        )}

        {/* Primary Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5 relative z-10">
          {model.announcement_url && isValidHttpUrl(model.announcement_url) && (
            <a
              href={model.announcement_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity btn-tactile shadow-sm"
            >
              <span>Announcement Blog</span>
              <ExternalLink size={13} />
            </a>
          )}

          <Link
            href={`/compare?m1=${model.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all btn-tactile"
          >
            <Scale size={13} />
            <span>Compare Model</span>
          </Link>

          {links.huggingface && isValidHttpUrl(links.huggingface) && (
            <a
              href={links.huggingface}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors btn-tactile"
            >
              <span>Hugging Face</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
          )}

          {links.ollama && isValidHttpUrl(links.ollama) && (
            <a
              href={links.ollama}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors btn-tactile"
            >
              <span>Ollama</span>
              <ExternalLink size={12} className="opacity-60" />
            </a>
          )}

          {links.website && isValidHttpUrl(links.website) && !model.announcement_url && (
            <a
              href={links.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] transition-colors btn-tactile"
            >
              <span>Official Website</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

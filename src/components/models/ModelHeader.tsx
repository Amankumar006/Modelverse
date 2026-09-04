"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ExternalLink,
  Calendar,
  ShieldCheck,
  ChevronRight,
  Copy,
  Check,
  Scale,
  Layers,
  BookOpen,
  FileText,
  Terminal,
  DollarSign,
  Cpu,
  Globe,
} from "lucide-react";
import type { ModelRow } from "@/types/database";
import { getProviderLogo } from "@/lib/logos";
import { resolveModelLinks, type ResolvedModelLink } from "@/lib/model-links";

interface ModelHeaderProps {
  model: ModelRow;
}

function GithubIcon({ size = 13, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

function getLinkIcon(type: ResolvedModelLink["type"]) {
  switch (type) {
    case "github":
      return <GithubIcon size={13} />;
    case "huggingface":
      return <Layers size={13} className="text-amber-500" />;
    case "docs":
      return <BookOpen size={13} className="text-blue-500" />;
    case "paper":
      return <FileText size={13} className="text-purple-500" />;
    case "ollama":
      return <Terminal size={13} className="text-emerald-500" />;
    case "openrouter":
      return <Cpu size={13} className="text-rose-500" />;
    case "website":
      return <Globe size={13} className="text-sky-500" />;
    default:
      return <ExternalLink size={13} />;
  }
}

export default function ModelHeader({ model }: ModelHeaderProps) {
  const [copied, setCopied] = useState(false);
  const resolvedLinks = resolveModelLinks(model);

  const dateStr = model.release_date
    ? new Date(model.release_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      })
    : null;

  const providerLogo = getProviderLogo(model.provider);

  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, unknown>;
  const rawIn = typeof pricing.input_per_1m === "number" ? pricing.input_per_1m : parseFloat(String(pricing.input_per_1m || "0")) || 0;
  const rawOut = typeof pricing.output_per_1m === "number" ? pricing.output_per_1m : parseFloat(String(pricing.output_per_1m || "0")) || 0;
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  
  let pricingText = "Enterprise Tier";
  if (rawIn > 0 || rawOut > 0) {
    pricingText = `$${rawIn}/1M in · $${rawOut}/1M out`;
  } else if (isOpenWeights) {
    pricingText = "Free ($0 API Tokens)";
  }

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
              <ShieldCheck size={11} /> Verified Architecture &amp; Specs
            </span>

            <a
              href="#pricing"
              className="inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
              title="Jump to Commercial Rates & Cost Calculator"
            >
              <DollarSign size={11} />
              <span>{pricingText}</span>
            </a>
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

        {/* Primary Action & Source Links Bar */}
        <div className="pt-2 flex flex-wrap items-center gap-2.5 relative z-10">
          <Link
            href={`/compare?m1=${model.slug}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity btn-tactile shadow-sm"
          >
            <Scale size={13} />
            <span>Compare Model</span>
          </Link>

          {resolvedLinks.map((link) => (
            <a
              key={link.key}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/20 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all btn-tactile"
              title={link.label}
            >
              {getLinkIcon(link.type)}
              <span>{link.label}</span>
              <ExternalLink size={11} className="opacity-50" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}

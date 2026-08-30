"use client";

import React from "react";
import { Sparkles, Database, Building2, Layers, CheckCircle2 } from "lucide-react";

interface ModelsPageHeaderProps {
  totalModels: number;
  totalProviders: number;
}

export default function ModelsPageHeader({
  totalModels,
  totalProviders,
}: ModelsPageHeaderProps) {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--muted)]/10">
      {/* Title & Description */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles size={13} className="shrink-0" />
          <span>Frontier Architecture Registry</span>
        </div>

        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          Foundation Models Archive
        </h1>

        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
          Filter and compare frontier foundation models, parameter counts, context architectures, commercial API pricing, and benchmark scores across {totalProviders} global AI laboratories.
        </p>
      </div>

      {/* Live Stat Badges on Right */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4 gap-2.5 shrink-0">
        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-[10px] uppercase font-bold tracking-wider">
            <Database size={11} className="text-[var(--accent)]" />
            <span>Models</span>
          </div>
          <span className="text-lg 2xl:text-xl font-mono font-extrabold text-[var(--text)] tabular-nums mt-0.5">
            {totalModels}
          </span>
        </div>

        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-[10px] uppercase font-bold tracking-wider">
            <Building2 size={11} className="text-blue-500" />
            <span>Labs</span>
          </div>
          <span className="text-lg 2xl:text-xl font-mono font-extrabold text-[var(--text)] tabular-nums mt-0.5">
            {totalProviders}
          </span>
        </div>

        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-[10px] uppercase font-bold tracking-wider">
            <Layers size={11} className="text-purple-500" />
            <span>Modalities</span>
          </div>
          <span className="text-lg 2xl:text-xl font-mono font-extrabold text-[var(--text)] tabular-nums mt-0.5">
            7 Types
          </span>
        </div>

        <div className="p-3 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-[10px] uppercase font-bold tracking-wider">
            <CheckCircle2 size={11} className="text-emerald-500" />
            <span>Status</span>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
}

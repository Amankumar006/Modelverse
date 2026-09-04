"use client";

import React from "react";
import Link from "next/link";
import { Rss, BookOpen, Sparkles, CheckCircle2 } from "lucide-react";

interface ArticlesHeaderProps {
  totalArticles: number;
}

export default function ArticlesHeader({ totalArticles }: ArticlesHeaderProps) {
  return (
    <div className="w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[var(--muted)]/10">
      {/* Title & Description */}
      <div className="max-w-3xl space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-bold uppercase tracking-wider shadow-sm">
          <Sparkles size={13} className="shrink-0" />
          <span>TheModelverse Intelligence</span>
        </div>

        <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          AI Model Architecture &amp; Intelligence
        </h1>

        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
          Fact-checked deep dives into AI model architecture, intelligence benchmarks, reinforcement learning paradigms, and primary research papers from TheModelverse.
        </p>
      </div>

      {/* Action Controls & Stat Badges on Right */}
      <div className="flex flex-wrap items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)]">
          <BookOpen size={16} className="text-[var(--accent)]" />
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Articles</span>
            <span className="text-xs font-bold font-mono text-[var(--text)] tabular-nums">{totalArticles} Published</span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)]">
          <CheckCircle2 size={16} className="text-emerald-500" />
          <div className="flex flex-col">
            <span className="text-[10px] text-[var(--muted)] uppercase font-bold tracking-wider">Quality</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Peer Audited</span>
          </div>
        </div>

        <Link
          href="/news/feed.xml"
          target="_blank"
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--radius-control)] bg-[var(--card-bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)] text-xs font-bold text-[var(--text)] transition-all btn-tactile cursor-pointer"
          title="Subscribe via RSS"
        >
          <Rss size={14} className="text-amber-500" />
          <span>RSS Feed</span>
        </Link>
      </div>
    </div>
  );
}

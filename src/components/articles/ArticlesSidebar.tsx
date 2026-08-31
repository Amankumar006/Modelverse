"use client";

import React from "react";
import Link from "next/link";
import { Cpu, Tag, Rss, ArrowUpRight } from "lucide-react";
import AdSenseUnit from "@/components/ads/AdSenseUnit";

const REFERENCED_MODELS = [
  { name: "DeepSeek-R1", slug: "deepseek-r1", provider: "DeepSeek", category: "Reasoning" },
  { name: "Claude 3.5 Sonnet", slug: "claude-3-5-sonnet-20241022", provider: "Anthropic", category: "Code / Agentic" },
  { name: "Gemini 2.0 Flash", slug: "gemini-2-flash", provider: "Google", category: "Multimodal Video" },
  { name: "Llama 3.3 70B", slug: "llama-3-3-70b-instruct", provider: "Meta", category: "Open Weights" },
];

const RESEARCH_THEMES = [
  "Test-Time Compute Scaling",
  "Direct GUI Computer Use",
  "Native Video Token Streams",
  "High-Throughput MoE Routing",
  "SWE-bench Automated Coding",
];

export default function ArticlesSidebar() {
  return (
    <aside className="w-full space-y-6 text-xs">
      {/* Referenced Foundation Models Widget */}
      <div className="p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-3.5">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[var(--text)] text-xs">
          <Cpu size={14} className="text-[var(--accent)]" />
          <span>Referenced Models</span>
        </div>

        <div className="flex flex-col gap-2">
          {REFERENCED_MODELS.map((m) => (
            <Link
              key={m.slug}
              href={`/models/${m.slug}`}
              className="flex items-center justify-between p-2.5 rounded-[var(--radius-control)] bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] border border-[var(--muted)]/10 transition-all group"
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] truncate text-xs">
                  {m.name}
                </span>
                <span className="text-[10px] text-[var(--muted)] truncate">
                  {m.provider} • {m.category}
                </span>
              </div>
              <ArrowUpRight size={13} className="text-[var(--muted)] group-hover:text-[var(--accent)] shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </div>
      </div>

      {/* Responsive AdSense Unit in Sidebar */}
      <AdSenseUnit slotId="sidebar-articles-slot" format="rectangle" minHeight={250} />

      {/* Research Taxonomy Themes */}
      <div className="p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-[var(--text)] text-xs">
          <Tag size={14} className="text-[var(--accent)]" />
          <span>Research Focus</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {RESEARCH_THEMES.map((theme) => (
            <span
              key={theme}
              className="px-2.5 py-1 rounded-full bg-[var(--bg)] border border-[var(--muted)]/10 text-[11px] text-[var(--muted)] font-medium"
            >
              {theme}
            </span>
          ))}
        </div>
      </div>

      {/* RSS Feed Card */}
      <div className="p-5 rounded-[var(--radius-card)] bg-gradient-to-br from-[var(--accent-soft)]/50 to-[var(--card-bg)] border border-[var(--accent)]/20 shadow-[var(--shadow-card)] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--text)]">
          <Rss size={15} className="text-amber-500" />
          <span>Intelligence Feed</span>
        </div>
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">
          Plug breaking foundation model research directly into your RSS reader or automated pipeline.
        </p>
        <Link
          href="/news/feed.xml"
          target="_blank"
          className="inline-flex items-center justify-center gap-1.5 w-full py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity btn-tactile"
        >
          <span>Subscribe to RSS</span>
          <ArrowUpRight size={12} />
        </Link>
      </div>
    </aside>
  );
}

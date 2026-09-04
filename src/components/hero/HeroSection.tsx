"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";

interface HeroSectionProps {
  totalModels?: number;
  totalArticles?: number;
}

export default function HeroSection({
  totalModels = 0,
  totalArticles = 0,
}: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/models?search=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/models");
    }
  };

  const categoryChips = [
    { label: "LLMs", href: "/models?category=LLM" },
    { label: "Multimodal", href: "/models?category=Multimodal" },
    { label: "Code", href: "/models?category=Code" },
    { label: "Anthropic", href: "/models?provider=Anthropic" },
    { label: "OpenAI", href: "/models?provider=OpenAI" },
  ];

  return (
    <section className="relative w-full bg-[var(--bg)] text-[var(--text)] pt-12 pb-14 md:pt-16 md:pb-20 2xl:pt-20 2xl:pb-24 flex flex-col items-center border-b border-[var(--muted)]/10">
      <div className="w-full max-w-[680px] 2xl:max-w-[780px] 3xl:max-w-[900px] mx-auto px-5 flex flex-col items-center text-center relative z-10">
        {/* Stat Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold mb-6 shadow-sm">
          <Sparkles size={14} className="shrink-0" />
          <span className="tabular-nums font-mono">
            {totalModels > 0 ? `${totalModels} foundation models` : "TheModelverse Catalog"} • {totalArticles > 0 ? `${totalArticles} research digests` : "LLM Benchmark Database"}
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl 2xl:text-7xl font-extrabold tracking-tight text-[var(--text)] leading-[1.1] mb-4">
          The Foundation Model Catalog & LLM Benchmark Database
        </h1>

        {/* Subtext */}
        <p className="text-sm sm:text-base 2xl:text-lg text-[var(--muted)] leading-relaxed max-w-lg 2xl:max-w-xl mb-8">
          TheModelverse is the living, fact-checked directory of AI model architecture &amp; intelligence, verified benchmark figures, context windows, and hardware sizing.
        </p>

        {/* Search Input Form */}
        <form
          onSubmit={handleSearchSubmit}
          className="w-full relative flex items-center bg-[var(--card-bg)] shadow-[var(--shadow-card)] rounded-[var(--radius-control)] p-1.5 border border-[var(--muted)]/10 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-all mb-5"
        >
          <Search size={18} className="ml-3 text-[var(--muted)] shrink-0" />

          <input
            type="text"
            placeholder="Search foundation models, LLM benchmarks, or parameters..."
            value={query}
            aria-label="Search foundation models"
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none font-sans"
          />

          <button
            type="submit"
            aria-label="Submit search"
            className="px-5 py-2.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer btn-tactile"
          >
            <span>Search</span>
            <ArrowRight size={14} />
          </button>
        </form>

        {/* Quick Category Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-[var(--muted)] font-medium mr-1">Quick Filters:</span>
          {categoryChips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="px-3.5 py-1 rounded-[var(--radius-pill)] bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors cursor-pointer btn-tactile"
            >
              {chip.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

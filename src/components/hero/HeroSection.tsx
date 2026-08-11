"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Reveal from "@/components/ui/Reveal";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";

interface HeroSectionProps {
  totalModels?: number;
  verifiedCount?: number;
}

export default function HeroSection({
  totalModels = 120,
  verifiedCount = 105,
}: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/models?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/models");
    }
  };

  const categoryChips = [
    { label: "Text", href: "/models?modality=text" },
    { label: "Image", href: "/models?modality=image" },
    { label: "Code", href: "/models?task=code-generation" },
    { label: "Open Weights", href: "/models?type=open-weights" },
  ];

  return (
    <section className="relative w-full bg-[var(--bg)] text-[var(--text)] pt-4 pb-12 md:pb-16 flex flex-col items-center border-b border-[var(--muted)]/10">
      {/* Navigation Header */}
      <div className="w-full relative z-20">
        <Navbar theme="dark" />
      </div>

      {/* Centered Hero Container (max-w-640px) */}
      <div className="w-full max-w-[640px] mx-auto px-5 pt-8 md:pt-14 flex flex-col items-center text-center relative z-10">
        {/* Stat Pill Badge */}
        <Reveal delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] text-xs font-semibold mb-6 shadow-sm">
            <ShieldCheck size={14} className="shrink-0" />
            <span className="tabular-nums font-mono">
              {totalModels} models tracked · {verifiedCount} verified by curators
            </span>
          </div>
        </Reveal>

        {/* Headline */}
        <Reveal delay={0.2}>
          <h1 className="text-fluid-hero font-extrabold tracking-tight text-[var(--text)] leading-[1.1] mb-4">
            Every AI Model. <br className="hidden sm:inline" />
            <span className="text-[var(--accent)]">Every Release.</span>
          </h1>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={0.3}>
          <p className="text-fluid-base text-[var(--muted)] leading-relaxed max-w-lg mb-8 mx-auto">
            From frontier closed APIs to open-weight breakthroughs — a living, fact-checked archive of parameters, context windows, and primary documentation.
          </p>
        </Reveal>

        {/* Search Input Form */}
        <Reveal delay={0.4} className="w-full">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full relative flex items-center bg-[var(--card-bg)] shadow-[var(--shadow-card)] rounded-[var(--radius-control)] p-1.5 border border-[var(--muted)]/10 focus-within:ring-2 focus-within:ring-[var(--accent)] transition-all mb-5"
          >
            <label htmlFor="hero-search-input" className="sr-only">
              Search AI models, developers, or parameters
            </label>

            <Search size={18} className="ml-3 text-[var(--muted)] shrink-0" />

            <input
              id="hero-search-input"
              type="text"
              placeholder="Search models, developers, or specs..."
              value={query}
              aria-label="Search AI models, developers, or parameters"
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none font-sans"
            />

            <button
              type="submit"
              aria-label="Submit search"
              className="px-4 py-2.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Search</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </Reveal>

        {/* Quick Category Chips */}
        <Reveal delay={0.5}>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[var(--muted)] font-medium mr-1">Quick Filters:</span>
            {categoryChips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                className="px-3.5 py-1 rounded-[var(--radius-pill)] bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] transition-colors cursor-pointer"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

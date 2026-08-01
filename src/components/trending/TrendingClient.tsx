"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TrendingModelEntry } from "@/lib/trending";
import { Info } from "lucide-react";

interface TrendingClientProps {
  initialModels: TrendingModelEntry[];
}

export default function TrendingClient({ initialModels }: TrendingClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showExplainer, setShowExplainer] = useState(false);

  useEffect(() => {
    import("gsap").then(({ gsap }) => {
      if (!containerRef.current) return;

      const items = containerRef.current.querySelectorAll(".list-item");
      const header = document.querySelector(".fade-in");

      gsap.fromTo(
        header,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power2.out" }
      );

      gsap.fromTo(
        items,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.06,
          ease: "power3.out",
          delay: 0.1,
        }
      );
    });
  }, [initialModels]);

  return (
    <div className="w-full space-y-6">
      {/* Score Explainer Toggle */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--muted)]/10">
        <span className="text-xs text-[var(--muted)]">Ranked by Modelverse Activity & Search Velocity Index</span>
        <button
          onClick={() => setShowExplainer(!showExplainer)}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline font-semibold"
        >
          <Info size={14} />
          <span>How ranking works</span>
        </button>
      </div>

      {/* Explainer Popover */}
      {showExplainer && (
        <div className="p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs text-[var(--muted)] leading-relaxed space-y-2">
          <p className="font-bold text-[var(--text)]">Trending Score Algorithm:</p>
          <p>
            Rankings are updated daily based on a composite score combining primary documentation traffic, curator verification status, release recency, and community search frequency.
          </p>
        </div>
      )}

      {/* List Container */}
      <div ref={containerRef} className="list-container w-full divide-y divide-[var(--muted)]/10">
        {initialModels.map((model, index) => {
          const rankNum = String(index + 1).padStart(2, "0");
          return (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              className="list-item relative grid grid-cols-[60px_1fr_120px] sm:grid-cols-[80px_1fr_200px] items-center py-6 sm:py-8 cursor-pointer text-inherit transition-all hover:bg-[var(--accent-soft)]/20 px-3 rounded-[var(--radius-control)] group"
            >
              {/* Rank Number (Plain Figtree numerals, tabular-nums) */}
              <div className="item-num text-sm sm:text-base text-[var(--muted)] font-semibold font-sans tabular-nums">
                {rankNum}
              </div>

              {/* Title */}
              <div className="item-title font-bold text-xl sm:text-3xl tracking-tight text-[var(--text)] group-hover:text-[var(--accent)] transition-colors pr-4">
                {model.name}
              </div>

              {/* Developer */}
              <div className="item-category text-xs sm:text-sm text-[var(--muted)] text-right font-medium truncate">
                {model.developer}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Share2, Bookmark, Check, Heart, ArrowRight } from "lucide-react";
import type { ArticleRow } from "@/types/database";

interface MediumArticleFooterProps {
  sourceName?: string;
  category?: string;
  slug: string;
  relatedArticles?: ArticleRow[];
}

export default function MediumArticleFooter({
  sourceName = "TheModelverse Intelligence",
  category = "Architecture",
  slug,
  relatedArticles = [],
}: MediumArticleFooterProps) {
  const [claps, setClaps] = useState(24);
  const [hasClapped, setHasClapped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const tags = [category, "Foundation Models", "AI Architecture", "Deep Dive", "Research"];

  const handleClap = () => {
    setClaps((prev) => prev + 1);
    setHasClapped(true);
  };

  const handleCopy = () => {
    const url = typeof window !== "undefined" ? window.location.href : `https://www.themodelverse.in/articles/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="w-full max-w-[728px] mx-auto mt-12 pt-8 border-t border-[var(--muted)]/15">
      {/* Tag Pills Section (Medium Style) */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {tags.map((t, idx) => (
          <Link
            key={idx}
            href={`/articles?category=${encodeURIComponent(t)}`}
            className="px-3.5 py-1.5 rounded-full text-xs sm:text-[13px] font-medium bg-[var(--card-bg)] hover:bg-[var(--muted)]/15 border border-[var(--muted)]/20 text-[var(--text)] transition-colors"
          >
            {t}
          </Link>
        ))}
      </div>

      {/* Action Bar at Bottom */}
      <div className="py-4 border-y border-[var(--muted)]/15 flex items-center justify-between text-[var(--muted)] text-sm mb-10">
        <button
          onClick={handleClap}
          className={`flex items-center gap-2 transition-colors cursor-pointer ${
            hasClapped ? "text-red-500 font-semibold" : "hover:text-[var(--text)]"
          }`}
        >
          <Heart size={20} className={hasClapped ? "fill-red-500 text-red-500" : ""} />
          <span className="text-sm font-mono">{claps} claps</span>
        </button>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors text-xs font-medium cursor-pointer"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            <span>{copied ? "Copied" : "Share"}</span>
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`transition-colors cursor-pointer ${
              saved ? "text-[var(--accent)]" : "hover:text-[var(--text)]"
            }`}
          >
            <Bookmark size={18} className={saved ? "fill-[var(--accent)]" : ""} />
          </button>
        </div>
      </div>

      {/* Author Profile Box (Medium Style) */}
      <div className="p-6 rounded-2xl bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-xs mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 ring-2 ring-[var(--accent)]/30 shrink-0 flex items-center justify-center text-white font-bold text-xl shadow-md">
          <span>MV</span>
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-base text-[var(--text)]">
              {sourceName}
            </h4>
            <Link
              href="/articles"
              className="text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              Browse All
            </Link>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
            In-depth architectural analysis, reverse-engineered benchmarks, and empirical evaluations of frontier foundation models.
          </p>
        </div>
      </div>

      {/* Recommended Reading Grid */}
      {relatedArticles.length > 0 && (
        <div className="pt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight">
              Recommended from TheModelverse
            </h3>
            <Link
              href="/articles"
              className="text-xs font-semibold text-[var(--accent)] hover:underline inline-flex items-center gap-1"
            >
              <span>See more</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedArticles.slice(0, 2).map((item) => (
              <Link
                key={item.id}
                href={`/articles/${item.slug}`}
                className="group p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--muted)]/15 hover-lift transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                    {item.category || "Architecture"}
                  </span>
                  <h4 className="font-bold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug">
                    {item.title}
                  </h4>
                </div>
                <span className="text-[11px] text-[var(--muted)] mt-4 font-mono">
                  {new Date(item.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </footer>
  );
}

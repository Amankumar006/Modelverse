"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Share2, Bookmark, Check, Heart } from "lucide-react";

interface MediumArticleHeaderProps {
  title: string;
  summary?: string;
  category?: string;
  sourceName?: string;
  sourceUrl?: string;
  publishedAt: string;
  readingTime?: number;
  slug: string;
}

export default function MediumArticleHeader({
  title,
  summary,
  category = "Architecture",
  sourceName = "Modelverse Intelligence",
  sourceUrl,
  publishedAt,
  readingTime = 6,
  slug,
}: MediumArticleHeaderProps) {
  const [claps, setClaps] = useState(24);
  const [hasClapped, setHasClapped] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const formattedDate = new Date(publishedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

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
    <header className="w-full max-w-[728px] mx-auto pt-6 pb-2">
      {/* Top Nav Breadcrumb */}
      <div className="flex items-center justify-between pb-6">
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--text)] transition-colors"
        >
          <ArrowLeft size={14} /> Back to Intelligence
        </Link>
        <span className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-[var(--card-bg)] border border-[var(--muted)]/20 text-[var(--text)] shadow-xs">
          {category}
        </span>
      </div>

      {/* Editorial Headline (H1) */}
      <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[var(--text)] tracking-tight leading-[1.18] font-sans">
        {title}
      </h1>

      {/* Subtitle / Deck */}
      {summary && (
        <p className="mt-4 text-lg sm:text-[21px] text-[var(--muted)] font-normal leading-[1.55] tracking-[-0.003em]">
          {summary}
        </p>
      )}

      {/* Author Byline Strip (Medium Signature Layout) */}
      <div className="mt-7 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          {/* Circular Avatar */}
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-amber-500 to-amber-700 ring-2 ring-[var(--accent)]/30 shrink-0 flex items-center justify-center text-white font-bold text-base shadow-sm">
            <span>MV</span>
          </div>

          {/* Author & Publication Details */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-[var(--text)] leading-none">
                {sourceName}
              </span>
              <span className="text-[11px] font-medium text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent)]/10">
                Verified Lab
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-[13px] text-[var(--muted)] mt-1 font-sans">
              <span>{readingTime} min read</span>
              <span>·</span>
              <span>{formattedDate}</span>
              {sourceUrl && (
                <>
                  <span>·</span>
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline"
                  >
                    <span>Original Source</span>
                    <ExternalLink size={11} />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medium Interactive Action Bar */}
      <div className="mt-6 py-3 border-y border-[var(--muted)]/15 flex items-center justify-between text-[var(--muted)] text-sm">
        <div className="flex items-center gap-5">
          <button
            onClick={handleClap}
            className={`flex items-center gap-1.5 transition-colors ${
              hasClapped ? "text-red-500 font-semibold" : "hover:text-[var(--text)]"
            }`}
            title="Applaud this analysis"
          >
            <Heart size={18} className={hasClapped ? "fill-red-500 text-red-500" : ""} />
            <span className="text-xs font-mono">{claps}</span>
          </button>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 hover:text-[var(--text)] transition-colors text-xs font-medium cursor-pointer"
            title="Copy link to article"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Share2 size={16} />}
            <span>{copied ? "Copied Link" : "Share"}</span>
          </button>

          <button
            onClick={() => setSaved(!saved)}
            className={`transition-colors cursor-pointer ${
              saved ? "text-[var(--accent)]" : "hover:text-[var(--text)]"
            }`}
            title="Save for later"
          >
            <Bookmark size={17} className={saved ? "fill-[var(--accent)]" : ""} />
          </button>
        </div>
      </div>
    </header>
  );
}

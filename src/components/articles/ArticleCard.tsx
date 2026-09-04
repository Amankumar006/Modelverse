"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import type { ArticleRow } from "@/types/database";
import { calculateReadingTime } from "@/lib/reading-time";

interface ArticleCardProps {
  article: ArticleRow;
  featured?: boolean;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const readingTime = calculateReadingTime(article.content || article.summary);

  return (
    <article className="group relative h-full rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] hover-lift flex flex-col justify-between overflow-hidden">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--muted)]/10">
        <Image
          src={article.cover_image || "/images/articles/universal-cover.svg"}
          alt={article.title}
          fill
          unoptimized={(article.cover_image || "/images/articles/universal-cover.svg").endsWith(".svg")}
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        {/* Category Pill Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-contrast)] shadow-sm">
            {article.category || "Intelligence"}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
        <div className="space-y-2.5">
          {/* Metadata info */}
          <div className="flex items-center gap-2.5 text-[11px] text-[var(--muted)] font-mono">
            <span className="flex items-center gap-1">
              <Calendar size={11} className="text-[var(--accent)]" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={11} className="text-[var(--accent)]" />
              {readingTime}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug tracking-tight">
            {article.title}
          </h3>

          {/* Summary Preview */}
          {article.summary && (
            <p className="text-xs text-[var(--muted)] line-clamp-3 leading-relaxed">
              {article.summary}
            </p>
          )}
        </div>

        {/* Card Footer */}
        <div className="pt-3 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs">
          <span className="text-[11px] text-[var(--muted)] font-medium truncate max-w-[140px]">
            {article.source_name || "TheModelverse Intelligence"}
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
            <span>Read</span>
            <ArrowRight size={12} />
          </span>
        </div>
      </div>

      <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-20">
        <span className="sr-only">Read {article.title}</span>
      </Link>
    </article>
  );
}

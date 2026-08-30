"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ArticleRow } from "@/types/database";

interface ArticleCardProps {
  article: ArticleRow;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  if (featured) {
    return (
      <div className="group relative rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col justify-between">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--muted)]/10">
          {article.cover_image ? (
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--accent-soft)]/30 to-[var(--card-bg)] text-[var(--accent)] text-lg font-bold">
              Modelverse Intelligence
            </div>
          )}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-contrast)]">
              {article.category || "AI News"}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug tracking-tight">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-sm text-[var(--muted)] mt-3 line-clamp-3 leading-relaxed">
                {article.summary}
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs text-[var(--muted)] font-mono tabular-nums">
            <div className="flex items-center gap-2">
              <span>{article.source_name || "Editorial"}</span>
              <span>•</span>
              <span>{formattedDate}</span>
            </div>
            <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
              Read Story <ArrowUpRight size={14} />
            </span>
          </div>
        </div>

        <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-20">
          <span className="sr-only">Read {article.title}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="group relative rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 p-4 hover:-translate-y-1 transition-all duration-400 flex gap-4 items-center">
      {article.cover_image && (
        <div className="relative h-20 w-24 rounded-[14px] overflow-hidden shrink-0 bg-[var(--muted)]/10">
          <Image
            src={article.cover_image}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
            {article.source_name || "News"}
          </span>
          <span className="text-[10px] font-mono tabular-nums text-[var(--muted)]">
            {formattedDate}
          </span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug tracking-tight">
          {article.title}
        </h4>

        {article.summary && (
          <p className="text-[11px] text-[var(--muted)] line-clamp-1 mt-0.5">
            {article.summary}
          </p>
        )}
      </div>

      <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-10">
        <span className="sr-only">Read {article.title}</span>
      </Link>
    </div>
  );
}

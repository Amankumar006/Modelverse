"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import type { ArticleRow } from "@/types/database";
import { calculateReadingTime } from "@/lib/reading-time";

interface FeaturedArticleHeroProps {
  article: ArticleRow;
}

export default function FeaturedArticleHero({ article }: FeaturedArticleHeroProps) {
  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const readingTime = calculateReadingTime(article.content || article.summary);

  return (
    <article className="group relative w-full rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)] overflow-hidden hover-lift transition-all">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Cover Image (7 cols on desktop) */}
        <div className="relative lg:col-span-7 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto min-h-[260px] lg:min-h-[380px] overflow-hidden bg-[var(--muted)]/10">
          <Image
            src={article.cover_image || "/images/articles/universal-cover.svg"}
            alt={article.title}
            fill
            priority
            unoptimized={(article.cover_image || "/images/articles/universal-cover.svg").endsWith(".svg")}
            className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />

          {/* Category Tag Overlay */}
          <div className="absolute top-4 left-4 z-10">
            <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-contrast)] shadow-md">
              {article.category || "Featured Deep Dive"}
            </span>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent lg:hidden" />
        </div>

        {/* Text Content & Metadata (5 cols on desktop) */}
        <div className="lg:col-span-5 p-6 sm:p-8 2xl:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-xs text-[var(--muted)] font-mono">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-[var(--accent)]" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={13} className="text-[var(--accent)]" />
                {readingTime}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-[1.2] tracking-tight">
              {article.title}
            </h2>

            {article.summary && (
              <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed line-clamp-4">
                {article.summary}
              </p>
            )}
          </div>

          <div className="pt-4 border-t border-[var(--muted)]/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-medium">
              <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px]">
                <User size={12} />
              </div>
              <span>{article.source_name || "Modelverse Editorial"}</span>
            </div>

            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
              <span>Read Deep Dive</span>
              <ArrowRight size={14} />
            </span>
          </div>
        </div>
      </div>

      <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-20">
        <span className="sr-only">Read {article.title}</span>
      </Link>
    </article>
  );
}

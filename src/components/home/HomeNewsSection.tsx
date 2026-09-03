"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Newspaper, Calendar, Clock } from "lucide-react";
import type { ArticleRow } from "@/types/database";
import { calculateReadingTime } from "@/lib/reading-time";

interface HomeNewsSectionProps {
  articles: ArticleRow[];
}

export default function HomeNewsSection({ articles }: HomeNewsSectionProps) {
  if (!articles || articles.length === 0) return null;

  const featuredArticle = articles[0];
  const subArticles = articles.slice(1, 4);

  const featuredDate = new Date(featuredArticle.published_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  const featuredReadingTime = calculateReadingTime(
    featuredArticle.content || featuredArticle.summary
  );

  return (
    <section className="w-full bg-[var(--card-bg)]/40 border-t border-[var(--muted)]/10 py-12 md:py-16 2xl:py-20">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 flex flex-col gap-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
              <Newspaper size={14} className="shrink-0" />
              <span>Intelligence Digest</span>
            </div>
            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Latest AI News &amp; Analysis
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Real-time releases, architecture papers, and updates from leading research labs.
            </p>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:opacity-85 transition-opacity uppercase tracking-wider shrink-0"
          >
            <span>View All Articles</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Balanced Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Prominent Featured Spotlight Hero Card */}
          <div className="lg:col-span-7 3xl:col-span-8 flex flex-col">
            <article className="group relative w-full h-full rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-[var(--shadow-card)] hover-lift flex flex-col justify-between overflow-hidden">
              {/* Cover Image */}
              <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[var(--muted)]/10">
                <Image
                  src={featuredArticle.cover_image || "/images/articles/universal-cover.svg"}
                  alt={featuredArticle.title}
                  fill
                  priority
                  unoptimized={(featuredArticle.cover_image || "/images/articles/universal-cover.svg").endsWith(".svg")}
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-contrast)] shadow-md">
                    {featuredArticle.category || "Intelligence"}
                  </span>
                </div>
              </div>

              {/* Body Content */}
              <div className="p-6 sm:p-7 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-3">
                  {/* Metadata */}
                  <div className="flex items-center gap-3 text-xs text-[var(--muted)] font-mono">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--accent)]" />
                      {featuredDate}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-[var(--accent)]" />
                      {featuredReadingTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug tracking-tight">
                    {featuredArticle.title}
                  </h3>

                  {/* Summary */}
                  {featuredArticle.summary && (
                    <p className="text-xs sm:text-sm text-[var(--muted)] line-clamp-2 sm:line-clamp-3 leading-relaxed">
                      {featuredArticle.summary}
                    </p>
                  )}
                </div>

                {/* Card Footer Action */}
                <div className="pt-4 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs">
                  <span className="text-xs text-[var(--muted)] font-medium">
                    {featuredArticle.source_name || "Modelverse Research"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] group-hover:translate-x-1 transition-transform">
                    <span>Read Deep Dive</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>

              {/* Full Card Link */}
              <Link href={`/articles/${featuredArticle.slug}`} className="absolute inset-0 z-20">
                <span className="sr-only">Read {featuredArticle.title}</span>
              </Link>
            </article>
          </div>

          {/* Right: 3 Sleek Horizontal Compact Research Briefings */}
          <div className="lg:col-span-5 3xl:col-span-4 flex flex-col justify-between gap-4">
            {subArticles.map((article) => {
              const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                timeZone: "UTC",
              });
              const readingTime = calculateReadingTime(article.content || article.summary);

              return (
                <article
                  key={article.id}
                  className="group relative flex-1 p-3.5 sm:p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/15 shadow-sm hover-lift flex items-center gap-3.5 sm:gap-4 overflow-hidden"
                >
                  {/* Micro Thumbnail */}
                  <div className="relative w-24 sm:w-28 h-20 sm:h-24 rounded-[var(--radius-control)] overflow-hidden bg-[var(--muted)]/10 shrink-0">
                    <Image
                      src={article.cover_image || "/images/articles/universal-cover.svg"}
                      alt={article.title}
                      fill
                      unoptimized={(article.cover_image || "/images/articles/universal-cover.svg").endsWith(".svg")}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Content Column */}
                  <div className="flex flex-col justify-between flex-1 min-w-0 h-full py-0.5 space-y-1.5">
                    <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono">
                      <span className="px-1.5 py-0.5 rounded bg-[var(--tag-bg)] text-[var(--tag-text)] font-semibold uppercase tracking-wider">
                        {article.category || "AI"}
                      </span>
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{readingTime}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug tracking-tight">
                      {article.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-[var(--muted)] pt-0.5">
                      <span className="truncate max-w-[130px] font-medium">
                        {article.source_name || "Modelverse"}
                      </span>
                      <ArrowRight size={12} className="text-[var(--accent)] group-hover:translate-x-1 transition-transform shrink-0" />
                    </div>
                  </div>

                  {/* Card Link */}
                  <Link href={`/articles/${article.slug}`} className="absolute inset-0 z-20">
                    <span className="sr-only">Read {article.title}</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

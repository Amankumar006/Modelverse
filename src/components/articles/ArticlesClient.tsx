"use client";

import React, { useState, useMemo } from "react";
import { Search, X, SearchX } from "lucide-react";
import type { ArticleRow } from "@/types/database";
import FeaturedArticleHero from "./FeaturedArticleHero";
import ArticleCard from "./ArticleCard";
import ArticlesSidebar from "./ArticlesSidebar";

interface ArticlesClientProps {
  initialArticles: ArticleRow[];
}

export default function ArticlesClient({ initialArticles }: ArticlesClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialArticles.forEach((a) => {
      if (a.category) set.add(a.category);
    });
    return Array.from(set);
  }, [initialArticles]);

  const filteredArticles = useMemo(() => {
    let list = [...initialArticles];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.summary && a.summary.toLowerCase().includes(q)) ||
          (a.content && a.content.toLowerCase().includes(q)) ||
          (a.source_name && a.source_name.toLowerCase().includes(q)) ||
          (a.category && a.category.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== "All") {
      list = list.filter((a) => a.category?.toLowerCase() === selectedCategory.toLowerCase());
    }

    return list;
  }, [initialArticles, searchQuery, selectedCategory]);

  const featuredArticle = filteredArticles[0] || null;
  const secondaryArticles = filteredArticles.slice(1);

  return (
    <div className="w-full space-y-10">
      {/* Search & Topic Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-lg">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Search AI research, architectures, or papers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[var(--card-bg)] border border-[var(--muted)]/15 rounded-[var(--radius-control)] pl-9 pr-8 py-2.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)]/70 focus:outline-none focus:border-[var(--accent)] transition-all shadow-[var(--shadow-card)]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)] p-1 cursor-pointer"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
              selectedCategory === "All"
                ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm"
                : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/15"
            }`}
          >
            All Intelligence
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer text-xs ${
                selectedCategory.toLowerCase() === cat.toLowerCase()
                  ? "bg-[var(--accent)] text-[var(--accent-contrast)] font-bold shadow-sm"
                  : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--muted)]/15"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Layout */}
      {filteredArticles.length > 0 ? (
        <div className="space-y-10">
          {/* Spotlight Hero Article */}
          {featuredArticle && (
            <div>
              <FeaturedArticleHero article={featuredArticle} />
            </div>
          )}

          {/* Grid + Intelligence Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Secondary Articles (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--muted)]/10">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
                  Recent Deep Dives ({secondaryArticles.length})
                </span>
                <span className="text-[11px] font-mono text-[var(--muted)]">
                  Showing {filteredArticles.length} total
                </span>
              </div>

              {secondaryArticles.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {secondaryArticles.map((article) => (
                    <div key={article.id} className="model-card-contain">
                      <ArticleCard article={article} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 text-center text-xs text-[var(--muted)]">
                  All articles for this filter are displayed in the spotlight hero above.
                </div>
              )}
            </div>

            {/* Sticky Sidebar (4 cols on desktop) */}
            <div className="lg:col-span-4 sticky top-24">
              <ArticlesSidebar />
            </div>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center flex flex-col items-center justify-center border border-[var(--muted)]/10 bg-[var(--card-bg)] rounded-[var(--radius-card)] p-8 space-y-3">
          <div className="p-3 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] mb-1">
            <SearchX size={24} />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">No matching research articles found</p>
          <p className="text-xs text-[var(--muted)] max-w-sm">
            Try adjusting your search keywords or switching category filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
            }}
            className="mt-2 bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold px-4 py-2 rounded-[var(--radius-control)] hover:opacity-90 transition-opacity btn-tactile cursor-pointer"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}

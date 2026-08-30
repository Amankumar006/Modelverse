import React from "react";
import type { Metadata } from "next";
import { Newspaper } from "lucide-react";
import { getArticles } from "@/lib/supabase/articles";
import ArticleCard from "@/components/articles/ArticleCard";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI News & Intelligence — Modelverse",
  description:
    "Daily fact-checked reports on foundation model releases, architecture papers, and AI laboratory announcements.",
};

export default async function ArticlesPage() {
  const { articles } = await getArticles({ limit: 50, isPublished: true });

  const featuredArticle = articles[0] || null;
  const remainingArticles = articles.slice(1);

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Newspaper size={14} className="shrink-0" />
          <span>Intelligence Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Latest AI News & Analysis
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
          Comprehensive, verified coverage of frontier foundation model releases, benchmark updates, and research breakthroughs.
        </p>
      </div>

      {articles.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--muted)]/10 p-8">
          <p className="text-sm font-semibold text-[var(--text)]">No articles published yet</p>
          <p className="text-xs text-[var(--muted)] mt-1">Check back soon for the latest AI intelligence digests.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {featuredArticle && (
            <div>
              <ArticleCard article={featuredArticle} featured={true} />
            </div>
          )}

          {remainingArticles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {remainingArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

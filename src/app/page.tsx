import React from "react";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";
import HeroSection from "@/components/hero/HeroSection";
import ModelCatalog from "@/components/models/ModelCatalog";
import ArticleCard from "@/components/articles/ArticleCard";

export const revalidate = 60;

export default async function HomePage() {
  const [{ models, total: totalModels }, { articles, total: totalArticles }] =
    await Promise.all([
      getModels({ limit: 32, isActive: true }),
      getArticles({ limit: 4, isPublished: true }),
    ]);

  const featuredArticle = articles[0] || null;
  const subArticles = articles.slice(1, 4);

  return (
    <main className="w-full flex flex-col flex-1">
      {/* Hero Section with Search & Stats */}
      <HeroSection totalModels={totalModels} totalArticles={totalArticles} />

      {/* Model Catalog Section */}
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1 block">
                Model Registry
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                Explore Foundation Models
              </h2>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                Filter by architecture, parameter counts, context windows, and frontier capabilities.
              </p>
            </div>

            <Link
              href="/models"
              className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:opacity-85 transition-opacity uppercase tracking-wider shrink-0"
            >
              Browse Full Archive
              <ArrowRight size={14} />
            </Link>
          </div>

          <ModelCatalog initialModels={models} />
        </div>
      </section>

      {/* Intelligence & Articles Section */}
      {articles.length > 0 && (
        <section className="w-full bg-[var(--card-bg)]/40 border-t border-[var(--muted)]/10 py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
                  <Newspaper size={14} className="shrink-0" />
                  <span>Intelligence Digest</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--text)] tracking-tight">
                  Latest AI News & Analysis
                </h2>
                <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
                  Real-time releases, architecture papers, and updates from leading research labs.
                </p>
              </div>

              <Link
                href="/articles"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:opacity-85 transition-opacity uppercase tracking-wider shrink-0"
              >
                View All Articles
                <ArrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {featuredArticle && (
                <div className="lg:col-span-7">
                  <ArticleCard article={featuredArticle} featured={true} />
                </div>
              )}

              <div className="lg:col-span-5 flex flex-col gap-4">
                {subArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} featured={false} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

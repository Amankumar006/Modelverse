import React from "react";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";
import HeroSection from "@/components/hero/HeroSection";
import FeaturedModelsSection from "@/components/home/FeaturedModelsSection";
import CategoryExplorerSection from "@/components/home/CategoryExplorerSection";
import ArticleCard from "@/components/articles/ArticleCard";

export const revalidate = 60;

export default async function HomePage() {
  const [{ models, total: totalModels }, { articles, total: totalArticles }] =
    await Promise.all([
      getModels({ limit: 6, isActive: true }),
      getArticles({ limit: 4, isPublished: true }),
    ]);

  const featuredArticle = articles[0] || null;
  const subArticles = articles.slice(1, 4);

  return (
    <main className="w-full flex flex-col flex-1">
      {/* Hero Section with Search & Stats */}
      <HeroSection totalModels={totalModels} totalArticles={totalArticles} />

      {/* Featured Flagship Spotlight (6 Top Models) */}
      <FeaturedModelsSection models={models} totalModels={totalModels} />

      {/* Domain Modality Categories Hub */}
      <CategoryExplorerSection />

      {/* Intelligence & Technical Articles Section */}
      {articles.length > 0 && (
        <section className="w-full bg-[var(--card-bg)]/40 border-t border-[var(--muted)]/10 py-12 md:py-16">
          <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 flex flex-col gap-8">
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {featuredArticle && (
                <div className="lg:col-span-7 3xl:col-span-8">
                  <ArticleCard article={featuredArticle} featured={true} />
                </div>
              )}

              <div className="lg:col-span-5 3xl:col-span-4 flex flex-col gap-4">
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

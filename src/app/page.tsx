import React from "react";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";
import HeroSection from "@/components/hero/HeroSection";
import FeaturedModelsSection from "@/components/home/FeaturedModelsSection";
import CategoryExplorerSection from "@/components/home/CategoryExplorerSection";
import HomeNewsSection from "@/components/home/HomeNewsSection";

export const revalidate = 60;

export default async function HomePage() {
  const [{ models, total: totalModels }, { articles, total: totalArticles }] =
    await Promise.all([
      getModels({ limit: 6, isActive: true }),
      getArticles({ limit: 4, isPublished: true }),
    ]);

  return (
    <main className="w-full flex flex-col flex-1">
      {/* Hero Section with Search & Stats */}
      <HeroSection totalModels={totalModels} totalArticles={totalArticles} />

      {/* Featured Flagship Spotlight (6 Top Models) */}
      <FeaturedModelsSection models={models} totalModels={totalModels} />

      {/* Domain Modality Categories Hub */}
      <CategoryExplorerSection />

      {/* Intelligence & Technical Articles Section */}
      <HomeNewsSection articles={articles} />
    </main>
  );
}

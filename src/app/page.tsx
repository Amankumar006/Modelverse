import React from "react";
import type { Metadata } from "next";
import { getModels, getModelCount } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";
import { DatasetJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";
import HeroSection from "@/components/hero/HeroSection";
import FeaturedModelsSection from "@/components/home/FeaturedModelsSection";
import CategoryExplorerSection from "@/components/home/CategoryExplorerSection";
import HomeNewsSection from "@/components/home/HomeNewsSection";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const count = await getModelCount();
  const countText = count > 0 ? `${count}+` : "386+";
  const description = `Explore ${countText} foundation models, verified parameters, context windows, benchmark figures, and real-time AI news on TheModelverse.`;

  return {
    description,
    openGraph: {
      description: `Explore ${countText} foundation models, parameters, context windows, and verified benchmarks on TheModelverse.`,
    },
    twitter: {
      description: `Explore ${countText} foundation models, parameters, context windows, and verified benchmarks on TheModelverse.`,
    },
  };
}

export default async function HomePage() {
  const [{ models, total: totalModels }, { articles, total: totalArticles }] =
    await Promise.all([
      getModels({ limit: 6, isActive: true }),
      getArticles({ limit: 4, isPublished: true }),
    ]);

  const itemList = models.map((m, index) => ({
    name: `${m.name} (${m.provider})`,
    url: `/models/${m.slug}`,
    position: index + 1,
  }));

  return (
    <>
      <DatasetJsonLd
        name="TheModelverse Foundation Models & Technical Specifications Dataset"
        description="Comprehensive dataset and benchmark ledger of frontier artificial intelligence foundation models with audited parameters, context windows, and pricing."
        modelCount={totalModels}
        url="/"
      />
      <ItemListJsonLd
        name="Featured Foundation Models"
        description="Spotlight of leading audited artificial intelligence foundation models."
        items={itemList}
      />
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
    </>
  );
}

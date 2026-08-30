import React from "react";
import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/models";
import ModelCatalog from "@/components/models/ModelCatalog";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

interface ModelsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: ModelsPageProps): Promise<Metadata> {
  const resolved = await searchParams;
  const category = typeof resolved.category === "string" && resolved.category !== "All" ? resolved.category : null;
  const provider = typeof resolved.provider === "string" && resolved.provider !== "All" ? resolved.provider : null;
  const search = typeof resolved.search === "string" && resolved.search.trim() ? resolved.search.trim() : null;

  let title = "AI Model Catalog & Foundation Model Registry";
  let description = "Comprehensive directory of 376+ foundation models, LLMs, multimodal, vision, and code models with verified parameters, context windows, and benchmarks.";

  if (category) {
    title = `${category} AI Models & Foundation Architecture Directory`;
    description = `Explore verified ${category.toLowerCase()} foundation models, parameter counts, context architectures, and benchmark evaluations on Modelverse.`;
  } else if (provider) {
    title = `${provider} AI Models, Parameters & Pricing Ledger`;
    description = `Browse all foundation models and API endpoints developed by ${provider} with verified benchmarks and context capacities.`;
  } else if (search) {
    title = `Search Results for "${search}" — Foundation Models`;
    description = `Discover foundation models matching "${search}" across all AI research laboratories.`;
  }

  const canonicalUrl = category
    ? `/models?category=${encodeURIComponent(category)}`
    : provider
    ? `/models?provider=${encodeURIComponent(provider)}`
    : "/models";

  return {
    title,
    description,
    keywords: [
      category ? `${category} AI models` : "AI models",
      provider ? `${provider} models` : "foundation models",
      "LLM benchmarks",
      "model parameters",
      "context window comparison",
      "AI pricing directory",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const resolved = await searchParams;
  const initialSearch = typeof resolved.search === "string" ? resolved.search : "";
  const initialCategory = typeof resolved.category === "string" ? resolved.category : "All";
  const initialProvider = typeof resolved.provider === "string" ? resolved.provider : "All";

  // Fetch all active foundation models from database
  const { models } = await getModels({ limit: 1000, isActive: true });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Models", url: "/models" },
  ];

  const itemList = models.slice(0, 30).map((m, index) => ({
    name: `${m.name} (${m.provider})`,
    url: `/models/${m.slug}`,
    position: index + 1,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        name="Foundation Models Directory"
        description="Comprehensive index of artificial intelligence foundation models."
        items={itemList}
      />
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 flex flex-col gap-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1 block">
            Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            Foundation Models Archive
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
            Filter and compare frontier foundation models, parameter counts, context architectures, and primary laboratory documentation.
          </p>
        </div>

        <ModelCatalog
          initialModels={models}
          initialSearch={initialSearch}
          initialCategory={initialCategory}
          initialProvider={initialProvider}
        />
      </main>
    </>
  );
}

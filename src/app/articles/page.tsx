import React from "react";
import type { Metadata } from "next";
import { getArticles } from "@/lib/supabase/articles";
import ArticlesHeader from "@/components/articles/ArticlesHeader";
import ArticlesClient from "@/components/articles/ArticlesClient";
import { BreadcrumbJsonLd, ItemListJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Research & Intelligence Hub — Modelverse",
  description: "Comprehensive, fact-checked deep dives into frontier foundation model architectures, reinforcement learning paradigms, and AI research papers.",
  keywords: [
    "AI news",
    "foundation model papers",
    "DeepSeek R1 architecture",
    "Claude 3.5 Sonnet analysis",
    "AI research digest",
    "Gemini 2.0 Flash benchmarks",
    "Llama 3.3 MoE compute",
  ],
  alternates: {
    canonical: "/articles",
  },
  openGraph: {
    title: "AI Research & Intelligence Hub — Modelverse",
    description: "Comprehensive, fact-checked deep dives into frontier foundation model architectures, reinforcement learning paradigms, and AI research papers.",
    url: "/articles",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Research & Intelligence Hub — Modelverse",
    description: "Comprehensive, fact-checked deep dives into frontier foundation model architectures, reinforcement learning paradigms, and AI research papers.",
  },
};

export default async function ArticlesPage() {
  const { articles } = await getArticles({ limit: 100, isPublished: true });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Intelligence Hub", url: "/articles" },
  ];

  const itemList = articles.map((a, index) => ({
    name: a.title,
    url: `/articles/${a.slug}`,
    position: index + 1,
  }));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ItemListJsonLd
        name="AI Intelligence Digests"
        description="Latest research breakthroughs and foundation model analysis."
        items={itemList}
      />
      <main className="w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 py-10 md:py-14 flex flex-col gap-8">
        <ArticlesHeader totalArticles={articles.length} />
        <ArticlesClient initialArticles={articles} />
      </main>
    </>
  );
}

import React from "react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getArticles, getModelsForArticle } from "@/lib/supabase/articles";
import { ArticleJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { normalizeArticleSourceName } from "@/lib/sanitize-article-content";
import MediumArticleHeader from "@/components/articles/MediumArticleHeader";
import MediumArticleBody from "@/components/articles/MediumArticleBody";
import MediumArticleFooter from "@/components/articles/MediumArticleFooter";
import ArticleReferencedModels from "@/components/articles/ArticleReferencedModels";
import AdSenseUnit from "@/components/ads/AdSenseUnit";

export const revalidate = 60;

export async function generateStaticParams() {
  const { articles } = await getArticles({ limit: 500, isPublished: true });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const title = article.title;
  const description = article.summary || article.title;
  const sourceName = normalizeArticleSourceName(article.source_name, "TheModelverse Intelligence");

  return {
    title,
    description,
    keywords: [
      article.title,
      article.category || "AI Research",
      sourceName,
      "Artificial Intelligence Research",
      "Foundation Model Architecture",
    ],
    alternates: {
      canonical: `/articles/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: `${title} | TheModelverse Intelligence`,
      description,
      type: "article",
      url: `/articles/${slug}`,
      publishedTime: article.published_at,
      authors: [sourceName],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | TheModelverse Intelligence`,
      description,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const rawArticle = await getArticleBySlug(slug);

  if (!rawArticle) {
    notFound();
  }

  const normalizedSource = normalizeArticleSourceName(rawArticle.source_name, "TheModelverse Intelligence");
  const article = {
    ...rawArticle,
    source_name: normalizedSource,
  };

  // Fetch referenced models and recent articles concurrently
  const [referencedModels, { articles: allArticles }] = await Promise.all([
    getModelsForArticle(article),
    getArticles({ limit: 4, isPublished: true }),
  ]);
  const relatedArticles = allArticles
    .filter((a) => a.slug !== slug)
    .slice(0, 2)
    .map((a) => ({
      ...a,
      source_name: normalizeArticleSourceName(a.source_name, "TheModelverse Intelligence"),
    }));

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Intelligence", url: "/articles" },
    { name: article.title, url: `/articles/${slug}` },
  ];

  const coverImage = article.cover_image || "/images/articles/universal-cover.svg";
  const isSvg = coverImage.endsWith(".svg");
  const readingTime = Math.max(3, Math.round((article.content || "").split(/\s+/).length / 200));

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ArticleJsonLd article={article} />

      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-12 flex flex-col items-center">
        {/* Medium Header */}
        <MediumArticleHeader
          title={article.title}
          summary={article.summary || undefined}
          category={article.category || undefined}
          sourceName={article.source_name}
          sourceUrl={article.source_url || undefined}
          publishedAt={article.published_at}
          readingTime={readingTime}
          slug={article.slug}
        />

        {/* Medium Hero Image & Caption */}
        <figure className="w-full max-w-[728px] mx-auto my-6 sm:my-8">
          <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[var(--muted)]/10 shadow-[var(--shadow-card)] border border-[var(--muted)]/15">
            <Image
              src={coverImage}
              alt={article.title}
              fill
              priority
              unoptimized={isSvg}
              className="object-cover"
            />
          </div>
          <figcaption className="text-center text-xs text-[var(--muted)] mt-3 font-sans tracking-wide">
            Figure 1: Official research and architecture release visual · {article.source_name}
          </figcaption>
        </figure>

        {/* Medium Article Prose Body */}
        <MediumArticleBody content={article.content} />

        {/* Referenced Model Specifications & Benchmarks */}
        <ArticleReferencedModels models={referencedModels} />

        {/* Medium Article Footer */}
        <MediumArticleFooter
          sourceName={article.source_name}
          category={article.category || undefined}
          slug={article.slug}
          relatedArticles={relatedArticles}
        />

        {/* In-Article AdSense Unit */}
        <div className="w-full max-w-[728px] mx-auto mt-8">
          <AdSenseUnit slotId="article-detail-footer-slot" format="horizontal" minHeight={90} />
        </div>
      </main>
    </>
  );
}


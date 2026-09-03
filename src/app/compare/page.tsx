import React, { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { getModels } from "@/lib/supabase/models";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { CompareDashboard } from "@/components/compare/CompareDashboard";
import { CURATED_POPULAR_PAIRS, getCanonicalCompareSlug } from "@/lib/compare";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Compare AI Foundation Models — Matrix, Benchmarks & VRAM Sizing",
  description: "Compare artificial intelligence foundation models side-by-side across parameters, quantization compression, context windows, API pricing, and benchmark scores.",
  keywords: [
    "Compare AI models",
    "LLM comparison tool",
    "DeepSeek vs Claude",
    "OpenAI vs Anthropic pricing",
    "Context window comparison matrix",
    "Foundation model specs comparison",
    "Model quantization VRAM calculator",
  ],
  alternates: {
    canonical: "/compare",
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
    title: "Compare AI Foundation Models — Matrix, Benchmarks & VRAM Sizing",
    description: "Compare foundation models side-by-side across parameters, quantization compression, context windows, API pricing, and benchmark scores.",
    url: "/compare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare AI Foundation Models — Matrix, Benchmarks & VRAM Sizing",
    description: "Compare foundation models side-by-side across parameters, quantization compression, context windows, API pricing, and benchmark scores.",
  },
};

export default async function ComparePage() {
  const { models } = await getModels({ limit: 1000, isActive: true });

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare Models", url: "/compare" },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 py-12 md:py-16 flex flex-col gap-8">
        <div>
          <Link
            href="/models"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-3"
          >
            <ArrowLeft size={14} /> Back to Catalog
          </Link>
          <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[var(--text)] tracking-tight">
            Model Showdown & Comparison Engine
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
            Select up to 3 models to perform a side-by-side technical evaluation across benchmarks, quantization compression, inference economics, and hardware VRAM requirements.
          </p>

          {/* Quick-Hop Popular Showdowns */}
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--muted)]">
              <TrendingUp size={13} className="text-[var(--accent)]" />
              <span>Trending Comparisons:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {CURATED_POPULAR_PAIRS.slice(0, 8).map(([s1, s2]) => {
                const pairCanonical = getCanonicalCompareSlug(s1, s2);
                const name1 = models.find((m) => m.slug === s1)?.name || s1;
                const name2 = models.find((m) => m.slug === s2)?.name || s2;

                return (
                  <Link
                    key={pairCanonical}
                    href={`/compare/${pairCanonical}`}
                    className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--muted)]/5 hover:bg-[var(--muted)]/15 text-[var(--text)] border border-[var(--muted)]/10 transition-colors"
                  >
                    <span>{name1}</span>
                    <span className="text-[var(--muted)] text-[10px]">vs</span>
                    <span>{name2}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <Suspense fallback={<div className="h-96 w-full animate-pulse bg-[var(--card-bg)] rounded-xl border border-[var(--muted)]/10" />}>
          <CompareDashboard models={models} />
        </Suspense>
      </main>
    </>
  );
}

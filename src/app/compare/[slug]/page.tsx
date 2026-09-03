import React, { Suspense } from "react";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitCompare } from "lucide-react";
import { getModelBySlug, getModels } from "@/lib/supabase/models";
import {
  parseCompareSlug,
  getCanonicalCompareSlug,
  CURATED_POPULAR_PAIRS,
} from "@/lib/compare";
import { BreadcrumbJsonLd, ComparisonJsonLd } from "@/components/seo/JsonLd";
import { CompareVerdict } from "@/components/compare/CompareVerdict";
import { ModelCompressionMeter } from "@/components/compare/ModelCompressionMeter";
import { BenchmarkDiff } from "@/components/compare/BenchmarkDiff";
import { InferenceEconomics } from "@/components/compare/InferenceEconomics";
import { ArchitectureMatrix } from "@/components/compare/ArchitectureMatrix";
import { CompareDashboard } from "@/components/compare/CompareDashboard";

export const revalidate = 60;

export async function generateStaticParams() {
  return CURATED_POPULAR_PAIRS.map(([s1, s2]) => ({
    slug: getCanonicalCompareSlug(s1, s2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);

  if (!parsed) {
    return { title: "Model Comparison — Modelverse" };
  }

  const { slug1, slug2 } = parsed;
  const [model1, model2] = await Promise.all([
    getModelBySlug(slug1),
    getModelBySlug(slug2),
  ]);

  if (!model1 || !model2) {
    return { title: "Model Showdown — Modelverse" };
  }

  const canonicalSlug = getCanonicalCompareSlug(model1.slug, model2.slug);
  const title = `${model1.name} vs ${model2.name}: Specs, Benchmarks, VRAM & Pricing`;
  const description = `Compare ${model1.name} (${model1.provider}) vs ${model2.name} (${model2.provider}) side-by-side. Analyze MMLU-Pro, SWE-bench, GPQA, required VRAM, quantization compression, and API token pricing.`;

  return {
    title,
    description,
    keywords: [
      `${model1.name} vs ${model2.name}`,
      `${model1.name} comparison`,
      `${model2.name} comparison`,
      "LLM comparison",
      "AI model benchmarks",
      "VRAM hardware requirements",
      "Model quantization sizing",
    ],
    alternates: {
      canonical: `/compare/${canonicalSlug}`,
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
      title,
      description,
      type: "website",
      url: `/compare/${canonicalSlug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function CompareSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parsed = parseCompareSlug(slug);

  if (!parsed) {
    notFound();
  }

  const { slug1, slug2 } = parsed;

  // Fetch both models and all models for the selector
  const [model1, model2, { models: allModels }] = await Promise.all([
    getModelBySlug(slug1),
    getModelBySlug(slug2),
    getModels({ limit: 1000, isActive: true }),
  ]);

  let resolved1 = model1;
  let resolved2 = model2;

  if (!resolved1) {
    resolved1 =
      allModels.find(
        (m) => m.slug === slug1 || m.slug.startsWith(slug1) || m.slug.includes(slug1) || slug1.includes(m.slug)
      ) || null;
  }

  if (!resolved2) {
    resolved2 =
      allModels.find(
        (m) => m.slug === slug2 || m.slug.startsWith(slug2) || m.slug.includes(slug2) || slug2.includes(m.slug)
      ) || null;
  }

  if (!resolved1 || !resolved2) {
    notFound();
  }

  // Enforce canonical sorted URL
  const expectedCanonical = getCanonicalCompareSlug(resolved1.slug, resolved2.slug);
  if (slug !== expectedCanonical) {
    redirect(`/compare/${expectedCanonical}`);
  }

  const activeModel1 = resolved1;
  const activeModel2 = resolved2;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Compare", url: "/compare" },
    { name: `${activeModel1.name} vs ${activeModel2.name}`, url: `/compare/${expectedCanonical}` },
  ];

  // Discover other popular comparisons involving either model
  const relatedPairs = CURATED_POPULAR_PAIRS.filter(
    ([s1, s2]) =>
      (s1 === activeModel1.slug || s2 === activeModel1.slug || s1 === activeModel2.slug || s2 === activeModel2.slug) &&
      getCanonicalCompareSlug(s1, s2) !== expectedCanonical
  ).slice(0, 6);

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ComparisonJsonLd
        model1={activeModel1}
        model2={activeModel2}
        canonicalUrl={`/compare/${expectedCanonical}`}
      />

      <main className="w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 py-12 md:py-16 flex flex-col gap-10">
        {/* Top Navigation & Breadcrumb */}
        <div>
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
          >
            <ArrowLeft size={14} /> Back to Model Comparison Engine
          </Link>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              {activeModel1.provider}
            </span>
            <span className="text-xs font-bold text-[var(--muted)]">vs</span>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
              {activeModel2.provider}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-[var(--text)] tracking-tight">
            {activeModel1.name} <span className="text-[var(--muted)] font-normal text-2xl sm:text-3xl">vs</span> {activeModel2.name}
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-2 max-w-3xl leading-relaxed">
            Side-by-side technical showdown between {activeModel1.name} and {activeModel2.name}. Compare verified benchmark scores, quantization compression (FP16, FP8, INT4), local GPU VRAM requirements, and API inference pricing.
          </p>
        </div>

        {/* Executive Verdict Cards */}
        <CompareVerdict model1={activeModel1} model2={activeModel2} />

        {/* Model Compression & Hardware Math */}
        <ModelCompressionMeter models={[activeModel1, activeModel2]} />

        {/* Standardized Benchmark Showdown */}
        <BenchmarkDiff models={[activeModel1, activeModel2]} />

        {/* Inference Economics Simulator */}
        <InferenceEconomics models={[activeModel1, activeModel2]} />

        {/* Architecture & Feature Matrix */}
        <ArchitectureMatrix models={[activeModel1, activeModel2]} />

        {/* Interactive Customizer & Add 3rd Model */}
        <div className="pt-6 border-t border-[var(--muted)]/15">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-3">
            <GitCompare size={15} />
            <span>Customize or Add a 3rd Model to this Showdown</span>
          </div>
          <Suspense fallback={<div className="h-48 w-full animate-pulse bg-[var(--card-bg)] rounded-xl" />}>
            <CompareDashboard
              models={allModels}
              initialM1={activeModel1.slug}
              initialM2={activeModel2.slug}
            />
          </Suspense>
        </div>

        {/* Related Showdowns */}
        {relatedPairs.length > 0 && (
          <div className="pt-6 border-t border-[var(--muted)]/15 flex flex-col gap-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
              More Head-to-Head Comparisons for {activeModel1.name} & {activeModel2.name}
            </div>
            <div className="flex flex-wrap gap-2.5">
              {relatedPairs.map(([s1, s2]) => {
                const pairCanonical = getCanonicalCompareSlug(s1, s2);
                const name1 = allModels.find((m) => m.slug === s1)?.name || s1;
                const name2 = allModels.find((m) => m.slug === s2)?.name || s2;

                return (
                  <Link
                    key={pairCanonical}
                    href={`/compare/${pairCanonical}`}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3.5 py-2 rounded-xl bg-[var(--muted)]/5 hover:bg-[var(--muted)]/15 text-[var(--text)] border border-[var(--muted)]/10 transition-all hover:border-[var(--accent)]/40"
                  >
                    <span>{name1}</span>
                    <span className="text-[var(--muted)] text-[10px]">vs</span>
                    <span>{name2}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

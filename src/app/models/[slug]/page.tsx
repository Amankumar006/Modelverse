import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModels } from "@/lib/supabase/models";
import { normalizeBenchmarks } from "@/lib/benchmarks";
import ModelHeader from "@/components/models/ModelHeader";
import LineageSpecSection from "@/components/models/LineageSpecSection";
import ModelEditorialAnalysis from "@/components/models/ModelEditorialAnalysis";
import PricingSection from "@/components/models/PricingSection";
import BenchmarksSection from "@/components/models/BenchmarksSection";
import QuickstartSection from "@/components/models/QuickstartSection";
import SourcesSection from "@/components/models/SourcesSection";
import ModelDetailTableOfContents from "@/components/models/ModelDetailTableOfContents";
import { ModelJsonLd, BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  const { models } = await getModels({ limit: 500, isActive: true });
  return models.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    return { title: "Model Not Found" };
  }

  const title = `${model.name} (${model.provider}) — Architecture, Benchmarks & Specs`;
  const description =
    model.description ||
    `Verified specifications, parameter counts, context window size, benchmarks, and API quickstarts for ${model.name}.`;

  return {
    title,
    description,
    keywords: [
      model.name,
      model.provider,
      `${model.name} benchmarks`,
      `${model.name} context window`,
      `${model.name} pricing`,
      `${model.name} parameters`,
      model.category || "AI Model",
    ],
    alternates: {
      canonical: `/models/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/models/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    notFound();
  }

  const hasBenchmarks = normalizeBenchmarks(model.benchmarks).length > 0;

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Models", url: "/models" },
    { name: model.name, url: `/models/${slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <ModelJsonLd model={model} />
      <main className="w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 py-10 md:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-12 3xl:grid-cols-12 gap-10 items-start">
          {/* Main Content Area */}
          <div className="xl:col-span-9 3xl:col-span-10 space-y-10">
            {/* Identity & Header */}
            <div id="overview" className="scroll-mt-28">
              <ModelHeader model={model} />
            </div>

            {/* Technical Architecture & Execution Specifications */}
            <div id="specifications" className="scroll-mt-28">
              <LineageSpecSection model={model} />
            </div>

            {/* In-Depth Architectural & Production Analysis */}
            <div id="analysis" className="scroll-mt-28">
              <ModelEditorialAnalysis model={model} />
            </div>

            {/* Verified Benchmarks Visualizer */}
            {hasBenchmarks && (
              <div id="benchmarks" className="scroll-mt-28">
                <BenchmarksSection benchmarks={model.benchmarks} />
              </div>
            )}

            {/* Commercial Rates & API Pricing */}
            <div id="pricing" className="scroll-mt-28">
              <PricingSection model={model} />
            </div>

            {/* API Multi-Language Quickstart */}
            <div id="quickstart" className="scroll-mt-28">
              <QuickstartSection model={model} />
            </div>

            {/* Sources & Provenance Links */}
            <div id="sources" className="scroll-mt-28">
              <SourcesSection model={model} />
            </div>
          </div>

          {/* Interactive Sticky Table of Contents */}
          <aside className="hidden xl:block xl:col-span-3 3xl:col-span-2 sticky top-24 p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 text-xs">
            <ModelDetailTableOfContents hasBenchmarks={hasBenchmarks} />
          </aside>
        </div>
      </main>
    </>
  );
}

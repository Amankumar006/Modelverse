import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModels } from "@/lib/supabase/models";
import { normalizeBenchmarks } from "@/lib/benchmarks";
import ModelHeader from "@/components/models/ModelHeader";
import LineageSpecSection from "@/components/models/LineageSpecSection";
import PricingSection from "@/components/models/PricingSection";
import BenchmarksSection from "@/components/models/BenchmarksSection";
import QuickstartSection from "@/components/models/QuickstartSection";
import SourcesSection from "@/components/models/SourcesSection";
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
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
          {/* Main Content Area (9 cols on wide screens) */}
          <div className="xl:col-span-9 space-y-10">
            {/* Identity & Header */}
            <div id="overview">
              <ModelHeader model={model} />
            </div>

            {/* Technical Architecture & Execution Specifications */}
            <div id="specifications">
              <LineageSpecSection model={model} />
            </div>

            {/* Verified Benchmarks Visualizer */}
            {hasBenchmarks && (
              <div id="benchmarks">
                <BenchmarksSection benchmarks={model.benchmarks} />
              </div>
            )}

            {/* Commercial Rates & API Pricing */}
            <div id="pricing">
              <PricingSection model={model} />
            </div>

            {/* API Multi-Language Quickstart */}
            <div id="quickstart">
              <QuickstartSection model={model} />
            </div>

            {/* Sources & Provenance Links */}
            <div id="sources">
              <SourcesSection model={model} />
            </div>
          </div>

          {/* Sticky Table of Contents (3 cols on desktop) */}
          <aside className="hidden xl:block xl:col-span-3 sticky top-24 p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 text-xs space-y-4">
            <div className="flex items-center gap-2 text-[var(--text)] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-3 bg-[var(--accent)] rounded-full" />
              <span>On This Page</span>
            </div>

            <ul className="space-y-2.5 text-[var(--muted)] pl-2 border-l border-[var(--muted)]/10 font-medium">
              <li>
                <a href="#overview" className="hover:text-[var(--accent)] transition-colors block">
                  Overview &amp; Identity
                </a>
              </li>
              <li>
                <a href="#specifications" className="hover:text-[var(--accent)] transition-colors block">
                  Architecture &amp; Specs
                </a>
              </li>
              {hasBenchmarks && (
                <li>
                  <a href="#benchmarks" className="hover:text-[var(--accent)] transition-colors block">
                    Verified Benchmarks
                  </a>
                </li>
              )}
              <li>
                <a href="#pricing" className="hover:text-[var(--accent)] transition-colors block">
                  Commercial Pricing
                </a>
              </li>
              <li>
                <a href="#quickstart" className="hover:text-[var(--accent)] transition-colors block">
                  API Quickstart
                </a>
              </li>
              <li>
                <a href="#sources" className="hover:text-[var(--accent)] transition-colors block">
                  Sources &amp; Repositories
                </a>
              </li>
            </ul>
          </aside>
        </div>
      </main>
    </>
  );
}

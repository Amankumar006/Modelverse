import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModelBySlug, getModels } from "@/lib/supabase/models";
import ModelHeader from "@/components/models/ModelHeader";
import SpecMatrix from "@/components/models/SpecMatrix";
import BenchmarksSection from "@/components/models/BenchmarksSection";
import QuickstartSection from "@/components/models/QuickstartSection";
import SourcesSection from "@/components/models/SourcesSection";

export const revalidate = 60;

export async function generateStaticParams() {
  const { models } = await getModels({ limit: 50, isActive: true });
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
    return { title: "Model Not Found — Modelverse" };
  }

  return {
    title: `${model.name} (${model.provider}) — Architecture, Benchmarks & Specs — Modelverse`,
    description:
      model.description ||
      `Verified specifications, parameter counts, context window size, benchmarks, and API quickstarts for ${model.name}.`,
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

  const benchmarks = (typeof model.benchmarks === "object" && model.benchmarks !== null ? model.benchmarks : {}) as Record<string, number | string>;

  return (
    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
        {/* Main Content Area (9 cols on wide) */}
        <div className="xl:col-span-9 space-y-10">
          {/* Identity & Header */}
          <div id="overview">
            <ModelHeader model={model} />
          </div>

          {/* Key Specs Matrix */}
          <div id="specifications">
            <SpecMatrix model={model} />
          </div>

          {/* Verified Benchmarks Visualizer */}
          {Object.keys(benchmarks).length > 0 && (
            <div id="benchmarks">
              <BenchmarksSection benchmarks={benchmarks} />
            </div>
          )}

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
            {Object.keys(benchmarks).length > 0 && (
              <li>
                <a href="#benchmarks" className="hover:text-[var(--accent)] transition-colors block">
                  Verified Benchmarks
                </a>
              </li>
            )}
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
  );
}

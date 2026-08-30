import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Cpu, Layers, DollarSign, Globe } from "lucide-react";
import { getModelBySlug, getModels } from "@/lib/supabase/models";
import BenchmarksSection from "@/components/models/BenchmarksSection";
import QuickstartSection from "@/components/models/QuickstartSection";

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
    title: `${model.name} (${model.provider}) — Specs & Benchmarks — Modelverse`,
    description:
      model.description ||
      `Technical specifications, context window, benchmarks, and pricing for ${model.name}.`,
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

  const links = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;
  const benchmarks = (typeof model.benchmarks === "object" && model.benchmarks !== null ? model.benchmarks : {}) as Record<string, number | string>;
  const modalities = Array.isArray(model.modalities) ? model.modalities : ["text"];

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-14 flex flex-col gap-8">
      {/* Back Link */}
      <Link
        href="/models"
        className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium self-start"
      >
        <ArrowLeft size={14} /> Back to Model Catalog
      </Link>

      {/* Model Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              {model.provider}
            </span>
            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[var(--tag-bg)] text-[var(--tag-text)] font-medium uppercase tracking-wider">
              {model.category || "LLM"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            {model.name}
          </h1>
          {model.description && (
            <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-2xl">
              {model.description}
            </p>
          )}
        </div>

        {/* Action Link */}
        {links.website && (
          <a
            href={links.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity shrink-0 self-start md:self-center"
          >
            <span>Official Page</span>
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Key Specifications Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1 font-medium">
            <Cpu size={14} className="text-[var(--accent)]" /> Context Window
          </div>
          <p className="text-base sm:text-lg font-bold text-[var(--text)] font-mono">
            {model.context_window ? `${model.context_window.toLocaleString()} tokens` : "Standard"}
          </p>
        </div>

        <div className="p-4 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1 font-medium">
            <Layers size={14} className="text-[var(--accent)]" /> Parameters
          </div>
          <p className="text-base sm:text-lg font-bold text-[var(--text)] font-mono">
            {model.parameters || "Proprietary"}
          </p>
        </div>

        <div className="p-4 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1 font-medium">
            <DollarSign size={14} className="text-[var(--accent)]" /> Pricing (1M in)
          </div>
          <p className="text-base sm:text-lg font-bold text-[var(--text)] font-mono">
            {pricing.input_per_1m !== undefined ? `$${pricing.input_per_1m}` : "Custom"}
          </p>
        </div>

        <div className="p-4 rounded-[var(--radius-control)] bg-[var(--card-bg)] border border-[var(--muted)]/10">
          <div className="flex items-center gap-1.5 text-[var(--muted)] text-xs mb-1 font-medium">
            <Globe size={14} className="text-[var(--accent)]" /> Modalities
          </div>
          <p className="text-xs sm:text-sm font-bold text-[var(--text)] capitalize">
            {modalities.join(", ")}
          </p>
        </div>
      </div>

      {/* Verified Benchmarks */}
      <BenchmarksSection benchmarks={benchmarks} />

      {/* API Quickstart */}
      <QuickstartSection model={model} />

      {/* Primary Links */}
      {Object.keys(links).length > 0 && (
        <section className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[var(--text)]">
            Official Documentation & Resources
          </h2>
          <div className="flex flex-wrap gap-2">
            {Object.entries(links).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs text-[var(--text)] border border-[var(--muted)]/10 transition-colors capitalize font-medium"
              >
                <span>{key}</span>
                <ExternalLink size={12} className="opacity-60" />
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ModelRow } from "@/types/database";
import ModelCard from "@/components/models/ModelCard";

interface FeaturedModelsSectionProps {
  models: ModelRow[];
  totalModels: number;
}

export default function FeaturedModelsSection({
  models,
  totalModels,
}: FeaturedModelsSectionProps) {
  const spotlightModels = models.slice(0, 6);

  return (
    <section className="w-full max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 py-12 md:py-16">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
              <Sparkles size={14} />
              <span>Flagship Spotlight</span>
            </div>
            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-[var(--text)] tracking-tight">
              Frontier Foundation Models
            </h2>
            <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
              Audited parameter counts, context windows, and verified benchmarks for top foundation models.
            </p>
          </div>

          <Link
            href="/models"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--accent)] hover:opacity-85 transition-all uppercase tracking-wider shrink-0 group"
          >
            <span>Explore All {totalModels} Models</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Responsive Grid scaling gracefully up to 3xl/4xl TV screens */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-6">
          {spotlightModels.map((model) => (
            <div key={model.id} className="model-card-contain">
              <ModelCard model={model} variant="card" />
            </div>
          ))}
        </div>

        {/* Bottom Explorer Action */}
        <div className="text-center pt-2">
          <Link
            href="/models"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--card-bg)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-xs text-[var(--text)] font-bold border border-[var(--muted)]/15 shadow-sm transition-all btn-tactile"
          >
            <span>Browse Full {totalModels}-Model Catalog with Filters</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}

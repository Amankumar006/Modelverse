import React from "react";
import type { Metadata } from "next";
import { getModels } from "@/lib/supabase/models";
import ModelCatalog from "@/components/models/ModelCatalog";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Model Catalog — Modelverse",
  description:
    "Comprehensive directory of LLMs, multimodal, vision, and code models with verified parameters, context windows, and benchmarks.",
};

interface ModelsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const resolved = await searchParams;
  const initialSearch = typeof resolved.search === "string" ? resolved.search : "";
  const initialCategory = typeof resolved.category === "string" ? resolved.category : "All";
  const initialProvider = typeof resolved.provider === "string" ? resolved.provider : "All";

  // Fetch all active foundation models from database
  const { models } = await getModels({ limit: 1000, isActive: true });

  return (
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
  );
}

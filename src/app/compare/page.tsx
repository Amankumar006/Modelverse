import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getModels } from "@/lib/supabase/models";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Compare AI Foundation Models — Matrix & Specs",
  description: "Compare artificial intelligence foundation models side-by-side across parameters, context windows, API pricing, and benchmark scores.",
  keywords: [
    "Compare AI models",
    "LLM comparison tool",
    "DeepSeek vs Claude",
    "OpenAI vs Anthropic pricing",
    "Context window comparison matrix",
    "Foundation model specs comparison",
  ],
  alternates: {
    canonical: "/compare",
  },
  openGraph: {
    title: "Compare AI Foundation Models — Matrix & Specs",
    description: "Compare foundation models side-by-side across parameters, context windows, API pricing, and benchmark scores.",
    url: "/compare",
  },
  twitter: {
    card: "summary_large_image",
    title: "Compare AI Foundation Models — Matrix & Specs",
    description: "Compare foundation models side-by-side across parameters, context windows, API pricing, and benchmark scores.",
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
            Model Comparison Matrix
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
            Side-by-side technical evaluation of frontier models, parameter sizing, context window capacity, and cost tiers.
          </p>
        </div>

        {models.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center justify-center bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--muted)]/10 p-8">
            <p className="text-sm font-semibold text-[var(--text)]">No models available for comparison yet</p>
            <p className="text-xs text-[var(--muted)] mt-1">Models will appear here once seeded or ingested.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--muted)]/10 bg-[var(--accent-soft)]/20 text-[var(--text)]">
                  <th className="p-4 font-bold">Model</th>
                  <th className="p-4 font-bold">Provider</th>
                  <th className="p-4 font-bold">Context Window</th>
                  <th className="p-4 font-bold">Parameters</th>
                  <th className="p-4 font-bold">Category</th>
                  <th className="p-4 font-bold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--muted)]/10 text-[var(--text)]">
                {models.map((m) => (
                  <tr key={m.id} className="hover:bg-[var(--bg)] transition-colors">
                    <td className="p-4 font-semibold">{m.name}</td>
                    <td className="p-4 text-[var(--accent)] font-medium">{m.provider}</td>
                    <td className="p-4 font-mono tabular-nums">
                      {m.context_window ? `${m.context_window.toLocaleString("en-US")} tokens` : "Standard"}
                    </td>
                    <td className="p-4 font-mono">{m.parameters || "Proprietary"}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-[var(--tag-bg)] text-[var(--tag-text)] uppercase">
                        {m.category || "LLM"}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/models/${m.slug}`}
                        className="text-xs font-bold text-[var(--accent)] hover:underline"
                      >
                        View Specs &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}

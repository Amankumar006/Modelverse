import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { getAllModelEntries, SITE_URL } from "@/lib/models";
import BenchmarksClient from "./ClientPage";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Model Benchmarks & Leaderboard (MMLU, SWE-bench, GPQA) — Modelverse",
  description: "Comprehensive benchmark leaderboard comparing frontier and open-weight AI models across reasoning, coding, mathematics, and agentic benchmarks.",
  alternates: {
    canonical: `${SITE_URL}/models/benchmarks`,
  },
  openGraph: {
    title: "AI Model Benchmarks & Leaderboard — Modelverse",
    description: "Compare MMLU-Pro, SWE-bench, HumanEval, MATH and other verified evaluations across frontier AI models.",
    url: `${SITE_URL}/models/benchmarks`,
    type: "website",
    siteName: "Modelverse",
    images: [
      {
        url: `${SITE_URL}/logos/social-avatar-1024.png`,
        width: 1024,
        height: 1024,
        alt: "Modelverse Benchmarks Leaderboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Model Benchmarks & Leaderboard — Modelverse",
    description: "Compare MMLU-Pro, SWE-bench, HumanEval, MATH and other verified evaluations across frontier AI models.",
    images: [`${SITE_URL}/logos/social-avatar-1024.png`],
  },
};

export default async function BenchmarksPage() {
  const allModels = await getAllModelEntries();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/models/benchmarks#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Models",
            item: `${SITE_URL}/models`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Benchmarks",
            item: `${SITE_URL}/models/benchmarks`,
          },
        ],
      },
      {
        "@type": "Dataset",
        "@id": `${SITE_URL}/models/benchmarks#dataset`,
        name: "AI Model Benchmarks Leaderboard",
        description: "Comparative benchmark evaluations across artificial intelligence foundation models.",
        url: `${SITE_URL}/models/benchmarks`,
        creator: {
          "@type": "Organization",
          name: "Modelverse",
          url: SITE_URL,
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />
      <JsonLd data={jsonLd} />
      <BenchmarksClient allModels={allModels} />
    </main>
  );
}


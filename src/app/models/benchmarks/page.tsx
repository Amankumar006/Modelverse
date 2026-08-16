import React from "react";
import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { getAllModelEntries, SITE_URL } from "@/lib/models";
import BenchmarksClient from "./ClientPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "LLM Benchmarks & Leaderboard — Modelverse",
  description: "Compare MMLU, HumanEval, MATH and other benchmarks across top AI models.",
  alternates: {
    canonical: `${SITE_URL}/models/benchmarks`,
  },
};

export default async function BenchmarksPage() {
  const allModels = await getAllModelEntries();

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />
      <BenchmarksClient allModels={allModels} />
    </main>
  );
}

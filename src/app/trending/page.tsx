import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Flame } from "lucide-react";
import { getModels } from "@/lib/supabase/models";
import TrendingClient from "@/components/trending/TrendingClient";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Trending AI Models & Leaderboard — Modelverse",
  description:
    "Explore the top trending foundation AI models, ranked by verified benchmark evaluations and search interest.",
};

export default async function TrendingPage() {
  const { models } = await getModels({ limit: 20, isActive: true });

  return (
    <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Flame size={14} />
          <span>Frontier Index</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Trending Models Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
          Ranked foundation models across reasoning performance, context size, and engineering benchmark scores.
        </p>
      </div>

      <TrendingClient initialModels={models} />
    </main>
  );
}

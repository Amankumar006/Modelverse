import type { Metadata } from "next";
import HeroSection from "@/components/hero/HeroSection";
import ModelCard from "@/components/models/ModelCard";
import { getRecentModels, SITE_URL } from "@/lib/models";
import Link from "next/link";
import { ArrowRight, Rss, ShieldCheck, Layers, CheckCircle } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Modelverse — Every AI Model, Every Release",
  description:
    "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships — a living, always-current archive.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Modelverse — Every AI Model, Every Release",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships — a living, always-current archive.",
    url: SITE_URL,
    siteName: "Modelverse",
    images: [
      {
        url: `${SITE_URL}/images/hero-base.jpg`, // Base preview image
        width: 1200,
        height: 630,
        alt: "Modelverse catalog preview",
      },
    ],
  },
};

export default function Home() {
  const recentModels = getRecentModels(4);

  return (
    <main className="bg-black text-white selection:bg-brand-orange selection:text-white">
      {/* ── Hero Section ───────────────────────────────────── */}
      <HeroSection />

      {/* ── Recently Added Models Strip ────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto border-t border-white/[0.06] z-50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
              }}
            >
              Recently Tracked
            </h2>
            <p className="text-sm text-white/50 mt-1.5">
              The latest open-weights breakthroughs and closed-source frontier releases.
            </p>
          </div>
          <Link
            href="/models"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:text-[#e85a28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
          >
            Browse entire catalog
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Horizontal flex / grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentModels.map((model) => (
            <ModelCard key={model.id} model={model} variant="card" />
          ))}
        </div>
      </section>

      {/* ── Timeline / Changelog Teaser Section ──────────────── */}
      <section className="relative py-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto border-t border-white/[0.06] z-50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
              }}
            >
              This Week in AI
            </h2>
            <p className="text-sm text-white/50 mt-1.5">
              Follow changes and updates in chronological order.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="/feed.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full"
            >
              <Rss size={13} className="text-brand-orange" />
              Subscribe via RSS
            </a>
            <Link
              href="/timeline"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:text-[#e85a28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
            >
              View full timeline
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Timeline Changelog List */}
        <div className="border-l border-white/[0.08] ml-4 pl-6 space-y-6">
          {recentModels.map((model) => {
            const dateObj = new Date(model.releaseDate);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            return (
              <div key={model.id} className="relative group">
                <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full bg-black border border-white/20 group-hover:border-brand-orange transition-colors" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-white/40 tabular-nums uppercase">{formattedDate}</span>
                    <span className="text-xs text-white/30">•</span>
                    <span className="text-xs text-white/50">{model.developer}</span>
                  </div>
                  <Link
                    href={`/models/${model.slug}`}
                    className="block text-sm font-semibold text-white group-hover:text-brand-orange transition-colors"
                  >
                    {model.name}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Trust / Methodology Section ────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto border-t border-white/[0.06] z-50 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2
            className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Our Curation Integrity
          </h2>
          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            Every entry on Modelverse is sourced directly from official developer blogs, technical
            model cards, or verified primary documentation. If we cannot corroborate a claim or a
            benchmark score, we mark it as unverified in the catalog rather than presenting guesses.
          </p>
        </div>

        {/* 3 Callout features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-12 max-w-4xl mx-auto">
          <div className="flex flex-col items-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <ShieldCheck size={20} className="text-brand-orange mb-3" />
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Fact-Checked Specs</p>
            <p className="text-[11px] text-white/45 mt-1.5 max-w-[200px]">Only real facts sourced from formal technical documentation.</p>
          </div>
          <div className="flex flex-col items-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <Layers size={20} className="text-brand-orange mb-3" />
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">No Sponsored Claims</p>
            <p className="text-[11px] text-white/45 mt-1.5 max-w-[200px]">No paid benchmarking or biased developer evaluations.</p>
          </div>
          <div className="flex flex-col items-center p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <CheckCircle size={20} className="text-brand-orange mb-3" />
            <p className="text-xs font-semibold text-white/80 uppercase tracking-wider">Always Current</p>
            <p className="text-[11px] text-white/45 mt-1.5 max-w-[200px]">Updated dynamically directly as new foundation models release.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

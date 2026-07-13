import type { Metadata } from "next";
import HeroSection from "@/components/hero/HeroSection";
import DeveloperMarquee from "@/components/home/DeveloperMarquee";
import { getRecentModels, getModelCount, getAllDevelopers, SITE_URL } from "@/lib/models";
import Link from "next/link";
import {
  ArrowRight,
  Rss,
  ShieldCheck,
  Layers,
  CheckCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

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
  const recentModels = getRecentModels(3);
  const modelCount = getModelCount();
  const developers = getAllDevelopers();

  return (
    <main className="bg-black text-white selection:bg-brand-orange selection:text-white">
      {/* ── Hero Section ───────────────────────────────────── */}
      <HeroSection />

      {/* ── Bento-Grid Features Section ────────────────────── */}
      <section className="bg-[#0a0a0a] text-white py-24 px-4 sm:px-6 md:px-8 border-t border-white/[0.04] relative overflow-hidden z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2
                className="text-3xl sm:text-4xl font-normal tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                }}
              >
                What We <span className="italic text-white/50">Track</span>
              </h2>
              <p className="text-sm text-white/40 mt-2 max-w-md">
                From open-weight research breakthroughs to proprietary cloud APIs, follow the entire index of modern AI.
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
                href="/models"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:text-[#e85a28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
              >
                Browse full catalog
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch">
            {/* Column 1: Tracked Releases (Large Row Span Card) */}
            <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-black p-6 sm:p-8 flex flex-col justify-between h-full min-h-[480px]">
              {/* Background Image */}
              <div className="absolute inset-0 z-0 pointer-events-none">
                <img
                  src="/videos/tracked-releases-bg.jpg"
                  alt="Background"
                  className="w-full h-full object-cover opacity-20"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
              </div>

              <div className="relative z-10 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 text-center">
                <Sparkles size={11} className="text-brand-orange" />
                <span>Tracked Releases</span>
                <Sparkles size={11} className="text-brand-orange" />
              </div>

              {/* Mini timeline of recent 3 releases */}
              <div className="relative z-10 space-y-3.5 mt-auto">
                <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">Recently Added</p>
                {recentModels.map((model) => {
                  const dateObj = new Date(model.releaseDate);
                  const formattedDate = dateObj.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <Link
                      key={model.id}
                      href={`/models/${model.slug}`}
                      className="block p-4 rounded-xl bg-white/[0.02] hover:bg-brand-orange/10 border border-white/[0.04] hover:border-brand-orange/30 transition-all text-left group/item"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-white/35 group-hover/item:text-brand-orange/80 transition-colors">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{model.developer}</span>
                      </div>
                      <div className="text-sm font-semibold text-white/80 group-hover/item:text-white transition-colors mt-1 flex items-center justify-between">
                        <span>{model.name}</span>
                        <span className="text-xs text-white/30 group-hover/item:text-white/60 transition-colors opacity-0 group-hover/item:opacity-100">&rarr;</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Stacked Cards (Methodology & stats) */}
            <div className="flex flex-col gap-4 md:gap-5 h-full">
              {/* Methodology Card */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-[#1C201E] noise-overlay p-6 sm:p-7 flex flex-col justify-between flex-1">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src="/videos/tracked-releases-bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-15 mix-blend-luminosity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
                </div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    <ShieldCheck size={12} className="text-brand-orange" />
                    <span>Our Methodology</span>
                  </div>
                  <p className="text-[13px] sm:text-[13.5px] leading-[1.6] text-white/80 mt-4">
                    Every entry on Modelverse is sourced from official documentation, model cards, and primary announcements, then fact-checked before publishing. If we can't verify a detail, we say so plainly.
                  </p>
                </div>
                <div className="relative z-10 text-[11px] text-white/40 font-medium italic mt-4">
                  — Modelverse Editorial Standards
                </div>
              </div>

              {/* Statistics Card */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-black p-6 sm:p-7 flex flex-col justify-between flex-1">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src="/videos/tracked-releases-bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
                </div>

                <div className="relative z-10 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                  <Layers size={12} className="text-brand-orange" />
                  <span>Database Statistics</span>
                </div>

                <div className="relative z-10 text-center py-2">
                  <span className="text-6xl sm:text-7xl font-extralight tracking-tighter text-white drop-shadow select-none">
                    {modelCount}+
                  </span>
                </div>

                <div className="relative z-10 text-[11px] text-white/40 tracking-wider text-center uppercase font-semibold">
                  Models tracked and counting
                </div>
              </div>
            </div>

            {/* Column 3: Stacked Cards (Developers Marquee & Inaccuracy suggestions) */}
            <div className="flex flex-col gap-4 md:gap-5 h-full">
              {/* Developers Marquee */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-black p-6 flex flex-col justify-between flex-[1.6]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src="/videos/tracked-releases-bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90" />
                </div>

                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50 mb-4 z-10">
                  <CheckCircle size={12} className="text-brand-orange" />
                  <span>Developers We Track</span>
                </div>
                <DeveloperMarquee developers={developers} />
              </div>

              {/* Spot an Inaccuracy Suggestions Card */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-[#1C201E] noise-overlay p-5 sm:p-6 flex flex-col justify-between flex-[0.4]">
                {/* Background Image */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  <img
                    src="/videos/tracked-releases-bg.jpg"
                    alt="Background"
                    className="w-full h-full object-cover opacity-15 mix-blend-luminosity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/80" />
                </div>

                <a
                  href="mailto:corrections@modelverse.ai?subject=Modelverse Correction"
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center text-white/70 hover:text-white z-20"
                  title="Submit Correction"
                >
                  <ArrowUpRight size={16} />
                </a>

                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50">
                    <Sparkles size={11} className="text-brand-orange" />
                    <span>Help Us Improve</span>
                  </div>
                  <div className="mt-3.5 space-y-1">
                    <p className="text-sm font-semibold text-white/90 font-mono">corrections@modelverse.ai</p>
                    <p className="text-xs text-white/55">Know a model we're missing? Suggest it.</p>
                  </div>
                </div>

                <div className="relative z-10 mt-3 text-left">
                  <a
                    href="mailto:corrections@modelverse.ai?subject=Model Suggestion"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:text-[#e85a28] font-semibold hover:underline"
                  >
                    Send Suggestion &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

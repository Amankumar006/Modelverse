import type { Metadata } from "next";
import HeroSection from "@/components/hero/HeroSection";
import DeveloperMarquee from "@/components/home/DeveloperMarquee";
import { getRecentModels, getModelCount, getAllDevelopers, SITE_URL } from "@/lib/models";
import Link from "next/link";
import {
  ArrowRight,
  Sparkle,
  ArrowUpRight,
  Flame,
} from "lucide-react";
import { getTrendingModels } from "@/lib/trending";

export const revalidate = 3600;

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
        url: `${SITE_URL}/images/hero-base.png`, // Base preview image
        width: 1200,
        height: 630,
        alt: "Modelverse catalog preview",
      },
    ],
  },
};

export default function Home() {
  const recentModels = getRecentModels(3);
  const trendingModels = getTrendingModels(3);
  const modelCount = getModelCount();
  const developers = getAllDevelopers();

  return (
    <main className="bg-black text-white selection:bg-brand-orange selection:text-white">
      {/* ── Hero Section ───────────────────────────────────── */}
      <HeroSection />

      {/* ── Portfolio Bento-Grid Features Section ───────────── */}
      <section className="bg-[#0a0a0a] text-white px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10 lg:h-screen flex flex-col justify-between border-t border-white/[0.04] relative z-10 antialiased">
        <div className="max-w-7xl mx-auto w-full flex flex-col justify-between gap-6 md:gap-8 lg:h-full">
          
          {/* Top Header Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3 text-left">
              <h2
                className="text-[28px] sm:text-3xl md:text-4xl lg:text-[44px] leading-[1.15] font-normal tracking-tight text-white"
                style={{
                  fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                }}
              >
                Every Model. <span className="italic text-white/50">Every Release.</span>
              </h2>
              <p className="text-sm md:text-[15px] leading-[1.6] text-white/60">
                A living reference of foundation AI models, tracking open-weights releases and frontier closed APIs. Fact-checked by curators using primary documentation, technical reports, and official announcements.
              </p>
            </div>

            <div className="flex shrink-0">
              <Link
                href="/models"
                className="liquid-glass inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold hover:bg-white/5 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                Browse Full Catalog
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch lg:flex-1">
            
            {/* Column 1 - Background card (rounded-2xl, bg-black) */}
            <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-black p-6 sm:p-8 flex flex-col justify-between min-h-[440px] md:min-h-[480px] lg:h-full">
              {/* Background Video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-90"
              >
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_150203_44a5bd32-516a-47ce-a077-8acbf9aa8991.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 z-0" />

              {/* Top Label */}
              <div className="relative z-10 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 text-center">
                <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
                <span>Tracked Releases</span>
                <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
              </div>

              {/* Bottom Timeline - Trending & Recent */}
              <div className="relative z-10 mt-auto flex flex-col gap-6 pt-10">
                {/* Trending Now */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <p className="text-[10px] uppercase tracking-wider text-brand-orange/80 font-bold flex items-center gap-1.5">
                      <Flame size={12} strokeWidth={2.5} /> Trending Now
                    </p>
                    <Link href="/trending" className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-wider font-semibold">View Top 20 &rarr;</Link>
                  </div>
                  
                  <div className="space-y-1">
                    {trendingModels.map((model) => {
                      const dateObj = new Date(model.releaseDate);
                      const formattedDate = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      
                      return (
                        <div
                          key={`trend-${model.id}`}
                          className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0 relative z-10"
                        >
                          <span className="text-[11px] font-mono text-brand-orange/60">{formattedDate}</span>
                          <Sparkle size={12} className="text-white/30" strokeWidth={1.5} />
                          <span className="text-xs text-white/80 font-medium truncate pr-2 text-left">{model.developer}</span>
                          <Link
                            href={`/models/${model.slug}`}
                            className="text-xs font-semibold text-white hover:text-brand-orange transition-colors hover:underline text-right"
                          >
                            {model.name}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recently Released */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold">Recently Released</p>
                  </div>
                  
                  <div className="space-y-1">
                    {recentModels.map((model) => {
                      const dateObj = new Date(model.releaseDate);
                      const formattedDate = dateObj.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                      
                      return (
                        <div
                          key={`recent-${model.id}`}
                          className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 py-2.5 border-b border-white/[0.04] last:border-0 relative z-10"
                        >
                          <span className="text-[11px] font-mono text-white/30">{formattedDate}</span>
                          <Sparkle size={12} className="text-white/20" strokeWidth={1.5} />
                          <span className="text-xs text-white/50 truncate pr-2 text-left">{model.developer}</span>
                          <Link
                            href={`/models/${model.slug}`}
                            className="text-xs font-medium text-white/70 hover:text-white transition-colors hover:underline text-right"
                          >
                            {model.name}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2 (stacked rows, md:grid-rows-[auto_1fr]) */}
            <div className="grid grid-cols-1 md:grid-rows-[auto_1fr] gap-4 md:gap-5 lg:h-full">
              
              {/* Methodology Card (Top) */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-[#324444] noise-overlay p-5 md:p-6 flex flex-col justify-between min-h-[180px]">
                <div className="relative z-10 text-left">
                  <div className="flex items-center justify-start gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
                    <span>Our Methodology</span>
                  </div>
                  <p className="text-[13px] sm:text-[13.5px] leading-[1.6] text-white/85 mt-4">
                    "Every entry on Modelverse is sourced from official documentation, model cards, and primary announcements, then fact-checked before publishing. If we can't verify a detail, we say so plainly."
                  </p>
                </div>
                <div className="relative z-10 text-[11px] text-white/50 font-medium mt-4 text-left">
                  — <span className="font-semibold text-white/80">Modelverse Editorial Standards</span>
                </div>
              </div>

              {/* Statistics Card (Bottom) */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-black p-5 md:p-6 flex flex-col justify-between min-h-[220px]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-85"
                >
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154543_d5b83fc1-9cea-44f3-b5e8-8f325935211a.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 z-0" />

                <div className="relative z-10 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 text-center">
                  <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
                  <span>Database Statistics</span>
                  <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
                </div>
                
                <div className="relative z-10 text-center py-2">
                  <span
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-light tracking-tight text-white drop-shadow"
                    style={{ fontFamily: "var(--font-body, ui-sans-serif, system-ui)" }}
                  >
                    {modelCount}+
                  </span>
                </div>

                <div className="relative z-10 text-xs text-white/85 tracking-wide text-center">
                  Models tracked and counting
                </div>
              </div>
            </div>

            {/* Column 3 (stacked) */}
            <div className="grid grid-cols-1 lg:grid-rows-[1.2fr_0.8fr] gap-4 md:gap-5 lg:h-full">
              
              {/* Developers Marquee Card (Top) */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-black p-5 md:p-6 flex flex-col justify-between min-h-[220px]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-85"
                >
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_153148_d7a3e1dd-e5d0-4ce6-8306-00d7522ecc44.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/75 z-0" />

                <div className="relative z-10 flex items-center justify-start gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70 text-left">
                  <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
                  <span>Developers We Track</span>
                </div>
                <DeveloperMarquee developers={developers} />
              </div>

              {/* Help Us Improve Card (Bottom) */}
              <div className="rounded-2xl border border-white/[0.05] relative overflow-hidden bg-[#324444] noise-overlay p-5 md:p-6 flex flex-col justify-between min-h-[180px]">
                <a
                  href="mailto:corrections@modelverse.ai?subject=Modelverse Correction"
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center text-white/70 hover:text-white z-20 cursor-pointer"
                  title="Submit Correction"
                >
                  <ArrowUpRight size={16} />
                </a>

                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
                    <Sparkle size={12} className="text-brand-orange" strokeWidth={1.5} />
                    <span>Help Us Improve</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm sm:text-base font-semibold text-white/90 font-mono">corrections@modelverse.ai</p>
                    <p className="text-xs sm:text-[13px] text-white/55">Know a model we're missing? Suggest it.</p>
                  </div>
                </div>

                <div className="relative z-10 mt-3 text-left">
                  <a
                    href="mailto:corrections@modelverse.ai?subject=Model Suggestion"
                    className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:text-[#e85a28] font-semibold hover:underline cursor-pointer"
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

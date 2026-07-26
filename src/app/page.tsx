import type { Metadata } from "next";
import Image from "next/image";
import HeroSection from "@/components/hero/HeroSection";
import DeveloperMarquee from "@/components/home/DeveloperMarquee";
import { getRecentModels, getModelCount, getAllDevelopers, SITE_URL, getModelBySlug, getAllModelEntries } from "@/lib/models";
import { getAllArticles } from "@/lib/news";
import Link from "next/link";
import {
  ArrowRight,
  Sparkle,
  ArrowUpRight,
  Flame,
  Cpu,
  Layers,
  Zap,
  GitCompare,
  ShieldCheck,
  CheckCircle2,
  Newspaper,
  Clock,
} from "lucide-react";
import { getTrendingModels } from "@/lib/trending";
import type { ModelEntry } from "@/lib/models";

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
  const latestArticles = getAllArticles().slice(0, 4);
  const featuredArticle = latestArticles[0];
  const subArticles = latestArticles.slice(1, 4);
  
  const allModels = getAllModelEntries();
  const todayStr = new Date().toISOString().split("T")[0];
  const priorityDevs = ["Anthropic", "Google DeepMind", "OpenAI", "Meta", "Mistral AI", "xAI", "Cohere", "DeepSeek", "Alibaba"];

  const validModels = allModels.filter((m) => m.releaseDate <= todayStr && m.verified);
  const latestModels: ModelEntry[] = [];
  const seenDevs = new Set<string>();

  for (const model of validModels) {
    if (latestModels.length >= 4) break;
    if (priorityDevs.includes(model.developer) && !seenDevs.has(model.developer)) {
      latestModels.push(model);
      seenDevs.add(model.developer);
    }
  }

  if (latestModels.length < 4) {
    for (const model of validModels) {
      if (latestModels.length >= 4) break;
      if (!latestModels.some((m) => m.slug === model.slug)) {
        latestModels.push(model);
      }
    }
  }

  return (
    <main className="bg-[#141414] text-[#E4E4E7] selection:bg-[#DA7756] selection:text-white">
      {/* ── Hero Section ───────────────────────────────────── */}
      <HeroSection />

      {/* ── Latest Models Section (Detailed & Professional) ────────────────────── */}
      {latestModels.length > 0 && (
        <section className="bg-[#141414] text-[#E4E4E7] px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 border-t border-[#27272A]">
          <div className="max-w-7xl mx-auto flex flex-col gap-10">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4ADE80] mb-3">
                  <Sparkle size={12} strokeWidth={2} />
                  <span>Frontier Intelligence Index</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white" style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)" }}>
                  Latest Tracked Releases
                </h2>
                <p className="text-sm text-[#8C9E91] mt-2 max-w-2xl leading-[1.6]">
                  Fact-checked specifications, context windows, and deployment parameters for the newest foundation releases.
                </p>
              </div>

              <Link
                href="/models"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#4ADE80] hover:text-[#22c55e] transition-colors uppercase tracking-wider group shrink-0"
              >
                Explore All {modelCount}+ Models 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            {/* Rich Model Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {latestModels.map(model => {
                const formattedDate = new Date(model.releaseDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

                return (
                  <div 
                    key={model.slug} 
                    className="rounded-2xl border border-[#243629] relative overflow-hidden bg-[#121A15] p-5 md:p-6 flex flex-col justify-between hover:border-[#334D3A] hover:bg-[#15211B] transition-all group shadow-sm"
                  >
                    <div>
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C9E91] truncate">
                          {model.developer}
                        </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          model.type === "open-source" || model.type === "open-weights"
                            ? "bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20"
                            : "bg-[#1A261D] text-[#8C9E91] border border-[#243629]"
                        }`}>
                          {model.type}
                        </span>
                      </div>

                      {/* Model Title */}
                      <h3 className="text-lg font-semibold text-white group-hover:text-[#4ADE80] transition-colors tracking-tight">
                        {model.name}
                      </h3>

                      {/* Brief Description */}
                      <p className="text-xs text-[#8C9E91] mt-2.5 line-clamp-2 leading-[1.5]">
                        {model.description}
                      </p>

                      {/* Metadata Chips */}
                      <div className="mt-4 pt-4 border-t border-[#243629]/60 flex flex-wrap gap-2">
                        {model.contextWindow && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#E2E8E4] bg-[#0C120F] px-2.5 py-1 rounded-md border border-[#243629]">
                            <Cpu size={10} className="text-[#4ADE80]" />
                            <span>{model.contextWindow}</span>
                          </div>
                        )}
                        {model.primaryTask && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8C9E91] bg-[#0C120F] px-2.5 py-1 rounded-md border border-[#243629]">
                            <Layers size={10} />
                            <span className="capitalize">{model.primaryTask.replace("-", " ")}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Footer Row */}
                    <div className="mt-6 pt-4 border-t border-[#243629] flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5A6E60]">
                        <ShieldCheck size={12} className="text-[#4ADE80]" />
                        <span>{formattedDate}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-semibold text-[#4ADE80] group-hover:underline">
                        <span>Details</span>
                        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    <Link href={`/models/${model.slug}`} className="absolute inset-0 z-10">
                      <span className="sr-only">View full details for {model.name}</span>
                    </Link>
                  </div>
                );
              })}
            </div>

            {/* Quick Domain Navigation Bar */}
            <div className="mt-4 p-4 md:p-5 rounded-2xl border border-[#243629] bg-[#121A15]/80 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#8C9E91]">
                <Zap size={14} className="text-[#4ADE80]" />
                <span className="font-semibold text-white">Quick Filters:</span>
                <span>Browse catalog by capabilities & modalities</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { label: "Reasoning & Math", href: "/models?task=chat-reasoning" },
                  { label: "Code Generation", href: "/models?task=code-generation" },
                  { label: "Multimodal & Vision", href: "/models?task=multimodal-general" },
                  { label: "Open Weights", href: "/models?type=open-weights" },
                  { label: "Audio & Speech", href: "/models?task=audio-speech" },
                ].map((tag) => (
                  <Link
                    key={tag.label}
                    href={tag.href}
                    className="text-[11px] font-medium text-[#E2E8E4] hover:text-[#4ADE80] bg-[#0C120F] hover:bg-[#1A261D] border border-[#243629] hover:border-[#334D3A] px-3 py-1.5 rounded-full transition-all cursor-pointer"
                  >
                    {tag.label}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── Latest AI News & Editorial Analysis Section ────────────── */}
      {latestArticles.length > 0 && (
        <section className="bg-[#090E0C] text-[#E2E8E4] px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 border-t border-[#243629]">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#4ADE80] mb-2.5">
                  <Newspaper size={13} strokeWidth={2} />
                  <span>Real-time Intelligence Digest</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-normal text-white" style={{ fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)" }}>
                  Latest AI News & Analysis
                </h2>
                <p className="text-sm text-[#8C9E91] mt-2 max-w-xl leading-[1.6]">
                  Real-time updates from Anthropic, OpenAI, DeepMind, Hugging Face, NVIDIA, and top AI labs.
                </p>
              </div>

              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#4ADE80] hover:text-[#22c55e] transition-colors uppercase tracking-wider group shrink-0"
              >
                View All AI News & Weekly Digests
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Grid: 1 Big Featured Story + 3 Side Stories */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Main Featured Article (Left - 7 cols) */}
              {featuredArticle && (
                <div className="lg:col-span-7 group relative rounded-2xl border border-[#243629] bg-[#121A15] overflow-hidden hover:border-[#334D3A] transition-all flex flex-col justify-between">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[#0C120F]">
                    <Image
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 1024px) 100vw, 58vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121A15] via-[#121A15]/40 to-transparent" />
                    
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#4ADE80] text-[#0C120F]">
                        {featuredArticle.category.replace("-", " ")}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[#0C120F]/80 text-[#8C9E91] backdrop-blur-sm border border-[#243629]">
                        {featuredArticle.author.split("/")[0].trim()}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 md:p-8 flex flex-col justify-between flex-1 -mt-6 relative z-10">
                    <div>
                      <h3 className="text-xl md:text-2xl font-semibold text-white group-hover:text-[#4ADE80] transition-colors tracking-tight leading-snug">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-xs md:text-sm text-[#8C9E91] mt-3 line-clamp-3 leading-[1.6]">
                        {featuredArticle.excerpt}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-[#243629] flex items-center justify-between text-xs text-[#5A6E60]">
                      <div className="flex items-center gap-3">
                        <span className="font-mono">{new Date(featuredArticle.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {featuredArticle.readTime}</span>
                      </div>
                      <span className="text-[#4ADE80] font-semibold group-hover:underline flex items-center gap-1">
                        Read Story <ArrowUpRight size={14} />
                      </span>
                    </div>
                  </div>

                  <Link href={`/news/${featuredArticle.slug}`} className="absolute inset-0 z-20">
                    <span className="sr-only">Read {featuredArticle.title}</span>
                  </Link>
                </div>
              )}

              {/* Side News List (Right - 5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                {subArticles.map((article) => (
                  <div
                    key={article.slug}
                    className="group relative rounded-xl border border-[#243629] bg-[#121A15] p-4 hover:border-[#334D3A] hover:bg-[#15211B] transition-all flex gap-4 items-center"
                  >
                    <div className="relative h-20 w-24 rounded-lg overflow-hidden shrink-0 bg-[#0C120F] border border-[#243629]">
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-[#4ADE80]">
                          {article.author.split("/")[0].trim()}
                        </span>
                        <span className="text-[10px] font-mono text-[#9CA3AF]">
                          {new Date(article.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>

                      <h4 className="text-xs md:text-sm font-semibold text-white group-hover:text-[#4ADE80] transition-colors line-clamp-2 leading-snug tracking-tight">
                        {article.title}
                      </h4>

                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[#9CA3AF]">
                        <span className="flex items-center gap-1.5 text-[#A3B8AA]"><Clock size={11} className="text-[#4ADE80]" /> {article.readTime}</span>
                      </div>
                    </div>

                    <Link href={`/news/${article.slug}`} className="absolute inset-0 z-10">
                      <span className="sr-only">Read {article.title}</span>
                    </Link>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* ── Portfolio Bento-Grid Features Section ───────────── */}
      <section className="bg-[#0C120F] text-[#E2E8E4] px-4 sm:px-6 md:px-10 lg:px-14 py-6 sm:py-8 md:py-10 lg:h-screen flex flex-col justify-between border-t border-[#243629] relative z-10 antialiased">
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
                Every Model. <span className="italic text-[#5A6E60]">Every Release.</span>
              </h2>
              <p className="text-sm md:text-[15px] leading-[1.6] text-[#8C9E91]">
                A living reference of foundation AI models, tracking open-weights releases and frontier closed APIs. Fact-checked by curators using primary documentation, technical reports, and official announcements.
              </p>
            </div>

            <div className="flex shrink-0">
              <Link
                href="/models"
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm font-semibold hover:bg-[#1A261D] border border-[#243629] hover:border-[#334D3A] transition-all cursor-pointer text-[#F0FDF4]"
              >
                Browse Full Catalog
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 items-stretch lg:flex-1">
            
            {/* Column 1 - Background card (rounded-2xl, bg-white/5) */}
            <div className="rounded-2xl border border-[#243629] relative overflow-hidden bg-[#121A15] p-6 sm:p-8 flex flex-col justify-between min-h-[440px] md:min-h-[480px] lg:h-full">
              {/* Background Video */}
              <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
              >
                <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_150203_44a5bd32-516a-47ce-a077-8acbf9aa8991.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-b from-[#0C120F]/30 via-transparent to-[#0C120F]/70 z-0" />

              {/* Top Label */}
              <div className="relative z-10 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8C9E91] text-center">
                <Sparkle size={12} className="text-[#4ADE80]" strokeWidth={1.5} />
                <span>Tracked Releases</span>
                <Sparkle size={12} className="text-[#4ADE80]" strokeWidth={1.5} />
              </div>

              {/* Bottom Timeline - Trending & Recent */}
              <div className="relative z-10 mt-auto flex flex-col gap-6 pt-10">
                {/* Trending Now */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pl-1">
                    <p className="text-[10px] uppercase tracking-wider text-[#4ADE80] font-bold flex items-center gap-1.5">
                      <Flame size={12} strokeWidth={2.5} /> Trending Now
                    </p>
                    <Link href="/trending" className="text-[10px] text-[#5A6E60] hover:text-[#8C9E91] transition-colors uppercase tracking-wider font-semibold">View Top 20 &rarr;</Link>
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
                          className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 py-2.5 border-b border-[#243629] last:border-0 relative z-10"
                        >
                          <span className="text-[11px] font-mono text-[#4ADE80]">{formattedDate}</span>
                          <Sparkle size={12} className="text-[#243629]" strokeWidth={1.5} />
                          <span className="text-xs text-[#8C9E91] font-medium truncate pr-2 text-left">{model.developer}</span>
                          <Link
                            href={`/models/${model.slug}`}
                            className="text-xs font-semibold text-[#E2E8E4] hover:text-[#4ADE80] transition-colors hover:underline text-right"
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
                    <p className="text-[10px] uppercase tracking-wider text-[#5A6E60] font-semibold">Recently Released</p>
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
                          className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-3 py-2.5 border-b border-[#243629] last:border-0 relative z-10"
                        >
                          <span className="text-[11px] font-mono text-[#5A6E60]">{formattedDate}</span>
                          <Sparkle size={12} className="text-[#243629]" strokeWidth={1.5} />
                          <span className="text-xs text-[#8C9E91] truncate pr-2 text-left">{model.developer}</span>
                          <Link
                            href={`/models/${model.slug}`}
                            className="text-xs font-medium text-[#E2E8E4] hover:text-[#F0FDF4] transition-colors hover:underline text-right"
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
              <div className="rounded-2xl border border-[#243629] relative overflow-hidden bg-[#121A15] p-5 md:p-6 flex flex-col justify-between min-h-[180px]">
                <div className="relative z-10 text-left">
                  <div className="flex items-center justify-start gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8C9E91]">
                    <Sparkle size={12} className="text-[#4ADE80]" strokeWidth={1.5} />
                    <span>Our Methodology</span>
                  </div>
                  <p className="text-[13px] sm:text-[13.5px] leading-[1.6] text-[#E2E8E4] mt-4">
                    "Every entry on Modelverse is sourced from official documentation, model cards, and primary announcements, then fact-checked before publishing. If we can't verify a detail, we say so plainly."
                  </p>
                </div>
                <div className="relative z-10 text-[11px] text-[#5A6E60] font-medium mt-4 text-left">
                  — <span className="font-semibold text-[#8C9E91]">Modelverse Editorial Standards</span>
                </div>
              </div>

              {/* Statistics Card (Bottom) */}
              <div className="rounded-2xl border border-[#243629] relative overflow-hidden bg-[#121A15] p-5 md:p-6 flex flex-col justify-between min-h-[220px]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-80"
                >
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_154543_d5b83fc1-9cea-44f3-b5e8-8f325935211a.mp4" type="video/mp4" />
                </video>
                
                <div className="relative z-10 text-center py-2">
                  <span
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-light tracking-tight text-[#E2E8E4] drop-shadow-sm"
                    style={{ fontFamily: "var(--font-body, ui-sans-serif, system-ui)" }}
                  >
                    {modelCount}+
                  </span>
                </div>

                <div className="relative z-10 text-xs text-[#8C9E91] tracking-wide text-center">
                  Models tracked and counting
                </div>
              </div>
            </div>

            {/* Column 3 (stacked) */}
            <div className="grid grid-cols-1 lg:grid-rows-[1.2fr_0.8fr] gap-4 md:gap-5 lg:h-full">
              
              {/* Developers Marquee Card (Top) */}
              <div className="rounded-2xl border border-[#243629] relative overflow-hidden bg-[#121A15] p-5 md:p-6 flex flex-col justify-between min-h-[220px]">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none opacity-70"
                >
                  <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260507_153148_d7a3e1dd-e5d0-4ce6-8306-00d7522ecc44.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0C120F]/30 via-transparent to-[#0C120F]/70 z-0" />

                <div className="relative z-10 flex items-center justify-start gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8C9E91] text-left">
                  <Sparkle size={12} className="text-[#4ADE80]" strokeWidth={1.5} />
                  <span>Developers We Track</span>
                </div>
                <div className="filter invert-0 brightness-[1.5]">
                  <DeveloperMarquee developers={developers} />
                </div>
              </div>

              {/* Help Us Improve Card (Bottom) */}
              <div className="rounded-2xl border border-[#243629] relative overflow-hidden bg-[#121A15] p-5 md:p-6 flex flex-col justify-between min-h-[180px]">
                <a
                  href="mailto:corrections@modelverse.ai?subject=Modelverse Correction"
                  className="absolute top-5 right-5 h-9 w-9 rounded-full bg-[#1A261D] border border-[#243629] hover:bg-[#243629] hover:border-[#334D3A] transition-all flex items-center justify-center text-[#8C9E91] hover:text-[#E2E8E4] z-20 cursor-pointer"
                  title="Submit Correction"
                >
                  <ArrowUpRight size={16} />
                </a>

                <div className="relative z-10 text-left">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#8C9E91]">
                    <Sparkle size={12} className="text-[#4ADE80]" strokeWidth={1.5} />
                    <span>Help Us Improve</span>
                  </div>
                  <div className="mt-4 space-y-1">
                    <p className="text-sm sm:text-base font-semibold text-[#E2E8E4] font-mono">corrections@modelverse.ai</p>
                    <p className="text-xs sm:text-[13px] text-[#5A6E60]">Know a model we're missing? Suggest it.</p>
                  </div>
                </div>

                <div className="relative z-10 mt-3 text-left">
                  <a
                    href="mailto:corrections@modelverse.ai?subject=Model Suggestion"
                    className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80] hover:text-[#22c55e] font-semibold hover:underline cursor-pointer"
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

import type { Metadata } from "next";
import Image from "@/components/ui/FallbackImage";
import HeroSection from "@/components/hero/HeroSection";
import ModelCard from "@/components/models/ModelCard";
import { getModelCount, SITE_URL, getAllModelEntries } from "@/lib/models";
import { getAllArticles } from "@/lib/news";
import Reveal from "@/components/ui/Reveal";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  Newspaper,
  Clock,
  Trophy,
} from "lucide-react";
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
        url: `${SITE_URL}/images/hero-base.png`,
        width: 1200,
        height: 630,
        alt: "Modelverse catalog preview",
      },
    ],
  },
};

export default async function Home() {
  const allModels = await getAllModelEntries();
  const totalModels = await getModelCount();
  const verifiedCount = allModels.filter((m) => m.verified).length;
  const latestArticles = (await getAllArticles()).slice(0, 4);
  const featuredArticle = latestArticles[0];
  const subArticles = latestArticles.slice(1, 4);

  const todayStr = new Date().toISOString().split("T")[0];
  const validModels = allModels.filter((m) => m.releaseDate <= todayStr && m.verified);

  // Pick top 5 models: 1 featured (spans 2 cols) + 3-4 regular
  const homepageModels: ModelEntry[] = validModels.slice(0, 5);

  return (
    <main className="bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] min-h-screen">
      {/* ── Hero Section with Live Stats & Search ───────────── */}
      <HeroSection totalModels={totalModels} verifiedCount={verifiedCount} />

      {/* ── Featured & Recent Model Card Grid ────────────────── */}
      {homepageModels.length > 0 && (
        <Reveal>
          <section className="px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 border-t border-[var(--muted)]/10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
                  <Sparkles size={14} className="shrink-0" />
                  <span>Frontier Releases</span>
                </div>
                <h2 className="text-fluid-h2 font-extrabold text-[var(--text)] tracking-tight leading-tight">
                  Recently Added Models
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1.5 max-w-xl">
                  Fact-checked specifications, context windows, and deployment parameters for the newest foundation releases.
                </p>
              </div>

              <Link
                href="/models"
                className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:opacity-85 transition-opacity uppercase tracking-wider group shrink-0"
              >
                Explore All {totalModels}+ Models
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* ModelCard Grid: 1st card is Featured (spans 2 cols) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {homepageModels.map((model, idx) => (
                <ModelCard
                  key={model.slug}
                  model={model}
                  isFeatured={idx === 0}
                />
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ── Tools & Insights Section (Editorial/Linear Style) ────────────── */}
      <Reveal y={40}>
        <section className="px-4 sm:px-6 md:px-10 lg:px-14 py-20 lg:py-28 max-w-7xl mx-auto border-t border-[var(--muted)]/10 overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            {/* Left: Editorial Content */}
            <div className="flex-1 lg:max-w-[480px]">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--muted)]/20 bg-[var(--card-bg)] text-[var(--muted)] text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Intelligence Tools
              </div>
              <h2 className="text-fluid-h1 font-medium text-[var(--text)] tracking-[-0.03em] leading-[1.05] mb-6">
                Don&apos;t guess. <br />
                <span className="text-[var(--muted)]">Measure and migrate with precision.</span>
              </h2>
              <p className="text-base sm:text-lg text-[var(--muted)] leading-relaxed mb-10">
                Modelverse goes beyond a static directory. We actively index evaluation benchmarks and track architectural lineage so you can confidently switch to state-of-the-art models.
              </p>

              <div className="flex flex-col gap-3">
                <Link href="/models/benchmarks" className="group flex items-center justify-between p-4 sm:p-5 rounded-[16px] border border-[var(--muted)]/10 bg-[var(--card-bg)] hover:bg-[var(--accent-soft)]/5 hover:border-[var(--accent)]/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-[10px] bg-[var(--bg)] border border-[var(--muted)]/10 flex items-center justify-center text-[var(--text)] group-hover:text-[var(--accent)] group-hover:scale-110 transition-all duration-300">
                      <Trophy size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)]">Global Leaderboard</h4>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Rank by MMLU, HumanEval & MATH</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300" />
                </Link>

                <Link href="/models/upgrade" className="group flex items-center justify-between p-4 sm:p-5 rounded-[16px] border border-[var(--muted)]/10 bg-[var(--card-bg)] hover:bg-[var(--accent-soft)]/5 hover:border-[var(--accent)]/30 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-[10px] bg-[var(--bg)] border border-[var(--muted)]/10 flex items-center justify-center text-[var(--text)] group-hover:text-[var(--accent)] group-hover:scale-110 transition-all duration-300">
                      <ArrowUpRight size={18} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--text)]">Upgrade Paths</h4>
                      <p className="text-xs text-[var(--muted)] mt-0.5">Navigate deprecations seamlessly</p>
                    </div>
                  </div>
                  <ArrowRight size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </div>
            </div>

            {/* Right: Abstract UI Visualization */}
            <div className="flex-1 w-full relative min-h-[400px] lg:min-h-[500px] flex items-center justify-center pt-10 lg:pt-0">
              {/* Background Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[400px] aspect-square bg-[var(--accent)]/5 rounded-full blur-[100px] pointer-events-none" />
              
              {/* Mock UI Composition */}
              <div className="relative w-full max-w-[480px]">
                {/* Leaderboard Mock Card (Back layer) */}
                <div className="absolute -top-12 sm:-top-20 right-0 sm:-right-4 w-[85%] bg-[var(--bg)] border border-[var(--muted)]/10 rounded-[20px] shadow-2xl p-5 sm:p-6 transform rotate-[3deg] z-10 opacity-90 hover:opacity-100 hover:rotate-0 hover:-translate-y-2 transition-all duration-500 cursor-default">
                  <div className="flex items-center justify-between mb-5 pb-4 border-b border-[var(--muted)]/10">
                    <span className="text-xs font-semibold text-[var(--text)] uppercase tracking-wider">Top Performers</span>
                    <span className="text-[10px] text-[var(--muted)] font-mono">MMLU Score</span>
                  </div>
                  <div className="space-y-4">
                    {[95.4, 91.2, 88.7].map((score, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="text-[10px] text-[var(--muted)] font-mono w-4">{i + 1}</div>
                        <div className="h-1.5 flex-1 bg-[var(--card-bg)] rounded-full overflow-hidden">
                          <div className="h-full bg-[var(--accent)]/70 rounded-full" style={{ width: `${score}%` }} />
                        </div>
                        <div className="text-xs font-mono text-[var(--text)]">{score}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upgrade Path Mock Card (Front layer) */}
                <div className="relative w-[90%] sm:w-[85%] mt-20 sm:mt-0 bg-[var(--card-bg)]/80 backdrop-blur-xl border border-[var(--muted)]/20 rounded-[24px] shadow-[0_20px_40px_rgba(0,0,0,0.1)] p-6 sm:p-8 transform -rotate-[4deg] z-20 hover:rotate-0 hover:-translate-y-2 transition-all duration-500">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--muted)]/10 flex items-center justify-center shrink-0">
                      <ArrowUpRight size={16} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-[var(--text)]">Legacy Model</div>
                      <div className="text-[11px] text-[var(--muted)] mt-0.5">Deprecation impending</div>
                    </div>
                  </div>
                  
                  <div className="pl-5 ml-5 border-l-[1.5px] border-dashed border-[var(--muted)]/30 relative py-2">
                    <div className="absolute w-2.5 h-2.5 rounded-full bg-[var(--bg)] border border-[var(--accent)] -left-[6px] top-1/2 -translate-y-1/2 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-[var(--accent)] animate-pulse" />
                    </div>
                    <div className="text-[11px] text-[var(--muted)] mb-1 uppercase tracking-wider font-semibold">Recommended Path</div>
                    <div className="text-base font-bold text-[var(--text)]">Next-Gen Frontier</div>
                    <div className="inline-flex mt-2 text-[10px] text-[var(--accent)] font-semibold bg-[var(--accent-soft)]/20 px-2.5 py-1 rounded-full border border-[var(--accent)]/10">
                      Lower cost • 2x context
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ── Latest AI News & Technical Analysis Section ────────────── */}
      {latestArticles.length > 0 && (
        <Reveal y={40}>
          <section className="bg-[var(--card-bg)] text-[var(--text)] px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 border-t border-[var(--muted)]/10">
            <div className="max-w-7xl mx-auto flex flex-col gap-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
                    <Newspaper size={14} className="shrink-0" />
                    <span>Intelligence Digest</span>
                  </div>
                  <h2 className="text-fluid-h2 font-extrabold text-[var(--text)] tracking-tight leading-tight">
                    Latest AI News & Analysis
                  </h2>
                  <p className="text-sm text-[var(--muted)] mt-1.5 max-w-xl">
                    Real-time updates from Anthropic, OpenAI, DeepMind, Hugging Face, NVIDIA, and top AI labs.
                  </p>
                </div>

                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[var(--accent)] hover:opacity-85 transition-opacity uppercase tracking-wider group shrink-0"
                >
                  View All AI News
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* News Grid: Featured + Sub articles */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {featuredArticle && (
                  <div className="lg:col-span-7 group relative rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col justify-between z-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--muted)]/10">
                      <Image
                        src={featuredArticle.coverImage}
                        alt={featuredArticle.title}
                        fill
                        priority
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 1024px) 100vw, 58vw"
                      />
                      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-contrast)]">
                          {featuredArticle.category.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 md:p-8 flex flex-col justify-between flex-1 relative z-10">
                      <div>
                        <h3 className="text-fluid-h3 font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug tracking-tight">
                          {featuredArticle.title}
                        </h3>
                        <p className="text-fluid-sm text-[var(--muted)] mt-3 line-clamp-3 leading-relaxed">
                          {featuredArticle.excerpt}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs text-[var(--muted)]">
                        <div className="flex items-center gap-3">
                          <span className="font-mono tabular-nums">{new Date(featuredArticle.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {featuredArticle.readTime}</span>
                        </div>
                        <span className="text-[var(--accent)] font-semibold flex items-center gap-1">
                          Read Story <ArrowUpRight size={14} />
                        </span>
                      </div>
                    </div>

                    <Link href={`/news/${featuredArticle.slug}`} className="absolute inset-0 z-20">
                      <span className="sr-only">Read {featuredArticle.title}</span>
                    </Link>
                  </div>
                )}

                <div className="lg:col-span-5 flex flex-col gap-4">
                  {subArticles.map((article) => (
                    <div
                      key={article.slug}
                      className="group relative rounded-[20px] bg-[var(--card-bg)]/90 backdrop-blur-xl border border-[var(--muted)]/10 shadow-sm hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 p-4 hover:-translate-y-1 transition-all duration-400 flex gap-4 items-center z-0"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[20px]" />
                      <div className="relative h-20 w-24 rounded-[14px] overflow-hidden shrink-0 bg-[var(--muted)]/10">
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
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--accent)]">
                            {article.author.split("/")[0].trim()}
                          </span>
                          <span className="text-[10px] font-mono tabular-nums text-[var(--muted)]">
                            {new Date(article.publishDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>

                        <h4 className="text-fluid-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug tracking-tight">
                          {article.title}
                        </h4>

                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--muted)] font-mono">
                          <span className="flex items-center gap-1"><Clock size={11} className="text-[var(--accent)]" /> {article.readTime}</span>
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
        </Reveal>
      )}
    </main>
  );
}

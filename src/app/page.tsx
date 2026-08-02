import type { Metadata } from "next";
import Image from "@/components/ui/FallbackImage";
import HeroSection from "@/components/hero/HeroSection";
import ModelCard from "@/components/models/ModelCard";
import { getRecentModels, getModelCount, getAllDevelopers, SITE_URL, getAllModelEntries } from "@/lib/models";
import { getAllArticles } from "@/lib/news";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ArrowUpRight,
  Newspaper,
  Clock,
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

export default function Home() {
  const allModels = getAllModelEntries();
  const totalModels = getModelCount();
  const verifiedCount = allModels.filter((m) => m.verified).length;
  const latestArticles = getAllArticles().slice(0, 4);
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
        <section className="px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 border-t border-[var(--muted)]/10 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
                <Sparkles size={14} className="shrink-0" />
                <span>Frontier Releases</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight">
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
      )}

      {/* ── Latest AI News & Technical Analysis Section ────────────── */}
      {latestArticles.length > 0 && (
        <section className="bg-[var(--card-bg)] text-[var(--text)] px-4 sm:px-6 md:px-10 lg:px-14 py-12 md:py-16 border-t border-[var(--muted)]/10">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-2">
                  <Newspaper size={14} className="shrink-0" />
                  <span>Intelligence Digest</span>
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight">
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
                <div className="lg:col-span-7 group relative rounded-[20px] bg-[var(--bg)] shadow-[var(--shadow-card)] overflow-hidden hover:-translate-y-0.5 transition-all flex flex-col justify-between">
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-[var(--muted)]/10">
                    <Image
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.title}
                      fill
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
                      <h3 className="text-xl md:text-2xl font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors leading-snug tracking-tight">
                        {featuredArticle.title}
                      </h3>
                      <p className="text-xs md:text-sm text-[var(--muted)] mt-3 line-clamp-3 leading-relaxed">
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
                    className="group relative rounded-[20px] bg-[var(--bg)] shadow-[var(--shadow-card)] p-4 hover:-translate-y-0.5 transition-all flex gap-4 items-center"
                  >
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

                      <h4 className="text-xs md:text-sm font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 leading-snug tracking-tight">
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
      )}
    </main>
  );
}

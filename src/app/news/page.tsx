import type { Metadata } from "next";
import Link from "next/link";
import Image from "@/components/ui/FallbackImage";
import Navbar from "@/components/layout/Navbar";
import { getAllArticles, getCategoryLabel } from "@/lib/news";
import { Clock, Calendar, ArrowRight, Sparkles, Filter } from "lucide-react";
import { SITE_URL } from "@/lib/models";
import ConfidenceBadge from "@/components/news/ConfidenceBadge";

export const metadata: Metadata = {
  title: "AI News & Research Announcements — Modelverse",
  description: "Deep-dive model reviews, benchmark breakdowns, and weekly research recaps from the Modelverse team.",
  alternates: {
    canonical: `${SITE_URL}/news`,
  },
  openGraph: {
    title: "AI News & Research Announcements — Modelverse",
    description: "Deep-dive model reviews, benchmark breakdowns, and weekly research recaps from the Modelverse team.",
    url: `${SITE_URL}/news`,
  },
};

function formatNewsDate(dateStr: string): string {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface NewsPageProps {
  searchParams: Promise<{ category?: string; page?: string; q?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category || "all";
  const searchPhrase = resolvedParams.q || "";
  const allArticles = await getAllArticles();

  if (allArticles.length === 0) {
    return (
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased relative">
        <Navbar theme="dark" />
        <div className="max-w-6xl mx-auto px-6 pt-24 text-center">
          <p className="text-sm text-[var(--muted)]">No news articles published yet.</p>
        </div>
      </main>
    );
  }

  const categoryArticles = activeCategory === "all"
    ? allArticles
    : allArticles.filter((a) => a.category === activeCategory);

  const filteredArticles = searchPhrase.trim()
    ? categoryArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchPhrase.toLowerCase()) ||
          a.excerpt.toLowerCase().includes(searchPhrase.toLowerCase())
      )
    : categoryArticles;

  const featuredArticle = allArticles.find((p) => p.isFeatured) || allArticles[0];

  const poolArticles = activeCategory === "all" && !searchPhrase.trim()
    ? filteredArticles.filter((p) => p.id !== featuredArticle.id)
    : filteredArticles;

  const categoryTabs = [
    { value: "all", label: "All Announcements", count: allArticles.length },
    { value: "weekly-news", label: "Weekly News", count: allArticles.filter((a) => a.category === "weekly-news").length },
    { value: "model-review", label: "Model Reviews", count: allArticles.filter((a) => a.category === "model-review").length },
    { value: "short-news", label: "Short News", count: allArticles.filter((a) => a.category === "short-news").length },
    { value: "other", label: "Research & Analysis", count: allArticles.filter((a) => a.category === "other").length },
  ];

  const pageSize = 8;
  const totalPages = Math.ceil(poolArticles.length / pageSize) || 1;
  const currentPage = Math.max(1, Math.min(totalPages, parseInt(resolvedParams.page || "1", 10) || 1));
  const paginatedArticles = poolArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />

      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 pt-10 sm:pt-14 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--muted)]/10 pb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] border border-[var(--accent)]/20 mb-4">
              <Sparkles size={12} className="text-[var(--accent)]" />
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)]">
                Modelverse Newsroom
              </span>
            </div>
            <h1 className="text-fluid-h1 font-extrabold text-[var(--text)] tracking-tight">
              News & Research
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted)] max-w-2xl mt-3 leading-relaxed">
              Deep-dive model reviews, benchmark breakdowns, and weekly AI research announcements curated by the Modelverse team.
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-xs text-[var(--muted)] font-mono block">Published Coverage</span>
            <span className="text-fluid-h2 font-extrabold text-[var(--text)] font-sans tabular-nums">{allArticles.length} Articles</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] pr-2 shrink-0 font-bold">
            <Filter size={13} />
            <span>Category:</span>
          </div>
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value === "all" ? "/news" : `/news?category=${tab.value}`}
                className={`px-3.5 py-1.5 rounded-[var(--radius-pill)] text-xs font-bold transition-all shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/30 shadow-sm"
                    : "bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--text)] border-[var(--muted)]/10 shadow-[var(--shadow-card)]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "bg-[var(--muted)]/10 text-[var(--muted)]"
                  }`}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 space-y-16">
        
        {/* Featured Hero Article */}
        {activeCategory === "all" && featuredArticle && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-[var(--muted)] font-bold">
                Featured Announcement
              </span>
              <span className="text-xs font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-[var(--radius-pill)] border border-[var(--accent)]/30">
                Top Pick
              </span>
            </div>

            <div className="group relative bg-[var(--card-bg)]/90 backdrop-blur-xl rounded-[var(--radius-card)] border border-[var(--muted)]/10 hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-400 overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-sm z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <Link
                href={`/news/${featuredArticle.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Read ${featuredArticle.title}`}
              />

              <div className="relative h-[260px] sm:h-[360px] lg:h-full min-h-[340px] bg-[var(--bg)] overflow-hidden">
                <Image
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                />
              </div>

              <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative z-20 pointer-events-none">
                <div>
                  <div className="flex items-center gap-2.5 mb-5 pointer-events-auto">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[var(--accent)] bg-[var(--accent-soft)] px-2.5 py-1 rounded-[var(--radius-pill)]">
                      {featuredArticle.category === "weekly-news" ? `Issue ${featuredArticle.issueNumber}` : getCategoryLabel(featuredArticle.category)}
                    </span>
                    <ConfidenceBadge confidence={featuredArticle.confidenceLevel} />
                  </div>

                  <h2 className="text-fluid-h2 font-extrabold text-[var(--text)] mb-4 group-hover:text-[var(--accent)] transition-colors leading-snug">
                    {featuredArticle.title}
                  </h2>

                  <p className="text-sm text-[var(--muted)] leading-relaxed mb-6 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-3 font-mono tabular-nums">
                    <span className="flex items-center gap-1.5 text-[var(--text)] font-semibold">
                      <Clock size={12} className="text-[var(--accent)]" />
                      {featuredArticle.readTime}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-[var(--accent)]" />
                      {formatNewsDate(featuredArticle.publishDate)}
                    </span>
                  </div>
                  <span className="font-bold text-[var(--accent)] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--muted)]/10 pb-4">
            <h2 className="text-xs uppercase font-mono tracking-wider text-[var(--muted)] font-bold">
              {searchPhrase.trim()
                ? `Search Results for "${searchPhrase}"`
                : (activeCategory === "all" ? "All News Coverage" : `${getCategoryLabel(activeCategory as unknown as Parameters<typeof getCategoryLabel>[0])} Articles`)}
            </h2>
            <span className="text-xs font-mono text-[var(--muted)] tabular-nums">
              Showing {paginatedArticles.length} of {poolArticles.length}
            </span>
          </div>

          {paginatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {paginatedArticles.map((post) => (
                <div
                  key={post.id}
                  className="group relative bg-[var(--card-bg)]/90 backdrop-blur-xl rounded-[var(--radius-card)] border border-[var(--muted)]/10 hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)] hover:border-[var(--accent)]/30 hover:-translate-y-1 transition-all duration-400 overflow-hidden flex flex-col justify-between shadow-sm z-0"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  <Link
                    href={`/news/${post.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${post.title}`}
                  />
                  <div>
                    <div className="relative h-[200px] w-full bg-[var(--bg)] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                      />
                      <div className="absolute top-3 right-3 z-20">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] bg-[var(--card-bg)]/90 backdrop-blur-md px-2.5 py-1 rounded-[var(--radius-pill)] border border-[var(--muted)]/10">
                          {post.category === "weekly-news" ? `Issue ${post.issueNumber}` : getCategoryLabel(post.category)}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 z-20">
                        <ConfidenceBadge confidence={post.confidenceLevel} />
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="text-fluid-h3 font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors mb-2.5 line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-3 border-t border-[var(--muted)]/10 flex items-center justify-between text-xs text-[var(--muted)]">
                    <span className="flex items-center gap-1 font-mono tabular-nums text-[11px]">
                      <Clock size={11} className="text-[var(--accent)]" />
                      {post.readTime}
                    </span>
                    <span className="font-bold text-[var(--accent)] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                      Read <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)]">
              <p className="text-sm text-[var(--muted)]">No articles found under this category filter.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8 border-t border-[var(--muted)]/10">
              <Link
                href={`/news?category=${activeCategory}&page=${currentPage - 1}`}
                className={`px-4 py-2 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] text-xs font-bold hover:border-[var(--accent)] text-[var(--text)] transition-all flex items-center gap-1 shadow-sm ${
                  currentPage <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                ← Previous
              </Link>
              <span className="text-xs text-[var(--muted)] font-mono tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={`/news?category=${activeCategory}&page=${currentPage + 1}`}
                className={`px-4 py-2 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] text-xs font-bold hover:border-[var(--accent)] text-[var(--text)] transition-all flex items-center gap-1 shadow-sm ${
                  currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Next →
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

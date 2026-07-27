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
  searchParams: Promise<{ category?: string; page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedParams = await searchParams;
  const activeCategory = resolvedParams.category || "all";
  const allArticles = getAllArticles();

  if (allArticles.length === 0) {
    return (
      <main className="min-h-screen bg-[#141414] text-[#E4E4E7] font-sans antialiased relative">
        <Navbar theme="dark" />
        <div className="max-w-6xl mx-auto px-6 pt-24 text-center">
          <p className="text-sm text-[#90908F]">No news articles published yet.</p>
        </div>
      </main>
    );
  }

  // Filter articles based on active category
  const filteredArticles = activeCategory === "all"
    ? allArticles
    : allArticles.filter((a) => a.category === activeCategory);

  // Top Featured News Article
  const featuredArticle = allArticles.find((p) => p.isFeatured) || allArticles[0];

  // Article Pool (excluding featured hero when viewing "all")
  const poolArticles = activeCategory === "all"
    ? filteredArticles.filter((p) => p.id !== featuredArticle.id)
    : filteredArticles;

  // Categories list with counts
  const categoryTabs = [
    { value: "all", label: "All Announcements", count: allArticles.length },
    { value: "weekly-news", label: "Weekly News", count: allArticles.filter((a) => a.category === "weekly-news").length },
    { value: "model-review", label: "Model Reviews", count: allArticles.filter((a) => a.category === "model-review").length },
    { value: "short-news", label: "Short News", count: allArticles.filter((a) => a.category === "short-news").length },
    { value: "other", label: "Research & Analysis", count: allArticles.filter((a) => a.category === "other").length },
  ];

  // Pagination
  const pageSize = 8;
  const totalPages = Math.ceil(poolArticles.length / pageSize) || 1;
  const currentPage = Math.max(1, Math.min(totalPages, parseInt(resolvedParams.page || "1", 10) || 1));
  const paginatedArticles = poolArticles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-[#141414] text-[#E1E1E0] selection:bg-emerald-500 selection:text-black pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />

      {/* Claude Announcement Header */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 pt-10 sm:pt-14 pb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#282828] pb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#242426] border border-[#333333] mb-4">
              <Sparkles size={12} className="text-emerald-400" />
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Modelverse Newsroom
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight"
              style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
            >
              News & Research Announcements
            </h1>
            <p className="text-sm sm:text-base text-[#90908F] max-w-2xl mt-3 leading-relaxed">
              Deep-dive model reviews, benchmark breakdowns, and weekly AI research announcements curated by the Modelverse team.
            </p>
          </div>

          {/* Total Articles Counter */}
          <div className="text-right shrink-0">
            <span className="text-xs text-[#90908F] font-mono block">Published Coverage</span>
            <span className="text-3xl font-normal text-white font-serif">{allArticles.length} Articles</span>
          </div>
        </div>
      </div>

      {/* Category Filter Pills (Claude Blog Style) */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 mb-10">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-center gap-1.5 text-xs text-[#90908F] pr-2 shrink-0">
            <Filter size={13} />
            <span>Category:</span>
          </div>
          {categoryTabs.map((tab) => {
            const isActive = activeCategory === tab.value;
            return (
              <Link
                key={tab.value}
                href={tab.value === "all" ? "/news" : `/news?category=${tab.value}`}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 flex items-center gap-2 border ${
                  isActive
                    ? "bg-[#242426] text-white border-emerald-500/40 shadow-sm"
                    : "bg-[#1C1C1E] text-[#90908F] hover:text-white border-[#282828] hover:border-[#333333]"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-[#242426] text-[#90908F]"
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
        
        {/* Featured Hero Article (Shown when viewing All Articles) */}
        {activeCategory === "all" && featuredArticle && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-mono tracking-wider text-[#90908F]">
                Featured Announcement
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                Top Pick
              </span>
            </div>

            <div className="group relative bg-[#1C1C1E] rounded-2xl border border-[#282828] hover:border-emerald-500/40 transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-2 shadow-2xl">
              <Link
                href={`/news/${featuredArticle.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Read ${featuredArticle.title}`}
              />

              {/* Cover Image Container */}
              <div className="relative h-[260px] sm:h-[360px] lg:h-full min-h-[340px] bg-[#141414] overflow-hidden">
                <Image
                  src={featuredArticle.coverImage}
                  alt={featuredArticle.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#1C1C1E]/40 to-[#1C1C1E] pointer-events-none hidden lg:block" />
              </div>

              {/* Content Body */}
              <div className="p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative z-20 pointer-events-none">
                <div>
                  <div className="flex items-center gap-2.5 mb-5 pointer-events-auto">
                    <span className="text-[10px] font-mono uppercase font-semibold tracking-wider text-emerald-400 bg-[#242426] px-2.5 py-1 rounded-md border border-[#333333]">
                      {featuredArticle.category === "weekly-news" ? `Issue ${featuredArticle.issueNumber}` : getCategoryLabel(featuredArticle.category)}
                    </span>
                    <ConfidenceBadge confidence={featuredArticle.confidenceLevel} />
                  </div>

                  <h2
                    className="text-2xl sm:text-3xl lg:text-4xl font-normal text-white mb-4 group-hover:text-emerald-400 transition-colors leading-snug"
                    style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
                  >
                    {featuredArticle.title}
                  </h2>

                  <p className="text-sm text-[#90908F] leading-relaxed mb-6 line-clamp-3">
                    {featuredArticle.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-[#282828] flex items-center justify-between text-xs text-[#90908F]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5 font-mono text-[#E1E1E0]">
                      <Clock size={12} className="text-emerald-400" />
                      {featuredArticle.readTime}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1.5 font-mono">
                      <Calendar size={12} className="text-emerald-400" />
                      {formatNewsDate(featuredArticle.publishDate)}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Article Grid (Claude Blog Topology) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#282828] pb-4">
            <h2 className="text-xs uppercase font-mono tracking-wider text-[#90908F]">
              {activeCategory === "all" ? "All News Coverage" : `${getCategoryLabel(activeCategory as any)} Articles`}
            </h2>
            <span className="text-xs font-mono text-[#90908F]">
              Showing {paginatedArticles.length} of {poolArticles.length}
            </span>
          </div>

          {paginatedArticles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
              {paginatedArticles.map((post) => (
                <div
                  key={post.id}
                  className="group relative bg-[#1C1C1E] rounded-2xl border border-[#282828] hover:border-emerald-500/40 shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${post.title}`}
                  />
                  <div>
                    {/* Media Cover Image */}
                    <div className="relative h-[200px] w-full bg-[#141414] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                      />
                      <div className="absolute top-3 right-3 z-20">
                        <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-emerald-400 bg-[#1C1C1E]/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-[#333333]">
                          {post.category === "weekly-news" ? `Issue ${post.issueNumber}` : getCategoryLabel(post.category)}
                        </span>
                      </div>
                      <div className="absolute top-3 left-3 z-20">
                        <ConfidenceBadge confidence={post.confidenceLevel} />
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-5">
                      <h3
                        className="text-lg font-normal text-white group-hover:text-emerald-400 transition-colors mb-2.5 line-clamp-2 leading-snug"
                        style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
                      >
                        {post.title}
                      </h3>
                      <p className="text-xs text-[#90908F] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>

                  {/* Footer Meta */}
                  <div className="px-5 pb-5 pt-3 border-t border-[#282828] flex items-center justify-between text-xs text-[#90908F]">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <Clock size={11} className="text-emerald-400" />
                      {post.readTime}
                    </span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                      Read <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#1C1C1E] rounded-2xl border border-[#282828]">
              <p className="text-sm text-[#90908F]">No articles found under this category filter.</p>
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-8 border-t border-[#282828]">
              <Link
                href={`/news?category=${activeCategory}&page=${currentPage - 1}`}
                className={`px-4 py-2 rounded-xl border border-[#333333] bg-[#1C1C1E] text-xs font-semibold hover:border-emerald-500/50 hover:text-white transition-colors flex items-center gap-1 ${
                  currentPage <= 1 ? "pointer-events-none opacity-40" : ""
                }`}
              >
                ← Previous
              </Link>
              <span className="text-xs text-[#90908F] font-mono">
                Page {currentPage} of {totalPages}
              </span>
              <Link
                href={`/news?category=${activeCategory}&page=${currentPage + 1}`}
                className={`px-4 py-2 rounded-xl border border-[#333333] bg-[#1C1C1E] text-xs font-semibold hover:border-emerald-500/50 hover:text-white transition-colors flex items-center gap-1 ${
                  currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
                }`}
              >
                Next →
              </Link>
            </div>
          )}
        </div>

      </div>

      {/* Styled Footer Frame */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 mt-24">
        <div className="border-t border-[#282828] pt-8 flex justify-between items-center text-xs text-[#90908F]">
          <span>© 2026 Modelverse®. All rights reserved.</span>
          <span className="uppercase font-mono text-[10px] font-semibold text-[#90908F]">
            Modelverse Newsroom
          </span>
        </div>
      </div>
    </main>
  );
}

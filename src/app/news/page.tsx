import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { getAllArticles, getCategoryLabel } from "@/lib/news";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/models";
import ConfidenceBadge from "@/components/news/ConfidenceBadge";

export const metadata: Metadata = {
  title: "AI Intelligence News & Analysis — Modelverse",
  description: "Practical reads, weekly recaps, and deep-dive model reviews from the Modelverse editorial team.",
  alternates: {
    canonical: `${SITE_URL}/news`,
  },
  openGraph: {
    title: "AI Intelligence News & Analysis — Modelverse",
    description: "Practical reads, weekly recaps, and deep-dive model reviews from the Modelverse editorial team.",
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
  searchParams: Promise<{ page?: string }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const resolvedSearchParams = await searchParams;
  const posts = getAllArticles();
  
  if (posts.length === 0) {
    return (
      <main className="min-h-screen bg-[#0C120F] text-[#E2E8E4] pb-24 font-sans antialiased relative">
        <Navbar theme="dark" />
        <div className="max-w-6xl mx-auto px-6 pt-24 text-center">
          <p className="text-sm text-[#5A6E60]">No news articles found. Add some data files in data/news/ to populate.</p>
        </div>
      </main>
    );
  }

  // Top News (Hero)
  let topNews = posts.find(p => p.isFeatured);
  if (!topNews) {
    topNews = posts[0];
  }

  // Remove topNews from the pool so it doesn't appear twice
  const remainingPosts = posts.filter(p => p.id !== topNews?.id);

  // Trending Coverage (Grid)
  const trendingNews = remainingPosts.filter(p => p.isTrending).slice(0, 3);
  if (trendingNews.length < 3) {
    // Fill the rest with the newest articles
    const otherRecent = remainingPosts
      .filter(p => !p.isTrending)
      .slice(0, 3 - trendingNews.length);
    trendingNews.push(...otherRecent);
  }

  // Section 2: Recent Issues (Weekly News)
  const recentIssues = remainingPosts.filter(p => p.category === "weekly-news").slice(0, 4);

  // Section 4: Archive (Cronological grid of all remaining articles, paginated)
  const pageSize = 6;
  const totalPages = Math.ceil(remainingPosts.length / pageSize) || 1;
  const currentPage = Math.max(1, Math.min(totalPages, parseInt(resolvedSearchParams.page || "1", 10) || 1));
  const archivePosts = remainingPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-[#0C120F] text-[#E2E8E4] selection:bg-[#4ADE80] selection:text-[#0C120F] pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 text-center">
        {/* Category Pill */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A261D] border border-[#243629] mb-6">
          <span className="text-[10px] font-bold text-[#8C9E91] uppercase tracking-widest">
            News & Editorial
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-light text-[#F0FDF4] tracking-tight leading-tight max-w-3xl mx-auto mb-16 sm:mb-20"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', serif)" }}
        >
          Practical reads to help you move <span className="italic text-[#7A8A7F]">faster.</span>
        </h1>
      </div>

      {/* Browse by Category Tiles */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mb-12">
        <div className="flex flex-wrap justify-center gap-2">
          {[
            { value: "weekly-news", label: "Weekly News" },
            { value: "short-news", label: "Short News" },
            { value: "model-review", label: "Model Reviews" },
            { value: "other", label: "Other" }
          ].map((cat) => (
            <Link
              key={cat.value}
              href={`/news/category/${cat.value}`}
              className="inline-flex items-center gap-2 bg-[#1A261D] hover:bg-[#243629] text-xs font-semibold text-[#8C9E91] hover:text-[#F0FDF4] px-3.5 py-1.5 rounded-full transition-colors"
            >
              <span>{cat.label}</span>
              <span className="bg-[#0C120F]/50 text-[#5A6E60] px-1.5 py-0.5 rounded-full text-[9px] font-mono border border-[#243629]">
                {posts.filter((p) => p.category === cat.value).length}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* ── 1. Top News (Hero Treatment) ──────────────── */}
        {topNews ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-[#243629] pb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">Top News</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-[#4ADE80]">Featured Article</span>
            </div>
            <div
              className="group relative bg-[#121A15] rounded-3xl border border-[#243629] hover:border-[#334D3A] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-2 z-0"
            >
              <Link
                href={`/news/${topNews.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Read ${topNews.title}`}
              />

              {/* Image Container */}
              <div className="relative h-[250px] sm:h-[350px] lg:h-full min-h-[350px] bg-[#0C120F]">
                <Image
                  src={topNews.coverImage}
                  alt={topNews.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#121A15]/50 to-[#121A15] pointer-events-none hidden lg:block" />
              </div>

              {/* Content Block */}
              <div className="p-6 sm:p-12 lg:p-16 flex flex-col justify-between relative z-20 pointer-events-none">
                <div>
                  {/* Category Label */}
                  <div className="flex items-center gap-2 mb-6 pointer-events-auto">
                    <Link
                      href={`/news/category/${topNews.category}`}
                      className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#0C120F] px-2.5 py-1 rounded bg-[#E2E8E4] shadow-sm hover:bg-[#4ADE80] transition-colors relative z-30"
                    >
                      {topNews.category === "weekly-news" ? `Issue ${topNews.issueNumber}` : getCategoryLabel(topNews.category)}
                    </Link>
                    <ConfidenceBadge confidence={topNews.confidenceLevel} />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#F0FDF4] mb-4 group-hover:text-[#4ADE80] transition-colors leading-snug">
                    {topNews.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-[#E5E7EB] leading-relaxed mb-8">
                    {topNews.excerpt}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-[#243629]">
                  <div className="flex items-center gap-4 text-xs text-[#9CA3AF]">
                    <span className="flex items-center gap-1.5 text-[#A3B8AA]">
                      <Clock size={13} className="text-[#4ADE80]" />
                      {topNews.readTime}
                    </span>
                    <span className="text-[#334D3A]">·</span>
                    <span className="flex items-center gap-1.5 text-[#A3B8AA]">
                      <Calendar size={13} className="text-[#4ADE80]" />
                      {formatNewsDate(topNews.publishDate)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-[#A3B8AA] tracking-wider uppercase inline-flex items-center gap-1">
                    by {topNews.author}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#121A15] rounded-3xl border border-[#243629]">
            <p className="text-sm text-[#5A6E60]">No articles published yet.</p>
          </div>
        )}

        {/* ── 2. Recent Issues (Grid) ───────────────────────── */}
        {recentIssues.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="border-b border-[#243629] pb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6E60]">Recent Issues</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="group relative bg-[#121A15] rounded-3xl border border-[#243629] hover:border-[#334D3A] hover:shadow-[0_0_20px_rgba(74,222,128,0.05)] transition-all duration-300 overflow-hidden flex flex-col justify-between z-0"
                >
                  <Link
                    href={`/news/${issue.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${issue.title}`}
                  />
                  <div>
                    <div className="relative h-[160px] w-full bg-[#0C120F] overflow-hidden">
                      <Image
                        src={issue.coverImage}
                        alt={issue.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                      />
                      <Link
                        href={`/news/category/weekly-news`}
                        className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider text-[#0C120F] px-2.5 py-1 rounded-full bg-[#E2E8E4] shadow-sm z-30 hover:bg-[#4ADE80] transition-colors"
                      >
                        Issue {issue.issueNumber}
                      </Link>
                      <div className="absolute top-4 right-4 z-20">
                        <ConfidenceBadge confidence={issue.confidenceLevel} />
                      </div>
                    </div>
                    <div className="p-6 relative z-20 pointer-events-none">
                      <h3 className="text-base font-semibold tracking-tight text-[#F0FDF4] group-hover:text-[#4ADE80] transition-colors mb-2 line-clamp-2 leading-snug">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-[#5A6E60]">
                        {formatNewsDate(issue.publishDate)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 3. Trending (Short News & Reviews) ────────────── */}
        {trendingNews.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="border-b border-[#243629] pb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6E60]">Trending Coverage</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {trendingNews.map((post) => (
                <div
                  key={post.id}
                  className="group relative bg-[#121A15] rounded-3xl border border-[#243629] hover:border-[#334D3A] hover:shadow-[0_0_20px_rgba(74,222,128,0.05)] transition-all duration-300 overflow-hidden flex flex-col justify-between z-0"
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${post.title}`}
                  />
                  <div>
                    <div className="relative h-[180px] w-full bg-[#0C120F] overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                      />
                      <Link
                        href={`/news/category/${post.category}`}
                        className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider text-[#E2E8E4] px-2.5 py-1 rounded-full bg-[#0C120F]/80 backdrop-blur-sm shadow-sm z-30 hover:bg-[#4ADE80] hover:text-[#0C120F] transition-colors"
                      >
                        {getCategoryLabel(post.category)}
                      </Link>
                      <div className="absolute top-4 left-4 z-20">
                        <ConfidenceBadge confidence={post.confidenceLevel} />
                      </div>
                    </div>
                    <div className="p-6 relative z-20 pointer-events-none">
                      <h3 className="text-lg font-semibold tracking-tight text-[#F0FDF4] group-hover:text-[#4ADE80] transition-colors mb-3 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-[#8C9E91] leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 relative z-20 pointer-events-none">
                    <div className="pt-4 border-t border-[#243629] flex items-center justify-between text-[11px] text-[#5A6E60]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {post.readTime}
                      </span>
                      <span className="font-semibold text-[#8C9E91] flex items-center gap-1 group-hover:text-[#4ADE80] transition-colors">
                        Read Article <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 4. The Archive (All articles, paginated) ───────── */}
        <div className="space-y-6 pt-4">
          <div className="border-b border-[#243629] pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6E60]">The Full Archive</h2>
          </div>
          
          {archivePosts.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {archivePosts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative bg-[#121A15] rounded-3xl border border-[#243629] hover:border-[#334D3A] hover:shadow-[0_0_20px_rgba(74,222,128,0.05)] transition-all duration-300 overflow-hidden flex flex-col justify-between z-0"
                  >
                    <Link
                      href={`/news/${post.slug}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Read ${post.title}`}
                    />
                    <div>
                      <div className="relative h-[180px] w-full bg-[#0C120F] overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                        />
                        <Link
                          href={`/news/category/${post.category}`}
                          className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider text-[#E2E8E4] px-2.5 py-1 rounded-full bg-[#0C120F]/80 backdrop-blur-sm shadow-sm z-30 hover:bg-[#4ADE80] hover:text-[#0C120F] transition-colors"
                        >
                          {post.category === "weekly-news" ? `Issue ${post.issueNumber}` : getCategoryLabel(post.category)}
                        </Link>
                        <div className="absolute top-4 left-4 z-20">
                          <ConfidenceBadge confidence={post.confidenceLevel} />
                        </div>
                      </div>
                      <div className="p-6 relative z-20 pointer-events-none">
                        <h3 className="text-lg font-semibold tracking-tight text-[#F0FDF4] group-hover:text-[#4ADE80] transition-colors mb-3 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs text-[#8C9E91] leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 pb-6 relative z-20 pointer-events-none">
                      <div className="pt-4 border-t border-[#243629] flex items-center justify-between text-[11px] text-[#5A6E60]">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {post.readTime}
                        </span>
                        <span className="font-semibold text-[#8C9E91] flex items-center gap-1 group-hover:text-[#4ADE80] transition-colors">
                          Read Article <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 border-t border-[#243629]">
                  <Link
                    href={`/news?page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-xl border border-[#243629] text-xs font-semibold hover:bg-[#1A261D] hover:text-[#F0FDF4] transition-colors flex items-center gap-1 ${
                      currentPage <= 1 ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    ← Previous
                  </Link>
                  <span className="text-xs text-[#5A6E60]">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Link
                    href={`/news?page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-xl border border-[#243629] text-xs font-semibold hover:bg-[#1A261D] hover:text-[#F0FDF4] transition-colors flex items-center gap-1 ${
                      currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    Next →
                  </Link>
                </div>
              )}
            </div>
          ) : (
             <div className="text-center py-12 bg-[#121A15] rounded-3xl border border-[#243629]">
              <p className="text-sm text-[#5A6E60]">No archive entries found.</p>
            </div>
          )}
        </div>

      </div>

      {/* Styled Footer Frame */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-24">
        <div className="border-t border-[#243629] pt-8 flex justify-between items-center text-xs text-[#5A6E60] font-light">
          <span>© 2026 Modelverse®. All rights reserved.</span>
          <span className="uppercase tracking-widest text-[9px] font-bold text-[#3A4D39]">
            Modelverse Newsroom
          </span>
        </div>
      </div>
    </main>
  );
}

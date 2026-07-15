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
      <main className="min-h-screen bg-[#FFFFFF] text-black pb-24 font-sans antialiased relative">
        <Navbar theme="light" />
        <div className="max-w-6xl mx-auto px-6 pt-24 text-center">
          <p className="text-sm text-black/40">No news articles found. Add some data files in data/news/ to populate.</p>
        </div>
      </main>
    );
  }

  // Filter out weekly-news category entries
  const weeklyNewsList = posts.filter((p) => p.category === "weekly-news");
  
  // Section 1: Latest Issue (Hero)
  const latestIssue = weeklyNewsList[0];
  
  // Section 2: Recent Issues (Next 6-8 weekly issues)
  const recentIssues = weeklyNewsList.slice(1, 9);

  // Section 3: Trending (Most recent short-news / model-review)
  const trendingNews = posts
    .filter((p) => p.category === "short-news" || p.category === "model-review")
    .slice(0, 3);

  // Section 4: Archive (Cronological grid of all articles, paginated)
  const pageSize = 6;
  const totalPages = Math.ceil(posts.length / pageSize) || 1;
  const currentPage = Math.max(1, Math.min(totalPages, parseInt(resolvedSearchParams.page || "1", 10) || 1));
  const archivePosts = posts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-black selection:bg-brand-orange selection:text-white pb-24 font-sans antialiased relative">
      <Navbar theme="light" />

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 text-center">
        {/* Category Pill */}
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] mb-6">
          <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
            News & Editorial
          </span>
        </div>

        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-light text-black tracking-tight leading-tight max-w-3xl mx-auto mb-16 sm:mb-20"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', serif)" }}
        >
          Practical reads to help you move <span className="italic text-black/50">faster.</span>
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
              className="inline-flex items-center gap-2 bg-black/[0.04] hover:bg-black/[0.08] text-xs font-semibold text-black/60 hover:text-[#0a0a0a] px-3.5 py-1.5 rounded-full transition-colors"
            >
              <span>{cat.label}</span>
              <span className="bg-black/5 text-black/50 px-1.5 py-0.5 rounded-full text-[9px] font-mono">
                {posts.filter((p) => p.category === cat.value).length}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 space-y-16">
        
        {/* ── 1. Latest Issue (Hero Treatment) ──────────────── */}
        {latestIssue ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-black/10 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black/40">Latest Issue</h2>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-orange">Flagship Edition</span>
            </div>
            <div
              className="group relative bg-[#F7F7F7] rounded-3xl border border-black/[0.05] hover:border-black/[0.08] transition-all duration-300 overflow-hidden grid grid-cols-1 lg:grid-cols-2 z-0"
            >
              <Link
                href={`/news/${latestIssue.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Read ${latestIssue.title}`}
              />

              {/* Image Container */}
              <div className="relative h-[250px] sm:h-[350px] lg:h-full min-h-[350px] bg-black">
                <Image
                  src={latestIssue.coverImage}
                  alt={latestIssue.title}
                  fill
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-102"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-white/10 pointer-events-none hidden lg:block" />
              </div>

              {/* Content Block */}
              <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative z-20 pointer-events-none">
                <div>
                  {/* Issue Number Label */}
                  <div className="flex items-center gap-2 mb-6 pointer-events-auto">
                    <Link
                      href={`/news/category/weekly-news`}
                      className="inline-block text-[10px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded bg-black/90 shadow-sm hover:bg-brand-orange transition-colors relative z-30"
                    >
                      Issue {latestIssue.issueNumber}
                    </Link>
                    <ConfidenceBadge confidence={latestIssue.confidenceLevel} />
                  </div>

                  {/* Title */}
                  <h3 className="text-3xl sm:text-4xl font-semibold tracking-tight text-black mb-4 group-hover:text-brand-orange transition-colors leading-snug">
                    {latestIssue.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-black/60 leading-relaxed mb-8">
                    {latestIssue.excerpt}
                  </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-6 border-t border-black/[0.05]">
                  <div className="flex items-center gap-4 text-xs text-black/40">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {latestIssue.readTime}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {formatNewsDate(latestIssue.publishDate)}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-black/50 tracking-wider uppercase inline-flex items-center gap-1">
                    by {latestIssue.author}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-[#F7F7F7] rounded-3xl border border-black/[0.05]">
            <p className="text-sm text-black/40">No weekly flagship issues published yet.</p>
          </div>
        )}

        {/* ── 2. Recent Issues (Grid) ───────────────────────── */}
        {recentIssues.length > 0 && (
          <div className="space-y-6 pt-4">
            <div className="border-b border-black/10 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black/40">Recent Issues</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {recentIssues.map((issue) => (
                <div
                  key={issue.id}
                  className="group relative bg-[#F7F7F7] rounded-3xl border border-black/[0.05] hover:border-black/[0.08] hover:shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between z-0"
                >
                  <Link
                    href={`/news/${issue.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${issue.title}`}
                  />
                  <div>
                    <div className="relative h-[160px] w-full bg-black overflow-hidden">
                      <Image
                        src={issue.coverImage}
                        alt={issue.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-102"
                      />
                      <Link
                        href={`/news/category/weekly-news`}
                        className="absolute top-4 left-4 text-[9px] font-bold uppercase tracking-wider text-white px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-sm shadow-sm z-30 hover:bg-brand-orange transition-colors"
                      >
                        Issue {issue.issueNumber}
                      </Link>
                      <div className="absolute top-4 right-4 z-20">
                        <ConfidenceBadge confidence={issue.confidenceLevel} />
                      </div>
                    </div>
                    <div className="p-6 relative z-20 pointer-events-none">
                      <h3 className="text-base font-semibold tracking-tight text-black group-hover:text-brand-orange transition-colors mb-2 line-clamp-2 leading-snug">
                        {issue.title}
                      </h3>
                      <p className="text-xs text-black/40">
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
            <div className="border-b border-black/10 pb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-black/40">Trending Coverage</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {trendingNews.map((post) => (
                <div
                  key={post.id}
                  className="group relative bg-white rounded-3xl border border-black/[0.05] hover:border-black/[0.08] hover:shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between z-0"
                >
                  <Link
                    href={`/news/${post.slug}`}
                    className="absolute inset-0 z-10"
                    aria-label={`Read ${post.title}`}
                  />
                  <div>
                    <div className="relative h-[180px] w-full bg-black overflow-hidden">
                      <Image
                        src={post.coverImage}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-102"
                      />
                      <Link
                        href={`/news/category/${post.category}`}
                        className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider text-black/60 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm z-30 hover:bg-black/10 hover:text-black transition-colors"
                      >
                        {getCategoryLabel(post.category)}
                      </Link>
                      <div className="absolute top-4 left-4 z-20">
                        <ConfidenceBadge confidence={post.confidenceLevel} />
                      </div>
                    </div>
                    <div className="p-6 relative z-20 pointer-events-none">
                      <h3 className="text-lg font-semibold tracking-tight text-black group-hover:text-brand-orange transition-colors mb-3 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-xs text-black/60 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 relative z-20 pointer-events-none">
                    <div className="pt-4 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-black/40">
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {post.readTime}
                      </span>
                      <span className="font-semibold text-black/70 flex items-center gap-1 group-hover:text-brand-orange transition-colors">
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
          <div className="border-b border-black/10 pb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-black/40">The Full Archive</h2>
          </div>
          
          {archivePosts.length > 0 ? (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                {archivePosts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative bg-white rounded-3xl border border-black/[0.05] hover:border-black/[0.08] hover:shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between z-0"
                  >
                    <Link
                      href={`/news/${post.slug}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Read ${post.title}`}
                    />
                    <div>
                      <div className="relative h-[180px] w-full bg-black overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-102"
                        />
                        <Link
                          href={`/news/category/${post.category}`}
                          className="absolute top-4 right-4 text-[9px] font-bold uppercase tracking-wider text-black/60 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm shadow-sm z-30 hover:bg-black/10 hover:text-black transition-colors"
                        >
                          {post.category === "weekly-news" ? `Issue ${post.issueNumber}` : getCategoryLabel(post.category)}
                        </Link>
                        <div className="absolute top-4 left-4 z-20">
                          <ConfidenceBadge confidence={post.confidenceLevel} />
                        </div>
                      </div>
                      <div className="p-6 relative z-20 pointer-events-none">
                        <h3 className="text-lg font-semibold tracking-tight text-black group-hover:text-brand-orange transition-colors mb-3 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs text-black/60 leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </div>
                    <div className="px-6 pb-6 relative z-20 pointer-events-none">
                      <div className="pt-4 border-t border-black/[0.05] flex items-center justify-between text-[11px] text-black/40">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {post.readTime}
                        </span>
                        <span className="font-semibold text-black/70 flex items-center gap-1 group-hover:text-brand-orange transition-colors">
                          Read Article <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-8 border-t border-black/[0.05]">
                  <Link
                    href={`/news?page=${currentPage - 1}`}
                    className={`px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-semibold hover:bg-black/[0.02] transition-colors flex items-center gap-1 ${
                      currentPage <= 1 ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    ← Previous
                  </Link>
                  <span className="text-xs text-black/50">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Link
                    href={`/news?page=${currentPage + 1}`}
                    className={`px-4 py-2 rounded-xl border border-black/[0.08] text-xs font-semibold hover:bg-black/[0.02] transition-colors flex items-center gap-1 ${
                      currentPage >= totalPages ? "pointer-events-none opacity-40" : ""
                    }`}
                  >
                    Next →
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-black/[0.05]">
              <p className="text-sm text-black/40">No archive entries found.</p>
            </div>
          )}
        </div>

      </div>

      {/* Styled Footer Frame */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 mt-24">
        <div className="border-t border-black/10 pt-8 flex justify-between items-center text-xs text-black/40 font-light">
          <span>© 2026 Modelverse®. All rights reserved.</span>
          <span className="uppercase tracking-widest text-[9px] font-bold text-black/30">
            Modelverse Newsroom
          </span>
        </div>
      </div>
    </main>
  );
}

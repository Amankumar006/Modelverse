import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import NewsBreadcrumb from "@/components/news/NewsBreadcrumb";
import { getArticlesByCategory, getCategoryLabel, getAllArticles } from "@/lib/news";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { SITE_URL } from "@/lib/models";
import { notFound } from "next/navigation";
import ConfidenceBadge from "@/components/news/ConfidenceBadge";
import { NewsCategory } from "../../../../../data/schema/news.schema";
import type { NewsCategoryType } from "../../../../../data/schema/news.schema";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  return NewsCategory.options.map((cat) => ({
    category: cat,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = resolvedParams.category as NewsCategoryType;
  if (!NewsCategory.options.includes(category)) {
    return {};
  }

  const label = getCategoryLabel(category);
  const title = `${label} Archives — Modelverse`;
  const description = `Read the latest articles, analysis and releases related to ${label} on Modelverse.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/news/category/${category}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/news/category/${category}`,
    },
  };
}

function formatNewsDate(dateStr: string): string {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = resolvedParams.category as NewsCategoryType;
  if (!NewsCategory.options.includes(category)) {
    notFound();
  }

  const posts = getArticlesByCategory(category);
  const label = getCategoryLabel(category);

  return (
    <main className="min-h-screen bg-[#0C120F] text-[#E2E8E4] selection:bg-[#4ADE80] selection:text-[#0C120F] pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />

      {/* Header Container */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 text-left">
        <NewsBreadcrumb category={{ slug: category }} />

        {/* Category Label Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-light text-[#F0FDF4] tracking-tight leading-tight mb-4"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', serif)" }}
        >
          {label}
        </h1>
        <p className="text-sm sm:text-base text-[#8C9E91] max-w-2xl mb-16">
          Showing all articles filed under the <span className="font-semibold text-[#E2E8E4]">{label}</span> category, listed newest to oldest.
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
        {posts.length === 0 ? (
          <p className="text-sm text-[#5A6E60] py-12">No articles found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group bg-[#121A15] rounded-3xl border border-[#243629] hover:border-[#334D3A] hover:shadow-[0_0_20px_rgba(74,222,128,0.05)] transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-[200px] w-full bg-[#0C120F] overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-102"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <ConfidenceBadge confidence={post.confidenceLevel} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8">
                    <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-[#F0FDF4] group-hover:text-[#4ADE80] transition-colors mb-3 leading-snug">
                      {post.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8C9E91] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                  <div className="pt-4 border-t border-[#243629] flex items-center justify-between text-[11px] text-[#5A6E60]">
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      {post.readTime}
                    </span>
                    <span className="font-semibold text-[#A3B8AA] flex items-center gap-1 group-hover:text-[#4ADE80] transition-colors">
                      Read Article <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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

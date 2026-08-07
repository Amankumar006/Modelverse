import type { Metadata } from "next";
import Link from "next/link";
import Image from "@/components/ui/FallbackImage";
import Navbar from "@/components/layout/Navbar";
import NewsBreadcrumb from "@/components/news/NewsBreadcrumb";
import { getArticlesByCategory, getCategoryLabel } from "@/lib/news";
import { Clock, ArrowRight } from "lucide-react";
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

export default async function CategoryPage({ params }: CategoryPageProps) {
  const resolvedParams = await params;
  const category = resolvedParams.category as NewsCategoryType;
  if (!NewsCategory.options.includes(category)) {
    notFound();
  }

  const posts = await getArticlesByCategory(category);
  const label = getCategoryLabel(category);

  return (
    <main className="min-h-screen bg-[#141414] text-[#E1E1E0] selection:bg-emerald-500 selection:text-black pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />

      {/* Header Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 pt-10 sm:pt-14 text-left">
        <NewsBreadcrumb category={{ slug: category }} />

        {/* Category Label Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-normal text-white tracking-tight leading-tight mb-3 mt-4"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          {label} Archives
        </h1>
        <p className="text-xs sm:text-sm text-[#90908F] max-w-2xl mb-12">
          Showing all articles filed under the <span className="font-semibold text-white">{label}</span> category, listed newest to oldest.
        </p>
      </div>

      {/* Main Grid Container */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12">
        {posts.length === 0 ? (
          <p className="text-sm text-[#90908F] py-12">No articles found in this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group bg-[#1C1C1E] rounded-2xl border border-[#282828] hover:border-emerald-500/40 shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-[200px] w-full bg-[#141414] overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-102 opacity-90"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <ConfidenceBadge confidence={post.confidenceLevel} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3
                      className="text-lg font-normal text-white group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2 leading-snug"
                      style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
                    >
                      {post.title}
                    </h3>
                    <p className="text-xs text-[#90908F] leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-5 pb-5 pt-3 border-t border-[#282828] flex items-center justify-between text-xs text-[#90908F]">
                  <span className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock size={11} className="text-emerald-400" />
                    {post.readTime}
                  </span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                    Read <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Frame */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 mt-24">
        <div className="border-t border-[#282828] pt-8 flex justify-between items-center text-xs text-[#90908F] font-mono">
          <span>© 2026 Modelverse®. All rights reserved.</span>
          <span className="uppercase text-[10px] font-semibold text-[#90908F]">
            Modelverse Newsroom
          </span>
        </div>
      </div>
    </main>
  );
}

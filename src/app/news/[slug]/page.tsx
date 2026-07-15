import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import NewsBreadcrumb from "@/components/news/NewsBreadcrumb";
import { getArticleBySlug, getAllArticles, getCategoryLabel } from "@/lib/news";
import { getModelBySlug, SITE_URL } from "@/lib/models";
import { Clock, Calendar, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import ConfidenceBadge from "@/components/news/ConfidenceBadge";

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);
  if (!article) {
    return {};
  }

  const title = article.seoTitle || `${article.title} — Modelverse`;
  const description = article.seoDescription || article.excerpt;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/news/${article.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/news/${article.slug}`,
      type: "article",
      publishedTime: article.publishDate,
      modifiedTime: article.updatedDate || article.publishDate,
      authors: [article.author],
      images: [
        {
          url: article.coverImage.startsWith("http") ? article.coverImage : `${SITE_URL}${article.coverImage}`,
          alt: article.title,
        }
      ],
    },
  };
}

function formatNewsDate(dateStr: string): string {
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

// Simple helper to render basic markdown elements into HTML securely
function renderMarkdown(content: string) {
  const paragraphs = content.split("\n\n");
  return paragraphs.map((para, pIdx) => {
    const trimmed = para.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <h3 key={pIdx} className="text-xl sm:text-2xl font-bold tracking-tight text-black mt-8 mb-4">
          {trimmed.replace("### ", "")}
        </h3>
      );
    }
    if (trimmed.startsWith("## ")) {
      return (
        <h2 key={pIdx} className="text-2xl sm:text-3xl font-bold tracking-tight text-black mt-10 mb-4">
          {trimmed.replace("## ", "")}
        </h2>
      );
    }
    if (trimmed.startsWith("> ")) {
      const quoteText = trimmed.split("\n").map(l => l.replace(/^>\s?/, "").trim()).join(" ");
      return (
        <blockquote key={pIdx} className="border-l-4 border-brand-orange pl-6 py-2 my-6 italic text-lg text-black/70 bg-black/[0.02] rounded-r-lg">
          {quoteText}
        </blockquote>
      );
    }

    if (trimmed.startsWith("|")) {
      const lines = trimmed.split("\n").filter(l => l.trim() !== "");
      const rows = lines.filter(l => !l.includes("---"));
      const tableData = rows.map(r => r.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1));
      
      if (tableData.length > 0) {
        const headers = tableData[0];
        const bodyRows = tableData.slice(1);
        return (
          <div key={pIdx} className="overflow-x-auto my-6 border border-black/10 rounded-xl">
            <table className="min-w-full divide-y divide-black/10 text-sm">
              <thead className="bg-black/[0.02]">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={hIdx} className="px-4 py-3 text-left font-semibold text-black">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 bg-white">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-black/[0.01] transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-3 text-black/80">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    if (trimmed.startsWith("- ")) {
      const items = trimmed.split("\n").map(li => li.replace("- ", "").trim());
      return (
        <ul key={pIdx} className="list-disc pl-5 my-4 space-y-2 text-black/75">
          {items.map((item, liIdx) => {
            // Check for simple bold markup: **text**
            const parts = item.split("**");
            return (
              <li key={liIdx}>
                {parts.map((part, ptIdx) => ptIdx % 2 === 1 ? <strong key={ptIdx} className="text-black font-semibold">{part}</strong> : part)}
              </li>
            );
          })}
        </ul>
      );
    }
    
    // Check for inline bold in paragraph: **text**
    if (trimmed.includes("**")) {
      const parts = trimmed.split("**");
      return (
        <p key={pIdx} className="text-base sm:text-lg leading-relaxed text-black/75 mb-6">
          {parts.map((part, ptIdx) => ptIdx % 2 === 1 ? <strong key={ptIdx} className="text-black font-semibold">{part}</strong> : part)}
        </p>
      );
    }

    return (
      <p key={pIdx} className="text-base sm:text-lg leading-relaxed text-black/75 mb-6">
        {trimmed}
      </p>
    );
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);
  
  if (!article) {
    notFound();
  }

  // Get full models details for related links
  const relatedModelsData = (article.relatedModels || [])
    .map(slug => getModelBySlug(slug))
    .filter((model): model is NonNullable<typeof model> => !!model);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "image": [
      article.coverImage.startsWith("http") ? article.coverImage : `${SITE_URL}${article.coverImage}`
    ],
    "datePublished": article.publishDate,
    "dateModified": article.updatedDate || article.publishDate,
    "author": [
      {
        "@type": "Person",
        "name": article.author,
      }
    ],
    "publisher": {
      "@type": "Organization",
      "name": "Modelverse",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo-light.png`
      }
    },
    "description": article.excerpt
  };

  return (
    <main className="min-h-screen bg-[#FFFFFF] text-black selection:bg-brand-orange selection:text-white pb-24 font-sans antialiased relative">
      <Navbar theme="light" />

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24">
        {/* Breadcrumb */}
        <NewsBreadcrumb category={{ slug: article.category }} article={{ title: article.title }} />

        {/* Back Link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-black/50 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to News
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          {/* Issue Number or Category Pill */}
          {article.category === "weekly-news" ? (
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-black/40 uppercase tracking-widest">
                  Issue {article.issueNumber}
                </span>
                <ConfidenceBadge confidence={article.confidenceLevel} />
              </div>
              <Link
                href={`/news/category/${article.category}`}
                className="self-start inline-flex items-center px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] hover:bg-black/[0.07] transition-all"
              >
                <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
                  {getCategoryLabel(article.category)}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 mb-6">
              <Link
                href={`/news/category/${article.category}`}
                className="inline-flex items-center px-3 py-1 rounded-full bg-black/[0.04] border border-black/[0.06] hover:bg-black/[0.07] transition-all"
              >
                <span className="text-[10px] font-bold text-black/60 uppercase tracking-widest">
                  {getCategoryLabel(article.category)}
                </span>
              </Link>
              <ConfidenceBadge confidence={article.confidenceLevel} />
            </div>
          )}

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light text-black tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-display, 'Instrument Serif', serif)" }}
          >
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-black/40 border-y border-black/[0.06] py-4">
            <span className="font-semibold text-black/60 uppercase">
              By {article.author}
            </span>
            <span className="hidden sm:inline">|</span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {formatNewsDate(article.publishDate)}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {article.readTime}
            </span>
          </div>
        </header>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-5xl mx-auto px-0 sm:px-8 mb-16">
        <div className="relative h-[250px] sm:h-[400px] md:h-[500px] w-full bg-black sm:rounded-3xl overflow-hidden shadow-sm">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Article Body Grid */}
      <div className="max-w-6xl mx-auto px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-12 sm:gap-16">
        {/* Main Content */}
        <article className="prose prose-neutral max-w-none text-black">
          {renderMarkdown(article.body)}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-black/[0.05]">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-black/60 bg-black/[0.04] px-2.5 py-1 rounded-full"
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar: Related Models & Internal Links */}
        <aside className="space-y-8">
          {relatedModelsData.length > 0 && (
            <div className="bg-[#F7F7F7] rounded-3xl p-6 sm:p-8 border border-black/[0.05]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-black/40 mb-6">
                Related Models
              </h4>
              <div className="space-y-4">
                {relatedModelsData.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.slug}`}
                    className="group block p-4 bg-white rounded-2xl border border-black/[0.04] hover:border-black/[0.08] hover:shadow-sm transition-all"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brand-orange block mb-1">
                      {model.developer}
                    </span>
                    <h5 className="text-sm font-semibold text-black group-hover:text-brand-orange transition-colors truncate mb-1">
                      {model.name}
                    </h5>
                    <p className="text-[10px] text-black/50 truncate mb-3">
                      {model.primaryTask}
                    </p>
                    <span className="text-[10px] font-semibold text-black/70 flex items-center gap-0.5 group-hover:text-brand-orange">
                      View Model <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
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

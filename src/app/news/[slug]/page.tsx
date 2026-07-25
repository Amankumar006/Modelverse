import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import NewsBreadcrumb from "@/components/news/NewsBreadcrumb";
import { getArticleBySlug, getAllArticles, getCategoryLabel } from "@/lib/news";
import { getModelBySlug, getAllModelEntries, SITE_URL } from "@/lib/models";
import { Clock, Calendar, ArrowRight, ArrowLeft, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import ConfidenceBadge from "@/components/news/ConfidenceBadge";
import BenchmarkTabs from "@/components/news/BenchmarkTabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/ui/CodeBlock";
import CopyableTable from "@/components/ui/CopyableTable";
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

// Markdown is now handled by react-markdown and @tailwindcss/typography

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);
  
  if (!article) {
    notFound();
  }

  // Get full models details for related links, with auto-matching fallback
  let relatedModelsData = (article.relatedModels || [])
    .map(slug => getModelBySlug(slug))
    .filter((model): model is NonNullable<typeof model> => !!model);

  if (relatedModelsData.length < 2) {
    const allModels = getAllModelEntries();
    const textToMatch = `${article.title} ${article.body}`.toLowerCase();
    const existingSlugs = new Set(relatedModelsData.map(m => m.slug));

    const matched = allModels.filter(m => {
      if (existingSlugs.has(m.slug)) return false;
      const nameLower = m.name.toLowerCase();
      if (nameLower.length >= 3 && textToMatch.includes(nameLower)) return true;
      if (m.family && m.family.length >= 3 && textToMatch.includes(m.family.toLowerCase())) return true;
      return false;
    });

    const combined = [...relatedModelsData, ...matched];
    if (combined.length < 2) {
      const featuredFallback = allModels.filter(m => m.featured && !existingSlugs.has(m.slug));
      combined.push(...featuredFallback);
    }
    relatedModelsData = combined.slice(0, 3);
  }

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
    <main className="min-h-screen bg-[#0C120F] text-[#E2E8E4] selection:bg-[#4ADE80] selection:text-[#0C120F] pb-24 font-sans antialiased relative">
      <Navbar theme="dark" />

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24">
        {/* Breadcrumb */}
        <NewsBreadcrumb category={{ slug: article.category }} article={{ title: article.title }} />

        {/* Back Link */}
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5A6E60] hover:text-[#E2E8E4] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to News
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          {/* Issue Number or Category Pill */}
          {article.category === "weekly-news" ? (
            <div className="flex flex-col gap-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#5A6E60] uppercase tracking-widest">
                  Issue {article.issueNumber}
                </span>
                <ConfidenceBadge confidence={article.confidenceLevel} />
              </div>
              <Link
                href={`/news/category/${article.category}`}
                className="self-start inline-flex items-center px-3 py-1 rounded-full bg-[#1A261D] border border-[#243629] hover:bg-[#2C4032] transition-all"
              >
                <span className="text-[10px] font-bold text-[#8C9E91] uppercase tracking-widest">
                  {getCategoryLabel(article.category)}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 mb-6">
              <Link
                href={`/news/category/${article.category}`}
                className="inline-flex items-center px-3 py-1 rounded-full bg-[#1A261D] border border-[#243629] hover:bg-[#2C4032] transition-all"
              >
                <span className="text-[10px] font-bold text-[#8C9E91] uppercase tracking-widest">
                  {getCategoryLabel(article.category)}
                </span>
              </Link>
              <ConfidenceBadge confidence={article.confidenceLevel} />
            </div>
          )}

          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-light text-[#F0FDF4] tracking-tight leading-tight mb-6"
            style={{ fontFamily: "var(--font-display, 'Instrument Serif', serif)" }}
          >
            {article.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm text-[#9CA3AF] border-y border-[#243629] py-4">
            <span className="font-semibold text-[#E2E8E4] uppercase">
              By {article.author}
            </span>
            <span className="hidden sm:inline text-[#334D3A]">|</span>
            <span className="flex items-center gap-1.5 text-[#A3B8AA]">
              <Calendar size={14} className="text-[#4ADE80]" />
              {formatNewsDate(article.publishDate)}
            </span>
            <span className="text-[#334D3A]">·</span>
            <span className="flex items-center gap-1.5 text-[#A3B8AA]">
              <Clock size={14} className="text-[#4ADE80]" />
              {article.readTime}
            </span>
          </div>
        </header>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-[1400px] mx-auto px-0 sm:px-8 lg:px-12 mb-16">
        <div suppressHydrationWarning className="relative h-[300px] sm:h-[500px] lg:h-[650px] w-full bg-[#0C120F] sm:rounded-3xl overflow-hidden shadow-sm border border-[#243629]">
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
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-12 lg:gap-20">
        {/* Main Content (Ergonomic 760px reading width & 20px font scale) */}
        <article className="prose prose-invert prose-emerald max-w-[760px] text-[#F3F4F6] prose-p:text-[#F3F4F6] prose-p:leading-[1.88] prose-p:text-[19px] md:prose-p:text-[21px] prose-headings:text-white prose-img:rounded-xl prose-img:max-w-full prose-img:h-auto prose-img:w-full prose-img:mx-auto">
          {article.slug === 'claude-opus-5-detailed-guide' && (
            <BenchmarkTabs />
          )}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table({ children }) {
                return (
                  <CopyableTable title="Specification Matrix">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm">
                      {children}
                    </table>
                  </CopyableTable>
                );
              },
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code className="bg-[#1A261D] text-[#4ADE80] px-1.5 py-0.5 rounded font-mono text-xs border border-[#243629]" {...props}>
                      {children}
                    </code>
                  );
                }

                return (
                  <CodeBlock
                    language={match ? match[1] : "bash"}
                    code={String(children).replace(/\n$/, "")}
                  />
                );
              },
              pre({ children }) {
                return <>{children}</>;
              }
            }}
          >
            {article.body}
          </ReactMarkdown>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#243629]">
              {article.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-[#E2E8E4] bg-[#1A261D] px-3 py-1 rounded-full border border-[#243629]"
                >
                  <Tag size={11} className="text-[#4ADE80]" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* External Sources */}
          {article.externalSources && article.externalSources.length > 0 && (
            <div className="mt-8 pt-8 border-t border-[#243629]">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF] mb-3">External Sources</h3>
              <ul className="space-y-2">
                {article.externalSources.map((src, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="text-xs text-[#9CA3AF] select-none font-mono">[{idx + 1}]</span>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm text-[#4ADE80] font-mono truncate hover:underline transition-colors max-w-full"
                    >
                      {src}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </article>

        {/* Sidebar: Related Models & Internal Links */}
        <aside className="space-y-8">
          {relatedModelsData.length > 0 && (
            <div className="bg-[#121A15] rounded-3xl p-6 sm:p-8 border border-[#243629]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#5A6E60] mb-6">
                Related Models
              </h4>
              <div className="space-y-4">
                {relatedModelsData.map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.slug}`}
                    className="group block p-4 bg-[#0C120F] rounded-2xl border border-[#243629] hover:border-[#334D3A] hover:shadow-[0_0_20px_rgba(74,222,128,0.05)] transition-all"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#4ADE80] block mb-1">
                      {model.developer}
                    </span>
                    <h5 className="text-sm font-semibold text-[#F0FDF4] group-hover:text-[#4ADE80] transition-colors truncate mb-1">
                      {model.name}
                    </h5>
                    <p className="text-[10px] text-[#8C9E91] truncate mb-3">
                      {model.primaryTask}
                    </p>
                    <span className="text-[10px] font-semibold text-[#E2E8E4] flex items-center gap-0.5 group-hover:text-[#4ADE80]">
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
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 mt-24">
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

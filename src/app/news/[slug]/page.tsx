import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
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

export default async function ArticlePage({ params }: ArticlePageProps) {
  const resolvedParams = await params;
  const article = getArticleBySlug(resolvedParams.slug);
  
  if (!article) {
    notFound();
  }

  const allArticles = getAllArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  // Get full models details for related links
  let relatedModelsData = (article.relatedModels || [])
    .map((slug) => getModelBySlug(slug))
    .filter((model): model is NonNullable<typeof model> => !!model);

  if (relatedModelsData.length < 2) {
    const allModels = getAllModelEntries();
    const textToMatch = `${article.title} ${article.body}`.toLowerCase();
    const existingSlugs = new Set(relatedModelsData.map((m) => m.slug));

    const matched = allModels.filter((m) => {
      if (existingSlugs.has(m.slug)) return false;
      const nameLower = m.name.toLowerCase();
      if (nameLower.length >= 3 && textToMatch.includes(nameLower)) return true;
      if (m.family && m.family.length >= 3 && textToMatch.includes(m.family.toLowerCase())) return true;
      return false;
    });

    const combined = [...relatedModelsData, ...matched];
    if (combined.length < 2) {
      const featuredFallback = allModels.filter((m) => m.featured && !existingSlugs.has(m.slug));
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
        "url": `${SITE_URL}/logo.svg`
      }
    },
    "description": article.excerpt
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] text-[#191919] selection:bg-[#E5DCD0] selection:text-[#191919] font-sans antialiased relative">
      {/* Site Header */}
      <Navbar theme="dark" />

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Anthropic Blog Top Header Navigation */}
      <div className="max-w-[840px] mx-auto px-6 pt-10 sm:pt-14">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#666666] hover:text-[#191919] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Newsroom
        </Link>

        {/* Article Meta Badges */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/news?category=${article.category}`}
            className="inline-flex items-center px-3 py-1 rounded-full bg-[#EFECE6] border border-[#E0DCD5] text-[11px] font-mono font-semibold uppercase tracking-wider text-[#191919] hover:bg-[#E5E0D6] transition-colors"
          >
            {article.category === "weekly-news" ? `Issue ${article.issueNumber}` : getCategoryLabel(article.category)}
          </Link>
          <ConfidenceBadge confidence={article.confidenceLevel} />
        </div>

        {/* Anthropic Article Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#191919] tracking-tight leading-[1.2] mb-6"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          {article.title}
        </h1>

        {/* Author & Date Metadata */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-[#666666] pb-8 border-b border-[#E0DCD5] font-mono">
          <span>By {article.author}</span>
          <span>·</span>
          <span>{formatNewsDate(article.publishDate)}</span>
          <span>·</span>
          <span>{article.readTime}</span>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 my-10">
        <div className="relative h-[280px] sm:h-[450px] lg:h-[540px] w-full bg-[#EFECE6] rounded-2xl overflow-hidden shadow-sm border border-[#E0DCD5]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Ergonomic 840px Article Reading Canvas (Anthropic Style) */}
      <article className="max-w-[840px] mx-auto px-6 py-4">
        {/* Render Interactive Benchmark Tabs for Claude Opus / Vision Articles */}
        {(article.slug === "claude-opus-5-detailed-guide" || article.body.includes("Benchmark")) && (
          <BenchmarkTabs />
        )}

        {/* Prose Content */}
        <div className="prose prose-slate max-w-none text-[#2D2D2D] leading-[1.88] text-base sm:text-lg font-serif prose-headings:font-serif prose-headings:font-normal prose-headings:text-[#191919] prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:mb-6 prose-a:text-[#191919] prose-a:underline prose-a:font-medium hover:prose-a:text-[#D97757] prose-li:my-1 prose-strong:text-[#191919] prose-strong:font-semibold">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table({ children }) {
                return (
                  <CopyableTable title="Specification Matrix">
                    <table className="w-full text-left border-collapse text-xs sm:text-sm font-sans">
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
                    <code className="bg-[#EFECE6] text-[#191919] px-1.5 py-0.5 rounded font-mono text-xs border border-[#E0DCD5]" {...props}>
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
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#E0DCD5]">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#555555] bg-[#EFECE6] px-3 py-1 rounded-full border border-[#E0DCD5]"
              >
                <Tag size={11} className="text-[#191919]" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* External Sources Footnote Section */}
        {article.externalSources && article.externalSources.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#E0DCD5]">
            <h3
              className="text-lg font-normal text-[#191919] mb-3"
              style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
            >
              Footnotes & Primary References
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[#666666]">
              {article.externalSources.map((src, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="shrink-0 select-none">[{idx + 1}]</span>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#191919] hover:underline truncate"
                  >
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* Anthropic Style Related Content Section */}
      <div className="max-w-[1040px] mx-auto px-6 mt-20 pt-16 border-t border-[#E0DCD5]">
        <h2
          className="text-2xl sm:text-3xl font-normal text-[#191919] mb-8"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          Related content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {relatedArticles.map((rel) => (
            <div key={rel.id} className="group flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-[#191919] text-base mb-2 group-hover:text-[#D97757] transition-colors leading-snug">
                  <Link href={`/news/${rel.slug}`}>{rel.title}</Link>
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed line-clamp-3 mb-4">
                  {rel.excerpt}
                </p>
              </div>

              <Link
                href={`/news/${rel.slug}`}
                className="text-xs font-semibold text-[#191919] group-hover:underline flex items-center gap-1 transition-colors mt-auto"
              >
                <span>Read article</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Styled Footer Frame */}
      <div className="max-w-[1040px] mx-auto px-6 mt-20 pb-12 border-t border-[#E0DCD5] pt-8 flex justify-between items-center text-xs text-[#777777] font-mono">
        <span>© 2026 Modelverse®. All rights reserved.</span>
        <span className="uppercase text-[10px] font-semibold text-[#666666]">
          Modelverse Newsroom
        </span>
      </div>
    </main>
  );
}

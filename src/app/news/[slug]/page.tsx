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
    <main className="min-h-screen bg-[#141414] text-[#E1E1E0] selection:bg-emerald-500 selection:text-black font-sans antialiased relative">
      {/* Site Navigation */}
      <Navbar theme="dark" />

      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Article Header Container */}
      <div className="max-w-[840px] mx-auto px-6 pt-10 sm:pt-14">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#90908F] hover:text-white transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Newsroom
        </Link>

        {/* Article Category & Confidence Badges */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/news?category=${article.category}`}
            className="inline-flex items-center px-3 py-1 rounded-full bg-[#242426] border border-[#333333] text-[11px] font-mono font-semibold uppercase tracking-wider text-emerald-400 hover:border-emerald-500/40 transition-colors"
          >
            {article.category === "weekly-news" ? `Issue ${article.issueNumber}` : getCategoryLabel(article.category)}
          </Link>
          <ConfidenceBadge confidence={article.confidenceLevel} />
        </div>

        {/* High-Contrast Article Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-normal text-white tracking-tight leading-[1.2] mb-6"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          {article.title}
        </h1>

        {/* Metadata Line */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#90908F] pb-8 border-b border-[#282828]">
          <span className="text-[#E1E1E0] font-semibold">By {article.author}</span>
          <span>·</span>
          <span>{formatNewsDate(article.publishDate)}</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Clock size={12} />
            {article.readTime}
          </span>
        </div>
      </div>

      {/* Featured Cover Image */}
      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 my-10">
        <div className="relative h-[280px] sm:h-[450px] lg:h-[540px] w-full bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-2xl border border-[#282828]">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Ergonomic 840px Article Reading Canvas (High Contrast Dark Theme) */}
      <article className="max-w-[840px] mx-auto px-6 py-4">
        {/* Render Interactive Benchmark Tabs for Claude Opus / Vision Articles */}
        {(article.slug === "claude-opus-5-detailed-guide" || article.body.includes("Benchmark")) && (
          <BenchmarkTabs />
        )}

        {/* High-Contrast Markdown Body */}
        <div className="prose prose-invert prose-emerald max-w-none text-[#E1E1E0] leading-[1.85] text-base sm:text-lg font-sans prose-p:text-[#E1E1E0] prose-p:mb-6 prose-headings:font-serif prose-headings:font-normal prose-headings:text-white prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-a:text-[#4ADE80] prose-a:underline hover:prose-a:text-emerald-300 prose-li:my-1.5 prose-strong:text-white prose-strong:font-semibold">
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
                    <code className="bg-[#242426] text-emerald-400 px-1.5 py-0.5 rounded font-mono text-xs border border-[#333333]" {...props}>
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
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[#282828]">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#E1E1E0] bg-[#242426] px-3 py-1 rounded-full border border-[#333333]"
              >
                <Tag size={11} className="text-emerald-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* External Sources Footnote Section */}
        {article.externalSources && article.externalSources.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[#282828]">
            <h3
              className="text-xl font-normal text-white mb-3"
              style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
            >
              Footnotes & Primary References
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[#90908F]">
              {article.externalSources.map((src, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="shrink-0 select-none text-emerald-400">[{idx + 1}]</span>
                  <a
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#E1E1E0] hover:text-emerald-400 hover:underline truncate"
                  >
                    {src}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </article>

      {/* Related Content Section */}
      <div className="max-w-[1040px] mx-auto px-6 mt-20 pt-16 border-t border-[#282828]">
        <h2
          className="text-2xl sm:text-3xl font-normal text-white mb-8"
          style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
        >
          Related content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedArticles.map((rel) => (
            <div
              key={rel.id}
              className="group p-5 bg-[#1C1C1E] border border-[#282828] rounded-2xl hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <h3
                  className="font-normal text-white text-lg mb-2 group-hover:text-emerald-400 transition-colors leading-snug"
                  style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
                >
                  <Link href={`/news/${rel.slug}`}>{rel.title}</Link>
                </h3>
                <p className="text-xs text-[#90908F] leading-relaxed line-clamp-3 mb-4">
                  {rel.excerpt}
                </p>
              </div>

              <Link
                href={`/news/${rel.slug}`}
                className="text-xs font-semibold text-emerald-400 group-hover:underline flex items-center gap-1 transition-colors mt-auto"
              >
                <span>Read article</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Frame */}
      <div className="max-w-[1040px] mx-auto px-6 mt-20 pb-12 border-t border-[#282828] pt-8 flex justify-between items-center text-xs text-[#90908F] font-mono">
        <span>© 2026 Modelverse®. All rights reserved.</span>
        <span className="uppercase text-[10px] font-semibold text-[#90908F]">
          Modelverse Newsroom
        </span>
      </div>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import Image from "@/components/ui/FallbackImage";
import Navbar from "@/components/layout/Navbar";
import JsonLd from "@/components/JsonLd";
import { getArticleBySlug, getAllArticles, getCategoryLabel } from "@/lib/news";
import { getModelBySlug, getAllModelEntries, SITE_URL } from "@/lib/models";
import { Clock, ArrowLeft, Tag, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import ConfidenceBadge from "@/components/news/ConfidenceBadge";
import BenchmarkTabs from "@/components/news/BenchmarkTabs";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeBlock from "@/components/ui/CodeBlock";


interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const article = await getArticleBySlug(resolvedParams.slug);
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
    robots: article.qualityStatus && article.qualityStatus !== "indexed"
      ? { index: false, follow: true }
      : undefined,
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
  const article = await getArticleBySlug(resolvedParams.slug);
  
  if (!article) {
    notFound();
  }

  const allArticles = await getAllArticles();
  const relatedArticles = allArticles
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  let relatedModelsData = (await Promise.all(
    (article.relatedModels || []).map(async (slug) => await getModelBySlug(slug))
  )).filter((model): model is NonNullable<typeof model> => !!model);

  if (relatedModelsData.length < 2) {
    const allModels = await getAllModelEntries();
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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] font-sans antialiased relative">
      <Navbar theme="dark" />

      <JsonLd data={jsonLd} />

      <div className="max-w-[840px] mx-auto px-6 pt-10 sm:pt-14">
        <Link
          href="/news"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Back to Newsroom
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/news?category=${article.category}`}
            className="inline-flex items-center px-3.5 py-1 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] border border-[var(--accent)]/20 text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
          >
            {article.category === "weekly-news" ? `Issue ${article.issueNumber}` : getCategoryLabel(article.category)}
          </Link>
          <ConfidenceBadge confidence={article.confidenceLevel} />
        </div>

        <h1 className="text-fluid-h2 font-extrabold text-[var(--text)] tracking-tight leading-[1.2] mb-6">
          {article.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[var(--muted)] pb-8 border-b border-[var(--muted)]/10">
          <span className="text-[var(--text)] font-bold">By {article.author.includes("Modelverse Editorial") ? "Modelverse Editorial" : article.author}</span>
          <span>·</span>
          <span>{formatNewsDate(article.publishDate)}</span>
          <span>·</span>
          <span className="flex items-center gap-1 text-[var(--accent)] font-bold">
            <Clock size={12} />
            {article.readTime}
          </span>
        </div>
      </div>

      <div className="max-w-[1040px] mx-auto px-4 sm:px-6 my-10">
        <div className="relative h-[280px] sm:h-[450px] lg:h-[540px] w-full bg-[var(--card-bg)] rounded-[var(--radius-card)] overflow-hidden shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
          <Image
            src={article.coverImage}
            alt={article.title}
            fill
            sizes="(max-width: 1040px) 100vw, 1040px"
            priority
            className="object-cover"
          />
        </div>
      </div>

      <article className="max-w-[840px] mx-auto px-6 py-4">
        {article.slug === "claude-opus-5-detailed-guide" && (
          <BenchmarkTabs />
        )}

        <div className="prose prose-invert max-w-none text-[var(--text)] leading-relaxed text-base sm:text-lg font-sans prose-p:text-[var(--text)] prose-p:mb-6 prose-headings:font-extrabold prose-headings:text-[var(--text)] prose-h2:text-fluid-h2 prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-a:text-[var(--accent)] prose-a:underline hover:prose-a:text-[var(--accent)] prose-li:my-1.5 prose-strong:text-[var(--text)] prose-strong:font-bold">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table({ children }) {
                return (
                  <div className="my-8 overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
                    <table className="w-full text-left text-xs sm:text-sm font-sans text-[var(--muted)]">
                      {children}
                    </table>
                  </div>
                );
              },
              thead({ children }) {
                return (
                  <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
                    {children}
                  </thead>
                );
              },
              tbody({ children }) {
                return (
                  <tbody className="divide-y divide-[var(--muted)]/10">
                    {children}
                  </tbody>
                );
              },
              tr({ children }) {
                return <tr className="hover:bg-[var(--bg)] transition-colors">{children}</tr>;
              },
              th({ children }) {
                return <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] text-[var(--text)]">{children}</th>;
              },
              td({ children }) {
                return <td className="p-3.5 text-[var(--text)] font-normal leading-relaxed">{children}</td>;
              },
              code({ className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || "");
                const isInline = !match && !String(children).includes("\n");

                if (isInline) {
                  return (
                    <code className="!bg-[var(--tag-bg)] !text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-mono text-xs font-bold" {...props}>
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

        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-[var(--muted)]/10">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[var(--tag-text)] bg-[var(--tag-bg)] px-3 py-1 rounded-[var(--radius-pill)]"
              >
                <Tag size={11} className="text-[var(--accent)]" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {article.externalSources && article.externalSources.length > 0 && (
          <div className="mt-10 pt-8 border-t border-[var(--muted)]/10">
            <h3 className="text-xl font-extrabold text-[var(--text)] mb-3">
              Footnotes & Primary References
            </h3>
            <ul className="space-y-2 text-xs font-mono text-[var(--muted)]">
              {article.externalSources.map((src, idx) => {
                let domain = "";
                try {
                  domain = new URL(src).hostname.replace("www.", "");
                } catch {
                  domain = "External Source";
                }
                return (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="shrink-0 select-none text-[var(--accent)] font-bold">[{idx + 1}]</span>
                    <a
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text)] hover:text-[var(--accent)] hover:underline truncate font-medium"
                    >
                      Read full report on {domain}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </article>

      <div className="max-w-[1040px] mx-auto px-6 mt-20 pt-16 border-t border-[var(--muted)]/10">
        <h2 className="text-fluid-h2 font-extrabold text-[var(--text)] mb-8">
          Related content
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {relatedArticles.map((rel) => (
            <div
              key={rel.id}
              className="group p-5 bg-[var(--card-bg)] border border-[var(--muted)]/10 rounded-[var(--radius-card)] hover:border-[var(--accent)]/40 shadow-[var(--shadow-card)] transition-all flex flex-col justify-between"
            >
              <div>
                <h3 className="font-bold text-[var(--text)] text-lg mb-2 group-hover:text-[var(--accent)] transition-colors leading-snug">
                  <Link href={`/news/${rel.slug}`}>{rel.title}</Link>
                </h3>
                <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-3 mb-4">
                  {rel.excerpt}
                </p>
              </div>

              <Link
                href={`/news/${rel.slug}`}
                className="text-xs font-bold text-[var(--accent)] group-hover:underline flex items-center gap-1 transition-colors mt-auto"
              >
                <span>Read article</span>
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

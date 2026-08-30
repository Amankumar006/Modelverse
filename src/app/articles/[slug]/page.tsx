import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Calendar, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getArticleBySlug, getArticles } from "@/lib/supabase/articles";
import { ArticleJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  const { articles } = await getArticles({ limit: 500, isPublished: true });
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return { title: "Article Not Found — Modelverse" };
  }

  const title = `${article.title} — Modelverse Intelligence`;
  const description = article.summary || article.title;

  return {
    title,
    description,
    alternates: {
      canonical: `/articles/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      url: `/articles/${slug}`,
      publishedTime: article.published_at,
      authors: [article.source_name || "Modelverse Editorial"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const formattedDate = new Date(article.published_at).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <>
      <ArticleJsonLd article={article} />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 flex flex-col gap-8">
        {/* Back Link */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium self-start"
        >
          <ArrowLeft size={14} /> Back to Intelligence Hub
        </Link>

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent)] text-[var(--accent-contrast)]">
              {article.category || "AI News"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight leading-tight">
            {article.title}
          </h1>

          {article.summary && (
            <p className="text-sm sm:text-base text-[var(--muted)] leading-relaxed font-normal">
              {article.summary}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--muted)] pt-2 border-t border-[var(--muted)]/10 font-mono">
            <span className="flex items-center gap-1.5">
              <User size={13} className="text-[var(--accent)]" />
              {article.source_name || "Modelverse Editorial"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Calendar size={13} className="text-[var(--accent)]" />
              {formattedDate}
            </span>
            {article.source_url && (
              <>
                <span>•</span>
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[var(--accent)] hover:underline font-sans"
                >
                  <span>Original Source</span>
                  <ExternalLink size={12} />
                </a>
              </>
            )}
          </div>
        </header>

        {/* Hero Cover Image */}
        {article.cover_image && (
          <div className="relative aspect-[16/9] w-full rounded-[var(--radius-card)] overflow-hidden bg-[var(--muted)]/10 shadow-[var(--shadow-card)]">
            <Image
              src={article.cover_image}
              alt={article.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}

        {/* Markdown Body Content */}
        <article className="prose dark:prose-invert max-w-none text-[var(--text)] leading-relaxed text-sm sm:text-base font-sans">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h2: ({ children }) => (
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] mt-8 mb-4 tracking-tight">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-lg sm:text-xl font-bold text-[var(--text)] mt-6 mb-3">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="mb-5 leading-relaxed text-[var(--text)]">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc pl-5 space-y-2 mb-5">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal pl-5 space-y-2 mb-5">{children}</ol>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-[var(--accent)] pl-4 italic bg-[var(--card-bg)] py-2 my-5 rounded-r-lg">
                  {children}
                </blockquote>
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </article>
      </main>
    </>
  );
}

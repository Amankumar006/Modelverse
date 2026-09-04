import React from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, Calendar, Clock } from "lucide-react";
import type { ArticleRow, ModelRow } from "@/types/database";

interface ModelRelatedArticlesSectionProps {
  articles: ArticleRow[];
  model: ModelRow;
}

export default function ModelRelatedArticlesSection({
  articles,
  model,
}: ModelRelatedArticlesSectionProps) {
  if (!articles || articles.length === 0) return null;

  return (
    <section id="coverage" className="space-y-4 scroll-mt-28">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <BookOpen size={14} />
          <span>Technical Analysis &amp; Coverage</span>
        </div>
        <Link
          href="/articles"
          className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors font-medium"
        >
          <span>All Intelligence</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-[var(--text)] tracking-tight">
            Research Reports &amp; Engineering Analyses
          </h3>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 leading-relaxed">
            Independent technical reporting, architectural audits, and benchmark breakdowns for <strong>{model.name}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => {
            const dateStr = new Date(article.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              timeZone: "UTC",
            });
            const readingTime = Math.max(3, Math.round((article.content || "").split(/\s+/).length / 200));

            return (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="p-5 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] transition-all flex flex-col justify-between group shadow-sm hover:shadow-md space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] text-[var(--muted)] font-mono">
                    <span className="font-bold text-[var(--accent)] uppercase">{article.source_name || "Intelligence"}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={10} /> {dateStr}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock size={10} /> {readingTime} min</span>
                  </div>

                  <h4 className="font-bold text-sm sm:text-base text-[var(--text)] group-hover:text-[var(--accent)] transition-colors line-clamp-2">
                    {article.title}
                  </h4>

                  {article.summary && (
                    <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-[var(--accent)] group-hover:underline">
                  <span>Read Full Analysis</span>
                  <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

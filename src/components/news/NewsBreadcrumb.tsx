import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getCategoryLabel } from "@/lib/news";
import type { NewsCategoryType } from "../../../data/schema/news.schema";

interface NewsBreadcrumbProps {
  category?: {
    slug: NewsCategoryType;
  };
  article?: {
    title: string;
  };
}

function decodeEntities(str: string): string {
  if (!str) return "";
  return str
    .replace(/&#8217;/g, "’")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8230;/g, "…")
    .replace(/&#160;/g, " ")
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

export default function NewsBreadcrumb({ category, article }: NewsBreadcrumbProps) {
  const title = article ? decodeEntities(article.title) : "";

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-[#8C9E91] mb-8 sm:mb-12">
      <Link href="/" className="hover:text-[var(--accent)] transition-colors">
        Home
      </Link>
      <ChevronRight size={12} className="text-[#5A6E60] shrink-0" />
      
      {category || article ? (
        <Link href="/news" className="hover:text-[var(--accent)] transition-colors">
          News
        </Link>
      ) : (
        <span className="text-[#E2E8E4] font-medium">News</span>
      )}

      {category && (
        <>
          <ChevronRight size={12} className="text-[#5A6E60] shrink-0" />
          {article ? (
            <Link
              href={`/news/category/${category.slug}`}
              className="hover:text-[var(--accent)] transition-colors"
            >
              {getCategoryLabel(category.slug)}
            </Link>
          ) : (
            <span className="text-[#E2E8E4] font-medium">{getCategoryLabel(category.slug)}</span>
          )}
        </>
      )}

      {article && (
        <>
          <ChevronRight size={12} className="text-[#5A6E60] shrink-0" />
          <span className="text-[#E2E8E4] truncate max-w-[200px] sm:max-w-md font-medium" title={title}>
            {title}
          </span>
        </>
      )}
    </nav>
  );
}

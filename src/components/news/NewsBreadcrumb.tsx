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

export default function NewsBreadcrumb({ category, article }: NewsBreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-black/40 mb-8 sm:mb-12">
      <Link href="/" className="hover:text-black transition-colors">
        Home
      </Link>
      <ChevronRight size={12} className="opacity-45 shrink-0" />
      
      {category || article ? (
        <Link href="/news" className="hover:text-black transition-colors">
          News
        </Link>
      ) : (
        <span className="text-black font-medium">News</span>
      )}

      {category && (
        <>
          <ChevronRight size={12} className="opacity-45 shrink-0" />
          {article ? (
            <Link
              href={`/news/category/${category.slug}`}
              className="hover:text-black transition-colors"
            >
              {getCategoryLabel(category.slug)}
            </Link>
          ) : (
            <span className="text-black font-medium">{getCategoryLabel(category.slug)}</span>
          )}
        </>
      )}

      {article && (
        <>
          <ChevronRight size={12} className="opacity-45 shrink-0" />
          <span className="text-black truncate max-w-[150px] sm:max-w-xs font-medium" title={article.title}>
            {article.title}
          </span>
        </>
      )}
    </nav>
  );
}

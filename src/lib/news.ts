import { createClient } from "@supabase/supabase-js";
import type { NewsArticle, NewsCategoryType } from "../../data/schema/news.schema";

// Create a generic anonymous client for public data fetching.
// This avoids the 'cookies() cannot be used in generateStaticParams' error.
// We use a defensive pattern here so that if env vars are missing during Vercel's build phase
// (e.g., when doing a static build without connecting to the DB), it doesn't crash the build.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl) {
  console.warn("⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL is missing during build in news.ts.");
}

const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    global: {
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          next: {
            revalidate: 3600,
            tags: ['news']
          }
        });
      }
    }
  }
);

export type NewsArticleIndexEntry = Omit<NewsArticle, "body">;

// Helper to map DB snake_case columns to frontend camelCase expected by NewsArticle
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToArticle(row: any): any {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category as NewsCategoryType,
    publishDate: row.publish_date,
    updatedDate: row.updated_at,
    author: row.author,
    readTime: row.read_time,
    excerpt: row.excerpt || "",
    body: row.body || "",
    coverImage: row.cover_image || "",
    status: row.status,
    confidenceLevel: row.confidence_level,
    externalSources: row.external_sources || [],
    sources: row.sources || row.external_sources || [],
    relatedModels: row.related_models || [],
    tags: row.tags || [],
    qualityStatus: row.quality_status,
    qualityScore: row.quality_score,
    qualityReasons: row.quality_reasons || [],
    qualityCheckedAt: row.quality_checked_at,
  };
}

export async function getAllArticles(): Promise<NewsArticleIndexEntry[]> {
  const { data, error } = await supabase
    .from("news_items")
    .select("id, slug, title, category, publish_date, updated_at, author, read_time, excerpt, cover_image, status, confidence_level, external_sources, sources, related_models, tags, quality_status, quality_score, quality_reasons, quality_checked_at")
    .eq("status", "published")
    .order("publish_date", { ascending: false });

  if (error || !data) {
    console.error("Error fetching articles from Supabase:", error);
    return [];
  }

  // Calculate issue numbers for weekly news
  let weeklyCount = 0;
  const mapped = data.map(row => {
    const article = mapDbRowToArticle(row);
    // Rough approximation: oldest to newest issue numbers
    if (article.category === "weekly-news") {
      weeklyCount++;
      article.issueNumber = weeklyCount; 
    }
    return article;
  });

  return mapped;
}

export async function getArticleBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase
    .from("news_items")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return null;
  }

  return mapDbRowToArticle(data);
}

export async function getArticlesByCategory(category: NewsCategoryType): Promise<NewsArticleIndexEntry[]> {
  const all = await getAllArticles();
  return all.filter((a) => a.category === category);
}

export function getCategoryLabel(category: NewsCategoryType): string {
  switch (category) {
    case "weekly-news":
      return "Weekly News";
    case "short-news":
      return "Short News";
    case "model-review":
      return "Model Review";
    case "other":
      return "Other";
    default:
      return category;
  }
}

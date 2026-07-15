import newsIndex from "./news-index.json";
import newsArchive from "./news-archive.json";
import type { NewsArticle, NewsCategoryType } from "../../data/schema/news.schema";

export type NewsArticleIndexEntry = Omit<NewsArticle, "body">;

function loadDevNewsIndex(): NewsArticleIndexEntry[] {
  if (typeof window !== "undefined") return newsIndex as unknown as NewsArticleIndexEntry[];

  const fs = require("fs");
  const path = require("path");
  const { z } = require("zod");

  const newsDir = path.join(process.cwd(), "data", "news");
  const files = fs.readdirSync(newsDir).filter((f: string) => f.endsWith(".json") && f !== "_index.json");

  const rawEntries: any[] = [];
  const NewsCategory = z.enum(["weekly-news", "short-news", "model-review", "other"]);
  const NewsPostSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    category: NewsCategory,
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    author: z.string(),
    readTime: z.string(),
    excerpt: z.string(),
    body: z.string(),
    coverImage: z.string(),
    issueNumber: z.number().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    confidenceLevel: z.enum(["confirmed", "reported", "rumor", "community-discussion"]).default("confirmed"),
    externalSources: z.array(z.string()).optional(),
    relatedModels: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  });

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(newsDir, file), "utf-8"));
    const result = NewsPostSchema.safeParse(raw);
    if (!result.success) continue;
    
    rawEntries.push(result.data);
  }

  // Filter out draft entries - only compile published articles
  const publishedEntries = rawEntries.filter(e => e.status === "published");

  // Auto-increment issueNumber for weekly-news category (chronological oldest to newest)
  const weeklyNews = publishedEntries.filter(e => e.category === 'weekly-news');
  weeklyNews.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
  weeklyNews.forEach((entry, idx) => {
    entry.issueNumber = entry.issueNumber ?? (idx + 1);
  });

  const entries: any[] = [];
  for (const validated of publishedEntries) {
    const { body, ...lightweight } = validated;
    entries.push(lightweight);
  }

  entries.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());

  try {
    fs.writeFileSync(path.join(process.cwd(), "src", "lib", "news-index.json"), JSON.stringify(entries, null, 2));
    fs.writeFileSync(path.join(newsDir, "_index.json"), JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error("[DEV] Failed to compile news-index.json:", err);
  }

  return entries as NewsArticleIndexEntry[];
}

function loadDevArticleBySlug(slug: string): NewsArticle | null {
  if (typeof window !== "undefined") {
    const found = newsArchive.find((a: any) => a.slug === slug);
    return found ? (found as unknown as NewsArticle) : null;
  }

  const fs = require("fs");
  const path = require("path");
  const { z } = require("zod");

  const newsDir = path.join(process.cwd(), "data", "news");
  const files = fs.readdirSync(newsDir).filter((f: string) => f.endsWith(".json") && f !== "_index.json");

  const NewsCategory = z.enum(["weekly-news", "short-news", "model-review", "other"]);
  const NewsPostSchema = z.object({
    id: z.string(),
    slug: z.string(),
    title: z.string(),
    category: NewsCategory,
    publishDate: z.string(),
    updatedDate: z.string().optional(),
    author: z.string(),
    readTime: z.string(),
    excerpt: z.string(),
    body: z.string(),
    coverImage: z.string(),
    issueNumber: z.number().optional(),
    status: z.enum(["draft", "published"]).default("draft"),
    confidenceLevel: z.enum(["confirmed", "reported", "rumor", "community-discussion"]).default("confirmed"),
    externalSources: z.array(z.string()).optional(),
    relatedModels: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional()
  });

  const rawEntries: any[] = [];
  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(newsDir, file), "utf-8"));
    const result = NewsPostSchema.safeParse(raw);
    if (result.success) {
      rawEntries.push(result.data);
    }
  }

  // Filter out draft entries - only compile published articles
  const publishedEntries = rawEntries.filter(e => e.status === "published");

  // Auto-increment issueNumber for weekly-news category (chronological oldest to newest)
  const weeklyNews = publishedEntries.filter(e => e.category === 'weekly-news');
  weeklyNews.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime());
  weeklyNews.forEach((entry, idx) => {
    entry.issueNumber = entry.issueNumber ?? (idx + 1);
  });

  const found = publishedEntries.find(e => e.slug === slug);
  return found ? (found as NewsArticle) : null;
}

export function getAllArticles(): NewsArticleIndexEntry[] {
  if (process.env.NODE_ENV !== "production") {
    return loadDevNewsIndex();
  }
  return newsIndex as unknown as NewsArticleIndexEntry[];
}

export function getArticleBySlug(slug: string): NewsArticle | null {
  if (process.env.NODE_ENV !== "production") {
    return loadDevArticleBySlug(slug);
  }
  const found = newsArchive.find((a: any) => a.slug === slug);
  return found ? (found as unknown as NewsArticle) : null;
}

export function getArticlesByCategory(category: NewsCategoryType): NewsArticleIndexEntry[] {
  const all = getAllArticles();
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

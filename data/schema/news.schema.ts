import { z } from "zod";

export const NewsCategory = z.enum(["weekly-news", "short-news", "model-review", "other"]);

export const NewsArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  category: NewsCategory,
  publishDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"), // ISO Date format
  updatedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD").optional(),
  author: z.string(),
  readTime: z.string(),
  excerpt: z.string(), // used for card preview + meta description fallback
  body: z.string(), // markdown content
  coverImage: z.string(),
  issueNumber: z.number().optional(), // only set for category === "weekly-news"
  status: z.enum(["draft", "published"]).default("draft"),
  confidenceLevel: z.enum(["confirmed", "reported", "rumor", "community-discussion"]).default("confirmed"),
  externalSources: z.array(z.string()).optional(),
  // `externalSources` is the legacy display field. `sources` is the quality
  // gate's canonical array and supports either URLs or a URL-bearing record.
  sources: z.array(z.union([z.string().url(), z.object({ url: z.string().url(), title: z.string().optional() })])).optional(),
  relatedModels: z.array(z.string()).optional(), // model slugs for internal linking
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(), // override <title>
  seoDescription: z.string().optional(), // override meta description
  isFeatured: z.boolean().optional().default(false), // pin to Hero section
  isTrending: z.boolean().optional().default(false), // pin to Trending section
  qualityStatus: z.enum(["indexed", "unlisted"]).optional(),
  qualityScore: z.number().min(0).max(100).optional(),
  qualityReasons: z.array(z.string()).optional(),
  qualityCheckedAt: z.string().datetime().optional(),
});

export type NewsArticle = z.infer<typeof NewsArticleSchema>;
export type NewsCategoryType = z.infer<typeof NewsCategory>;

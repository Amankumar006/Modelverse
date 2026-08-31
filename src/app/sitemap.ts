import type { MetadataRoute } from "next";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ models }, { articles }] = await Promise.all([
    getModels({ limit: 1000, isActive: true }),
    getArticles({ limit: 1000, isPublished: true }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/models`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/trending`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/timeline`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/methodology`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/submit`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/security`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  const modelRoutes: MetadataRoute.Sitemap = models.map((m) => ({
    url: `${baseUrl}/models/${m.slug}`,
    lastModified: new Date(m.updated_at || m.created_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(a.updated_at || a.published_at),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...modelRoutes, ...articleRoutes];
}

import type { MetadataRoute } from "next";
import { getModels } from "@/lib/supabase/models";
import { getArticles } from "@/lib/supabase/articles";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";
const SITE_LAUNCH_DATE = new Date("2025-01-01T00:00:00.000Z");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [{ models }, { articles }] = await Promise.all([
    getModels({ limit: 1000, isActive: true }),
    getArticles({ limit: 1000, isPublished: true }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/models`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/articles`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/trending`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/timeline`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/compare`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/methodology`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/about`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/submit`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/privacy`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/terms`, lastModified: SITE_LAUNCH_DATE },
    { url: `${baseUrl}/security`, lastModified: SITE_LAUNCH_DATE },
  ];

  const modelRoutes: MetadataRoute.Sitemap = models.map((m) => ({
    url: `${baseUrl}/models/${m.slug}`,
    lastModified: new Date(m.updated_at || m.created_at || SITE_LAUNCH_DATE),
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${baseUrl}/articles/${a.slug}`,
    lastModified: new Date(a.updated_at || a.published_at || SITE_LAUNCH_DATE),
  }));

  return [...staticRoutes, ...modelRoutes, ...articleRoutes];
}

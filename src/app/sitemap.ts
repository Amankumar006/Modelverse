import type { MetadataRoute } from "next";
import { getAllModels, getModelBySlug, SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const models = getAllModels();

  // Define static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/models`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  // Dynamic model pages
  const modelRoutes: MetadataRoute.Sitemap = models.map((indexItem) => {
    // Attempt to load full model entry for updatedAt, fallback to releaseDate
    const fullModel = getModelBySlug(indexItem.slug);
    const lastModDate = fullModel?.updatedAt || indexItem.releaseDate;

    return {
      url: `${SITE_URL}/models/${indexItem.slug}`,
      lastModified: new Date(lastModDate),
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  return [...staticRoutes, ...modelRoutes];
}

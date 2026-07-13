import type { MetadataRoute } from "next";
import { getAllModels, getAllModelEntries, SITE_URL } from "@/lib/models";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = getAllModelEntries();

  // Define static base routes
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

  // Dynamic model detail pages
  const modelRoutes: MetadataRoute.Sitemap = entries.map((entry) => {
    const lastModDate = entry.updatedAt || entry.releaseDate;
    return {
      url: `${SITE_URL}/models/${entry.slug}`,
      lastModified: new Date(lastModDate),
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Collect unique single-facet values
  const tasks = [...new Set(entries.map((e) => e.primaryTask))].filter(Boolean);
  const developers = [...new Set(entries.map((e) => e.developer))].filter(Boolean);
  const types = [...new Set(entries.map((e) => e.type))].filter(Boolean);
  const modalities = [...new Set(entries.flatMap((e) => e.modality))].filter(Boolean);
  const licenses = [...new Set(entries.map((e) => e.license))].filter(Boolean);
  const deployments = [...new Set(entries.flatMap((e) => e.deployment))].filter(Boolean);

  // Generate single-facet anchor URLs
  const facetRoutes: MetadataRoute.Sitemap = [];

  const addFacetUrls = (key: string, values: string[]) => {
    for (const val of values) {
      facetRoutes.push({
        url: `${SITE_URL}/models?${key}=${encodeURIComponent(val)}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.7,
      });
    }
  };

  addFacetUrls("task", tasks);
  addFacetUrls("developer", developers);
  addFacetUrls("type", types);
  addFacetUrls("modality", modalities);
  addFacetUrls("license", licenses);
  addFacetUrls("deployment", deployments);

  return [...staticRoutes, ...modelRoutes, ...facetRoutes];
}

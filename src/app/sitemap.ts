import type { MetadataRoute } from "next";
import { getAllModels, SITE_URL } from "@/lib/models";
import { getAllArticles } from "@/lib/news";
import { NewsCategory } from "../../data/schema/news.schema";

export const revalidate = 3600; // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getAllModels();

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
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/models/benchmarks`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${SITE_URL}/compare`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/timeline`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/archive`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/methodology`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/security`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  // Dynamic model detail pages
  // Only models that meet the strict verified provenance gate are included in sitemap.
  const indexedEntries = entries.filter(
    (entry) =>
      entry.qualityStatus === "indexed" &&
      entry.status !== "sunset" &&
      !entry.metadata?.redirect_to &&
      !entry.metadata?.redirectTo
  );
  const modelRoutes: MetadataRoute.Sitemap = indexedEntries.map((entry) => {
    const lastModDate = entry.releaseDate ? new Date(entry.releaseDate) : new Date();
    return {
      url: `${SITE_URL}/models/${entry.slug}`,
      lastModified: lastModDate,
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Dynamic family pages
  const families = [...new Set(indexedEntries.map((e) => e.family))].filter(Boolean) as string[];
  const familyRoutes: MetadataRoute.Sitemap = families.map((familySlug) => {
    return {
      url: `${SITE_URL}/models/family/${familySlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.65,
    };
  });

  // Dynamic developer pages
  const developers = [...new Set(indexedEntries.map((e) => e.developer))].filter(Boolean);
  const developerRoutes: MetadataRoute.Sitemap = developers.map((developer) => {
    return {
      url: `${SITE_URL}/models/developer/${encodeURIComponent(developer)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  // Collect unique single-facet values
  const tasks = [...new Set(indexedEntries.map((e) => e.primaryTask))].filter((v): v is string => Boolean(v));
  const types = [...new Set(indexedEntries.map((e) => String(e.type)))].filter((v): v is string => Boolean(v));
  const modalities = [...new Set(indexedEntries.flatMap((e) => e.modality || []))].filter((v): v is string => Boolean(v));
  const licenses = [...new Set(indexedEntries.map((e) => e.license && typeof e.license === "object" ? (e.license as { name?: string }).name || "Custom" : e.license))].filter((v): v is string => Boolean(v));
  const deployments = [...new Set(indexedEntries.flatMap((e) => e.deployment || []))].filter((v): v is string => Boolean(v));

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

  // Dynamic news categories
  const newsCategoryRoutes: MetadataRoute.Sitemap = NewsCategory.options.map((cat) => ({
    url: `${SITE_URL}/news/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Dynamic news articles
  const allArticles = await getAllArticles();
  const newsArticleRoutes: MetadataRoute.Sitemap = allArticles.filter((article) => !article.qualityStatus || article.qualityStatus === "indexed").map((article) => {
    const lastModDate = article.updatedDate || article.publishDate;
    return {
      url: `${SITE_URL}/news/${article.slug}`,
      lastModified: new Date(lastModDate),
      changeFrequency: "weekly",
      priority: 0.75,
    };
  });

  return [
    ...staticRoutes,
    ...modelRoutes,
    ...familyRoutes,
    ...developerRoutes,
    ...facetRoutes,
    ...newsCategoryRoutes,
    ...newsArticleRoutes,
  ];
}

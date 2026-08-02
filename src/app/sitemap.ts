import type { MetadataRoute } from "next";
import { getAllModels, getAllModelEntries } from "@/lib/models";
import { getAllArticles } from "@/lib/news";
import { NewsCategory } from "../../data/schema/news.schema";

export const dynamic = "force-static";

const BASE_URL = "https://www.themodelverse.in";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = getAllModelEntries();

  // Define static base routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/models`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/timeline`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/archive`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/trending`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/methodology`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Dynamic model detail pages
  const modelRoutes: MetadataRoute.Sitemap = entries.map((entry) => {
    const lastModDate = entry.updatedAt || entry.releaseDate;
    return {
      url: `${BASE_URL}/models/${entry.slug}`,
      lastModified: new Date(lastModDate),
      changeFrequency: "weekly",
      priority: 0.6,
    };
  });

  // Dynamic family pages
  const families = [...new Set(entries.map((e) => e.family))].filter(Boolean) as string[];
  const familyRoutes: MetadataRoute.Sitemap = families.map((familySlug) => {
    return {
      url: `${BASE_URL}/models/family/${familySlug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.65,
    };
  });

  // Dynamic developer pages
  const developers = [...new Set(entries.map((e) => e.developer))].filter(Boolean);
  const developerRoutes: MetadataRoute.Sitemap = developers.map((developer) => {
    return {
      url: `${BASE_URL}/models/developer/${encodeURIComponent(developer)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    };
  });

  // Collect unique single-facet values
  const tasks = [...new Set(entries.map((e) => e.primaryTask))].filter(Boolean);
  const types = [...new Set(entries.map((e) => e.type))].filter(Boolean);
  const modalities = [...new Set(entries.flatMap((e) => e.modality))].filter(Boolean);
  const licenses = [...new Set(entries.map((e) => typeof e.license === "object" ? e.license.name || "Custom" : e.license))].filter(Boolean);
  const deployments = [...new Set(entries.flatMap((e) => e.deployment))].filter(Boolean);

  // Generate single-facet anchor URLs
  const facetRoutes: MetadataRoute.Sitemap = [];

  const addFacetUrls = (key: string, values: string[]) => {
    for (const val of values) {
      facetRoutes.push({
        url: `${BASE_URL}/models?${key}=${encodeURIComponent(val)}`,
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
    url: `${BASE_URL}/news/category/${cat}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.7,
  }));

  // Dynamic news articles
  const articles = getAllArticles();
  const newsArticleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    const lastModDate = article.updatedDate || article.publishDate;
    return {
      url: `${BASE_URL}/news/${article.slug}`,
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

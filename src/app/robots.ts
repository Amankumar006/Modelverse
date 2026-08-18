import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/models";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/*",
          "/login",
          "/auth",
          "/auth/*",
          "/api/*",
          "/_next/*",
        ],
      },
      {
        userAgent: [
          "Mediapartners-Google",
          "AdsBot-Google",
          "Google-AdSense-Keywords",
        ],
        allow: "/",
      },
      {
        userAgent: [
          "GPTBot",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bytespider",
        ],
        allow: [
          "/",
          "/models",
          "/models/*",
          "/news",
          "/news/*",
          "/compare",
          "/timeline",
          "/archive",
          "/feed.xml",
          "/news/feed.xml",
          "/llms.txt",
          "/llms-full.txt",
        ],
        disallow: [
          "/admin*",
          "/login",
          "/auth*",
          "/api*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

import React from "react";
import type { ModelRow } from "@/types/database";
import type { ArticleRow } from "@/types/database";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.themodelverse.in";

export function WebSiteJsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "Modelverse",
        description: "The Open Foundation Model Catalog, Technical Architecture Specifications, and Benchmark Ledger.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/models?search={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Modelverse",
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logos/social-avatar-1024.png`,
          width: 1024,
          height: 1024,
        },
        sameAs: [
          "https://github.com/Amankumar006/Modelverse",
          "https://x.com/themodelverse",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ModelJsonLd({ model }: { model: ModelRow }) {
  const modelUrl = `${SITE_URL}/models/${model.slug}`;
  const links = (typeof model.links === "object" && model.links !== null ? model.links : {}) as Record<string, string>;
  const pricing = (typeof model.pricing === "object" && model.pricing !== null ? model.pricing : {}) as Record<string, number | string>;

  const inputPrice = pricing.input_per_1m !== undefined ? pricing.input_per_1m : "0";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: model.name,
    operatingSystem: "Cloud API, Linux, macOS, Windows",
    applicationCategory: "AI/Machine Learning Model",
    description: model.description || `Technical specifications, context window, and benchmarks for ${model.name} by ${model.provider}.`,
    url: modelUrl,
    author: {
      "@type": "Organization",
      name: model.provider,
    },
    publisher: {
      "@type": "Organization",
      name: "Modelverse",
      url: SITE_URL,
    },
    datePublished: model.release_date || model.created_at,
    offers: {
      "@type": "Offer",
      price: String(inputPrice),
      priceCurrency: "USD",
      description: pricing.input_per_1m !== undefined ? `$${pricing.input_per_1m} per 1M input tokens` : "Open Weights / Free Tier",
    },
    featureList: [
      model.category ? `Category: ${model.category}` : "LLM",
      model.context_window ? `Context Window: ${model.context_window.toLocaleString()} tokens` : null,
      model.parameters ? `Parameters: ${model.parameters}` : null,
      model.source_type ? `License: ${model.source_type}` : null,
    ].filter(Boolean),
    downloadUrl: links.huggingface || links.ollama || undefined,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ArticleJsonLd({ article }: { article: ArticleRow }) {
  const articleUrl = `${SITE_URL}/articles/${article.slug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: article.title,
    description: article.summary || article.title,
    url: articleUrl,
    image: article.cover_image || `${SITE_URL}/articles/${article.slug}/opengraph-image`,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      "@type": "Organization",
      name: article.source_name || "Modelverse Intelligence",
    },
    publisher: {
      "@type": "Organization",
      name: "Modelverse",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logos/social-avatar-1024.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

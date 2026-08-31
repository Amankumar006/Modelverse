import React from "react";
import type { ModelRow } from "@/types/database";
import type { ArticleRow } from "@/types/database";
import { normalizeBenchmarks } from "@/lib/benchmarks";

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

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function ItemListJsonLd({
  name,
  description,
  items,
}: {
  name: string;
  description: string;
  items: { name: string; url: string; position: number }[];
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    itemListElement: items.map((item) => ({
      "@type": "ListItem",
      position: item.position,
      name: item.name,
      url: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
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
  const benchmarks = normalizeBenchmarks(model.benchmarks);

  const inputPrice = pricing.input_per_1m !== undefined ? pricing.input_per_1m : "0";

  const appSchema = {
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

  // Build FAQ items for Google Rich Snippets
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));
  const contextNum = model.context_window || 8192;
  const isMoE = Boolean(model.active_parameters);

  // Build FAQ items for Google Rich Snippets matching visible DOM
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is ${model.name}'s context window capacity?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${model.name} provides a certified context window of ${contextNum.toLocaleString()} tokens.`,
        },
      },
      {
        "@type": "Question",
        name: `Who developed ${model.name} and what is its neural architecture?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${model.name} was created by ${model.provider}. It features a ${
            isMoE ? `Sparse Mixture-of-Experts (${model.active_parameters} active parameters per token)` : "Dense Transformer"
          } architecture with a total parameter capacity of ${model.parameters || "proprietary scale"}.`,
        },
      },
      {
        "@type": "Question",
        name: `Can ${model.name} be run locally on private hardware?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: isOpenWeights
            ? `Yes. ${model.name} is an open-weights model compatible with local inference frameworks such as vLLM, Ollama, SGLang, and Llama.cpp.`
            : `No. ${model.name} is a proprietary cloud-hosted model accessible via official vendor REST API endpoints.`,
        },
      },
      {
        "@type": "Question",
        name: `How much does ${model.name} cost per million tokens?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: pricing.input_per_1m !== undefined
            ? `Standard API rates for ${model.name} are $${pricing.input_per_1m} per 1M input tokens and $${pricing.output_per_1m ?? "—"} per 1M output tokens.`
            : `${model.name} is available under open distribution licenses for free direct checkpoint download.`,
        },
      },
      benchmarks.length > 0
        ? {
            "@type": "Question",
            name: `What are ${model.name}'s verified benchmark scores?`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `In standardized evaluations, ${model.name} achieved: ${benchmarks
                .slice(0, 4)
                .map((b) => `${b.name}: ${b.score}${typeof b.score === "number" ? "%" : ""}`)
                .join(", ")}.`,
            },
          }
        : null,
    ].filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
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

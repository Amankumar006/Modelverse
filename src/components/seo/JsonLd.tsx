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

  const parameters = model.parameters || "Unknown";
  const contextNum = model.context_window || 8192;
  const isMoE = Boolean(model.active_parameters);
  const isOpenWeights = Boolean(model.source_type && model.source_type.toLowerCase().includes("open"));

  let vramEstimate = "Cloud API — Zero Local VRAM";
  if (isOpenWeights) {
    if (parameters.includes("8B") || parameters.includes("7B")) vramEstimate = "8-12 GB VRAM (FP16/INT4)";
    else if (parameters.includes("70B") || parameters.includes("72B")) vramEstimate = "40-80 GB VRAM (FP16/INT4)";
    else if (parameters.includes("400B") || parameters.includes("314B") || parameters.includes("671B")) vramEstimate = "320-640 GB VRAM (Multi-GPU SXM5)";
    else vramEstimate = "Hardware dependent on quantization";
  }

  const appSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: model.name,
    operatingSystem: isOpenWeights ? "Linux, macOS, Windows (Local / Cloud)" : "Cloud API",
    applicationCategory: "AI/Machine Learning Model",
    applicationSubCategory: "Foundation Model",
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
    processorRequirements: vramEstimate,
    memoryRequirements: `${contextNum.toLocaleString()} tokens certified context capacity`,
    offers: {
      "@type": "Offer",
      price: String(inputPrice),
      priceCurrency: "USD",
      description: pricing.input_per_1m !== undefined ? `$${pricing.input_per_1m} per 1M input tokens` : "Open Weights / Free Tier",
    },
    additionalProperty: [
      { "@type": "PropertyValue", name: "Parameters", value: model.parameters || "Proprietary" },
      { "@type": "PropertyValue", name: "Context Window", value: `${contextNum.toLocaleString()} tokens` },
      { "@type": "PropertyValue", name: "Architecture", value: isMoE ? `Sparse MoE (${model.active_parameters} active)` : "Dense Transformer" },
      { "@type": "PropertyValue", name: "License", value: model.source_type || "Proprietary" },
    ],
    featureList: [
      model.category ? `Category: ${model.category}` : "LLM",
      model.context_window ? `Context Window: ${model.context_window.toLocaleString()} tokens` : null,
      model.parameters ? `Parameters: ${model.parameters}` : null,
      model.source_type ? `License: ${model.source_type}` : null,
    ].filter(Boolean),
    downloadUrl: links.huggingface || links.ollama || undefined,
  };

  // Build FAQ items for Google Rich Snippets matching visible DOM
  const isCommercial = !model.source_type?.toLowerCase().includes("non-commercial");
  const isReasoning = model.category?.toLowerCase().includes("reasoning") || model.name.toLowerCase().includes("o1") || model.name.toLowerCase().includes("r1");

  const reasoningBenchmarks = benchmarks.filter(b => ["MMLU-Pro", "MATH-500", "GPQA Diamond"].includes(b.name));
  const codingBenchmarks = benchmarks.filter(b => ["SWE-bench Verified", "HumanEval", "LiveCodeBench"].includes(b.name));
  const chatBenchmarks = benchmarks.filter(b => ["LMSYS Arena Elo", "Arena-Hard-Auto", "MT-Bench"].includes(b.name));
  const formatBenchmarks = (arr: { name: string; score: string | number }[]) => arr.map(b => `${b.name}: ${b.score}${typeof b.score === "number" ? "%" : ""}`).join(", ");

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What are the VRAM requirements to run ${model.name} locally?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: isOpenWeights 
            ? `To run ${model.name} (${parameters}) locally, you generally need ${vramEstimate}. We recommend using quantized GGUF/AWQ formats with Ollama or vLLM to optimize memory footprint.`
            : `${model.name} is a proprietary API model and cannot be run locally. It requires no local VRAM.`
        },
      },
      {
        "@type": "Question",
        name: `Does ${model.name} support commercial use?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: isCommercial 
            ? `Yes, ${model.name} is available for commercial use. Please review the official ${model.provider} license terms for any specific restrictions on acceptable use.`
            : `No, ${model.name} is released under a non-commercial or research-only license. You cannot use it for commercial applications without explicit permission from ${model.provider}.`
        },
      },
      {
        "@type": "Question",
        name: `Is fine-tuning supported for ${model.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: isOpenWeights
            ? `Yes, as an open-weights model, ${model.name} can be fine-tuned using LoRA/QLoRA on local hardware or via cloud platforms like Modal, RunPod, or Together AI.`
            : `Fine-tuning availability depends on ${model.provider}'s API offerings. Many providers offer managed fine-tuning through their developer consoles.`
        },
      },
      {
        "@type": "Question",
        name: `Does ${model.name} support prompt caching?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Prompt caching is increasingly standard across frontier models. If using the official API, check ${model.provider}'s documentation for prefix caching support, which can reduce costs and latency for repetitive system prompts.`
        },
      },
      ...(isReasoning ? [{
        "@type": "Question",
        name: `How do I configure the reasoning budget for ${model.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For reasoning models like ${model.name}, you typically configure the reasoning budget via the 'max_completion_tokens' or specific thinking parameters in the API, allowing the model more time to generate chain-of-thought pathways before responding.`
        },
      }] : []),
      ...(reasoningBenchmarks.length > 0 ? [{
        "@type": "Question",
        name: `How does ${model.name} perform on advanced reasoning benchmarks?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `On advanced reasoning evaluations, ${model.name} scored: ${formatBenchmarks(reasoningBenchmarks)}.`
        },
      }] : []),
      ...(codingBenchmarks.length > 0 ? [{
        "@type": "Question",
        name: `What are ${model.name}'s coding capabilities?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `For agentic and coding tasks, ${model.name} achieved: ${formatBenchmarks(codingBenchmarks)}.`
        },
      }] : []),
      ...(chatBenchmarks.length > 0 ? [{
        "@type": "Question",
        name: `How does ${model.name} rank in instruction following and chat?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `On chat evaluations, ${model.name} scored: ${formatBenchmarks(chatBenchmarks)}.`
        },
      }] : []),
      {
        "@type": "Question",
        name: `What is ${model.name}'s context window capacity and architecture?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${model.name} was created by ${model.provider} with a ${
            isMoE ? `Sparse Mixture-of-Experts (${model.active_parameters} active per token)` : "Dense Transformer"
          } architecture and a certified context window of ${contextNum.toLocaleString()} tokens. ${
            contextNum >= 128000
              ? "This allows for extensive full-codebase repository indexing, multi-hour audio processing, and book-length document ingestion."
              : "This capacity is ideal for standard instruction-following, summarization, and interactive conversational turns."
          }`
        },
      },
      {
        "@type": "Question",
        name: `What are the API pricing and operational rates for ${model.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: pricing.input_per_1m !== undefined
            ? `Official API inference rates for ${model.name} are $${pricing.input_per_1m} per 1M input tokens and $${pricing.output_per_1m || pricing.input_per_1m} per 1M output tokens.`
            : `${model.name} is distributed as open weights. You can download and run it with zero API token costs on self-hosted infrastructure.`
        },
      },
    ],
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
    proficiencyLevel: "Expert",
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "article p"],
    },
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

export function ComparisonJsonLd({
  model1,
  model2,
  canonicalUrl,
}: {
  model1: ModelRow;
  model2: ModelRow;
  canonicalUrl: string;
}) {
  const p1 = (model1.pricing || {}) as Record<string, unknown>;
  const p2 = (model2.pricing || {}) as Record<string, unknown>;
  const in1 = typeof p1.input_per_1m === "number" ? `$${p1.input_per_1m}` : "Open / Free";
  const in2 = typeof p2.input_per_1m === "number" ? `$${p2.input_per_1m}` : "Open / Free";

  const open1 = Boolean(model1.source_type?.toLowerCase().includes("open"));
  const open2 = Boolean(model2.source_type?.toLowerCase().includes("open"));

  const fullUrl = canonicalUrl.startsWith("http") ? canonicalUrl : `${SITE_URL}${canonicalUrl}`;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the difference between ${model1.name} and ${model2.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${model1.name} (${model1.provider}) features ${model1.parameters || "proprietary parameters"} with a ${model1.context_window ? (model1.context_window / 1000).toFixed(0) + "k" : "standard"} context window, while ${model2.name} (${model2.provider}) features ${model2.parameters || "proprietary parameters"} with a ${model2.context_window ? (model2.context_window / 1000).toFixed(0) + "k" : "standard"} context window.`,
        },
      },
      {
        "@type": "Question",
        name: `Which is cheaper for production inference, ${model1.name} or ${model2.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${model1.name} input pricing is ${in1} per 1M tokens vs ${model2.name} at ${in2} per 1M tokens.`,
        },
      },
      {
        "@type": "Question",
        name: `Can I run ${model1.name} or ${model2.name} locally on private GPU hardware?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${model1.name} is ${open1 ? "an open-weights model and can be hosted locally using Ollama or vLLM" : "a closed cloud API and cannot be self-hosted"}. ${model2.name} is ${open2 ? "an open-weights model and can be hosted locally" : "a closed cloud API"}.`,
        },
      },
    ],
  };

  const comparisonWebPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${model1.name} vs ${model2.name} Comparison: Specs, Benchmarks & VRAM`,
    description: `Side-by-side technical comparison between ${model1.name} and ${model2.name} across parameters, benchmarks, quantization compression, and token pricing.`,
    url: fullUrl,
    publisher: {
      "@type": "Organization",
      name: "Modelverse",
      url: SITE_URL,
    },
    about: [
      {
        "@type": "SoftwareApplication",
        name: model1.name,
        author: { "@type": "Organization", name: model1.provider },
      },
      {
        "@type": "SoftwareApplication",
        name: model2.name,
        author: { "@type": "Organization", name: model2.provider },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonWebPage) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}


import fs from "fs/promises";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllModels,
  getAllModelEntries,
  getModelBySlug,
  SITE_URL,
} from "@/lib/models";
import JsonLd from "@/components/JsonLd";
import ModelDocsLayout from "@/components/models/ModelDocsLayout";

export const dynamic = "force-static";

// Enable static site generation at build time for all model entries
export async function generateStaticParams() {
  const models = await getAllModels();
  return models.map((m) => ({
    slug: m.slug,
  }));
}

// Generate metadata dynamically per model
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    return {
      title: "Model Not Found — Modelverse",
    };
  }

  let distinguishingFact = model.primaryTask;
  if (typeof model.parameters === "string" && model.parameters !== "Unknown") {
    distinguishingFact = `${model.parameters} Parameters`;
  }

  const title = `${model.name} by ${model.developer} — ${distinguishingFact}`;
  const description =
    model.description.length > 155
      ? `${model.description.slice(0, 152)}...`
      : model.description;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/models/${model.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/models/${model.slug}`,
      type: "article",
      siteName: "Modelverse Docs",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ModelDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const model = await getModelBySlug(slug);

  if (!model) {
    notFound();
  }

  // Fetch candidate markdown documentation readmes
  let markdownContent: string | null = null;
  const candidateNames = Array.from(
    new Set([
      `${slug}.md`,
      `${model.id}.md`,
      slug.includes("-") ? `${slug.split("-").slice(1).join("-")}.md` : null,
      slug.includes("-") ? `${slug.split("-").slice(2).join("-")}.md` : null,
    ].filter(Boolean))
  ) as string[];

  for (const cand of candidateNames) {
    try {
      const readmePath = path.join(process.cwd(), "data", "models", "readme", cand);
      markdownContent = await fs.readFile(readmePath, "utf-8");
      if (markdownContent && markdownContent.trim().length > 0) break;
    } catch {
      // try next candidate
    }
  }

  const allEntries = await getAllModelEntries();

  // Find other models in the same family
  const familyMembers = model.family
    ? allEntries.filter((e) => e.family === model.family && e.id !== model.id)
    : [];

  // Filter related models (sharing primary task and verified)
  const relatedModels = allEntries
    .filter((e) => e.primaryTask === model.primaryTask && e.id !== model.id && e.verified)
    .slice(0, 4);

  // Structured JSON-LD: Product (the model) + TechArticle (the page)
  const parametersText = typeof model.parameters === "string" ? model.parameters : "Unknown";
  const contextWindowText = typeof model.contextWindow === "string" ? model.contextWindow : "Unknown";
  const licenseText = typeof model.license === "string" ? model.license : model.license?.name || "Custom";

  const imageUrl = model.logo ? `${SITE_URL}${model.logo}` : `${SITE_URL}/icon.jpg`;

  // Build the SoftwareApplication entity
  const productEntity: Record<string, unknown> = {
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/models/${model.slug}#software`,
    name: model.name,
    description: model.description,
    image: imageUrl,
    applicationCategory: "WebApplication",
    publisher: { "@type": "Organization", name: model.developer },
    releaseDate: model.releaseDate,
    additionalProperty: [
      { "@type": "PropertyValue", name: "Parameters", value: parametersText },
      { "@type": "PropertyValue", name: "Context Window", value: contextWindowText },
      { "@type": "PropertyValue", name: "License", value: licenseText },
    ],
  };

  const commonOfferDetails = {
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
  };
  // Include offers: use real pricing data if available, otherwise fallback to 0
  if (model.pricing && model.pricing.length > 0) {
    productEntity.offers = model.pricing.map((p) => ({
      "@type": "Offer",
      price: String(p.amount),
      priceCurrency: p.currency,
      description: p.notes || `${p.unit}`,
      ...commonOfferDetails,
    }));
  } else {
    productEntity.offers = {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      ...commonOfferDetails,
    };
  }

  // Cross-link to base model if this is a variant
  if (model.baseModel) {
    productEntity.isVariantOf = {
      "@type": "SoftwareApplication",
      name: model.baseModel,
      url: `${SITE_URL}/models/${model.baseModel}`,
    };
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${SITE_URL}/models/${model.slug}#article`,
        headline: `${model.name} Overview`,
        description: model.description,
        datePublished: model.releaseDate,
        dateModified: model.updatedAt || model.releaseDate,
        publisher: { "@type": "Organization", name: "Modelverse" },
        about: { "@id": `${SITE_URL}/models/${model.slug}#software` },
      },
      productEntity,
    ],
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ModelDocsLayout
        model={model}
        markdownContent={markdownContent}
        allModels={allEntries}
        familyMembers={familyMembers}
        relatedModels={relatedModels}
      />
    </>
  );
}

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
  const models = getAllModels();
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
  const model = getModelBySlug(slug);

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

  const canonicalSlug = model.baseModel || model.slug;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/models/${canonicalSlug}`,
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
  const model = getModelBySlug(slug);

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

  const allEntries = getAllModelEntries();

  // Find other models in the same family
  const familyMembers = model.family
    ? allEntries.filter((e) => e.family === model.family && e.id !== model.id)
    : [];

  // Filter related models (sharing primary task and verified)
  const relatedModels = allEntries
    .filter((e) => e.primaryTask === model.primaryTask && e.id !== model.id && e.verified)
    .slice(0, 4);

  // Structured JSON-LD
  const parametersText = typeof model.parameters === "string" ? model.parameters : "Unknown";
  const contextWindowText = typeof model.contextWindow === "string" ? model.contextWindow : "Unknown";
  const licenseText = typeof model.license === "string" ? model.license : model.license?.name || "Custom";

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/models/${model.slug}#application`,
        name: model.name,
        applicationCategory: "AI Model",
        description: model.description,
        publisher: { "@type": "Organization", name: model.developer },
        datePublished: model.releaseDate,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD"
        },
        license: licenseText,
        additionalProperty: [
          {
            "@type": "PropertyValue",
            name: "Parameters",
            value: parametersText
          },
          {
            "@type": "PropertyValue",
            name: "Context Window",
            value: contextWindowText
          }
        ]
      },
    ],
  };

  return (
    <>
      <JsonLd data={softwareAppSchema} />
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

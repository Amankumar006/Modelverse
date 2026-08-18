import { Metadata } from "next";
import { getModelBySlug, getAllModels, SITE_URL } from "@/lib/models";
import Navbar from "@/components/layout/Navbar";
import CompareClient from "@/components/compare/CompareClient";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const modelsQuery = resolvedParams.models;
  
  let slugs: string[] = [];
  if (typeof modelsQuery === "string") {
    slugs = modelsQuery.split(",").map((s) => s.trim());
  } else if (Array.isArray(modelsQuery)) {
    slugs = modelsQuery.flatMap((s) => s.split(",").map((val) => val.trim()));
  }

  slugs = Array.from(new Set(slugs)).filter(Boolean).slice(0, 4);

  const selectedModels = (
    await Promise.all(slugs.map(async (slug) => await getModelBySlug(slug)))
  ).filter((model): model is NonNullable<typeof model> => model !== null);

  if (selectedModels.length > 0) {
    const names = selectedModels.map((m) => m.name).join(" vs ");
    const title = `Compare ${names} — Modelverse`;
    const description = `Compare ${names} side-by-side. Analyze parameters, context windows, benchmarks, and licensing to find the best model for your use case.`;
    const url = `${SITE_URL}/compare?models=${slugs.join(",")}`;

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      openGraph: {
        title,
        description,
        url,
        type: "website",
        siteName: "Modelverse",
        images: [`${SITE_URL}/api/og/compare?models=${slugs.join(",")}`],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [`${SITE_URL}/api/og/compare?models=${slugs.join(",")}`],
      },
    };
  }

  return {
    title: "Compare AI Models Side-by-Side — Modelverse",
    description:
      "Compare AI models side-by-side. Analyze parameters, context windows, benchmarks, and licensing to find the best model for your use case.",
    alternates: {
      canonical: `${SITE_URL}/compare`,
    },
    openGraph: {
      title: "Compare AI Models Side-by-Side — Modelverse",
      description: "Analyze parameters, context windows, benchmarks, and pricing across top AI foundation models.",
      url: `${SITE_URL}/compare`,
      type: "website",
      siteName: "Modelverse",
      images: [`${SITE_URL}/logos/social-avatar-1024.png`],
    },
    twitter: {
      card: "summary_large_image",
      title: "Compare AI Models Side-by-Side — Modelverse",
      description: "Analyze parameters, context windows, benchmarks, and pricing across top AI foundation models.",
      images: [`${SITE_URL}/logos/social-avatar-1024.png`],
    },
  };
}

export default async function ComparePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const modelsQuery = resolvedParams.models;

  let slugs: string[] = [];
  if (typeof modelsQuery === "string") {
    slugs = modelsQuery.split(",").map((s) => s.trim());
  } else if (Array.isArray(modelsQuery)) {
    slugs = modelsQuery.flatMap((s) => s.split(",").map((val) => val.trim()));
  }

  slugs = Array.from(new Set(slugs)).filter(Boolean).slice(0, 4);

  // Default to frontier flagship comparison if no query provided
  if (slugs.length === 0) {
    slugs = ["openai-gpt-4o", "anthropic-claude-3-5-sonnet"];
  }

  const [allAvailableModels, selectedModels] = await Promise.all([
    getAllModels(),
    Promise.all(slugs.map((slug) => getModelBySlug(slug))),
  ]);

  const initialModels = selectedModels.filter(
    (model): model is NonNullable<typeof model> => model !== null
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/compare#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Compare Models",
            item: `${SITE_URL}/compare`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col justify-between">
      <JsonLd data={jsonLd} />
      <div>
        <div className="sticky top-0 z-50 shrink-0 border-b border-[var(--muted)]/10 bg-[var(--bg)]">
          <Navbar />
        </div>
        <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <CompareClient
            initialModels={initialModels}
            allAvailableModels={allAvailableModels}
          />
        </main>
      </div>
    </div>
  );
}

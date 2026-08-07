import { Metadata } from "next";
import { getAllModelEntries, getModelBySlug, SITE_URL } from "@/lib/models";
import Navbar from "@/components/layout/Navbar";
import CompareClient from "@/components/models/CompareClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const modelsQuery = resolvedParams.models;
  
  let slugs: string[] = [];
  if (typeof modelsQuery === "string") {
    slugs = modelsQuery.split(",").map((s) => s.trim());
  } else if (Array.isArray(modelsQuery)) {
    slugs = modelsQuery.flatMap((s) => s.split(",").map(val => val.trim()));
  }

  slugs = Array.from(new Set(slugs)).filter(Boolean).slice(0, 4);

  const selectedModels = (await Promise.all(
    slugs.map(async (slug) => await getModelBySlug(slug))
  )).filter((model): model is NonNullable<typeof model> => model !== null);

  if (selectedModels.length > 0) {
    const names = selectedModels.map(m => m.name).join(" vs ");
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
    title: "Compare AI Models — Modelverse",
    description: "Compare AI models side-by-side. Analyze parameters, context windows, benchmarks, and licensing to find the best model for your use case.",
    alternates: {
      canonical: `${SITE_URL}/compare`,
    },
  };
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ComparePage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const modelsQuery = resolvedParams.models;
  
  let slugs: string[] = [];
  if (typeof modelsQuery === "string") {
    slugs = modelsQuery.split(",").map((s) => s.trim());
  } else if (Array.isArray(modelsQuery)) {
    // If someone passes ?models=a&models=b
    slugs = modelsQuery.flatMap((s) => s.split(",").map(val => val.trim()));
  }

  // Remove duplicates and limit to 4 to prevent UI overflow
  slugs = Array.from(new Set(slugs)).filter(Boolean).slice(0, 4);

  const selectedModels = (await Promise.all(
    slugs.map(async (slug) => await getModelBySlug(slug))
  )).filter((model): model is NonNullable<typeof model> => model !== null);

  const allModels = await getAllModelEntries();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] font-sans">
      <div className="sticky top-0 z-50 shrink-0 border-b border-[var(--muted)]/10 bg-[var(--bg)]">
        <Navbar />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 space-y-4 text-center sm:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            Compare Models
          </h1>
          <p className="text-[var(--muted)] max-w-2xl text-sm md:text-base leading-relaxed">
            Evaluate leading AI models side-by-side. Compare context windows, open-weights licensing, parameters, and verified benchmarks to choose the right model for your application.
          </p>
        </div>

        <CompareClient initialModels={selectedModels} allModels={allModels} />
      </main>
    </div>
  );
}

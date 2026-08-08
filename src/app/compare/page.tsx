import { Metadata } from "next";
import { getModelBySlug, SITE_URL } from "@/lib/models";
import Navbar from "@/components/layout/Navbar";

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

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans flex flex-col">
      <div className="sticky top-0 z-50 shrink-0 border-b border-[var(--muted)]/10 bg-[var(--bg)]">
        <Navbar />
      </div>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center">
        <div className="max-w-md text-center space-y-6 p-8 bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)]">
          <h1 className="text-3xl font-extrabold text-[var(--text)] tracking-tight">
            Under Maintenance
          </h1>
          <p className="text-[var(--muted)] leading-relaxed">
            The Compare feature is currently being redesigned for a better UX. It will be back soon!
          </p>
        </div>
      </main>
    </div>
  );
}

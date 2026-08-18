import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllModelEntries,
  getAllDevelopers,
  SITE_URL,
} from "@/lib/models";
import ModelCatalog from "@/components/models/ModelCatalog";
import Breadcrumb from "@/components/models/Breadcrumb";
import Navbar from "@/components/layout/Navbar";
import JsonLd from "@/components/JsonLd";

export const revalidate = 60;

export async function generateStaticParams() {
  const developers = await getAllDevelopers();
  return developers.map((developer) => ({
    developer,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ developer: string }>;
}): Promise<Metadata> {
  const { developer } = await params;
  const decodedDeveloper = decodeURIComponent(developer);
  const allModels = await getAllModelEntries();
  const models = allModels.filter((m) => m.developer === decodedDeveloper);
  
  if (models.length === 0) {
    return { title: "Developer Not Found — Modelverse" };
  }

  const title = `${decodedDeveloper} AI Models — Catalog & Specifications | Modelverse`;
  const description = `Explore all ${models.length} AI models developed by ${decodedDeveloper} with technical specs, benchmarks, context windows, and pricing.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/models/developer/${encodeURIComponent(decodedDeveloper)}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/models/developer/${encodeURIComponent(decodedDeveloper)}`,
      type: "website",
      siteName: "Modelverse",
      images: [
        {
          url: `${SITE_URL}/logos/social-avatar-1024.png`,
          width: 1024,
          height: 1024,
          alt: `${decodedDeveloper} Models`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${SITE_URL}/logos/social-avatar-1024.png`],
    },
  };
}

export default async function DeveloperPage({
  params,
}: {
  params: Promise<{ developer: string }>;
}) {
  const { developer } = await params;
  const decodedDeveloper = decodeURIComponent(developer);
  
  const allModels = await getAllModelEntries();
  const models = allModels.filter((m) => m.developer === decodedDeveloper);
  const developers = await getAllDevelopers();

  if (models.length === 0) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/models/developer/${encodeURIComponent(decodedDeveloper)}#breadcrumb`,
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
            name: "Models",
            item: `${SITE_URL}/models`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: decodedDeveloper,
            item: `${SITE_URL}/models/developer/${encodeURIComponent(decodedDeveloper)}`,
          },
        ],
      },
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/models/developer/${encodeURIComponent(decodedDeveloper)}#page`,
        name: `${decodedDeveloper} AI Models`,
        description: `A complete catalog of AI models developed by ${decodedDeveloper}.`,
        url: `${SITE_URL}/models/developer/${encodeURIComponent(decodedDeveloper)}`,
        publisher: { "@type": "Organization", name: "Modelverse", url: SITE_URL },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: models.map((m, idx) => ({
            "@type": "ListItem",
            position: idx + 1,
            name: m.name,
            url: `${SITE_URL}/models/${m.slug}`,
          })),
        },
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white pb-24 relative">
      <Navbar theme="dark" />
      <JsonLd data={jsonLd} />
      {/* ── Top Bar / Breadcrumb ─────────────────────────────── */}
      <header className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 pt-8 pb-4">
        <Breadcrumb developer={decodedDeveloper} />
      </header>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12 mt-6 relative">
        <div className="border-b border-[var(--muted)]/10 pb-8 mb-8">
          <h1
            className="text-4xl sm:text-5xl font-normal tracking-tight text-[var(--text)]"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            {decodedDeveloper} <span className="italic text-[var(--muted)]">Models</span>
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)] max-w-xl">
            A complete catalog of AI models developed by {decodedDeveloper}.
          </p>
        </div>

        {/* Catalog component (dense table + client filters) */}
        <ModelCatalog 
          models={models} 
          developers={developers} 
          hideDeveloperPrefix={true} 
        />
      </div>
    </main>
  );
}

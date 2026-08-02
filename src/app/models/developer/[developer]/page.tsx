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

export const dynamic = "force-static";

export async function generateStaticParams() {
  const developers = getAllDevelopers();
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
  const models = getAllModelEntries().filter((m) => m.developer === decodedDeveloper);
  
  if (models.length === 0) {
    return { title: "Developer Not Found — Modelverse" };
  }

  const title = `${decodedDeveloper} AI Models — Modelverse`;
  const description = `Explore all AI models developed by ${decodedDeveloper} in the Modelverse catalog.`;

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
  
  const models = getAllModelEntries().filter((m) => m.developer === decodedDeveloper);
  const developers = getAllDevelopers();

  if (models.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white pb-24 relative">
      <Navbar theme="dark" />
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

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllModels,
  getAllModelEntries,
  SITE_URL,
} from "@/lib/models";
import Breadcrumb from "@/components/models/Breadcrumb";
import ModelCard from "@/components/models/ModelCard";
import Navbar from "@/components/layout/Navbar";
import ClientBackButton from "@/components/ui/ClientBackButton";
import { ChevronLeft, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";

export const dynamic = "force-static";

export async function generateStaticParams() {
  const models = getAllModelEntries();
  const seen = new Set<string>();
  const families: string[] = [];
  for (const m of models) {
    if (!m.family) continue;
    const key = m.family.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seen.has(key)) {
      seen.add(key);
      families.push(m.family);
    }
  }
  return families.map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const models = getAllModelEntries().filter((m) => m.family === slug);
  
  if (models.length === 0) {
    return { title: "Family Not Found — Modelverse" };
  }

  const primaryModel = models.find((m) => m.primaryTask === "chat-reasoning") || models.sort((a, b) => b.boost - a.boost)[0];
  const developer = primaryModel.developer;
  
  const title = `${slug} Family by ${developer} — Modelverse`;
  const description = `Explore all variants in the ${slug} family by ${developer}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/models/family/${encodeURIComponent(slug)}`,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/models/family/${encodeURIComponent(slug)}`,
      type: "website",
      siteName: "Modelverse",
    },
  };
}

export default async function FamilyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const models = getAllModelEntries().filter((m) => m.family === slug);

  if (models.length === 0) {
    notFound();
  }

  const primaryModel = models.find((m) => m.primaryTask === "chat-reasoning") || models.sort((a, b) => b.boost - a.boost)[0];
  const developer = primaryModel.developer;

  return (
    <main className="min-h-screen bg-[#0C120F] text-white selection:bg-[#4ADE80] selection:text-white pb-24 relative">
      <Navbar theme="dark" />
      {/* ── Top Bar / Breadcrumb ─────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <Breadcrumb developer={developer} family={{ slug, label: slug }} />
      </header>

      {/* ── Content ────────────────────────────────────────── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <ClientBackButton
          fallbackHref={`/models/developer/${encodeURIComponent(developer)}`}
          fallbackLabel={developer}
        />

        <div className="mb-10 space-y-4">
          <div className="inline-flex items-center gap-2 text-[#4ADE80] bg-[#4ADE80]/10 px-3 py-1 rounded-full text-xs font-semibold mb-2">
            <Sparkles size={14} />
            Model Family
          </div>
          <h1
            className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            {slug}
          </h1>
          <p className="text-gray-400 text-lg">
            Developed by {developer}. Explore the {models.length} variants available in this generation.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {models.map((model) => {
            const allModels = getAllModelEntries();
            const nextVersionModel = allModels.find(m => m.previousVersion === model.slug);
            const prevVersionModel = model.previousVersion ? allModels.find(m => m.slug === model.previousVersion) : null;
            
            return (
              <div key={model.id} className="flex flex-col gap-2 bg-white/5 p-3 rounded-2xl border border-white/10">
                <ModelCard model={model} variant="row" />
                
                {/* Cross-Generation Nav */}
                {(nextVersionModel || prevVersionModel) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 py-1 text-xs text-gray-400 font-medium">
                    <span className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Lineage</span>
                    <div className="flex items-center gap-3">
                      {prevVersionModel && prevVersionModel.family && (
                         <Link href={`/models/family/${prevVersionModel.family}`} className="flex items-center gap-1 hover:text-white transition-colors">
                           <ArrowLeft size={12} />
                           {prevVersionModel.family} {prevVersionModel.tier ? `(${prevVersionModel.tier})` : ''}
                         </Link>
                      )}
                      {(prevVersionModel && nextVersionModel) && <span className="text-white/20">|</span>}
                      {nextVersionModel && nextVersionModel.family && (
                         <Link href={`/models/family/${nextVersionModel.family}`} className="flex items-center gap-1 hover:text-white transition-colors">
                           {nextVersionModel.family} {nextVersionModel.tier ? `(${nextVersionModel.tier})` : ''}
                           <ArrowRight size={12} />
                         </Link>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </article>
    </main>
  );
}

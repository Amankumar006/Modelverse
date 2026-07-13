import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllModels,
  getModelBySlug,
  SITE_URL,
  type ModelEntry,
} from "@/lib/models";
import JsonLd from "@/components/JsonLd";
import TypeBadge from "@/components/ui/TypeBadge";
import ModalityTag from "@/components/ui/ModalityTag";
import {
  ChevronRight,
  Globe,
  ExternalLink,
  Shield,
  Layers,
  Sparkles,
  Calendar,
  Layers2,
  FileText,
  ChevronLeft,
} from "lucide-react";

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

  const title = `${model.name} by ${model.developer} — Modelverse`;
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
      siteName: "Modelverse",
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

  // Fetch family members if this model belongs to a family
  const allModels = getAllModels();
  const familyMembers = model.family
    ? allModels.filter((m) => m.id !== model.id && m.id === model.previousVersion)
    : [];

  const releaseDateFormatted = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  // Construct JSON-LD Schema structured data
  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/models/${model.slug}#application`,
        name: model.name,
        applicationCategory: "AI Model",
        operatingSystem: "Cloud/API or Local Inference",
        description: model.description,
        datePublished: model.releaseDate,
        publisher: {
          "@type": "Organization",
          name: model.developer,
        },
        offers: {
          "@type": "Offer",
          price: "0.00",
          priceCurrency: "USD",
          description: model.type === "open-weights" ? "Free / Open weights" : "Commercial API / Closed source",
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/models/${model.slug}#breadcrumb`,
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
            name: model.name,
            item: `${SITE_URL}/models/${model.slug}`,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24 relative">
      <JsonLd data={softwareAppSchema} />

      {/* ── Background Accent Glow ──────────────────────────── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-brand-orange/5 via-brand-pink/2 to-transparent pointer-events-none" />

      {/* ── Top Bar / Breadcrumb ─────────────────────────────── */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-white/40">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="opacity-50" />
          <Link href="/models" className="hover:text-white transition-colors">
            Models
          </Link>
          <ChevronRight size={12} className="opacity-50" />
          <span className="text-white/80 truncate max-w-[150px] sm:max-w-xs">{model.name}</span>
        </nav>
      </header>

      {/* ── Detail Content ─────────────────────────────────── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <Link
          href="/models"
          className="inline-flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors group mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
        >
          <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Catalog
        </Link>

        {/* ── Header Card ─────────────────────────────────────── */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-white/[0.03] border border-white/[0.06] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-brand-pink/5 opacity-50" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <TypeBadge type={model.type} />
                <span className="text-xs text-white/40 flex items-center gap-1.5">
                  <Calendar size={12} />
                  Released {releaseDateFormatted}
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight"
                style={{
                  fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                }}
              >
                {model.name}
              </h1>
              <p className="text-white/50 font-medium">Developed by {model.developer}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {model.modality.map((mod) => (
                <ModalityTag key={mod} modality={mod} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Grid Layout for Stats & Desc ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Main info (left col) */}
          <div className="md:col-span-2 space-y-10">
            {/* Description */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/30">Description</h2>
              <p className="text-white/80 leading-relaxed text-base">{model.description}</p>
            </section>

            {/* Key Features */}
            {model.keyFeatures && model.keyFeatures.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/30">Key Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {model.keyFeatures.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-white/70 bg-white/[0.02] border border-white/[0.04] p-3 rounded-xl"
                    >
                      <Sparkles size={14} className="text-brand-orange shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benchmarks */}
            {model.benchmarks && model.benchmarks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/30">Benchmarks</h2>
                <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-white/40 font-medium">
                        <th className="p-3">Benchmark</th>
                        <th className="p-3 text-right">Score</th>
                        <th className="p-3 text-center">Verified</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {model.benchmarks.map((bench, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3 text-white/80 font-medium">{bench.name}</td>
                          <td className="p-3 text-right text-white font-semibold tabular-nums">{bench.score}</td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block w-2 h-2 rounded-full ${
                                bench.verified ? "bg-emerald-500" : "bg-white/20"
                              }`}
                              title={bench.verified ? "Verified by curator" : "Self-reported"}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Sidebar specs (right col) */}
          <div className="space-y-8">
            <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/30">Model Specs</h2>

              {/* Params */}
              <div className="space-y-1">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Parameters</p>
                <p className="text-sm text-white/80 font-medium flex items-center gap-1.5">
                  <Layers size={14} className="text-white/30" />
                  {model.parameters}
                </p>
              </div>

              {/* Context window */}
              <div className="space-y-1">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">Context Window</p>
                <p className="text-sm text-white/80 font-medium flex items-center gap-1.5">
                  <Layers2 size={14} className="text-white/30" />
                  {model.contextWindow}
                </p>
              </div>

              {/* License */}
              <div className="space-y-1">
                <p className="text-xs text-white/40 font-medium uppercase tracking-wider">License</p>
                <p className="text-sm text-white/80 font-medium flex items-center gap-1.5">
                  <Shield size={14} className="text-white/30" />
                  {model.license}
                </p>
              </div>
            </section>

            {/* Links */}
            <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/30">Resources</h2>
              <div className="flex flex-col gap-2">
                {model.links.website && (
                  <a
                    href={model.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm font-medium text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={14} className="text-white/40" />
                      Official Website
                    </span>
                    <ExternalLink size={12} className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
                {model.links.huggingface && (
                  <a
                    href={model.links.huggingface}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-sm font-medium text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={14} className="text-white/40" />
                      Hugging Face
                    </span>
                    <ExternalLink size={12} className="text-white/20 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
              </div>
            </section>

            {/* Family relations */}
            {familyMembers.length > 0 && (
              <section className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/30">Family Hierarchy</h2>
                <p className="text-xs text-white/40">Other releases in the {model.family} line:</p>
                <div className="flex flex-col gap-2">
                  {familyMembers.map((member) => (
                    <Link
                      key={member.id}
                      href={`/models/${member.slug}`}
                      className="text-sm text-brand-orange hover:underline flex items-center gap-1"
                    >
                      {member.name}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}

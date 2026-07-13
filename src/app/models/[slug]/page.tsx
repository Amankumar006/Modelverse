import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllModels,
  getAllModelEntries,
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
  AlertTriangle,
  GitCompare,
  Terminal,
  Link2,
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

function TaskBadge({ task }: { task: string }) {
  const taskNames: Record<string, string> = {
    "chat-reasoning": "Chat & Reasoning",
    "code-generation": "Coding",
    "image-generation": "Image Gen",
    "video-generation": "Video Gen",
    "audio-speech": "Audio & Speech",
    "embedding": "Embedding",
    "agentic": "Agentic",
    "multimodal-general": "Multimodal",
    "translation": "Translation",
    "search-retrieval": "Search & RAG",
    "other": "Specialized",
  };
  const label = taskNames[task] || task;

  return (
    <span className="text-xs font-semibold bg-white/5 border border-white/10 text-white/70 px-3 py-1 rounded-full shrink-0">
      {label}
    </span>
  );
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

  // Fetch static lists
  const allEntries = getAllModelEntries();

  // Find other models in the same family
  const familyMembers = model.family
    ? allEntries.filter((e) => e.family === model.family && e.id !== model.id)
    : [];

  // Find previous version model details
  const prevVersionModel = model.previousVersion
    ? allEntries.find((e) => e.id === model.previousVersion)
    : null;

  // Find related models (sharing primary task)
  const relatedModels = allEntries
    .filter((e) => e.primaryTask === model.primaryTask && e.id !== model.id)
    .slice(0, 3);

  const releaseDateFormatted = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  );

  // Check if any critical specification field is unverified
  const hasUnverifiedField =
    model.verified === false ||
    model.benchmarks.some((b) => b.verified === false);

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
          description:
            model.type === "open-weights"
              ? "Free / Open weights"
              : "Commercial API / Closed source",
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
            name: model.developer,
            item: `${SITE_URL}/models?developer=${encodeURIComponent(
              model.developer
            )}`,
          },
          {
            "@type": "ListItem",
            position: 4,
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
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-white/40">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight size={12} className="opacity-50 shrink-0" />
          <Link href="/models" className="hover:text-white transition-colors">
            Models
          </Link>
          <ChevronRight size={12} className="opacity-50 shrink-0" />
          <Link
            href={`/models?developer=${encodeURIComponent(model.developer)}`}
            className="hover:text-white transition-colors truncate max-w-[120px]"
          >
            {model.developer}
          </Link>
          <ChevronRight size={12} className="opacity-50 shrink-0" />
          <span className="text-white/80 truncate max-w-[150px] sm:max-w-xs">{model.name}</span>
        </nav>
      </header>

      {/* ── Detail Content ─────────────────────────────────── */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <Link
          href="/models"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors group mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
        >
          <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Catalog
        </Link>

        {/* ── Header Card ─────────────────────────────────────── */}
        <div className="relative rounded-3xl p-6 sm:p-8 bg-white/[0.02] border border-white/[0.05] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/5 to-brand-pink/5 opacity-40" />

          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <TypeBadge type={model.type} />
                <TaskBadge task={model.primaryTask} />
                <span className="text-xs text-white/40 flex items-center gap-1.5 ml-1">
                  <Calendar size={12} />
                  Released {releaseDateFormatted}
                </span>
              </div>
              <h1
                className="text-4xl sm:text-5xl font-normal tracking-tight text-white leading-none"
                style={{
                  fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                }}
              >
                {model.name}
              </h1>
              <Link
                href={`/models?developer=${encodeURIComponent(model.developer)}`}
                className="inline-block text-white/50 hover:text-brand-orange text-sm font-medium transition-colors"
              >
                Developed by {model.developer}
              </Link>
            </div>

            <div className="flex flex-wrap gap-2 md:self-end">
              {model.modality.map((mod) => (
                <ModalityTag key={mod} modality={mod} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Trust Banner warning for unverified entries ──────── */}
        {hasUnverifiedField && (
          <div className="mt-6 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/10 text-amber-500/80 text-xs">
            <AlertTriangle size={15} className="shrink-0" />
            <span>Some details or benchmark scores on this page are self-reported by developers and unconfirmed.</span>
          </div>
        )}

        {/* ── Grid Layout for Stats & Desc ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          {/* Main Info Columns (left) */}
          <div className="md:col-span-2 space-y-10">
            {/* Description */}
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Description</h2>
              <p className="text-white/70 leading-relaxed text-sm sm:text-base">{model.description}</p>
            </section>

            {/* Key Features */}
            {model.keyFeatures && model.keyFeatures.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Key Features</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {model.keyFeatures.map((feat, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-white/60 bg-white/[0.01] border border-white/[0.04] p-3 rounded-xl hover:border-white/[0.08] transition-colors"
                    >
                      <Sparkles size={13} className="text-brand-orange shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Benchmarks Table */}
            {model.benchmarks && model.benchmarks.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Benchmarks</h2>
                <div className="border border-white/[0.06] rounded-xl overflow-hidden bg-white/[0.01]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-white/[0.02] text-white/40 font-medium">
                        <th className="p-3">Benchmark</th>
                        <th className="p-3 text-right">Score</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {model.benchmarks.map((bench, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01] transition-colors">
                          <td className="p-3 text-white/80 font-medium">{bench.name}</td>
                          <td className="p-3 text-right text-white font-semibold tabular-nums">{bench.score}</td>
                          <td className="p-3 text-center">
                            {bench.verified ? (
                              <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-500/80 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-[10px] text-white/30 font-medium" title="Self-reported score">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                Self-Reported
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Related Models Strip */}
            {relatedModels.length > 0 && (
              <section className="space-y-4 pt-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">You might also want to compare</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedModels.map((item) => (
                    <Link
                      key={item.id}
                      href={`/models/${item.slug}`}
                      className="group p-4 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.03] hover:border-white/[0.08] transition-all flex flex-col gap-2 text-left"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-brand-orange transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-white/40 mt-0.5">{item.developer}</p>
                      </div>
                      <span className="text-[9px] text-white/50 border border-white/10 px-2 py-0.5 rounded-full self-start mt-auto">
                        Specs &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Sourcing Ledger */}
            {model.sources && model.sources.length > 0 && (
              <section className="space-y-3 pt-6 border-t border-white/[0.04]">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Verified Sources</h2>
                <ul className="space-y-1.5">
                  {model.sources.map((src, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/20 select-none">[{idx + 1}]</span>
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-white/40 font-mono truncate hover:text-brand-orange hover:underline transition-colors max-w-full"
                      >
                        {src}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar Specs & Relationships Columns (right) */}
          <div className="space-y-6">
            {/* Specs Card */}
            <section className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] space-y-6 text-left">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Model Specs</h2>

              {/* Params */}
              <div className="space-y-1">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Parameters</p>
                <p className="text-xs text-white/70 font-mono">
                  {model.parameters === "undisclosed" ? "undisclosed" : model.parameters}
                </p>
              </div>

              {/* Context window */}
              <div className="space-y-1">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Context Window</p>
                <p className="text-xs text-white/70 font-mono">
                  {model.contextWindow}
                </p>
              </div>

              {/* License */}
              <div className="space-y-1">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">License</p>
                <p className="text-xs text-white/70 font-mono truncate" title={model.license}>
                  {model.license}
                </p>
              </div>

              {/* Deployments */}
              <div className="space-y-1">
                <p className="text-[10px] text-white/35 uppercase tracking-wider font-semibold">Deployment</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {model.deployment.map((dep) => (
                    <span key={dep} className="text-[9px] uppercase tracking-wide bg-white/[0.04] text-white/50 border border-white/5 px-2 py-0.5 rounded">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* Links Section */}
            <section className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] space-y-3.5 text-left">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Links</h2>
              <div className="flex flex-col gap-2">
                {model.links.website && (
                  <a
                    href={model.links.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-white/80 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={13} className="text-white/40" />
                      Official Website
                    </span>
                    <ExternalLink size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
                {model.links.paper && (
                  <a
                    href={model.links.paper}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-white/80 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <FileText size={13} className="text-white/40" />
                      Research Paper
                    </span>
                    <ExternalLink size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
                {model.links.huggingface && (
                  <a
                    href={model.links.huggingface}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-white/80 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <Layers size={13} className="text-white/40" />
                      Hugging Face
                    </span>
                    <ExternalLink size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
                {model.links.github && (
                  <a
                    href={model.links.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-white/80 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <Terminal size={13} className="text-white/40" />
                      GitHub Repository
                    </span>
                    <ExternalLink size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
                {model.links.blogPost && (
                  <a
                    href={model.links.blogPost}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] text-xs font-semibold text-white/80 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50"
                  >
                    <span className="flex items-center gap-2">
                      <Link2 size={13} className="text-white/40" />
                      Developer Blog
                    </span>
                    <ExternalLink size={12} className="text-white/25 group-hover:text-white/60 transition-colors" />
                  </a>
                )}
              </div>
            </section>

            {/* Lineage & Family Section */}
            {(model.family || prevVersionModel) && (
              <section className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] space-y-3.5 text-left">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-white/25">Lineage</h2>
                
                {/* Family line */}
                {model.family && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-white/35 font-medium">Part of the {model.family} family</p>
                    {familyMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {familyMembers.map((member) => (
                          <Link
                            key={member.id}
                            href={`/models/${member.slug}`}
                            className="text-xs text-brand-orange hover:text-[#e85a28] hover:underline"
                          >
                            {member.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-white/50">Only release in this line currently tracked.</p>
                    )}
                  </div>
                )}

                {/* Previous version link */}
                {prevVersionModel && (
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                    <p className="text-[10px] text-white/35 font-medium">Predecessor</p>
                    <Link
                      href={`/models/${prevVersionModel.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs text-brand-orange hover:text-[#e85a28] hover:underline group"
                    >
                      <GitCompare size={12} className="shrink-0" />
                      {prevVersionModel.name}
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Compare CTA Box */}
            <section className="p-5 rounded-2xl bg-[#FF6B35]/5 border border-[#FF6B35]/15 space-y-3 text-left">
              <h3 className="text-xs font-semibold text-white">Compare Specs</h3>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Compare the parameters, context windows, and benchmarks of this model against others side-by-side.
              </p>
              <Link
                href={`/compare?models=${model.slug}`}
                className="w-full py-2.5 bg-brand-orange hover:bg-[#e85a28] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center hover:scale-[1.02] active:scale-95"
              >
                Compare Model
              </Link>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

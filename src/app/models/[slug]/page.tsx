import fs from "fs/promises";
import path from "path";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";

import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
import Breadcrumb from "@/components/models/Breadcrumb";
import ClientBackButton from "@/components/ui/ClientBackButton";
import Navbar from "@/components/layout/Navbar";
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
  Sliders,
  GitFork,
  ShieldCheck,
  Cpu,
} from "lucide-react";
import ModelLogo from "@/components/ui/ModelLogo";

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
    <span className="text-xs font-semibold bg-[#121A15]/5 border border-white/10 text-white/70 px-3 py-1 rounded-full shrink-0">
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
  
  let markdownContent: string | null = null;
  try {
    const readmePath = path.join(process.cwd(), "data", "models", "readme", `${slug}.md`);
    markdownContent = await fs.readFile(readmePath, "utf-8");
  } catch (err) {
    try {
      const readmePathId = path.join(process.cwd(), "data", "models", "readme", `${model.id}.md`);
      markdownContent = await fs.readFile(readmePathId, "utf-8");
    } catch (err2) {
      // silently ignore
    }
  }

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
            item: `${SITE_URL}/models/developer/${encodeURIComponent(
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
    <main className="min-h-screen bg-[#0C120F] text-gray-100 selection:bg-[#4ADE80] selection:text-white pb-24 relative">
      <Navbar theme="dark" />
      <JsonLd data={softwareAppSchema} />

      {/* ── Top Bar / Breadcrumb ─────────────────────────────── */}
      <header className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pt-8 pb-4">
        <Breadcrumb 
          developer={model.developer} 
          family={model.family ? { slug: model.family, label: model.family } : undefined} 
          model={{ slug: model.slug, name: model.name }} 
        />
      </header>

      {/* ── Detail Content ─────────────────────────────────── */}
      <article className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 mt-6">
        <ClientBackButton
          fallbackHref={model.family ? `/models/family/${model.family}` : `/models/developer/${encodeURIComponent(model.developer)}`}
          fallbackLabel={model.family ? model.family : model.developer}
        />

        {/* ── Flat Header ─────────────────────────────────────── */}
        <div className="pb-6 border-b border-white/10 mb-8 mt-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div>
                <Link
                  href={`/models?developer=${encodeURIComponent(model.developer)}`}
                  className="inline-block text-gray-400 hover:text-white text-base font-medium transition-colors mb-1"
                >
                  {model.developer} {model.institution && ` / ${model.institution}`} /
                </Link>
                <h1
                  className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-none flex items-center gap-3"
                >
                  <ModelLogo
                    logo={model.logo}
                    name={model.name}
                    developer={model.developer}
                    size="lg"
                  />
                  {model.name}
                  {model.featured && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4ADE80] bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-2 py-0.5 rounded-full shrink-0">
                      Featured
                    </span>
                  )}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <TypeBadge type={model.type} />
                <TaskBadge task={model.primaryTask} />
                
                {model.modality.map((mod) => (
                  <ModalityTag key={mod} modality={mod} />
                ))}

                <span className="text-xs text-gray-400 flex items-center gap-1.5 ml-1">
                  <Calendar size={12} />
                  Updated {releaseDateFormatted}
                </span>
              </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-10">
          {/* Main Info Columns (left) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Markdown Documentation or Fallback Description & Benchmarks */}
            {markdownContent ? (
              <section className="pt-2 pb-6 border-b border-white/10 mb-6">
                <MarkdownRenderer content={markdownContent} />
              </section>
            ) : (
              <>
                {/* Description */}
                <section className="space-y-3">
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Description</h2>
                  <p className="text-[#F3F4F6] leading-relaxed text-base sm:text-lg">{model.description}</p>
                </section>

                {/* Benchmark Images */}
                {model.images && model.images.length > 0 && (
                  <section className="space-y-4 pt-2">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Benchmark Images</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {model.images.map((imgUrl, idx) => (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-white/10 bg-white/5 aspect-video">
                          <img
                            src={imgUrl}
                            alt={`${model.name} benchmark ${idx + 1}`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Benchmarks Table */}
                {model.benchmarks && model.benchmarks.length > 0 && (
                  <section className="space-y-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Benchmarks</h2>
                    <div className="border border-white/10 rounded-xl overflow-x-auto bg-white/5 scrollbar-thin">
                      <table className="w-full text-left border-collapse text-xs min-w-[300px]">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/5 text-[#E5E7EB] font-medium">
                            <th className="p-3.5">Benchmark</th>
                            <th className="p-3.5 text-right">Score</th>
                            <th className="p-3.5 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {model.benchmarks.map((bench, idx) => (
                            <tr key={idx} className="hover:bg-white/5 transition-colors">
                              <td className="p-3.5 text-white font-medium">{bench.name}</td>
                              <td className="p-3.5 text-right text-white font-semibold tabular-nums">{bench.score}</td>
                              <td className="p-3.5 text-center">
                                {bench.verified ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-[#4ADE80] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                                    Verified
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs text-[#9CA3AF] font-medium" title="Self-reported score">
                                    <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
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
              </>
            )}

            {/* Key Features Section */}
            {model.keyFeatures && model.keyFeatures.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-[#9CA3AF]">Key Features</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {model.keyFeatures.map((feat, idx) => (
                    <div
                      key={idx}
                      className="group relative p-4 rounded-2xl bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-[#4ADE80]/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(74,222,128,0.08)] flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-[#4ADE80]/10 border border-[#4ADE80]/20 text-[#4ADE80] shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <Sparkles size={16} />
                        </div>
                        <p className="text-sm font-medium text-[#F3F4F6] group-hover:text-white transition-colors leading-relaxed mt-0.5">
                          {feat}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-[#9CA3AF] pt-2 border-t border-white/10">
                        <span>Feature {String(idx + 1).padStart(2, "0")}</span>
                        <span className="opacity-0 group-hover:opacity-100 text-[#4ADE80] transition-opacity duration-300">✦</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Models Strip */}
            {relatedModels.length > 0 && (
              <section className="space-y-4 pt-4">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400/60">You might also want to compare</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedModels.map((item) => (
                    <Link
                      key={item.id}
                      href={`/models/${item.slug}`}
                      className="group p-4 rounded-xl bg-white/5 hover:bg-[#121A15] border border-white/10 hover:border-white/20 transition-all flex flex-col gap-2 text-left"
                    >
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-white truncate group-hover:text-[#4ADE80] transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 mt-0.5">{item.developer}</p>
                      </div>
                      <span className="text-[9px] text-gray-400 border border-white/10 px-2 py-0.5 rounded-full self-start mt-auto">
                        Specs &rarr;
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

             {/* Sourcing Ledger */}
            {model.sources && model.sources.length > 0 && (
              <section className="space-y-3 pt-6 border-t border-white/10">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400/60">Verified Sources</h2>
                <ul className="space-y-1.5">
                  {model.sources.map((src, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400/50 select-none">[{idx + 1}]</span>
                      <a
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 font-mono truncate hover:text-[#4ADE80] hover:underline transition-colors max-w-full"
                      >
                        {src}
                      </a>
                    </li>
                  ))}
                 </ul>
              </section>
            )}

            {/* Tags */}
            {model.tags && model.tags.length > 0 && (
              <section className="space-y-3 pt-6 border-t border-white/10">
                <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-400/60">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {model.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-[#121A15] border border-white/10 text-gray-400 px-2.5 py-1 rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Specs & Relationships Columns (right) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 h-fit">
            {/* Specs Card */}
            <section className="p-5.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-5 text-left shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Sliders size={15} className="text-[#4ADE80]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">Model Specs</h2>
                </div>
                <span className="text-[10px] font-mono text-gray-400/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
                  {model.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Params */}
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Parameters</p>
                  <p className="text-xs text-white font-mono font-medium">
                    {model.parameters === "undisclosed" ? "Undisclosed" : model.parameters}
                  </p>
                </div>

                {/* Context window */}
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Context Window</p>
                  <p className="text-xs text-white font-mono font-medium">
                    {model.contextWindow}
                  </p>
                </div>

                {/* Tier */}
                {model.tier && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Tier</p>
                    <p className="text-xs text-white font-mono font-medium">
                      {model.tier}
                    </p>
                  </div>
                )}

                {/* License */}
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">License</p>
                  <p className="text-xs text-white font-mono font-medium truncate" title={model.license}>
                    {model.license}
                  </p>
                </div>
              </div>

              {/* Deployments */}
              <div className="space-y-1.5 pt-3 border-t border-white/10">
                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Deployment</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {model.deployment.map((dep) => (
                    <span key={dep} className="text-[10px] font-semibold uppercase tracking-wider bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 px-2.5 py-0.5 rounded-full">
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cost Tiers */}
              {model.costTiers && model.costTiers.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Cost Tiers</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {model.costTiers.map((tier) => (
                      <div key={tier.id} className="group/tier relative inline-block">
                        <span className="inline-flex items-center text-[10px] font-semibold bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/20 px-2.5 py-1 rounded-full cursor-help hover:bg-[#4ADE80]/20 transition-all select-none">
                          {tier.label}
                        </span>
                        {tier.description && (
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tier:block z-30 w-56 p-3 bg-[#121A15] border border-white/10 text-[10px] text-gray-400 leading-relaxed rounded-xl shadow-xl font-sans text-center">
                            {tier.description}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pricing */}
              {model.pricing && model.pricing.length > 0 && (
                <div className="space-y-2 pt-3 border-t border-white/10">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Pricing</p>
                  <ul className="space-y-1.5 mt-1">
                    {model.pricing.map((price, idx) => (
                      <li key={idx} className="text-xs text-white flex items-center justify-between border-b border-white/5 pb-1.5 last:border-0 last:pb-0">
                        <span className="text-gray-400">
                          {price.tier ? <span className="font-semibold mr-1">{price.tier}:</span> : null}
                          {price.unit}
                        </span>
                        <span className="font-mono font-medium text-[#4ADE80]">
                          {price.currency !== "USD" ? `${price.currency} ` : "$"}{price.amount}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {model.pricingLastVerified && (
                    <p className="text-[9px] text-gray-400/70 text-right italic pt-1">
                      as of {model.pricingLastVerified}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Links Section */}
            {model.links && Object.keys(model.links).length > 0 && (
              <section className="p-5.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-4 text-left shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <Globe size={15} className="text-[#4ADE80]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">Resources & Links</h2>
                </div>
                <div className="flex flex-col gap-2">
                  {Object.entries(model.links).map(([key, url]) => {
                    let Icon = ExternalLink;
                    const lowerKey = key.toLowerCase();
                    if (lowerKey.includes('github') || lowerKey.includes('repo')) Icon = Terminal;
                    else if (lowerKey.includes('hugging') || lowerKey.includes('weights')) Icon = Layers;
                    else if (lowerKey.includes('paper') || lowerKey.includes('arxiv') || lowerKey.includes('doc')) Icon = FileText;
                    else if (lowerKey.includes('site') || lowerKey.includes('official') || lowerKey === 'website') Icon = Globe;
                    else if (lowerKey.includes('blog') || lowerKey.includes('post')) Icon = Link2;
                    else if (lowerKey === 'api') Icon = Terminal;

                    let displayName = key;
                    if (key === 'blogPost') displayName = 'Developer Blog';
                    else if (key === 'huggingface') displayName = 'Hugging Face';
                    else if (key === 'github') displayName = 'GitHub Repository';
                    else if (key === 'paper') displayName = 'Research Paper';
                    else if (key === 'website') displayName = 'Official Website';
                    else if (key.toLowerCase() === 'api') displayName = 'API & Playground';

                    const isComingSoon = url === "coming-soon" || url.toLowerCase().includes("coming-soon");

                    if (isComingSoon) {
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 text-xs font-semibold text-gray-500 select-none"
                        >
                          <span className="flex items-center gap-2.5">
                            <Icon size={14} className="text-gray-500" />
                            {displayName}
                          </span>
                          <span className="text-[10px] font-sans font-semibold text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      );
                    }

                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-[#4ADE80]/40 text-xs font-semibold text-gray-300 hover:text-white transition-all duration-200 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4ADE80]/50 shadow-sm"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon size={14} className="text-[#4ADE80] group-hover:scale-110 transition-transform" />
                          {displayName}
                        </span>
                        <ExternalLink size={13} className="text-gray-400 group-hover:text-[#4ADE80] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                      </a>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Lineage & Family Section */}
            {(model.family || prevVersionModel) && (
              <section className="p-5.5 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 backdrop-blur-md space-y-4 text-left shadow-xl">
                <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                  <GitFork size={15} className="text-[#4ADE80]" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-gray-300">Lineage</h2>
                </div>
                
                {/* Family line */}
                {model.family && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Model Family</p>
                    <p className="text-xs text-gray-300 font-medium">Part of the <span className="text-white font-semibold">{model.family}</span> family</p>
                    {familyMembers.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {familyMembers.map((member) => (
                          <Link
                            key={member.id}
                            href={`/models/${member.slug}`}
                            className="text-xs text-[#4ADE80] hover:underline bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-2.5 py-1 rounded-lg transition-colors font-medium"
                          >
                            {member.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-gray-400/80 italic">Only release in this line currently tracked.</p>
                    )}
                  </div>
                )}

                {/* Previous version link */}
                {prevVersionModel && (
                  <div className="space-y-1.5 pt-3 border-t border-white/10">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Predecessor</p>
                    <Link
                      href={`/models/${prevVersionModel.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-[#4ADE80] hover:text-emerald-300 hover:underline group bg-[#4ADE80]/10 border border-[#4ADE80]/20 px-3 py-1.5 rounded-xl transition-all"
                    >
                      <GitCompare size={13} className="shrink-0 group-hover:rotate-12 transition-transform" />
                      {prevVersionModel.name}
                    </Link>
                  </div>
                )}
              </section>
            )}

            {/* Curator Notes */}
            {model.curatorNotes && (
              <section className="p-5.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/[0.04] to-transparent border border-amber-500/20 space-y-2.5 text-left shadow-lg">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-400">Curator Notes</h3>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed font-sans">
                  {model.curatorNotes}
                </p>
              </section>
            )}

            {/* Compare CTA Box */}
            <section className="p-5.5 rounded-2xl bg-gradient-to-b from-[#121A15] via-[#0E1511] to-[#0A0F0C] border border-[#4ADE80]/30 shadow-[0_0_30px_rgba(74,222,128,0.07)] space-y-3.5 text-left">
              <div className="flex items-center gap-2">
                <GitCompare size={16} className="text-[#4ADE80]" />
                <h3 className="text-sm font-bold text-white tracking-tight">Compare Specs</h3>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Compare parameters, context windows, modalities, and benchmark scores of this model side-by-side with others.
              </p>
              <Link
                href={`/compare?models=${model.slug}`}
                className="w-full py-3 bg-[#4ADE80] hover:bg-[#38c96e] text-[#0C120F] rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#4ADE80]/25 hover:shadow-[#4ADE80]/40 active:scale-[0.98]"
              >
                <GitCompare size={14} />
                Compare Model
              </Link>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

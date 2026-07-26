import fs from "fs/promises";
import path from "path";
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
import Navbar from "@/components/layout/Navbar";
import CuratorReviewBanner from "@/components/CuratorReviewBanner";
import ModelDetailTabs from "@/components/models/ModelDetailTabs";
import ModelLogo from "@/components/ui/ModelLogo";
import BenchmarkTabs from "@/components/news/BenchmarkTabs";
import { ArrowUpRight, ChevronRight, Copy } from "lucide-react";

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

  const title = `${model.name} Overview — Modelverse Docs`;
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
      siteName: "Modelverse Docs",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ------------------------------------------------------------------ */
/* Minimal Signature Device & Status Helpers                           */
/* ------------------------------------------------------------------ */

const DOT = {
  active: "bg-emerald-500",
  deprecated: "bg-amber-500",
  sunset: "bg-rose-500",
  vendor: "bg-amber-500",
  independent: "bg-emerald-500",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  deprecated: "Deprecated",
  sunset: "Sunset",
};

function StatusLine({
  status,
  vendorApiStatus,
  modelType,
}: {
  status: string;
  vendorApiStatus?: string | null;
  modelType: string;
}) {
  const showVendor =
    vendorApiStatus &&
    (modelType === "open-weights" ? true : vendorApiStatus !== status);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-[#90908F]">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status as keyof typeof DOT] || "bg-emerald-500"}`} />
      {STATUS_LABEL[status] || status}
      {showVendor && vendorApiStatus && (
        <span className="text-[#666664]">
          · vendor API {(STATUS_LABEL[vendorApiStatus] || vendorApiStatus).toLowerCase()}
        </span>
      )}
    </span>
  );
}

function TrustNote({ model }: { model: ModelEntry }) {
  const hasVendorReported = model.benchmarks?.some(
    (b) => b.sourceType === "vendor-reported"
  );
  if (model.verified && !hasVendorReported) return null;

  return (
    <div className="border-l-2 border-[#D97757] pl-3 text-sm text-[#90908F] space-y-0.5">
      {!model.verified && (
        <p>Specifications on this page are provisional — not yet confirmed against a primary source.</p>
      )}
      {hasVendorReported && (
        <p className={!model.verified ? "mt-1" : ""}>
          Some benchmark scores below are self-reported by the developer, not independently evaluated.
        </p>
      )}
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value?: string | number | null }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline justify-between border-b border-[#282828] py-2.5 text-sm">
      <dt className="text-[#90908F]">{label}</dt>
      <dd className="tabular-nums text-[#E1E1E0] font-mono">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ModelDetailPage Main Component (Claude 3-Column Docs Layout)        */
/* ------------------------------------------------------------------ */

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

  const releaseDateFormatted = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const isShowcase = model.verified && model.benchmarks?.length >= 3;

  const linkKeys: Record<string, string> = {
    website: "Website",
    github: "GitHub Repository",
    huggingface: "Hugging Face",
    paper: "Research Paper",
    playground: "Playground",
    blogPost: "Developer Blog",
  };
  const linkEntries = Object.keys(linkKeys).filter((k) => model.links?.[k]);

  // Structured JSON-LD
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
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#141414] text-[#E1E1E0] selection:bg-[#D97757] selection:text-white relative font-sans">
      <Navbar theme="dark" />
      <JsonLd data={softwareAppSchema} />

      {/* 3-Column Docs Layout Container */}
      <div className="flex max-w-[1600px] mx-auto min-h-[calc(100vh-3.5rem)]">
        {/* ── Left Sidebar Navigation (Column 1) ────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-[#282828] p-4 space-y-6 text-sm">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#90908F] px-2 mb-2">
              Models Directory
            </div>
            <nav className="space-y-1">
              <Link
                href="/models"
                className="flex items-center px-2.5 py-1.5 rounded-lg text-[#90908F] hover:text-white hover:bg-[#1E1E1E] transition-colors"
              >
                All Models Overview
              </Link>
              <Link
                href={`/models?developer=${encodeURIComponent(model.developer)}`}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-white bg-[#242426] font-medium"
              >
                <span className="truncate">{model.developer}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#2E2E2E] text-gray-300">
                  {allEntries.filter(m => m.developer === model.developer).length}
                </span>
              </Link>
            </nav>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#90908F] px-2 mb-2">
              {model.developer} Models
            </div>
            <nav className="space-y-1 max-h-72 overflow-y-auto no-scrollbar">
              {allEntries
                .filter((m) => m.developer === model.developer)
                .slice(0, 10)
                .map((m) => (
                  <Link
                    key={m.slug}
                    href={`/models/${m.slug}`}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      m.slug === model.slug
                        ? "bg-[#242426] text-white font-medium border-l-2 border-[#D97757]"
                        : "text-[#90908F] hover:text-white hover:bg-[#1E1E1E]"
                    }`}
                  >
                    <span className="truncate">{m.name}</span>
                  </Link>
                ))}
            </nav>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#90908F] px-2 mb-2">
              Documentation
            </div>
            <nav className="space-y-1 text-xs">
              <Link href="/timeline" className="flex items-center px-2.5 py-1.5 rounded-lg text-[#90908F] hover:text-white hover:bg-[#1E1E1E]">
                Release Timeline
              </Link>
              <Link href="/compare" className="flex items-center px-2.5 py-1.5 rounded-lg text-[#90908F] hover:text-white hover:bg-[#1E1E1E]">
                Model Comparison
              </Link>
              <Link href="/about" className="flex items-center px-2.5 py-1.5 rounded-lg text-[#90908F] hover:text-white hover:bg-[#1E1E1E]">
                Schema Specification
              </Link>
            </nav>
          </div>
        </aside>

        {/* ── Center Reading Workspace (Column 2) ─────────────────── */}
        <article className="flex-1 min-w-0 max-w-4xl px-6 lg:px-10 py-8">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-xs text-[#90908F] mb-6">
            <Link href="/" className="hover:text-white">Models & pricing</Link>
            <ChevronRight size={12} className="text-[#555555]" />
            <Link href="/models" className="hover:text-white">Models</Link>
            <ChevronRight size={12} className="text-[#555555]" />
            <span className="text-[#E1E1E0] font-medium">{model.name}</span>
          </div>

          {/* Curator Review Banner */}
          <div className="mb-6">
            <CuratorReviewBanner model={model} />
          </div>

          {/* Document Header */}
          <header className="mb-8 border-b border-[#282828] pb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <ModelLogo logo={model.logo} name={model.name} developer={model.developer} size="lg" />
                <div>
                  <h1
                    className="text-3xl sm:text-4xl font-normal tracking-tight text-white"
                    style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
                  >
                    {model.name}
                  </h1>
                  <p className="text-sm text-[#90908F] mt-0.5">{model.developer}</p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-mono bg-[#242426] text-[#E1E1E0] border border-[#333333] px-2.5 py-1 rounded-md">
                  ID: {model.slug}
                </span>
              </div>
            </div>

            {/* Spec & Status Pills Ribbon */}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-[#90908F]">
              <span className="font-mono bg-[#242426] text-[#E1E1E0] border border-[#333333] px-2 py-0.5 rounded">
                {model.type.replace("-", " ")}
              </span>
              <span className="text-[#555555]">·</span>
              <StatusLine status={model.status} vendorApiStatus={model.vendorApiStatus} modelType={model.type} />
              <span className="text-[#555555]">·</span>
              <span className="capitalize">{model.primaryTask.replace(/-/g, " ")}</span>
              {model.releaseDate && (
                <>
                  <span className="text-[#555555]">·</span>
                  <span>Updated {releaseDateFormatted}</span>
                </>
              )}
            </div>

            {/* Quiet Trust Note */}
            <div className="mt-5">
              <TrustNote model={model} />
            </div>
          </header>

          {/* Main Detail Content Tabs */}
          <ModelDetailTabs model={model} markdownContent={markdownContent} />

          {/* Visual Benchmark Showcase for Claude Opus 5 */}
          {isShowcase && model.slug === "anthropic-claude-opus-5" && (
            <div className="mt-10 pt-6 border-t border-[#282828]">
              <h2
                className="text-2xl font-normal text-white mb-4"
                style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
              >
                Benchmark performance details
              </h2>
              <BenchmarkTabs />
            </div>
          )}

          {/* Related Models Grid List */}
          {relatedModels.length > 0 && (
            <section className="mt-12 pt-6 border-t border-[#282828]">
              <h2
                className="text-xl font-normal text-white mb-4"
                style={{ fontFamily: "var(--font-display, 'Instrument Serif', Georgia, serif)" }}
              >
                Related models comparison
              </h2>
              <div className="divide-y divide-[#282828] border-y border-[#282828]">
                {relatedModels.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/models/${m.slug}`}
                    className="flex items-center justify-between py-3 text-left hover:bg-[#1E1E1E] transition-colors px-3 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <ModelLogo logo={m.logo} name={m.name} developer={m.developer} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-white">{m.name}</p>
                        <p className="text-xs text-[#90908F]">{m.developer}</p>
                      </div>
                    </div>
                    <StatusLine status={m.status} vendorApiStatus={m.vendorApiStatus} modelType={m.type} />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </article>

        {/* ── Right Table of Contents Sidebar (Column 3) ─────────────── */}
        <aside className="hidden xl:block w-64 shrink-0 border-l border-[#282828] p-5 space-y-6 text-xs sticky top-14 h-fit">
          {/* Quick Specs */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#90908F] mb-3">
              Model Specs
            </div>
            <dl className="space-y-1">
              <SidebarRow label="Parameters" value={model.parameters !== "undisclosed" ? model.parameters : undefined} />
              <SidebarRow label="Context" value={model.contextWindow !== "undisclosed" ? model.contextWindow : undefined} />
              <SidebarRow label="Tier" value={model.tier} />
              <SidebarRow label="License" value={model.license !== "Other/Custom" ? model.license : undefined} />
            </dl>
          </div>

          {/* Resources Links */}
          {linkEntries.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#90908F] mb-3">
                Resources
              </div>
              <ul className="space-y-2">
                {linkEntries.map((k) => (
                  <li key={k}>
                    <a
                      href={model.links[k]}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-[#E1E1E0] hover:text-[#D97757] hover:underline transition-colors"
                    >
                      {linkKeys[k] || k}
                      <ArrowUpRight size={11} className="text-[#90908F]" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Family Lineage */}
          {familyMembers.length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#90908F] mb-3">
                Family Variants
              </div>
              <div className="flex flex-wrap gap-1.5">
                {familyMembers.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/models/${m.slug}`}
                    className="text-xs font-mono bg-[#242426] text-gray-300 border border-[#333333] px-2 py-0.5 rounded hover:text-white hover:border-[#D97757] transition-colors"
                  >
                    {m.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Curator Notes */}
          {model.curatorNotes && model.curatorNotes.trim().length > 0 && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#D97757] mb-2">
                Curator Notes
              </div>
              <p className="text-xs leading-relaxed text-[#90908F] font-sans">{model.curatorNotes}</p>
            </div>
          )}

          {/* Compare CTA */}
          <Link
            href={`/compare?models=${model.slug}`}
            className="flex w-full items-center justify-center gap-1 rounded-lg bg-[#E1E1E0] text-[#141414] py-2.5 text-xs font-semibold hover:bg-white transition-colors"
          >
            Compare specs <ChevronRight size={14} aria-hidden />
          </Link>
        </aside>
      </div>
    </main>
  );
}

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
import Breadcrumb from "@/components/models/Breadcrumb";
import ClientBackButton from "@/components/ui/ClientBackButton";
import Navbar from "@/components/layout/Navbar";
import CuratorReviewBanner from "@/components/CuratorReviewBanner";
import ModelDetailTabs from "@/components/models/ModelDetailTabs";
import ModelLogo from "@/components/ui/ModelLogo";
import BenchmarkTabs from "@/components/news/BenchmarkTabs";
import { ArrowUpRight, ChevronRight } from "lucide-react";

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
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-400">
      <span className={`h-1.5 w-1.5 rounded-full ${DOT[status as keyof typeof DOT] || "bg-emerald-500"}`} />
      {STATUS_LABEL[status] || status}
      {showVendor && vendorApiStatus && (
        <span className="text-gray-500">
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
    <div className="border-l-2 border-amber-400/60 pl-3 text-sm text-gray-400 space-y-0.5">
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
    <div className="flex items-baseline justify-between border-b border-white/10 py-2.5 text-sm">
      <dt className="text-gray-400">{label}</dt>
      <dd className="tabular-nums text-gray-200 font-medium">{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ModelDetailPage Main Component                                      */
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
    .slice(0, 3);

  const releaseDateFormatted = new Date(model.releaseDate).toLocaleDateString(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  );

  const isShowcase = model.verified && model.benchmarks?.length >= 3;

  const linkKeys: Record<string, string> = {
    website: "Website",
    github: "GitHub",
    huggingface: "Hugging Face",
    paper: "Research Paper",
    playground: "Playground",
    blogPost: "Developer Blog",
  };
  const linkEntries = Object.keys(linkKeys).filter((k) => model.links?.[k]);

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
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${SITE_URL}/models/${model.slug}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Models", item: `${SITE_URL}/models` },
          {
            "@type": "ListItem",
            position: 3,
            name: model.developer,
            item: `${SITE_URL}/models?developer=${encodeURIComponent(model.developer)}`,
          },
          { "@type": "ListItem", position: 4, name: model.name, item: `${SITE_URL}/models/${model.slug}` },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-[#141414] text-[#E4E4E7] selection:bg-[#DA7756] selection:text-white pb-24 relative font-sans">
      <Navbar theme="dark" />
      <JsonLd data={softwareAppSchema} />

      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <Breadcrumb
            developer={model.developer}
            family={model.family ? { slug: model.family, label: model.family } : undefined}
            model={{ slug: model.slug, name: model.name }}
          />
          <ClientBackButton
            fallbackHref={model.family ? `/models/family/${model.family}` : `/models?developer=${encodeURIComponent(model.developer)}`}
            fallbackLabel={model.family ? model.family : model.developer}
          />
        </div>

        {/* Curator Review Banner */}
        <div className="mb-6">
          <CuratorReviewBanner model={model} />
        </div>

        {/* Model Header Section */}
        <header className="mb-10">
          <div className="flex items-center gap-4">
            <ModelLogo logo={model.logo} name={model.name} developer={model.developer} size="lg" />
            <div>
              <h1 className="text-3xl font-serif tracking-tight text-[#F4F4F5] font-normal">{model.name}</h1>
              <p className="text-sm text-[#A1A1AA]">{model.developer}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-400">
            <span className="capitalize">{model.type.replace("-", " ")}</span>
            <span className="text-gray-600">·</span>
            <StatusLine status={model.status} vendorApiStatus={model.vendorApiStatus} modelType={model.type} />
            <span className="text-gray-600">·</span>
            <span className="capitalize">{model.primaryTask.replace(/-/g, " ")}</span>
            {model.releaseDate && (
              <>
                <span className="text-gray-600">·</span>
                <span>Updated {releaseDateFormatted}</span>
              </>
            )}
          </div>

          {/* Quiet Trust Note */}
          <div className="mt-5">
            <TrustNote model={model} />
          </div>
        </header>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_240px]">
          {/* Main Left Content */}
          <div>
            <ModelDetailTabs model={model} markdownContent={markdownContent} />

            {/* Benchmark Showcase Chart */}
            {isShowcase && model.slug === "anthropic-claude-opus-5" && (
              <div className="mt-10 pt-6 border-t border-white/10">
                <h2 className="mb-4 text-xs uppercase tracking-wider font-semibold text-gray-400">
                  Official Visual Benchmark Charts
                </h2>
                <BenchmarkTabs />
              </div>
            )}

            {/* Related Models List */}
            {relatedModels.length > 0 && (
              <section className="mt-12 pt-6 border-t border-white/10">
                <h2 className="mb-4 text-xs uppercase tracking-wider font-semibold text-gray-400">
                  Related models
                </h2>
                <div className="divide-y divide-white/10 border-y border-white/10">
                  {relatedModels.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/models/${m.slug}`}
                      className="flex items-center justify-between py-3 text-left hover:bg-white/5 transition-colors px-2 rounded-md"
                    >
                      <div className="flex items-center gap-3">
                        <ModelLogo logo={m.logo} name={m.name} developer={m.developer} size="sm" />
                        <div>
                          <p className="text-sm font-medium text-white">{m.name}</p>
                          <p className="text-xs text-gray-400">{m.developer}</p>
                        </div>
                      </div>
                      <StatusLine status={m.status} vendorApiStatus={m.vendorApiStatus} modelType={m.type} />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Minimal Sidebar */}
          <aside className="space-y-8">
            {/* Specs DL */}
            <div>
              <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold text-gray-400">Specs</h3>
              <dl>
                <SidebarRow label="Parameters" value={model.parameters !== "undisclosed" ? model.parameters : undefined} />
                <SidebarRow label="Context" value={model.contextWindow !== "undisclosed" ? model.contextWindow : undefined} />
                <SidebarRow label="Tier" value={model.tier} />
                <SidebarRow label="License" value={model.license !== "Other/Custom" ? model.license : undefined} />
              </dl>
            </div>

            {/* Resources Links */}
            {linkEntries.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold text-gray-400">Resources</h3>
                <ul className="space-y-1.5">
                  {linkEntries.map((k) => (
                    <li key={k}>
                      <a
                        href={model.links[k]}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-300 hover:text-white hover:underline transition-colors"
                      >
                        {linkKeys[k] || k}
                        <ArrowUpRight size={12} className="text-gray-400" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Family Members */}
            {familyMembers.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold text-gray-400">Family</h3>
                <div className="flex flex-wrap gap-2">
                  {familyMembers.map((m) => (
                    <Link
                      key={m.slug}
                      href={`/models/${m.slug}`}
                      className="text-sm text-gray-300 underline-offset-2 hover:text-white hover:underline"
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
                <h3 className="mb-2 text-xs uppercase tracking-wider font-semibold text-amber-400">Curator notes</h3>
                <p className="text-sm leading-relaxed text-gray-300 font-sans">{model.curatorNotes}</p>
              </div>
            )}

            {/* Compare CTA */}
            <Link
              href={`/compare?models=${model.slug}`}
              className="flex w-full items-center justify-center gap-1.5 rounded-md bg-white text-black py-2.5 text-sm font-semibold hover:bg-gray-200 transition-colors"
            >
              Compare specs <ChevronRight size={15} aria-hidden />
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

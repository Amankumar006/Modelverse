import type { Metadata } from "next";
import Link from "next/link";
import { getAllModelEntries, getAllDevelopers, SITE_URL } from "@/lib/models";
import ModelCatalog from "@/components/models/ModelCatalog";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Map key query param name to model entry keys for priority mapping
const FACET_PRIORITY = ["task", "developer", "type", "modality", "license", "deployment"];

function parseQueryParam(val: string | string[] | undefined): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.flatMap(v => v.split(","));
  return val.split(",");
}

function getActiveFacets(resolvedParams: Record<string, string | string[] | undefined>) {
  const facets: Record<string, string[]> = {};
  let activeCount = 0;

  for (const key of FACET_PRIORITY) {
    const queryKey = key === "task" ? "task" : key;
    const values = parseQueryParam(resolvedParams[queryKey]);
    if (values.length > 0) {
      facets[key] = values;
      activeCount++;
    }
  }

  return { facets, activeCount };
}

function getCanonicalUrl(facets: Record<string, string[]>) {
  // Priority: task > developer > type > modality > license > deployment
  for (const key of FACET_PRIORITY) {
    if (facets[key] && facets[key].length > 0) {
      const queryKey = key === "task" ? "task" : key;
      return `${SITE_URL}/models?${queryKey}=${encodeURIComponent(facets[key][0])}`;
    }
  }
  return `${SITE_URL}/models`;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const q = typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;
  const { facets, activeCount } = getActiveFacets(resolvedParams);

  // Canonical computation
  const canonicalUrl = getCanonicalUrl(facets);

  // Indexing rules:
  // - Noindex if search query q is active
  // - Noindex if 2 or more facets are active
  const isNoIndex = !!q || activeCount >= 2;

  // Title and Description based on active single facet
  let title = "Browse AI Models — Modelverse";
  let description = "Explore, filter, and compare the complete catalog of released AI models. Track parameters, context sizes, and licensing.";

  if (activeCount === 1 && !q) {
    const activeKey = FACET_PRIORITY.find(k => facets[k] && facets[k].length > 0)!;
    const val = facets[activeKey][0];

    if (activeKey === "task") {
      const taskNames: Record<string, string> = {
        "chat-reasoning": "Chat & Reasoning",
        "code-generation": "Code Generation",
        "image-generation": "Image Generation",
        "video-generation": "Video Generation",
        "audio-speech": "Audio & Speech",
        "embedding": "Embedding",
        "agentic": "Agentic",
        "multimodal-general": "Multimodal General",
        "translation": "Translation",
        "search-retrieval": "Search & Retrieval",
        "other": "Specialized",
      };
      const readable = taskNames[val] || val;
      title = `${readable} AI Models — Modelverse`;
      description = `Discover and compare ${readable.toLowerCase()} AI models. View verified benchmarks, open-weights licenses, parameters, and deployment formats.`;
    } else if (activeKey === "developer") {
      title = `${val} AI Models — Modelverse`;
      description = `Explore and compare all AI models developed by ${val}. View release dates, parameters, and licensing options.`;
    } else if (activeKey === "type") {
      const readableType = val === "open-weights" ? "Open-Weights" : val === "closed-source" ? "Closed-Source" : val === "api-only" ? "API-Only" : "Research Preview";
      title = `${readableType} AI Models — Modelverse`;
      description = `Browse the latest ${readableType.toLowerCase()} AI models. Track benchmarks, licenses, and deployment details.`;
    } else if (activeKey === "modality") {
      title = `${val.charAt(0).toUpperCase() + val.slice(1)} AI Models — Modelverse`;
      description = `Explore AI models supporting ${val} inputs and outputs. Compare benchmarks and model sizing.`;
    } else if (activeKey === "license") {
      title = `AI Models under ${val} License — Modelverse`;
      description = `Compare AI models released under the ${val} license. Review open-weights codebases and terms.`;
    } else if (activeKey === "deployment") {
      title = `${val.charAt(0).toUpperCase() + val.slice(1)} Deployment AI Models — Modelverse`;
      description = `Explore AI models optimized for ${val} deployment. View hardware requirements and sizes.`;
    }
  }

  return {
    title,
    description,
    robots: {
      index: !isNoIndex,
      follow: true,
    },
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/models`,
    },
  };
}

export default async function BrowsePage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const models = getAllModelEntries();
  const developers = getAllDevelopers();

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24">
      {/* ── Background Grid Accent ─────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/5 via-brand-pink/2 to-transparent pointer-events-none" />

      {/* ── Fixed Minimal Nav Back Link ─────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </div>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 mt-10 relative">
        <div className="border-b border-white/[0.06] pb-8 mb-8">
          <h1
            className="text-4xl sm:text-5xl font-normal tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Model <span className="italic text-white/50">Catalog</span>
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            A comprehensive, always-up-to-date registry of every released AI model.
            Filter by task, deployment type, or developer.
          </p>
        </div>

        {/* Catalog component (dense table + client filters) */}
        <ModelCatalog models={models} developers={developers} initialSearchParams={resolvedSearchParams} />
      </div>
    </main>
  );
}

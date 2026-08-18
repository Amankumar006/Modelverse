import type { Metadata } from "next";

import { getAllModelEntries, getAllDevelopers, SITE_URL } from "@/lib/models";
import ModelCatalog from "@/components/models/ModelCatalog";
import Navbar from "@/components/layout/Navbar";

export const revalidate = 60;

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

function getCanonicalUrl(facets: Record<string, string[]>, activeCount: number) {
  // Single active facet developer override
  if (activeCount === 1 && facets.developer && facets.developer.length === 1) {
    return `${SITE_URL}/models/developer/${encodeURIComponent(facets.developer[0])}`;
  }

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
  const canonicalUrl = getCanonicalUrl(facets, activeCount);

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
  const models = (await getAllModelEntries()).filter((m) => m.status !== "sunset");
  const developers = await getAllDevelopers();

  return (
    <main className="min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] pb-24 lg:pb-0 relative font-sans max-w-full flex flex-col">
      <div className="sticky top-0 z-50 shrink-0 border-b border-[var(--muted)]/10">
        <Navbar theme="dark" />
      </div>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 2xl:px-12 pt-4 flex-1 lg:min-h-0">
        {/* Catalog component */}
        <ModelCatalog models={models} developers={developers} initialSearchParams={resolvedSearchParams} />
      </div>
    </main>
  );
}

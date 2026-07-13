import type { Metadata } from "next";
import Link from "next/link";
import { getAllModels, getAllDevelopers, SITE_URL } from "@/lib/models";
import ModelCatalog from "@/components/models/ModelCatalog";
import { ChevronLeft } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Browse AI Models — Modelverse",
  description:
    "Explore, filter, and compare the complete catalog of released AI models. Track parameters, context size, licenses, and official sources.",
  alternates: {
    canonical: `${SITE_URL}/models`,
  },
  openGraph: {
    title: "Browse AI Models — Modelverse",
    description:
      "Explore, filter, and compare the complete catalog of released AI models.",
    url: `${SITE_URL}/models`,
  },
};

export default function BrowsePage() {
  const models = getAllModels();
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
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Model Catalog
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            A comprehensive, always-up-to-date registry of every released AI model.
            Filter by task, deployment type, or developer.
          </p>
        </div>

        {/* Catalog component (dense table + client filters) */}
        <ModelCatalog models={models} developers={developers} />
      </div>
    </main>
  );
}

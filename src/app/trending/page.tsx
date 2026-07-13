import type { Metadata } from "next";
import Link from "next/link";
import { getTrendingModels } from "@/lib/trending";
import { SITE_URL } from "@/lib/models";
import { ChevronLeft, Flame, Sparkle } from "lucide-react";
import JsonLd from "@/components/JsonLd";

// Revalidate every hour so the decay function is reflected in the static build
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Trending AI Models — Modelverse",
  description: "The top trending foundation AI models, ranked by a recency-decay scoring algorithm.",
  alternates: {
    canonical: `${SITE_URL}/trending`,
  },
  openGraph: {
    title: "Trending AI Models — Modelverse",
    description: "The top trending foundation AI models, ranked by a recency-decay scoring algorithm.",
    url: `${SITE_URL}/trending`,
  },
};

export default function TrendingPage() {
  const trendingModels = getTrendingModels(20);

  // Generate structured data for the list
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Trending AI Models",
    "description": "The top trending foundation AI models.",
    "itemListElement": trendingModels.map((model, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${SITE_URL}/models/${model.slug}`,
      "name": model.name
    }))
  };

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24">
      <JsonLd data={structuredData} />
      
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-orange/10 via-brand-pink/2 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-8 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1 mb-8"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
        
        <div className="border-b border-white/[0.06] pb-8 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1
              className="text-4xl sm:text-5xl font-normal tracking-tight text-white flex items-center gap-3"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
              }}
            >
              Trending <span className="italic text-white/50">Now</span>
            </h1>
            <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl leading-relaxed">
              Models with the highest current momentum, driven by recency and editorial curation.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-xs font-mono text-white/40 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
            <Flame size={14} className="text-brand-orange" />
            <span>Updated Hourly</span>
          </div>
        </div>

        <div className="space-y-4">
          {trendingModels.map((model, index) => (
            <Link
              key={model.id}
              href={`/models/${model.slug}`}
              className="group block rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-4 sm:p-5 transition-all duration-300 relative overflow-hidden"
            >
              {/* Rank Number */}
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none">
                <span className="text-6xl font-bold font-mono tracking-tighter italic">#{index + 1}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 relative z-10">
                <div className="max-w-[85%]">
                  <div className="flex items-center gap-2 mb-1">
                    {index < 3 && (
                      <Flame size={14} className="text-brand-orange shrink-0" strokeWidth={2} />
                    )}
                    <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
                      {model.developer}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight text-white/90 group-hover:text-white transition-colors">
                    {model.name}
                  </h3>
                  <p className="text-sm text-white/60 mt-2 line-clamp-2 max-w-2xl">
                    {model.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0">
                  <span className="text-xs font-mono text-brand-orange/80">
                    {new Date(model.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <div className="px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] uppercase tracking-widest text-white/50 font-semibold">
                    {model.type.replace("-", " ")}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

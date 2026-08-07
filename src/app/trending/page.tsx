import type { Metadata } from "next";
import { getTrendingModels } from "@/lib/trending";
import { SITE_URL } from "@/lib/models";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/layout/Navbar";
import TrendingClient from "@/components/trending/TrendingClient";

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

export default async function TrendingPage() {
  const trendingModels = await getTrendingModels(20);

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
    <main className="min-h-screen bg-[#F2EFE9] text-[#2E352B] selection:bg-[#2E352B] selection:text-[#F2EFE9] pb-24 font-sans antialiased relative">
      <JsonLd data={structuredData} />
      
      {/* Navbar with light theme to blend with linen background */}
      <div className="w-full">
        <Navbar theme="light" />
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24">
        {/* Style block for dimming hover logic */}
        <style dangerouslySetInnerHTML={{ __html: `
          .list-container:hover .list-item {
            opacity: 0.25;
          }
          .list-container .list-item:hover {
            opacity: 1;
          }
          .list-item .item-title {
            font-family: var(--font-serif), 'Cormorant Garamond', Georgia, serif;
          }
        `}} />

        <header className="fade-in flex flex-col sm:flex-row justify-between items-baseline gap-4 mb-16 sm:mb-24">
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#8C9485] font-semibold">
            Index 01—20 · Updated Hourly
          </div>
          <h1 className="text-[clamp(2.5rem,5vw,3rem)] font-light italic text-[#2E352B]" style={{ fontFamily: "var(--font-serif), serif" }}>
            Trending Now
          </h1>
        </header>

        <TrendingClient initialModels={trendingModels} />
      </div>
    </main>
  );
}

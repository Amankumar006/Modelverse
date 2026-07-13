import type { Metadata } from "next";
import HeroSection from "@/components/hero/HeroSection";
import ModelCard from "@/components/models/ModelCard";
import { getRecentModels, SITE_URL } from "@/lib/models";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Modelverse — Every AI Model, Every Release",
  description:
    "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships — a living, always-current archive.",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "Modelverse — Every AI Model, Every Release",
    description:
      "From frontier closed-source releases to open-weight breakthroughs, Modelverse tracks every model as it ships — a living, always-current archive.",
    url: SITE_URL,
    siteName: "Modelverse",
    images: [
      {
        url: `${SITE_URL}/images/hero-base.jpg`, // Base preview image
        width: 1200,
        height: 630,
        alt: "Modelverse catalog preview",
      },
    ],
  },
};

export default function Home() {
  const recentModels = getRecentModels(4);

  return (
    <main className="bg-black text-white selection:bg-brand-orange selection:text-white">
      {/* ── Hero Section ───────────────────────────────────── */}
      <HeroSection />

      {/* ── Recently Added Models Strip ────────────────────── */}
      <section className="relative py-20 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto border-t border-white/[0.06] z-50">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <h2
              className="text-2xl sm:text-3xl font-bold tracking-tight text-white"
              style={{
                fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
              }}
            >
              Recently Tracked
            </h2>
            <p className="text-sm text-white/50 mt-1.5">
              The latest open-weights breakthroughs and closed-source frontier releases.
            </p>
          </div>
          <Link
            href="/models"
            className="group inline-flex items-center gap-1.5 text-sm font-medium text-brand-orange hover:text-[#e85a28] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
          >
            Browse entire catalog
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Horizontal flex / grid cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recentModels.map((model) => (
            <ModelCard key={model.id} model={model} variant="card" />
          ))}
        </div>
      </section>
    </main>
  );
}

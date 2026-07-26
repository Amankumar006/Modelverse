import type { Metadata } from "next";
import Link from "next/link";
import { getAllModelEntries, SITE_URL } from "@/lib/models";
import { ChevronLeft } from "lucide-react";
import TimelineContainer from "@/components/timeline/TimelineContainer";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "AI Model Release Timeline & Changelog — Modelverse",
  description:
    "A chronological ledger of every notable AI model release. Follow open-weight and closed-source updates as they ship.",
  alternates: {
    canonical: `${SITE_URL}/timeline`,
  },
  openGraph: {
    title: "AI Model Release Timeline — Modelverse",
    description:
      "A chronological ledger of every notable AI model release. Follow open-weight and closed-source updates as they ship.",
    url: `${SITE_URL}/timeline`,
  },
};

export default function TimelinePage() {
  const models = getAllModelEntries(); // Already sorted newest-first by library

  return (
    <main className="min-h-screen bg-[#141414] text-[#E4E4E7] selection:bg-[#DA7756] selection:text-white pb-24 relative font-sans">
      {/* ── Top Hero Background Gradient ── */}
      <div className="absolute top-0 left-0 w-full h-[40vh] z-0 pointer-events-none select-none bg-gradient-to-b from-[#1C1C1E]/60 to-[#141414]" />

      {/* ── Fixed Minimal Nav Back Link ─────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors group focus-visible:outline-none rounded-lg px-2 py-1"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </div>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mt-6">
        <div className="border-b border-[#27272A] pb-8 mb-12">
          <h1 className="text-4xl sm:text-5xl font-serif font-normal tracking-tight text-[#F4F4F5]">
            Release Timeline
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            A chronological changelog of frontier developments. Follow model updates
            in order of their official release dates.
          </p>
          <div className="mt-4">
            <Link href="/archive" className="text-sm text-brand-orange hover:text-[#e85a28] hover:underline transition-colors font-medium">
              Prefer a plain list? View the archive &rarr;
            </Link>
          </div>
        </div>

        {/* ── Interactive Timeline Container ── */}
        <TimelineContainer initialModels={models} />
      </div>
    </main>
  );
}

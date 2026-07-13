import type { Metadata } from "next";
import Link from "next/link";
import { getAllModels, SITE_URL } from "@/lib/models";
import TypeBadge from "@/components/ui/TypeBadge";
import { ChevronLeft, Calendar } from "lucide-react";

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
  const models = getAllModels(); // Already sorted newest-first by library

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24 relative">
      {/* ── Background Grid Accent ─────────────────────────── */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-pink/5 via-brand-orange/2 to-transparent pointer-events-none" />

      {/* ── Fixed Minimal Nav Back Link ─────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Home
        </Link>
      </div>

      {/* ── Content Container ───────────────────────────────── */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-10 relative">
        <div className="border-b border-white/[0.06] pb-8 mb-12">
          <h1
            className="text-4xl sm:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Release Timeline
          </h1>
          <p className="mt-2 text-sm text-white/50 max-w-xl">
            A chronological changelog of frontier developments. Follow model updates
            in order of their official release dates.
          </p>
        </div>

        {/* ── Vertical Timeline ───────────────────────────────── */}
        <div className="relative border-l border-white/[0.08] ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-12">
          {models.map((model) => {
            const dateObj = new Date(model.releaseDate);
            const formattedDate = dateObj.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div key={model.id} className="relative group">
                {/* Timeline Circle Bullet */}
                <span className="absolute -left-[31px] sm:-left-[39px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black border border-white/20 group-hover:border-brand-orange group-hover:scale-110 transition-all">
                  <span className="h-1.5 w-1.5 rounded-full bg-white/40 group-hover:bg-brand-orange transition-colors" />
                </span>

                {/* Card Container */}
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.08] hover:bg-white/[0.03] transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <TypeBadge type={model.type} />
                      <span className="text-[11px] text-white/40 flex items-center gap-1">
                        <Calendar size={10} />
                        {formattedDate}
                      </span>
                    </div>

                    <h2
                      className="text-lg font-semibold text-white group-hover:text-brand-orange transition-colors"
                      style={{
                        fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
                      }}
                    >
                      {model.name}
                    </h2>

                    <p className="text-sm text-white/60 font-medium">Developed by {model.developer}</p>
                  </div>

                  <Link
                    href={`/models/${model.slug}`}
                    className="self-start sm:self-center text-xs text-white/50 hover:text-white border border-white/10 hover:border-white/30 px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    View Specs
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

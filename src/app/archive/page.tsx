import type { Metadata } from "next";
import Link from "next/link";
import { getAllModelEntries, SITE_URL } from "@/lib/models";
import { ChevronLeft, Sparkle } from "lucide-react";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Archive — Every AI Model Release, Chronologically — Modelverse",
  description: "A complete, static, chronologically ordered archive of every foundation AI model release tracked by Modelverse.",
  alternates: {
    canonical: `${SITE_URL}/archive`,
  },
  openGraph: {
    title: "Archive — Every AI Model Release, Chronologically",
    description: "A complete, static, chronologically ordered archive of every foundation AI model release tracked by Modelverse.",
    url: `${SITE_URL}/archive`,
  },
};

export default async function ArchivePage() {
  const models = await getAllModelEntries();
  
  // Group by month (e.g. "July 2026")
  const groupedModels: Record<string, typeof models> = {};
  
  models.forEach(model => {
    const dateObj = new Date(model.releaseDate);
    const monthYear = dateObj.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric"
    });
    
    if (!groupedModels[monthYear]) {
      groupedModels[monthYear] = [];
    }
    groupedModels[monthYear].push(model);
  });
  
  // The keys will be ordered correctly because models are already sorted descending
  // by releaseDate, and we iterate over them. But let's be safe:
  const monthKeys = Object.keys(groupedModels);

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-orange selection:text-white pb-24">
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-white/2 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 pt-8 relative z-10">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/80 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-lg px-2 py-1 mb-8"
        >
          <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
          Back to Timeline
        </Link>
        
        <div className="border-b border-white/[0.06] pb-8 mb-12">
          <h1
            className="text-4xl sm:text-5xl font-normal tracking-tight text-white"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Release <span className="italic text-white/50">Archive</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-white/60 max-w-xl leading-relaxed">
            A flat, chronological list of every model tracked in the Modelverse registry.
          </p>
        </div>

        <div className="space-y-16">
          {monthKeys.map((month) => (
            <section key={month} className="space-y-6">
              <h2 className="text-xl font-semibold text-white/80 border-b border-white/[0.04] pb-4 sticky top-0 bg-black/80 backdrop-blur-md z-20">
                {month}
              </h2>
              
              <div className="space-y-4">
                {groupedModels[month].map((model) => (
                  <Link
                    key={model.id}
                    href={`/models/${model.slug}`}
                    className={`block rounded-xl border transition-all duration-300 ${
                      model.featured 
                        ? "border-brand-orange/30 bg-brand-orange/[0.03] hover:bg-brand-orange/[0.05] p-5 sm:p-6 shadow-[0_0_20px_rgba(232,90,40,0.05)]" 
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] p-4 sm:p-5"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {model.featured && (
                            <Sparkle size={14} className="text-brand-orange shrink-0" strokeWidth={1.5} />
                          )}
                          <div className="text-xs font-mono text-white/50 uppercase tracking-wider">
                            {model.developer}
                          </div>
                        </div>
                        <h3 className={`font-semibold tracking-tight ${model.featured ? "text-xl text-white" : "text-lg text-white/90"}`}>
                          {model.name}
                        </h3>
                        <p className="text-sm text-white/60 mt-2 line-clamp-2 max-w-2xl">
                          {model.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0">
                        <span className="text-xs font-mono text-white/40">
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
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

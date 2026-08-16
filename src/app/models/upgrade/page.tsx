import React from "react";
import { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import { getAllModels, SITE_URL } from "@/lib/models";
import { ArrowRight, ArrowUpRight, Cpu, Layers } from "lucide-react";
import Link from "next/link";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Upgrade Paths & Model Migrations | Modelverse",
  description: "Navigate model migrations, deprecations, and recommended upgrade paths for frontier AI models.",
  alternates: {
    canonical: `${SITE_URL}/models/upgrade`,
  },
};

export default async function UpgradePathsPage() {
  const allModels = await getAllModels();

  // Find models that explicitly list a previousVersion
  const paths = allModels
    .filter((m) => m.previousVersion)
    .map((m) => {
      const prev = allModels.find((p) => p.slug === m.previousVersion);
      return { current: m, previous: prev };
    })
    .filter((p) => p.previous !== undefined);

  // Group by developer
  const groupedPaths = paths.reduce((acc, path) => {
    const dev = path.current.developer;
    if (!acc[dev]) acc[dev] = [];
    acc[dev].push(path);
    return acc;
  }, {} as Record<string, typeof paths>);

  // Sort developers alphabetically
  const developers = Object.keys(groupedPaths).sort();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased flex flex-col justify-between">
      <div>
        <Navbar theme="dark" />
        <main className="mx-auto w-full max-w-[1200px] px-4 md:px-6 py-12 md:py-16 space-y-16">
          <header className="space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight">
              Upgrade Paths
            </h1>
            <p className="text-lg text-[var(--muted)] leading-relaxed font-medium">
              Navigate model migrations, deprecations, and recommended upgrade paths. Ensure your applications are running on the most capable, cost-effective, and supported versions.
            </p>
          </header>

          <div className="space-y-16">
            {developers.map((dev) => (
              <section key={dev} className="space-y-6">
                <h2 className="text-2xl font-extrabold text-[var(--text)] border-b border-[var(--muted)]/10 pb-4">
                  {dev}
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {groupedPaths[dev].map((path, idx) => (
                    <div
                      key={idx}
                      className="rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative group transition-colors hover:border-[var(--muted)]/20"
                    >
                      {/* Legacy Model */}
                      <div className="flex-1 w-full p-4 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 opacity-70">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            Legacy / Previous
                          </span>
                          <Link href={`/models/${path.previous?.slug}`} className="block">
                            <h3 className="font-extrabold text-[var(--text)] hover:text-[var(--accent)] transition-colors">
                              {path.previous?.name}
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--muted)] mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <Cpu size={12} />
                              {path.previous?.parameters ? (typeof path.previous.parameters === "object" ? Object.values(path.previous.parameters)[0] : path.previous.parameters) : "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers size={12} />
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {path.previous?.contextWindow ? (typeof path.previous.contextWindow === "object" ? (path.previous.contextWindow as any).native : path.previous.contextWindow) : "—"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="shrink-0 text-[var(--muted)]/50 sm:rotate-0 rotate-90">
                        <ArrowRight size={24} />
                      </div>

                      {/* Current Model */}
                      <div className="flex-1 w-full p-4 rounded-[var(--radius-control)] bg-[var(--accent-soft)]/10 border border-[var(--accent)]/30">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">
                            Recommended Upgrade
                          </span>
                          <Link href={`/models/${path.current.slug}`} className="block">
                            <h3 className="font-extrabold text-[var(--accent)] hover:text-[var(--accent)]/80 transition-colors flex items-center gap-1.5">
                              {path.current.name}
                              <ArrowUpRight size={14} />
                            </h3>
                          </Link>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--text)] mt-2 font-mono">
                            <span className="flex items-center gap-1">
                              <Cpu size={12} />
                              {path.current.parameters ? (typeof path.current.parameters === "object" ? Object.values(path.current.parameters)[0] : path.current.parameters) : "—"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Layers size={12} />
                              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                              {path.current.contextWindow ? (typeof path.current.contextWindow === "object" ? (path.current.contextWindow as any).native : path.current.contextWindow) : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
            
            {developers.length === 0 && (
               <div className="text-[var(--muted)] text-sm">No recorded upgrade paths found in the current archive.</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

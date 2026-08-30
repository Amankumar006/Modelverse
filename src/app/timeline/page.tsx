import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { getModels } from "@/lib/supabase/models";
import TimelineContainer from "@/components/timeline/TimelineContainer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "AI Model Release Timeline & History — Modelverse",
  description:
    "A chronological ledger of foundation model releases, architecture updates, and lab launches.",
};

export default async function TimelinePage() {
  const { models } = await getModels({ limit: 100, isActive: true });

  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 flex flex-col gap-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Clock size={14} />
          <span>Chronological Ledger</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Release Timeline
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1.5 max-w-2xl leading-relaxed">
          Track the evolution of foundation AI models as they ship across frontier labs and open-source communities.
        </p>
      </div>

      {models.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--muted)]/10 p-8">
          <p className="text-sm font-semibold text-[var(--text)]">No model release history available yet</p>
          <p className="text-xs text-[var(--muted)] mt-1">Releases will appear here in chronological order.</p>
        </div>
      ) : (
        <TimelineContainer initialModels={models} />
      )}
    </main>
  );
}

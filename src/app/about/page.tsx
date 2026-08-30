import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Database, Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "About Modelverse — The Open Foundation Model Catalog",
  description:
    "Learn about Modelverse's mission to provide an open, transparent, and fact-checked archive of AI foundation models.",
};

export default function AboutPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 flex flex-col gap-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1 block">
          About
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          Democratizing AI Intelligence
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] mt-3 leading-relaxed max-w-2xl">
          Modelverse is a public, open-source intelligence catalog for AI researchers, engineers, and technology leaders. We index, verify, and document every foundation model and research breakthrough.
        </p>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Fact-Checked & Verified</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Every specification, context window, and benchmark is verified against primary laboratory documentation and whitepapers.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Real-Time Intelligence</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Automated tracking and editorial digests covering OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, and open-source labs.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Database size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Open-Access API</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Public Next.js and Supabase endpoints to programmatically query model parameters, pricing, and benchmark scores.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Layers size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Full Spectrum Coverage</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Frontier multimodal LLMs, specialized coding architectures, diffusion models, and open-weight checkpoints.
          </p>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-[var(--radius-card)] bg-[var(--accent-soft)]/20 border border-[var(--accent)]/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-[var(--text)]">Explore the Model Catalog</h3>
          <p className="text-xs text-[var(--muted)] mt-1">Browse and filter foundation models by parameters and context.</p>
        </div>
        <Link
          href="/models"
          className="px-5 py-2.5 rounded-[var(--radius-control)] bg-[var(--accent)] text-[var(--accent-contrast)] text-xs font-bold hover:opacity-90 transition-opacity shrink-0 flex items-center gap-1.5"
        >
          <span>Explore Catalog</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}

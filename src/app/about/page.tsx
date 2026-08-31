import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Database, Layers, Mail, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "About Modelverse — The Open Foundation Model Catalog",
  description:
    "Learn about Modelverse's mission to provide an open, transparent, and fact-checked archive of AI foundation models.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Modelverse — The Open Foundation Model Catalog",
    description:
      "Learn about Modelverse's mission to provide an open, transparent, and fact-checked archive of AI foundation models.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Modelverse — The Open Foundation Model Catalog",
    description:
      "Learn about Modelverse's mission to provide an open, transparent, and fact-checked archive of AI foundation models.",
  },
};

export default function AboutPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16 flex flex-col gap-10">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1 block">
          About &amp; Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          Democratizing AI Intelligence
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] mt-3 leading-relaxed max-w-2xl">
          Modelverse is an independent, open-source intelligence catalog for AI researchers, software engineers, and technology leaders. We index, verify, benchmark, and document every foundation model breakthrough.
        </p>
      </div>

      {/* Value Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <ShieldCheck size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Fact-Checked &amp; Verified</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Every specification, context window, and benchmark score is audited against primary laboratory documentation, research papers, and verified vendor API endpoints.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Sparkles size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Real-Time Intelligence</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Automated tracking and editorial digests covering OpenAI, Anthropic, Google DeepMind, Meta, DeepSeek, Mistral, and open-source research labs.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Database size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Open-Access API</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Public Next.js and Supabase endpoints to programmatically query model parameters, context architectures, pricing rates, and benchmark matrices.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-2.5">
          <div className="p-2 w-fit rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
            <Layers size={20} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Full Spectrum Coverage</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Frontier multimodal LLMs, reasoning models, specialized coding architectures, diffusion models, and open-weight checkpoints.
          </p>
        </div>
      </div>

      {/* Editorial Transparency & Contact Details for Compliance */}
      <div className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-[var(--shadow-card)] space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
          <CheckCircle2 size={16} />
          <span>Editorial Standards &amp; Contact Information</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Modelverse maintains strict editorial independence. Our benchmark figures and comparative metrics are algorithmically verified against published evaluation suites (MMLU, HumanEval, MATH, SWE-bench) without vendor favoritism.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[var(--text)]">
          <a
            href="mailto:contact@themodelverse.in"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/15 hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors font-medium cursor-pointer"
          >
            <Mail size={13} className="text-[var(--accent)]" />
            <span>contact@themodelverse.in</span>
          </a>
          <Link
            href="/methodology"
            className="inline-flex items-center gap-1 text-[var(--accent)] underline font-medium"
          >
            Read Our Benchmark Methodology →
          </Link>
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-8 rounded-[var(--radius-card)] bg-[var(--accent-soft)]/20 border border-[var(--accent)]/30 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
        <div>
          <h3 className="text-lg font-bold text-[var(--text)]">Explore the Model Catalog</h3>
          <p className="text-xs text-[var(--muted)] mt-1">Browse and filter 376+ foundation models by parameters and context.</p>
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

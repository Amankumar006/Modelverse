import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Award, ClipboardCheck, Sparkles, BookOpen, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Curation Methodology & LLM Benchmarking Standards",
  description:
    "Comprehensive whitepaper detailing TheModelverse's data provenance protocols, benchmark normalization algorithms, and foundation model taxonomy standards.",
  alternates: {
    canonical: "/methodology",
  },
  openGraph: {
    title: "Curation Methodology & LLM Benchmarking Standards | TheModelverse",
    description:
      "Comprehensive whitepaper detailing TheModelverse's data provenance protocols, benchmark normalization algorithms, and foundation model taxonomy standards.",
    url: "/methodology",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curation Methodology & LLM Benchmarking Standards | TheModelverse",
    description:
      "Comprehensive whitepaper detailing TheModelverse's data provenance protocols, benchmark normalization algorithms, and foundation model taxonomy standards.",
  },
};

const GLOSSARY_TERMS = [
  {
    term: "Multi-Head Latent Attention (MLA)",
    desc: "An attention compression architecture that projects Key and Value vectors into a low-dimensional latent subspace during inference, reducing KV-cache memory footprints by over 80% while retaining full contextual attention fidelity.",
  },
  {
    term: "Sparse Mixture-of-Experts (MoE)",
    desc: "A neural routing architecture where only a subset of specialized feed-forward expert networks are activated per token, delivering the knowledge capacity of massive parameter topologies at a fraction of active compute cost.",
  },
  {
    term: "Group Relative Policy Optimization (GRPO)",
    desc: "A reinforcement learning algorithm that removes the need for a separate critic model by computing relative policy advantages across sampled group trajectories, drastically improving mathematical and coding reasoning stability.",
  },
  {
    term: "SWE-bench Verified",
    desc: "An automated software engineering evaluation benchmark comprising 500 validated GitHub issues from real-world Python repositories, measuring an agent's ability to locate bugs, modify multi-file codebases, and pass unit test suites.",
  },
];

export default function MethodologyPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 flex flex-col gap-10">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Sparkles size={14} />
          <span>Research Standards &amp; Data Provenance</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-[var(--text)] tracking-tight">
          Curation &amp; Benchmarking Methodology
        </h1>
        <p className="text-sm sm:text-base text-[var(--muted)] mt-2 max-w-2xl leading-relaxed">
          The rigorous architectural framework and normalization protocols used by TheModelverse to audit foundation model metrics, eliminate marketing bias, and ensure absolute reproducibility.
        </p>
      </div>

      {/* Core Principles Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3">
          <div className="p-2.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
            <Database size={18} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Primary Source Auditing</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            All parameters, dense vs MoE configurations, context window limits, and tokenization rates are parsed directly from official research papers, open-source model weights, and vendor API headers.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3">
          <div className="p-2.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
            <ShieldCheck size={18} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Open License Integrity</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Open-weight models are categorized according to OSI standards. Commercial usage thresholds, monthly active user caps, and derivative distillation clauses are explicitly audited.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3">
          <div className="p-2.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
            <Award size={18} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Benchmark Normalization</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Reasoning and coding scores (MMLU-Pro, GPQA Diamond, HumanEval+, SWE-bench) are normalized to standard zero-shot / few-shot configurations without prompt engineering favoritism.
          </p>
        </div>
      </div>

      {/* 4-Step Verification Workflow */}
      <section className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
        <div className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
          <ClipboardCheck className="text-[var(--accent)]" size={20} />
          <h2>The 4-Step TheModelverse Audit Pipeline</h2>
        </div>

        <div className="space-y-4">
          {[
            {
              step: "01",
              title: "Automated Ingestion & Release Discovery",
              desc: "Collectors continuously monitor ArXiv preprints, Hugging Face Hub releases, GitHub repository commits, and major AI laboratory release feeds to catalog new foundation models the hour they are announced.",
            },
            {
              step: "02",
              title: "Specification & Context Architecture Audit",
              desc: "Our technical team reviews architecture documentation, distinguishing between total versus active parameters, dense transformer layers, tokenizer vocabulary sizes, and maximum context lengths.",
            },
            {
              step: "03",
              title: "Zod Schema Type Validation & Pricing Sync",
              desc: "Extracted attributes pass through strict TypeScript and Zod schemas, standardizing input/output token pricing per 1M tokens, modality vectors, and verifiable benchmark matrices.",
            },
            {
              step: "04",
              title: "Static Route Compilation & Continuous Revalidation",
              desc: "Verified models are compiled into pre-rendered static routes across edge regions, with automated revalidation jobs re-verifying endpoint status and documentation updates.",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="flex items-start gap-4 p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10"
            >
              <span className="text-sm font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-[var(--radius-pill)] tabular-nums">
                {item.step}
              </span>
              <div>
                <h3 className="font-bold text-sm text-[var(--text)]">{item.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundation Model Architectural Glossary */}
      <section id="glossary" className="space-y-6 pt-6 border-t border-[var(--muted)]/10">
        <div className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
          <BookOpen className="text-[var(--accent)]" size={20} />
          <h2>Foundation Model Architecture Glossary</h2>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          Standardized definitions of key architectural paradigms and evaluation suites referenced throughout TheModelverse Foundation Model Catalog.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GLOSSARY_TERMS.map((g) => (
            <div
              key={g.term}
              className="p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] border border-[var(--muted)]/10 shadow-sm space-y-2"
            >
              <h3 className="text-xs font-bold text-[var(--accent)] uppercase tracking-wider">
                {g.term}
              </h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">{g.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editorial Independence & Anti-Bias Statement */}
      <section className="p-6 sm:p-8 rounded-[var(--radius-card)] bg-[var(--accent-soft)]/20 border border-[var(--accent)]/30 space-y-3">
        <div className="flex items-center gap-2 text-sm font-bold text-[var(--text)]">
          <Scale size={18} className="text-[var(--accent)]" />
          <h2>Commitment to Editorial Independence</h2>
        </div>
        <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed">
          TheModelverse accepts no financial compensation or vendor sponsorship in exchange for higher catalog rankings, biased benchmark scores, or favorable architectural reviews. All comparisons reflect standardized evaluation suites and verifiable primary sources.
        </p>
      </section>
    </main>
  );
}

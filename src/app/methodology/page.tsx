import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck, Database, Award, ClipboardCheck, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Curation Methodology & Fact-Checking Standards — Modelverse",
  description:
    "How Modelverse fact-checks model specifications, verifies benchmark evaluations, and maintains data integrity.",
};

export default function MethodologyPage() {
  return (
    <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-14 flex flex-col gap-10">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors font-medium mb-4"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1">
          <Sparkles size={14} />
          <span>Editorial Integrity</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text)] tracking-tight">
          Curation & Verification Methodology
        </h1>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-2 max-w-2xl leading-relaxed">
          How we extract verified specifications, audit benchmark numbers, and eliminate marketing bias from the foundation model directory.
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
            Parameter numbers, context window limits, and architecture layers are extracted directly from official research papers, Hugging Face model cards, and vendor API headers.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3">
          <div className="p-2.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
            <ShieldCheck size={18} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">License Integrity</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Open-weight models are categorized according to OSI standards. Any custom commercial caps (e.g. monthly active users) are explicitly labeled for enterprise compliance.
          </p>
        </div>

        <div className="p-6 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3">
          <div className="p-2.5 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
            <Award size={18} />
          </div>
          <h3 className="font-bold text-base text-[var(--text)]">Verified Benchmarks</h3>
          <p className="text-xs text-[var(--muted)] leading-relaxed">
            Coding, reasoning, and math scores (MMLU, GPQA, MATH, HumanEval) are recorded with full evaluation methodology and citations.
          </p>
        </div>
      </div>

      {/* 4-Step Verification Workflow */}
      <section className="space-y-6 pt-4 border-t border-[var(--muted)]/10">
        <div className="flex items-center gap-2 text-lg font-bold text-[var(--text)]">
          <ClipboardCheck className="text-[var(--accent)]" size={20} />
          <span>The 4-Step Audit Pipeline</span>
        </div>

        <div className="space-y-4">
          {[
            {
              step: "01",
              title: "Automated Discovery",
              desc: "Continuous ingestion collectors poll ArXiv preprints, Hugging Face trending hubs, and lab announcement feeds to register releases the moment they drop.",
            },
            {
              step: "02",
              title: "Specification Verification",
              desc: "Engineers audit architecture parameters, dense vs MoE configurations, context window boundaries, and pricing tables.",
            },
            {
              step: "03",
              title: "Zod Schema Type Validation",
              desc: "Extracted model attributes are passed through strict TypeScript/Zod schemas to ensure standardized pricing and benchmark types.",
            },
            {
              step: "04",
              title: "Static Route Compilation",
              desc: "Verified models are compiled into pre-rendered static routes and deployed to edge nodes for sub-millisecond retrieval.",
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
                <h4 className="font-bold text-sm text-[var(--text)]">{item.title}</h4>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Database, Award, ClipboardCheck, Sparkles } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function MethodologyPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 0);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", handleScroll); };
  }, []);

  const bgY = mounted ? scrollY * 0.2 : 0;
  const textY = mounted ? scrollY * 0.45 : 0;

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen relative font-sans select-none">
      <div className="absolute top-0 left-0 w-full z-[100]">
        <Navbar theme="dark" />
      </div>

      {/* Hero Section */}
      <header className="relative h-[55vh] w-full flex justify-center items-center overflow-hidden border-b border-[var(--muted)]/10">
        <div
          className="absolute top-0 left-0 w-full h-[120%] bg-[url('/images/about-bg.jpg')] bg-cover bg-center will-change-transform z-[1] opacity-30"
          style={{
            transform: `translate3d(0, ${bgY}px, 0)`,
          }}
        />

        <div
          className="absolute inset-0 z-[3] flex flex-col justify-center items-center text-center px-4 will-change-transform pt-12"
          style={{
            transform: `translate3d(0, ${textY}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-[var(--accent)] mb-3 bg-[var(--accent-soft)] px-3 py-1 rounded-[var(--radius-pill)] border border-[var(--accent)]/20">
            <Sparkles size={12} />
            <span>Editorial Standards</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4rem)] font-extrabold tracking-tight text-[var(--text)] leading-none">
            Our Methodology
          </h1>
          <p className="text-sm text-[var(--muted)] mt-4 max-w-xl leading-relaxed font-medium">
            How we fact-check specifications, verify benchmark assertions, and maintain our index free from marketing hype.
          </p>
        </div>
      </header>

      {/* Content Section */}
      <section className="relative z-30 bg-[var(--bg)] px-6 md:px-12 py-16 text-center max-w-6xl mx-auto space-y-16">
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[var(--accent)] border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-5 py-2.5 rounded-[var(--radius-pill)] shadow-sm hover:scale-105 transition-all"
          >
            <ChevronLeft size={12} />
            Back to Home
          </Link>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          <div className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-4">
            <div className="p-3 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">Primary Source Verification</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              We extract parameter counts, structural features, and context lengths exclusively from official release documentation, whitepapers, codebases, or directly from API response headers.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-4">
            <div className="p-3 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">License Classification</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              Open-weights models are evaluated against OSI definitions. If a license imposes custom commercial restrictions, it is categorized with strict clarity so commercial creators stay legally secure.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-4">
            <div className="p-3 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">Reproducible Benchmarks</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              Coding and reasoning evaluations are cataloged only when published alongside structured code repositories or verifiable logs.
            </p>
          </div>
        </div>

        {/* Audit Pipeline */}
        <div className="max-w-4xl mx-auto text-left space-y-8 pt-6">
          <h3 className="text-[clamp(1.5rem,3vw,1.875rem)] font-extrabold tracking-tight text-[var(--text)] border-b border-[var(--muted)]/10 pb-4 flex items-center gap-2">
            <ClipboardCheck className="text-[var(--accent)]" />
            Curation Pipeline
          </h3>
          
          <div className="space-y-6">
            {[
              {
                step: "01",
                title: "Discovery & Ingestion",
                desc: "Our automated monitoring engines parse academic papers on arXiv, index cards on Hugging Face, and developer announcement channels daily to register new model assets the moment they land."
              },
              {
                step: "02",
                title: "Fact-Check & Parameter Audit",
                desc: "A curator reviews the newly listed model's architectural specifications, verifying model type (open weights vs. API), context capacities, parameter sizes, and structural layers to ensure database integrity."
              },
              {
                step: "03",
                title: "Zod Schema Validation",
                desc: "All extracted specifications are structured into our TypeScript-verified schemas. The compilation suite validates pricing specifications, task modalities, and parameter tags to maintain strict consistency."
              },
              {
                step: "04",
                title: "Static Route Compilation",
                desc: "Validated model models compile statically into pre-rendered routes, ensuring the comparison lists and indices remain lightning-fast and highly secure for developers referencing them daily."
              }
            ].map((p) => (
              <div key={p.step} className="flex gap-4 items-start p-4 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10">
                <span className="text-xl font-mono font-bold text-[var(--accent)] bg-[var(--accent-soft)] px-3 py-1 rounded-[var(--radius-pill)] border border-[var(--accent)]/20 select-none tabular-nums">
                  {p.step}
                </span>
                <div>
                  <h4 className="font-bold text-[var(--text)] text-base">{p.title}</h4>
                  <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed font-normal">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

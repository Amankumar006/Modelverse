"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Database, Award, ClipboardCheck, Sparkle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function MethodologyPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const bgY = mounted ? scrollY * 0.2 : 0;
  const textY = mounted ? scrollY * 0.45 : 0;

  return (
    <div className="bg-[#0C120F] text-[#E2E8E4] min-h-screen relative font-sans overflow-x-hidden select-none">
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full z-[100]">
        <Navbar theme="dark" />
      </div>

      {/* Hero Section */}
      <header className="relative h-[60vh] w-full flex justify-center items-center overflow-hidden border-b border-[#243629]">
        {/* Parallax Overlay Background */}
        <div
          className="absolute top-0 left-0 w-full h-[120%] bg-[linear-gradient(to_bottom,rgba(12,18,15,0.8),rgba(12,18,15,0.95)),url('/images/about-bg.jpg')] bg-cover bg-center will-change-transform z-[1]"
          style={{
            transform: `translate3d(0, ${bgY}px, 0)`,
          }}
        />

        {/* Text */}
        <div
          className="absolute inset-0 z-[3] flex flex-col justify-center items-center text-center px-4 will-change-transform pt-16"
          style={{
            transform: `translate3d(0, ${textY}px, 0)`,
          }}
        >
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4ADE80] mb-4">
            <Sparkle size={12} strokeWidth={2} />
            <span>Editorial Standards</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[#E2E8E4] leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Our Methodology
          </h1>
          <p className="text-sm text-[#8C9E91] mt-4 max-w-xl leading-[1.6]">
            How we fact-check specifications, verify benchmark assertions, and maintain our index free from marketing hype.
          </p>
        </div>
      </header>

      {/* Content Section */}
      <section className="relative z-30 bg-[#0C120F] px-6 md:px-12 py-16 text-center max-w-6xl mx-auto space-y-20">
        
        {/* Back Link */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C9E91] hover:text-[#E2E8E4] transition-colors border border-[#243629] bg-[#121A15] px-5 py-2.5 rounded-full backdrop-blur-sm shadow-md hover:border-[#334D3A]"
          >
            <ChevronLeft size={12} />
            Back to Home
          </Link>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
          <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-4 hover:border-[#334D3A] transition-colors">
            <div className="p-3 rounded-xl bg-[#1A261D] text-[#4ADE80] w-fit shadow-inner">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Primary Source Verification</h3>
            <p className="text-sm text-[#8C9E91] leading-relaxed">
              We extract parameter counts, structural features, and context lengths exclusively from official release documentation, whitepapers, codebases, or directly from API response headers. We ignore third-party leaks and rumors.
            </p>
          </div>

          <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-4 hover:border-[#334D3A] transition-colors">
            <div className="p-3 rounded-xl bg-[#1A261D] text-[#4ADE80] w-fit shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">License Classification</h3>
            <p className="text-sm text-[#8C9E91] leading-relaxed">
              Open-weights models are evaluated against OSI definitions. If a license imposes custom commercial restrictions (e.g., LLaMA, Mistral Research, or DeepSeek limits), it is categorized with strict clarity so commercial creators stay legally secure.
            </p>
          </div>

          <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-4 hover:border-[#334D3A] transition-colors">
            <div className="p-3 rounded-xl bg-[#1A261D] text-[#4ADE80] w-fit shadow-inner">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Reproducible Benchmarks</h3>
            <p className="text-sm text-[#8C9E91] leading-relaxed">
              Coding and reasoning evaluations (e.g., SWE-Bench, Aider Polyglot, and GPQA) are cataloged only when published alongside structured code repositories or verifiable logs. Self-reported marketing evaluations are excluded from row-highlights.
            </p>
          </div>
        </div>

        {/* Audit Pipeline */}
        <div className="max-w-4xl mx-auto text-left space-y-8 pt-8">
          <h3 className="text-2xl font-bold tracking-tight text-white border-b border-[#243629] pb-4 flex items-center gap-2">
            <ClipboardCheck className="text-[#4ADE80]" />
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
              <div key={p.step} className="flex gap-4 items-start">
                <span className="text-2xl font-mono font-bold text-[#4ADE80] bg-[#1A261D] px-3 py-1 rounded-lg border border-[#243629] select-none">
                  {p.step}
                </span>
                <div>
                  <h4 className="font-semibold text-white text-base">{p.title}</h4>
                  <p className="text-sm text-[#8C9E91] mt-1.5 leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </div>
  );
}

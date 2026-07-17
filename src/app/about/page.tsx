"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ShieldCheck, Database, Award } from "lucide-react";
import Navbar from "@/components/layout/Navbar";

export default function AboutPage() {
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
  const fgY = mounted ? scrollY * 0.1 : 0;

  return (
    <div className="bg-[#0C120F] text-[#E2E8E4] min-h-screen relative font-sans overflow-x-hidden select-none">
      {/* ── Global Navigation ── */}
      <div className="absolute top-0 left-0 w-full z-[100]">
        <Navbar theme="dark" />
      </div>

      {/* ── Hero Parallax Section ── */}
      <header className="relative h-screen w-full flex justify-center items-center overflow-hidden">
        {/* Background Layer */}
        <div
          className="absolute top-0 left-0 w-full h-[110%] bg-[url('/images/about-bg.jpg')] bg-cover bg-center will-change-transform z-[1]"
          style={{
            transform: `translate3d(0, ${bgY}px, 0)`,
          }}
        />

        {/* Dark Overlay Gradient for Top-Half Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-transparent pointer-events-none z-[2]" />

        {/* Text Layer */}
        <div
          className="absolute inset-0 z-[3] flex flex-col justify-center items-center text-center px-4 will-change-transform"
          style={{
            transform: `translate3d(0, ${textY}px, 0)`,
          }}
        >
          <div className="w-[85%] max-w-5xl flex justify-between text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[#E2E8E4] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] mb-8 md:mb-16">
            <span>Elegance in Curation</span>
            <span>Every Model. Every Release.</span>
          </div>
          <h1
            className="text-6xl sm:text-8xl md:text-[9.5vw] font-extrabold tracking-tight text-[#E2E8E4] leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)]"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Modelverse
          </h1>
        </div>

        {/* Foreground Layer / Gradient Blend */}
        <div
          className="absolute inset-0 z-[4] pointer-events-none will-change-transform"
          style={{
            transform: `translate3d(0, ${fgY}px, 0)`,
          }}
        />
        <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-b from-transparent to-[#0C120F] z-[5]" />
      </header>

      {/* ── Content Section ── */}
      <section className="relative z-30 bg-[#0C120F] px-6 md:px-12 py-16 md:py-24 text-center max-w-6xl mx-auto space-y-20">

        {/* Back Nav Link */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C9E91] hover:text-[#E2E8E4] transition-colors border border-[#243629] bg-[#121A15] px-5 py-2.5 rounded-full backdrop-blur-sm shadow-md hover:border-[#334D3A]"
          >
            <ChevronLeft size={12} />
            Back to Home
          </Link>
        </div>

        <p className="max-w-3xl mx-auto text-lg md:text-2xl leading-relaxed text-[#F0FDF4] font-medium drop-shadow-sm">
          Explore distinguished foundation models, iconic architectures, and meticulously curated metrics across the globe's most advanced artificial intelligence research.
        </p>

        {/* Glassmorphic Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-6">
          <div className="bg-[#121A15] backdrop-blur-sm border border-[#243629] hover:border-[#334D3A] p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] space-y-4">
            <div className="p-3 rounded-xl bg-[#1A261D] text-[#4ADE80] w-fit shadow-inner">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#E2E8E4] tracking-tight">Fact-Checked Data</h3>
            <p className="text-sm text-[#8C9E91] leading-relaxed font-normal">
              We ignore marketing hype. Every parameter count, context length, and license type is extracted directly from official research papers and primary source code.
            </p>
          </div>

          <div className="bg-[#121A15] backdrop-blur-sm border border-[#243629] hover:border-[#334D3A] p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] space-y-4">
            <div className="p-3 rounded-xl bg-[#1A261D] text-[#4ADE80] w-fit shadow-inner">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#E2E8E4] tracking-tight">License Clarity</h3>
            <p className="text-sm text-[#8C9E91] leading-relaxed font-normal">
              We strictly audit open weights vs. open-source terms, custom commercial licenses, and restricted API boundaries so you build with legal confidence.
            </p>
          </div>

          <div className="bg-[#121A15] backdrop-blur-sm border border-[#243629] hover:border-[#334D3A] p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] space-y-4">
            <div className="p-3 rounded-xl bg-[#1A261D] text-[#4ADE80] w-fit shadow-inner">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-bold text-[#E2E8E4] tracking-tight">Verified Benchmarks</h3>
            <p className="text-sm text-[#8C9E91] leading-relaxed font-normal">
              Scores are stamped as verified only when published alongside reproducible code or standardized datasets, keeping our records fully scientific.
            </p>
          </div>
        </div>

        {/* ── Curation Pipeline ── */}
        <div className="space-y-12 max-w-5xl mx-auto pt-10 text-left">
          <div className="text-center space-y-2">
            <h3 className="text-xl md:text-3xl font-bold tracking-tight">The Curation Pipeline</h3>
            <p className="text-sm text-[#8C9E91] max-w-xl mx-auto">
              How model specifications go from raw research papers to a verified entry in our catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-3 relative overflow-hidden hover:border-[#334D3A] transition-colors">
              <span className="absolute right-4 top-2 text-6xl font-black text-[#1A261D] select-none pointer-events-none">01</span>
              <h4 className="text-base font-bold text-[#E2E8E4]">1. Discovery</h4>
              <p className="text-xs text-[#8C9E91] leading-relaxed font-normal">
                We monitor research preprints, Hugging Face repositories, and developers' release calendars to catch new foundation models the moment they land.
              </p>
            </div>

            <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-3 relative overflow-hidden hover:border-[#334D3A] transition-colors">
              <span className="absolute right-4 top-2 text-6xl font-black text-[#1A261D] select-none pointer-events-none">02</span>
              <h4 className="text-base font-bold text-[#E2E8E4]">2. Audit</h4>
              <p className="text-xs text-[#8C9E91] leading-relaxed font-normal">
                Curators cross-reference parameter claims, licensing terms, and evaluation criteria with primary technical documentations to root out unverified claims.
              </p>
            </div>

            <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-3 relative overflow-hidden hover:border-[#334D3A] transition-colors">
              <span className="absolute right-4 top-2 text-6xl font-black text-[#1A261D] select-none pointer-events-none">03</span>
              <h4 className="text-base font-bold text-[#E2E8E4]">3. Schema Check</h4>
              <p className="text-xs text-[#8C9E91] leading-relaxed font-normal">
                Specifications are structured into a Zod-verified JSON model scheme, ensuring exact parameters, license, and deployment values match global standards.
              </p>
            </div>

            <div className="bg-[#121A15] border border-[#243629] p-6 rounded-2xl space-y-3 relative overflow-hidden hover:border-[#334D3A] transition-colors">
              <span className="absolute right-4 top-2 text-6xl font-black text-[#1A261D] select-none pointer-events-none">04</span>
              <h4 className="text-base font-bold text-[#E2E8E4]">4. Static Build</h4>
              <p className="text-xs text-[#8C9E91] leading-relaxed font-normal">
                Once validated, the entry is compiled into a static webpage route, providing fast, secure, and permanent tracking for developer reference.
              </p>
            </div>
          </div>
        </div>


        <h2
          className="max-w-4xl mx-auto text-2xl md:text-[2.75rem] leading-tight font-medium text-[#F0FDF4] pt-8"
          style={{
            fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
          }}
        >
          We present refined model profiles that merge remarkable design, prime surroundings, and relentless curation. <span className="text-[#8C9E91] italic">Each release is cataloged for the experience it delivers, not merely the footprint it occupies.</span>
        </h2>
      </section>

      {/* ── Marquee Section ── */}
      <section className="relative z-30 w-full overflow-hidden py-10 bg-[#121A15] border-y border-[#243629]">
        <div className="flex w-max animate-marquee-left">
          <div className="flex gap-16 px-8 text-sm md:text-base font-semibold uppercase tracking-widest text-[#8C9E91]">
            <span>★ Chat Reasoning</span>
            <span>★ Code Generation</span>
            <span>★ Image Synthesis</span>
            <span>★ Video Simulation</span>
            <span>★ Audio & Speech</span>
            <span>★ Agentic Workflows</span>
            <span>★ Dense Embeddings</span>
            <span>★ Multimodal General</span>
          </div>
          {/* Loop copy */}
          <div className="flex gap-16 px-8 text-sm md:text-base font-semibold uppercase tracking-widest text-[#8C9E91]" aria-hidden="true">
            <span>★ Chat Reasoning</span>
            <span>★ Code Generation</span>
            <span>★ Image Synthesis</span>
            <span>★ Video Simulation</span>
            <span>★ Audio & Speech</span>
            <span>★ Agentic Workflows</span>
            <span>★ Dense Embeddings</span>
            <span>★ Multimodal General</span>
          </div>
        </div>
      </section>

      {/* ── Stats Section (Seamless full-bleed blend) ── */}
      <section className="relative z-30 bg-[url('/images/stats-bg.png')] bg-cover bg-[position:center_25%] text-[#E2E8E4] px-6 md:px-12 py-32 md:py-44 text-center overflow-hidden">
        {/* Top Blend from Background */}
        <div className="absolute top-0 left-0 w-full h-[15vh] bg-gradient-to-b from-[#0C120F] to-transparent z-[2] pointer-events-none" />

        {/* Dark Translucent Overlay for High Legibility over background image */}
        <div className="absolute inset-0 bg-[#0C120F]/60 z-[1] pointer-events-none" />

        {/* Bottom Blend to Background */}
        <div className="absolute bottom-0 left-0 w-full h-[20vh] bg-gradient-to-t from-[#0C120F] to-transparent z-[2] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto">
          <h2
            className="text-2xl md:text-4xl font-semibold mb-16 text-[#F0FDF4] drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
            style={{
              fontFamily: "var(--font-display, ui-sans-serif, system-ui, sans-serif)",
            }}
          >
            Proven Curation Results
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="border-r border-[#243629] last:border-r-0 px-4">
              <div className="text-4xl md:text-6xl font-extrabold text-[#4ADE80] mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">45+</div>
              <div className="text-xs md:text-sm text-[#8C9E91] uppercase tracking-wider font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Models Tracked</div>
            </div>
            <div className="border-r border-[#243629] last:border-r-0 md:last:border-r-0 px-4">
              <div className="text-4xl md:text-6xl font-extrabold text-[#4ADE80] mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">18+</div>
              <div className="text-xs md:text-sm text-[#8C9E91] uppercase tracking-wider font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">AI Labs Listed</div>
            </div>
            <div className="border-r border-[#243629] last:border-r-0 px-4">
              <div className="text-4xl md:text-6xl font-extrabold text-[#4ADE80] mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">100%</div>
              <div className="text-xs md:text-sm text-[#8C9E91] uppercase tracking-wider font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Human Verified</div>
            </div>
            <div className="px-4">
              <div className="text-4xl md:text-6xl font-extrabold text-[#4ADE80] mb-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">0</div>
              <div className="text-xs md:text-sm text-[#8C9E91] uppercase tracking-wider font-bold drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">Speculative Catalog Listings</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

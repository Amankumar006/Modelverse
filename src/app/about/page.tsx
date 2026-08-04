"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ShieldCheck, Database, Award } from "lucide-react";
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

  return (
    <div className="bg-[var(--bg)] text-[var(--text)] min-h-screen relative font-sans select-none">
      <div className="absolute top-0 left-0 w-full z-[100]">
        <Navbar theme="dark" />
      </div>

      {/* Hero Section */}
      <header className="relative h-[65vh] sm:h-[75vh] w-full flex justify-center items-center overflow-hidden border-b border-[var(--muted)]/10">
        <div
          className="absolute top-0 left-0 w-full h-[110%] bg-[url('/images/about-bg.jpg')] bg-cover bg-center will-change-transform z-[1] opacity-40"
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
          <div className="w-[85%] max-w-5xl flex justify-between text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-[var(--accent)] mb-6">
            <span>Elegance in Curation</span>
            <span>Every Model. Every Release.</span>
          </div>
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-extrabold tracking-tight text-[var(--text)] leading-none">
            Modelverse
          </h1>
          <p className="text-[clamp(0.875rem,2.5vw,1rem)] text-[var(--muted)] mt-4 max-w-xl font-medium">
            Independent, human-verified registry of foundation AI models, benchmarks, and licensing.
          </p>
        </div>
      </header>

      {/* Content Section */}
      <section className="relative z-30 bg-[var(--bg)] px-6 md:px-12 py-16 md:py-24 text-center max-w-6xl mx-auto space-y-16">
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-[var(--accent)] border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-5 py-2.5 rounded-[var(--radius-pill)] shadow-sm hover:scale-105 transition-all"
          >
            <ChevronLeft size={12} />
            Back to Home
          </Link>
        </div>

        <p className="max-w-3xl mx-auto text-[clamp(1.125rem,3vw,1.5rem)] leading-relaxed text-[var(--text)] font-semibold">
          Explore distinguished foundation models, iconic architectures, and meticulously curated metrics across the globe&apos;s most advanced artificial intelligence research.
        </p>

        {/* Core Principles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-4">
          <div className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-4">
            <div className="p-3 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
              <Database size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">Fact-Checked Data</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              We ignore marketing hype. Every parameter count, context length, and license type is extracted directly from official research papers and primary source code.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-4">
            <div className="p-3 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">License Clarity</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              We strictly audit open weights vs. open-source terms, custom commercial licenses, and restricted API boundaries so you build with legal confidence.
            </p>
          </div>

          <div className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-4">
            <div className="p-3 rounded-[var(--radius-pill)] bg-[var(--accent-soft)] text-[var(--accent)] w-fit">
              <Award size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-[var(--text)] tracking-tight">Verified Benchmarks</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              Scores are stamped as verified only when published alongside reproducible code or standardized datasets, keeping our records fully scientific.
            </p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="space-y-10 max-w-5xl mx-auto pt-10 text-left">
          <div className="text-center space-y-2">
            <h3 className="text-[clamp(1.5rem,4vw,1.875rem)] font-extrabold tracking-tight text-[var(--text)]">The Curation Pipeline</h3>
            <p className="text-[clamp(0.875rem,2vw,1rem)] text-[var(--muted)] max-w-xl mx-auto font-medium">
              How model specifications go from raw research papers to a verified entry in our catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "1. Discovery", desc: "We monitor research preprints, Hugging Face repositories, and developers' release calendars to catch new foundation models." },
              { step: "02", title: "2. Audit", desc: "Curators cross-reference parameter claims, licensing terms, and evaluation criteria with primary technical documentations." },
              { step: "03", title: "3. Schema Check", desc: "Specifications are structured into a Zod-verified JSON model scheme, ensuring parameters and license tags match global standards." },
              { step: "04", title: "4. Static Build", desc: "Once validated, entries compile into static routes, providing fast, secure, and permanent tracking for developer reference." },
            ].map((item) => (
              <div key={item.step} className="bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 p-6 rounded-[var(--radius-card)] space-y-3 relative overflow-hidden">
                <span className="absolute right-4 top-2 text-5xl font-black text-[var(--muted)]/10 select-none pointer-events-none">{item.step}</span>
                <h4 className="text-base font-bold text-[var(--text)]">{item.title}</h4>
                <p className="text-xs text-[var(--muted)] leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

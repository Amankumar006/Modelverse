"use client";

import React from "react";
import Link from "next/link";
import { Brain, Code2, Eye, Video, Mic, Cpu, ArrowUpRight } from "lucide-react";

interface CategoryMeta {
  title: string;
  category: string;
  description: string;
  count: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryMeta[] = [
  {
    title: "Code & Programming",
    category: "Code",
    description: "Specialized models for code generation, SWE-bench evaluations, and automated refactoring.",
    count: "134 Models",
    icon: <Code2 size={20} className="text-blue-500" />,
  },
  {
    title: "Reasoning & Math",
    category: "Reasoning",
    description: "Chain-of-thought and test-time compute reasoning models solving complex proofs and logic.",
    count: "79 Models",
    icon: <Brain size={20} className="text-amber-500" />,
  },
  {
    title: "Video Generation",
    category: "Video",
    description: "Diffusion and autoregressive video synthesis architectures generating HD video.",
    count: "74 Models",
    icon: <Video size={20} className="text-purple-500" />,
  },
  {
    title: "Multimodal Vision",
    category: "Multimodal",
    description: "Vision-language models trained on joint image, document, and video understanding.",
    count: "37 Models",
    icon: <Eye size={20} className="text-emerald-500" />,
  },
  {
    title: "General LLM",
    category: "LLM",
    description: "Foundational natural language instruction and high-throughput conversational models.",
    count: "31 Models",
    icon: <Cpu size={20} className="text-rose-500" />,
  },
  {
    title: "Speech & Audio",
    category: "Audio",
    description: "Zero-shot voice cloning, expressive TTS, and high-accuracy speech-to-text models.",
    count: "19 Models",
    icon: <Mic size={20} className="text-sky-500" />,
  },
];

export default function CategoryExplorerSection() {
  return (
    <section className="w-full bg-[var(--card-bg)]/30 border-y border-[var(--muted)]/10 py-12 md:py-16">
      <div className="max-w-7xl 2xl:max-w-[1600px] 3xl:max-w-[1920px] 4xl:max-w-[2400px] mx-auto px-4 sm:px-6 md:px-10 lg:px-12 2xl:px-16 3xl:px-20 flex flex-col gap-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)] mb-1 block">
            Domain Explorer
          </span>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            Browse by Intelligence Capability
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Jump directly into curated sub-catalogs tailored to specific model modalities.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 3xl:grid-cols-6 gap-5">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.category}
              href={`/models?category=${encodeURIComponent(cat.category)}`}
              className="group p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--muted)]/10 hover:border-[var(--accent)]/40 hover-lift flex flex-col justify-between space-y-3 cursor-pointer shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2 rounded-xl bg-[var(--bg)] border border-[var(--muted)]/15">
                    {cat.icon}
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg)] border border-[var(--muted)]/10 text-[var(--muted)]">
                    {cat.count}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors">
                  {cat.title}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="pt-2 flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                <span>View {cat.category} models</span>
                <ArrowUpRight size={13} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

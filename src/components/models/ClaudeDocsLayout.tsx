"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ModelEntry } from "@/lib/models";
import ModelDetailTabs from "./ModelDetailTabs";
import Navbar from "@/components/layout/Navbar";
import { Search, ChevronDown, Copy, Check, ExternalLink, Terminal, Shield, Layers, FileText } from "lucide-react";

interface ClaudeDocsLayoutProps {
  model: ModelEntry;
  markdownContent: string | null;
  allModels: ModelEntry[];
  familyMembers: ModelEntry[];
  relatedModels: ModelEntry[];
}

export default function ClaudeDocsLayout({
  model,
  markdownContent,
  allModels,
  familyMembers,
  relatedModels,
}: ClaudeDocsLayoutProps) {
  const [copied, setCopied] = useState(false);
  const [activeToc, setActiveToc] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const handleCopyPage = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Select top models for comparison table (Opus 5, Sonnet 5, Haiku 4.5 / Mythos 5)
  const comparisonModels = [
    model,
    ...allModels.filter((m) => m.id !== model.id && m.verified).slice(0, 3),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      {/* ── Global Top Navbar ────────────────────────────── */}
      <Navbar theme="dark" />

      {/* ── 3-Column Main Documentation Grid ──────────────────────── */}
      <div className="mx-auto flex w-full max-w-[1700px] px-4 md:px-6 py-6 gap-6">
        {/* LEFT COLUMN: Sidebar Navigation (~240px) */}
        <aside className="w-60 shrink-0 hidden md:block rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 space-y-6 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto">
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6E6D66]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md bg-[#222220] border border-[#30302D] pl-8 pr-8 py-1.5 text-xs text-[#F0EFEA] placeholder:text-[#6E6D66] focus:outline-none focus:border-[#50504B]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6E6D66]">
              ⌘K
            </span>
          </div>

          {/* Menu Sections */}
          <div className="space-y-1 text-xs">
            <p className="px-2 py-1 font-semibold text-[#F0EFEA] text-xs">Models</p>

            <Link
              href={`/models/${model.slug}`}
              className="block px-2.5 py-1.5 rounded-md bg-[#252523] text-[#F0EFEA] font-medium"
            >
              Models overview
            </Link>

            <Link
              href={`/models/developer/${encodeURIComponent(model.developer)}`}
              className="block px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors"
            >
              Model IDs and versioning
            </Link>

            <button
              onClick={() => setActiveToc("choosing")}
              className="w-full text-left px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors"
            >
              Choosing a model
            </button>

            {familyMembers.map((member) => (
              <Link
                key={member.id}
                href={`/models/${member.slug}`}
                className="block px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors truncate"
              >
                What&apos;s new in {member.name}
              </Link>
            ))}

            <Link
              href="/models"
              className="block px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors"
            >
              Upgrade between model versions
            </Link>

            <Link
              href="/models"
              className="block px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors"
            >
              Model deprecations
            </Link>

            <Link
              href="/models"
              className="block px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors"
            >
              Model cards
            </Link>

            <Link
              href="/models"
              className="block px-2.5 py-1.5 rounded-md text-[#9E9D95] hover:text-[#F0EFEA] hover:bg-[#20201E] transition-colors"
            >
              Pricing
            </Link>
          </div>
        </aside>

        {/* CENTER COLUMN: Main Reading Area (Max ~820px) */}
        <main className="flex-1 max-w-[860px] px-6 lg:px-10 py-8 space-y-8 min-w-0">
          {/* Breadcrumb & Header */}
          <div className="space-y-3">
            <p className="text-xs text-[#7E7D76]">
              Models & pricing / <span className="text-[#B4B2A9]">Models</span>
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="font-serif text-3xl sm:text-4xl text-[#F0EFEA] tracking-tight font-normal">
                {model.name} Overview
              </h1>

              <button
                onClick={handleCopyPage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#343431] bg-[#20201E] hover:bg-[#2A2A28] text-xs font-medium text-[#D4D3CC] transition-colors"
              >
                {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                <span>{copied ? "Copied!" : "Copy page"}</span>
                <ChevronDown size={12} className="text-[#7E7D76]" />
              </button>
            </div>

            <p className="text-base text-[#B4B2A9] leading-relaxed max-w-3xl">
              {model.description ||
                `${model.name} is a state-of-the-art model developed by ${model.developer}. This documentation introduces the available model variants and compares their capability, context window, and pricing performance.`}
            </p>
          </div>

          {/* Section 1: Choosing a model */}
          <section id="choosing" className="space-y-3 pt-4 border-t border-[#262624]">
            <h2 className="font-serif text-2xl text-[#F0EFEA]">Choosing a model</h2>
            <p className="text-sm text-[#B4B2A9] leading-relaxed">
              If you&apos;re unsure which model to use, start with <strong className="text-[#F0EFEA] font-semibold">{model.name}</strong> for complex agentic coding, reasoning, and enterprise workloads. For lightweight, low-latency autocomplete or edge tasks, consider smaller parameters.
            </p>
            <p className="text-sm text-[#B4B2A9] leading-relaxed">
              All current {model.developer} models support text and multimodal input, multilingual reasoning, and structured tool calling. Models are available via API, cloud hosters, and open-weights download repositories.
            </p>
          </section>

          {/* Section 2: Model Variant Overview */}
          <section className="space-y-3 pt-4 border-t border-[#262624]">
            <h2 className="font-serif text-2xl text-[#F0EFEA]">Model Lineage & Specification</h2>
            <p className="text-sm text-[#B4B2A9] leading-relaxed">
              <code className="bg-[#282826] text-[#D4D3CC] px-2 py-0.5 rounded text-xs font-mono">{model.slug}</code> is {model.developer}&apos;s primary release in the {model.family || "current"} family.
            </p>
            <div className="p-4 rounded-lg bg-[#1E1E1C] border border-[#2B2B28] space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#282825]">
                <span className="text-[#7E7D76]">Developer</span>
                <span className="text-[#F0EFEA] font-medium">{model.developer}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282825]">
                <span className="text-[#7E7D76]">API Identifier</span>
                <code className="bg-[#282826] text-[#D4D3CC] px-1.5 py-0.5 rounded font-mono">{model.slug}</code>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282825]">
                <span className="text-[#7E7D76]">Parameters</span>
                <span className="text-[#F0EFEA] font-medium">{model.parameters}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#282825]">
                <span className="text-[#7E7D76]">Context Window</span>
                <span className="text-[#F0EFEA] font-medium">{model.contextWindow}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#7E7D76]">License</span>
                <span className="text-[#F0EFEA] font-medium">{model.license}</span>
              </div>
            </div>
          </section>

          {/* Section 3: Latest Models Comparison Table (Anthropic Docs Style Matrix) */}
          <section id="comparison" className="space-y-4 pt-4 border-t border-[#262624]">
            <h2 className="font-serif text-2xl text-[#F0EFEA]">Latest models comparison</h2>
            <div className="overflow-x-auto rounded-lg border border-[#2B2B28] bg-[#1E1E1C]">
              <table className="w-full text-left text-xs text-[#B4B2A9]">
                <thead className="bg-[#242422] border-b border-[#2B2B28] text-[#F0EFEA] font-medium">
                  <tr>
                    <th className="p-3 font-medium">Feature</th>
                    {comparisonModels.map((m) => (
                      <th key={m.id} className="p-3 font-semibold text-[#F0EFEA]">
                        {m.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282825]">
                  <tr>
                    <td className="p-3 font-semibold text-[#F0EFEA]">Description</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} className="p-3 text-[11px] leading-normal text-[#9E9D95]">
                        {m.description ? m.description.slice(0, 80) + "..." : "Frontier AI model"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#F0EFEA]">API Identifier</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} className="p-3 font-mono text-[11px]">
                        <code className="bg-[#282826] text-[#D4D3CC] px-2 py-0.5 rounded border border-[#343431]">
                          {m.slug}
                        </code>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#F0EFEA]">Parameters</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} className="p-3 font-mono text-[#F0EFEA]">
                        {m.parameters !== "undisclosed" ? m.parameters : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#F0EFEA]">Context Window</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} className="p-3 font-mono text-[#F0EFEA]">
                        {m.contextWindow !== "undisclosed" ? m.contextWindow : "—"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-[#F0EFEA]">License / Type</td>
                    {comparisonModels.map((m) => (
                      <td key={m.id} className="p-3 text-[#B4B2A9] capitalize">
                        {m.type.replace("-", " ")}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: Detailed Model Tabs & Markdown Readme */}
          <section className="pt-4 border-t border-[#262624]">
            <ModelDetailTabs model={model} markdownContent={markdownContent} />
          </section>
        </main>

        {/* RIGHT COLUMN: Table of Contents (~220px) */}
        <aside className="w-52 shrink-0 hidden xl:block p-6 border-l border-[#262624] sticky top-14 h-[calc(100vh-3.5rem)] text-xs space-y-4">
          <div className="flex items-center gap-1.5 text-[#F0EFEA] font-medium">
            <span className="w-1 h-3 bg-[#F0EFEA] rounded-full" />
            <span>Choosing a model</span>
          </div>

          <ul className="space-y-2 text-[#7E7D76] pl-2 border-l border-[#262624]">
            <li>
              <a href="#choosing" className="hover:text-[#F0EFEA] transition-colors block">
                {model.developer} model overview
              </a>
            </li>
            <li>
              <a href="#comparison" className="hover:text-[#F0EFEA] transition-colors block">
                Latest models comparison
              </a>
            </li>
            <li>
              <a href="#benchmarks" className="hover:text-[#F0EFEA] transition-colors block">
                Prompt and output performance
              </a>
            </li>
            <li>
              <a href="#resources" className="hover:text-[#F0EFEA] transition-colors block">
                Migrating to {model.name}
              </a>
            </li>
            <li>
              <a href="#resources" className="hover:text-[#F0EFEA] transition-colors block">
                Get started with {model.developer}
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

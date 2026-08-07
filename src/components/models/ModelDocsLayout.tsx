"use client";

import React, { useState } from "react";
import Link from "next/link";
import { type ModelEntry, getModalities } from "@/lib/models";
import ModelDetailTabs from "./ModelDetailTabs";
import Navbar from "@/components/layout/Navbar";
import AdUnit from "@/components/third-party/AdUnit";
import { Search, ChevronDown, Copy, Check, ExternalLink, Terminal, Shield, Layers, FileText } from "lucide-react";

interface ModelDocsLayoutProps {
  model: ModelEntry;
  markdownContent: string | null;
  allModels: ModelEntry[];
  familyMembers: ModelEntry[];
  relatedModels: ModelEntry[];
}

export default function ModelDocsLayout({
  model,
  markdownContent,
  allModels,
  familyMembers,
  relatedModels,
}: ModelDocsLayoutProps) {
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

  const comparisonModels = [
    model,
    ...allModels.filter((m) => m.id !== model.id && m.verified && m.primaryTask === model.primaryTask).slice(0, 3),
  ];

  const renderLeftNav = () => (
    <>
      {/* Search Box */}
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search docs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-[var(--radius-control)] bg-[var(--bg)] border border-[var(--muted)]/10 pl-8 pr-8 py-1.5 text-xs text-[var(--text)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--accent)]"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[var(--muted)]">
          ⌘K
        </span>
      </div>

      {/* Menu Sections */}
      <div className="space-y-1 text-xs">
        <p className="px-2 py-1 font-bold text-[var(--text)] text-xs uppercase tracking-wider">Models</p>

        <Link
          href={`/models/${model.slug}`}
          className="block px-3 py-2 rounded-[var(--radius-control)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold shadow-sm"
        >
          Models overview
        </Link>

        <Link
          href={`/models/developer/${encodeURIComponent(model.developer)}`}
          className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
        >
          Model IDs & versioning
        </Link>

        <button
          onClick={() => setActiveToc("choosing")}
          className="w-full text-left px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium cursor-pointer"
        >
          Choosing a model
        </button>

        {familyMembers.map((member) => (
          <Link
            key={member.id}
            href={`/models/${member.slug}`}
            className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors truncate font-medium"
          >
            What&apos;s new in {member.name}
          </Link>
        ))}

        <Link
          href="/models/upgrade"
          className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
        >
          Upgrade model versions
        </Link>

        <Link
          href="/models/benchmarks"
          className="block px-3 py-2 rounded-[var(--radius-control)] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors font-medium"
        >
          Model cards & benchmarks
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] font-sans antialiased">
      {/* ── Global Top Navbar ────────────────────────────── */}
      <Navbar theme="dark" />

      {/* ── 3-Column Main Documentation Grid ──────────────────────── */}
      <div className="mx-auto grid w-full max-w-[1700px] px-4 md:px-6 py-6 gap-8 grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_240px]">
        {/* LEFT COLUMN: Sidebar Navigation */}
        <aside className="w-full shrink-0 hidden lg:block rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 space-y-6 sticky top-20 h-[calc(100vh-6rem)] overflow-y-auto border border-[var(--muted)]/10">
          {renderLeftNav()}
        </aside>

        {/* CENTER COLUMN: Main Reading Area */}
        <main className="flex-1 max-w-[860px] py-4 space-y-8 min-w-0">
          
          {/* Mobile Left Nav Collapsible */}
          <details className="lg:hidden group rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 mb-8">
            <summary className="p-4 font-bold text-[var(--text)] text-sm cursor-pointer list-none flex justify-between items-center">
              <span>Documentation Navigation</span>
              <ChevronDown size={16} className="text-[var(--muted)] group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 pt-0 space-y-6">
              {renderLeftNav()}
            </div>
          </details>
          {/* Breadcrumb & Header */}
          <div className="space-y-3">
            <p className="text-xs text-[var(--muted)] font-medium">
              Models & pricing / <span className="text-[var(--text)] font-semibold">Models</span> / {model.name}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="font-extrabold text-3xl sm:text-4xl text-[var(--text)] tracking-tight flex items-center gap-3">
                  {model.name} Overview
                  {model.verified && (
                    <Shield size={24} className="text-emerald-500" />
                  )}
                </h1>
                {model.verified && (() => {
                  const verificationDate = model.verifiedAt || model.updatedAt || model.releaseDate;
                  const isEstimated = !model.verifiedAt;
                  return (
                    <p className="text-xs text-[var(--muted)] font-mono">
                      Confirmed against {model.developer} documentation, {new Date(verificationDate).toLocaleString('default', { month: 'long', year: 'numeric' })}{isEstimated ? ' (estimated)' : ''}
                    </p>
                  );
                })()}
              </div>

              <button
                onClick={handleCopyPage}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-[var(--radius-pill)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] text-xs font-bold text-[var(--text)] hover:border-[var(--accent)] transition-all cursor-pointer"
              >
                {copied ? <Check size={13} className="text-[var(--accent)]" /> : <Copy size={13} />}
                <span>{copied ? "Copied!" : "Copy page"}</span>
              </button>
            </div>

            <p className="text-lg text-[var(--text)] leading-relaxed max-w-3xl font-semibold">
              {model.name} is a {model.primaryTask} AI model created by {model.developer}, featuring {model.parameters ? (typeof model.parameters === "object" ? Object.values(model.parameters).join(" / ") : model.parameters) : "Unknown"} parameters and a context window of {model.contextWindow ? (typeof model.contextWindow === "object" ? (model.contextWindow as any).native : model.contextWindow) : "Unknown"}.
            </p>

            <p className="text-base text-[var(--muted)] leading-relaxed max-w-3xl font-normal">
              {model.description ||
                `${model.name} is a state-of-the-art model developed by ${model.developer}. This documentation introduces the available model variants and compares their capability, context window, and pricing performance.`}
            </p>
          </div>

          {/* Section 1: Choosing a model */}
          <section id="choosing" className="space-y-3 pt-6 border-t border-[var(--muted)]/10">
            <h2 className="text-2xl font-extrabold text-[var(--text)]">Choosing a model</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              If you&apos;re unsure which model to use, start with <strong className="text-[var(--text)] font-bold">{model.name}</strong> for complex agentic coding, reasoning, and enterprise workloads. For lightweight, low-latency autocomplete or edge tasks, consider smaller parameters.
            </p>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              All current {model.developer} models support text and multimodal input, multilingual reasoning, and structured tool calling. Models are available via API, cloud hosters, and open-weights download repositories.
            </p>
          </section>

          {/* Section 2: Model Variant Overview */}
          <section className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
            <h2 className="text-2xl font-extrabold text-[var(--text)]">Model Lineage & Specification</h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed font-normal">
              <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] text-xs font-mono font-bold">{model.slug}</code> is {model.developer}&apos;s primary release in the {model.family || "current"} family.
            </p>
            <div className="p-5 rounded-[var(--radius-card)] bg-[var(--card-bg)] shadow-[var(--shadow-card)] border border-[var(--muted)]/10 space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                <span className="text-[var(--muted)] font-medium">Developer</span>
                <span className="text-[var(--text)] font-bold">{model.developer}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                <span className="text-[var(--muted)] font-medium">API Identifier</span>
                <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-mono font-bold">{model.slug}</code>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                <span className="text-[var(--muted)] font-medium">Parameters</span>
                <span className="text-[var(--text)] font-bold tabular-nums font-mono">
                  {model.parameters ? (typeof model.parameters === "object" ? Object.values(model.parameters).join(" / ") : model.parameters) : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[var(--muted)]/10">
                <span className="text-[var(--muted)] font-medium">Context Window</span>
                <span className="text-[var(--text)] font-bold tabular-nums font-mono">
                  {model.contextWindow ? (typeof model.contextWindow === "object" ? (model.contextWindow as any).native : model.contextWindow) : "—"}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[var(--muted)] font-medium">License</span>
                <span className="text-[var(--text)] font-bold">
                  {model.license && typeof model.license === "object" ? model.license.name || "Custom" : model.license || "Unknown"}
                </span>
              </div>
            </div>
          </section>

          {/* AdSense Unit */}
          <div className="w-full flex justify-center py-2">
            <AdUnit slot="model-docs-mid" format="fluid" className="w-full max-w-[728px] aspect-[728/90]" />
          </div>

          {/* Section 3: Latest Models Comparison Table */}
          {comparisonModels.length > 1 && (
          <section id="comparison" className="space-y-4 pt-6 border-t border-[var(--muted)]/10">
            <h2 className="text-2xl font-extrabold text-[var(--text)]">Comparable models</h2>
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)]">
                <table className="w-full text-left text-xs text-[var(--muted)]">
                  <thead className="bg-[var(--accent-soft)]/20 border-b border-[var(--muted)]/10 text-[var(--text)] font-bold">
                    <tr>
                      <th className="p-3.5 font-bold">Feature</th>
                      {comparisonModels.map((m) => (
                        <th key={m.id} className="p-3.5 font-bold text-[var(--text)]">
                          {m.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--muted)]/10">
                    <tr>
                      <td className="p-3.5 font-bold text-[var(--text)]">Description</td>
                      {comparisonModels.map((m) => (
                        <td key={m.id} className="p-3.5 text-[11px] leading-relaxed text-[var(--muted)]">
                          {m.description ? m.description.slice(0, 80) + "..." : "Frontier AI model"}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[var(--text)]">API Identifier</td>
                      {comparisonModels.map((m) => (
                        <td key={m.id} className="p-3.5 font-mono text-[11px]">
                          <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-2 py-0.5 rounded-[var(--radius-pill)] font-bold">
                            {m.slug}
                          </code>
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[var(--text)]">Parameters</td>
                      {comparisonModels.map((m) => {
                        const p = m.parameters ? (typeof m.parameters === "object" && m.parameters !== null ? Object.values(m.parameters).join(" / ") : m.parameters) : "—";
                        return (
                          <td key={m.id} className="p-3.5 font-mono tabular-nums text-[var(--text)] font-bold">
                            {p !== "undisclosed" ? p : "—"}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[var(--text)]">Context Window</td>
                      {comparisonModels.map((m) => {
                        const cw = m.contextWindow ? (typeof m.contextWindow === "object" && m.contextWindow !== null ? (m.contextWindow as any).native : m.contextWindow) : "—";
                        return (
                          <td key={m.id} className="p-3.5 font-mono tabular-nums text-[var(--text)] font-bold">
                            {cw !== "undisclosed" ? cw : "—"}
                          </td>
                        );
                      })}
                    </tr>
                    <tr>
                      <td className="p-3.5 font-bold text-[var(--text)]">License / Type</td>
                      {comparisonModels.map((m) => (
                        <td key={m.id} className="p-3.5 text-[var(--muted)] capitalize font-medium">
                          {m.type.replace("-", " ")}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Stack View */}
              <div className="md:hidden grid grid-cols-1 gap-4">
                {comparisonModels.map((m) => {
                  const p = m.parameters ? (typeof m.parameters === "object" && m.parameters !== null ? Object.values(m.parameters).join(" / ") : m.parameters) : "—";
                  const cw = m.contextWindow ? (typeof m.contextWindow === "object" && m.contextWindow !== null ? (m.contextWindow as any).native : m.contextWindow) : "—";
                  return (
                    <div key={m.id} className="rounded-[var(--radius-card)] border border-[var(--muted)]/10 bg-[var(--card-bg)] shadow-[var(--shadow-card)] p-4 space-y-3">
                      <h3 className="font-extrabold text-[var(--text)] text-sm">{m.name}</h3>
                      <p className="text-[11px] leading-relaxed text-[var(--muted)] border-b border-[var(--muted)]/10 pb-2">
                        {m.description ? m.description.slice(0, 80) + "..." : "Frontier AI model"}
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[var(--muted)] font-bold block mb-1">API ID</span>
                          <code className="bg-[var(--tag-bg)] text-[var(--tag-text)] px-1.5 py-0.5 rounded-[var(--radius-pill)] font-mono text-[10px] font-bold">
                            {m.slug}
                          </code>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] font-bold block mb-1">Type</span>
                          <span className="text-[var(--text)] capitalize font-medium">
                            {m.type.replace("-", " ")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] font-bold block mb-1">Parameters</span>
                          <span className="font-mono tabular-nums text-[var(--text)] font-bold">
                            {p !== "undisclosed" ? p : "—"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[var(--muted)] font-bold block mb-1">Context</span>
                          <span className="font-mono tabular-nums text-[var(--text)] font-bold">
                            {cw !== "undisclosed" ? cw : "—"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          </section>
          )}

          {/* Section 4: Detailed Model Tabs & Markdown Readme */}
          <section className="pt-6 border-t border-[var(--muted)]/10">
            <ModelDetailTabs model={model} markdownContent={markdownContent} />
          </section>
        </main>

        {/* RIGHT COLUMN: Table of Contents */}
        <aside className="w-56 shrink-0 hidden xl:block p-5 border-l border-[var(--muted)]/10 sticky top-20 h-[calc(100vh-6rem)] text-xs space-y-4">
          <div className="flex items-center gap-1.5 text-[var(--text)] font-bold">
            <span className="w-1.5 h-3.5 bg-[var(--accent)] rounded-full" />
            <span>Table of Contents</span>
          </div>

          <ul className="space-y-2.5 text-[var(--muted)] pl-2 border-l border-[var(--muted)]/10 font-medium">
            <li>
              <a href="#choosing" className="hover:text-[var(--accent)] transition-colors block">
                {model.developer} model overview
              </a>
            </li>
            {comparisonModels.length > 1 && (
            <li>
              <a href="#comparison" className="hover:text-[var(--accent)] transition-colors block">
                Comparable models
              </a>
            </li>
            )}
            <li>
              <a href="#benchmarks" className="hover:text-[var(--accent)] transition-colors block">
                Benchmarks & specifications
              </a>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
